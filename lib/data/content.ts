import "server-only";

import { db } from "@/lib/db";
import type { ApprovalStage } from "@prisma/client";

/**
 * Shared lookup for permission checks on a deliverable: who owns it
 * (the influencer's userId, if the influencer has portal access) and which
 * campaign it rolls up to. Used by both the presign route and the content
 * submission action so the two enforce identical rules.
 */
export async function getDeliverableAccessContext(deliverableId: string) {
  const deliverable = await db.deliverable.findUnique({
    where: { id: deliverableId },
    include: {
      assignment: {
        include: { influencer: true, campaign: true },
      },
    },
  });
  if (!deliverable) return null;

  return {
    deliverable,
    assignmentId: deliverable.assignment.id,
    campaignId: deliverable.assignment.campaignId,
    influencerUserId: deliverable.assignment.influencer.userId,
  };
}

export async function getContentSubmissionAccessContext(
  contentSubmissionId: string,
) {
  const submission = await db.contentSubmission.findUnique({
    where: { id: contentSubmissionId },
    include: {
      deliverable: {
        include: {
          assignment: {
            include: { influencer: true, campaign: true },
          },
        },
      },
    },
  });
  if (!submission) return null;

  return {
    campaignId: submission.deliverable.assignment.campaignId,
    brandId: submission.deliverable.assignment.campaign.brandId,
    influencerUserId: submission.deliverable.assignment.influencer.userId,
    assignmentId: submission.deliverable.assignment.id,
  };
}

async function attachFiles<T extends { id: string }>(submissions: T[]) {
  if (submissions.length === 0) return [] as (T & { files: Awaited<ReturnType<typeof db.fileAsset.findMany>> })[];

  const files = await db.fileAsset.findMany({
    where: {
      entityType: "CONTENT_SUBMISSION",
      entityId: { in: submissions.map((s) => s.id) },
    },
    orderBy: { createdAt: "asc" },
  });

  return submissions.map((submission) => ({
    ...submission,
    files: files.filter((file) => file.entityId === submission.id),
  }));
}

export async function getDeliverableWithSubmissions(deliverableId: string) {
  const context = await getDeliverableAccessContext(deliverableId);
  if (!context) return null;

  const submissions = await db.contentSubmission.findMany({
    where: { deliverableId },
    include: {
      submittedBy: true,
      approvalRequests: { include: { reviewer: true }, orderBy: { createdAt: "asc" } },
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
    },
    orderBy: { version: "desc" },
  });

  const withFiles = await attachFiles(submissions);

  return { ...context, submissions: withFiles };
}

export async function getContentSubmissionDetail(contentSubmissionId: string) {
  const submission = await db.contentSubmission.findUnique({
    where: { id: contentSubmissionId },
    include: {
      submittedBy: true,
      approvalRequests: { include: { reviewer: true }, orderBy: { createdAt: "asc" } },
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
      deliverable: {
        include: {
          assignment: {
            include: { influencer: true, campaign: { include: { brand: true } } },
          },
        },
      },
    },
  });
  if (!submission) return null;

  const [withFiles] = await attachFiles([submission]);
  return withFiles;
}

export async function getCampaignApprovalQueue(
  campaignId: string,
  stage: ApprovalStage,
) {
  return db.approvalRequest.findMany({
    where: {
      stage,
      decision: "PENDING",
      contentSubmission: { deliverable: { assignment: { campaignId } } },
    },
    include: {
      contentSubmission: {
        include: {
          deliverable: { include: { assignment: { include: { influencer: true } } } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

/** Agency-wide internal review queue for the dashboard's attention widget. */
export async function listPendingInternalApprovals(take = 5) {
  const [requests, total] = await Promise.all([
    db.approvalRequest.findMany({
      where: { stage: "INTERNAL", decision: "PENDING" },
      include: {
        contentSubmission: {
          include: {
            deliverable: {
              include: {
                assignment: { include: { influencer: true, campaign: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
      take,
    }),
    db.approvalRequest.count({ where: { stage: "INTERNAL", decision: "PENDING" } }),
  ]);
  return { requests, total };
}

export async function getApprovedSubmissionsForCampaign(campaignId: string) {
  const submissions = await db.contentSubmission.findMany({
    where: {
      status: "APPROVED",
      deliverable: { assignment: { campaignId } },
    },
    include: {
      submittedBy: true,
      deliverable: { include: { assignment: { include: { influencer: true } } } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const files = await db.fileAsset.findMany({
    where: { entityType: "CONTENT_SUBMISSION", entityId: { in: submissions.map((s) => s.id) } },
  });

  return submissions.map((submission) => ({
    ...submission,
    files: files.filter((file) => file.entityId === submission.id),
  }));
}

export async function getApprovedFilesForBrands(brandIds: string[]) {
  if (brandIds.length === 0) return [];

  const submissions = await db.contentSubmission.findMany({
    where: {
      status: "APPROVED",
      deliverable: {
        assignment: { campaign: { brandId: { in: brandIds } } },
      },
    },
    include: {
      deliverable: {
        include: { assignment: { include: { campaign: true, influencer: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const files = await db.fileAsset.findMany({
    where: { entityType: "CONTENT_SUBMISSION", entityId: { in: submissions.map((s) => s.id) } },
  });

  return submissions.flatMap((submission) =>
    files
      .filter((file) => file.entityId === submission.id)
      .map((file) => ({ file, submission })),
  );
}

export async function getClientApprovalQueue(brandIds: string[]) {
  if (brandIds.length === 0) return [];
  return db.approvalRequest.findMany({
    where: {
      stage: "CLIENT",
      decision: "PENDING",
      contentSubmission: {
        deliverable: {
          assignment: { campaign: { brandId: { in: brandIds } } },
        },
      },
    },
    include: {
      contentSubmission: {
        include: {
          deliverable: {
            include: {
              assignment: {
                include: { influencer: true, campaign: { include: { brand: true } } },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}
