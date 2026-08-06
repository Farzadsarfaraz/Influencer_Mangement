"use server";

import { revalidatePath } from "next/cache";

import { CAMPAIGN_MANAGER_ROLES } from "@/lib/auth/permissions";
import { requireRole, requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/actions/brands";
import { emitDomainEvent } from "@/lib/events/emitter";
import { canTransitionAssignment } from "@/lib/workflow/assignment";
import {
  assignmentSchema,
  assignmentStatusChangeSchema,
  type AssignmentInput,
  type AssignmentStatusChangeInput,
} from "@/lib/validations/assignment";
import type { Assignment, AssignmentStatus } from "@prisma/client";

export async function createAssignmentAction(
  input: AssignmentInput,
): Promise<ActionResult<{ assignmentId: string }>> {
  const actor = await requireRole(CAMPAIGN_MANAGER_ROLES);
  const parsed = assignmentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await db.assignment.findFirst({
    where: {
      campaignId: parsed.data.campaignId,
      influencerId: parsed.data.influencerId,
    },
  });
  if (existing) {
    return { ok: false, error: "This influencer is already assigned to this campaign." };
  }

  const assignment = await db.assignment.create({
    data: {
      campaignId: parsed.data.campaignId,
      flightId: parsed.data.flightId || null,
      influencerId: parsed.data.influencerId,
      createdById: actor.id,
      fee: parsed.data.fee,
      currency: parsed.data.currency,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      notes: parsed.data.notes || null,
    },
  });

  await db.activityEvent.create({
    data: {
      campaignId: parsed.data.campaignId,
      actorId: actor.id,
      verb: "assignment.created",
      entityType: "Assignment",
      entityId: assignment.id,
      metadata: { influencerId: parsed.data.influencerId },
    },
  });

  emitDomainEvent({
    type: "assignment.created",
    assignmentId: assignment.id,
    campaignId: parsed.data.campaignId,
    influencerId: parsed.data.influencerId,
  });

  revalidatePath(`/agency/campaigns/${parsed.data.campaignId}/assignments`);
  return { ok: true, data: { assignmentId: assignment.id } };
}

async function applyAssignmentTransition(
  assignment: Assignment,
  to: AssignmentStatus,
  actorId: string,
) {
  await db.$transaction([
    db.assignment.update({
      where: { id: assignment.id },
      data: {
        status: to,
        respondedAt: ["ACCEPTED", "DECLINED"].includes(to)
          ? new Date()
          : assignment.respondedAt,
      },
    }),
    db.activityEvent.create({
      data: {
        campaignId: assignment.campaignId,
        actorId,
        verb: "assignment.status_changed",
        entityType: "Assignment",
        entityId: assignment.id,
        metadata: { from: assignment.status, to },
      },
    }),
    db.auditLog.create({
      data: {
        actorId,
        action: "assignment.status_changed",
        entityType: "Assignment",
        entityId: assignment.id,
        before: { status: assignment.status },
        after: { status: to },
      },
    }),
  ]);

  emitDomainEvent({
    type: "assignment.status_changed",
    assignmentId: assignment.id,
    campaignId: assignment.campaignId,
    influencerId: assignment.influencerId,
    from: assignment.status,
    to,
    actorId,
  });

  revalidatePath(`/agency/campaigns/${assignment.campaignId}/assignments`);
  revalidatePath(`/agency/campaigns/${assignment.campaignId}/assignments/${assignment.id}`);
  revalidatePath(`/influencer/assignments/${assignment.id}`);
  revalidatePath("/influencer/assignments");
}

export async function transitionAssignmentStatusAction(
  input: AssignmentStatusChangeInput,
): Promise<ActionResult> {
  const actor = await requireRole(CAMPAIGN_MANAGER_ROLES);
  const parsed = assignmentStatusChangeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const assignment = await db.assignment.findUnique({
    where: { id: parsed.data.assignmentId },
  });
  if (!assignment) return { ok: false, error: "Assignment not found." };

  if (!canTransitionAssignment(assignment.status, parsed.data.status)) {
    return {
      ok: false,
      error: `Can't move an assignment from ${assignment.status} to ${parsed.data.status}.`,
    };
  }

  await applyAssignmentTransition(assignment, parsed.data.status, actor.id);
  return { ok: true, data: undefined };
}

export async function respondToInvitationAction(
  assignmentId: string,
  response: "ACCEPTED" | "DECLINED",
): Promise<ActionResult> {
  const actor = await requireUser();

  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
    include: { influencer: true },
  });
  if (!assignment) return { ok: false, error: "Assignment not found." };
  if (assignment.influencer.userId !== actor.id) {
    return { ok: false, error: "This isn't your assignment." };
  }
  if (!canTransitionAssignment(assignment.status, response)) {
    return { ok: false, error: "This invitation has already been responded to." };
  }

  await applyAssignmentTransition(assignment, response, actor.id);
  return { ok: true, data: undefined };
}
