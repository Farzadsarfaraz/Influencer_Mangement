"use server";

import { revalidatePath } from "next/cache";

import { AGENCY_ROLES } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/actions/brands";
import { getDeliverableAccessContext } from "@/lib/data/content";
import { emitDomainEvent } from "@/lib/events/emitter";
import {
  nextContentSubmissionStatus,
  nextDeliverableStatus,
} from "@/lib/workflow/content-submission";
import {
  submitContentSchema,
  type SubmitContentInput,
} from "@/lib/validations/upload";
import {
  decideApprovalSchema,
  type DecideApprovalInput,
} from "@/lib/validations/approval";

export async function submitContentAction(
  input: SubmitContentInput,
): Promise<ActionResult<{ submissionId: string }>> {
  const actor = await requireUser();
  const parsed = submitContentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const context = await getDeliverableAccessContext(parsed.data.deliverableId);
  if (!context) return { ok: false, error: "Deliverable not found." };

  const isOwningInfluencer = context.influencerUserId === actor.id;
  const isAgencyStaff = AGENCY_ROLES.includes(actor.role);
  if (!isOwningInfluencer && !isAgencyStaff) {
    return { ok: false, error: "You can't upload content for this deliverable." };
  }

  const lastVersion = await db.contentSubmission.aggregate({
    where: { deliverableId: parsed.data.deliverableId },
    _max: { version: true },
  });
  const version = (lastVersion._max.version ?? 0) + 1;

  const submission = await db.$transaction(async (tx) => {
    const created = await tx.contentSubmission.create({
      data: {
        deliverableId: parsed.data.deliverableId,
        submittedById: actor.id,
        version,
        caption: parsed.data.caption || null,
        status: "SUBMITTED",
      },
    });

    await tx.fileAsset.create({
      data: {
        entityType: "CONTENT_SUBMISSION",
        entityId: created.id,
        uploadedById: actor.id,
        fileName: parsed.data.fileName,
        mimeType: parsed.data.mimeType,
        sizeBytes: parsed.data.sizeBytes,
        storageKey: parsed.data.storageKey,
        url: parsed.data.url,
      },
    });

    await tx.approvalRequest.create({
      data: {
        contentSubmissionId: created.id,
        stage: "INTERNAL",
        decision: "PENDING",
      },
    });

    await tx.deliverable.update({
      where: { id: parsed.data.deliverableId },
      data: { status: "SUBMITTED" },
    });

    await tx.activityEvent.create({
      data: {
        campaignId: context.campaignId,
        actorId: actor.id,
        verb: "content.submitted",
        entityType: "ContentSubmission",
        entityId: created.id,
        metadata: { deliverableId: parsed.data.deliverableId, version },
      },
    });

    return created;
  });

  emitDomainEvent({
    type: "content.submitted",
    contentSubmissionId: submission.id,
    deliverableId: parsed.data.deliverableId,
    actorId: actor.id,
  });

  revalidatePath(`/agency/campaigns/${context.campaignId}/approvals`);
  revalidatePath(`/influencer/assignments/${context.assignmentId}`);
  return { ok: true, data: { submissionId: submission.id } };
}

export async function decideApprovalAction(
  input: DecideApprovalInput,
): Promise<ActionResult> {
  const actor = await requireUser();
  const parsed = decideApprovalSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const approvalRequest = await db.approvalRequest.findUnique({
    where: { id: parsed.data.approvalRequestId },
    include: {
      contentSubmission: {
        include: {
          deliverable: {
            include: {
              assignment: {
                include: { campaign: { include: { brand: true } } },
              },
            },
          },
        },
      },
    },
  });
  if (!approvalRequest) return { ok: false, error: "Approval request not found." };
  if (approvalRequest.decision !== "PENDING") {
    return { ok: false, error: "This approval has already been decided." };
  }

  const campaign = approvalRequest.contentSubmission.deliverable.assignment.campaign;

  if (approvalRequest.stage === "INTERNAL") {
    if (!AGENCY_ROLES.includes(actor.role)) {
      return { ok: false, error: "Only agency staff can decide internal review." };
    }
  } else {
    if (actor.role !== "CLIENT_ADMIN") {
      return { ok: false, error: "Only a brand admin can approve on the client side." };
    }
    const membership = await db.brandMember.findUnique({
      where: { brandId_userId: { brandId: campaign.brandId, userId: actor.id } },
    });
    if (!membership) {
      return { ok: false, error: "You don't have access to this brand." };
    }
  }

  const contentSubmissionId = approvalRequest.contentSubmissionId;
  const deliverableId = approvalRequest.contentSubmission.deliverableId;
  const newSubmissionStatus = nextContentSubmissionStatus(
    approvalRequest.stage,
    parsed.data.decision,
  );
  const newDeliverableStatus = nextDeliverableStatus(
    approvalRequest.stage,
    parsed.data.decision,
  );

  await db.$transaction(async (tx) => {
    await tx.approvalRequest.update({
      where: { id: approvalRequest.id },
      data: {
        decision: parsed.data.decision,
        reviewerId: actor.id,
        comment: parsed.data.comment || null,
        decidedAt: new Date(),
      },
    });

    await tx.contentSubmission.update({
      where: { id: contentSubmissionId },
      data: { status: newSubmissionStatus },
    });

    await tx.deliverable.update({
      where: { id: deliverableId },
      data: { status: newDeliverableStatus },
    });

    if (approvalRequest.stage === "INTERNAL" && parsed.data.decision === "APPROVED") {
      await tx.approvalRequest.create({
        data: {
          contentSubmissionId,
          stage: "CLIENT",
          decision: "PENDING",
        },
      });
    }

    await tx.activityEvent.create({
      data: {
        campaignId: campaign.id,
        actorId: actor.id,
        verb: `approval.${approvalRequest.stage.toLowerCase()}_${parsed.data.decision.toLowerCase()}`,
        entityType: "ContentSubmission",
        entityId: contentSubmissionId,
        metadata: { stage: approvalRequest.stage, decision: parsed.data.decision },
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: actor.id,
        action: "approval.decided",
        entityType: "ApprovalRequest",
        entityId: approvalRequest.id,
        before: { decision: "PENDING" },
        after: { decision: parsed.data.decision, stage: approvalRequest.stage },
      },
    });
  });

  emitDomainEvent({
    type: "approval.decided",
    approvalRequestId: approvalRequest.id,
    contentSubmissionId,
    stage: approvalRequest.stage,
    decision: parsed.data.decision,
    actorId: actor.id,
  });

  revalidatePath(`/agency/campaigns/${campaign.id}/approvals`);
  revalidatePath("/customer/approvals");
  revalidatePath(`/influencer/assignments/${approvalRequest.contentSubmission.deliverable.assignmentId}`);
  return { ok: true, data: undefined };
}
