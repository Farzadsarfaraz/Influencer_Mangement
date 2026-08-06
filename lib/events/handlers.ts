import "server-only";

import { onDomainEvent } from "@/lib/events/emitter";
import { db } from "@/lib/db";
import { enqueueEmail } from "@/lib/jobs/email-queue";
import { env } from "@/lib/env";
import type { NotificationType } from "@prisma/client";

async function notify(
  userId: string,
  type: NotificationType,
  title: string,
  options: { body?: string; link?: string; email?: string | null } = {},
) {
  await db.notification.create({
    data: { userId, type, title, body: options.body, link: options.link },
  });

  if (options.email) {
    await enqueueEmail({
      to: options.email,
      title,
      body: options.body,
      actionLabel: options.link ? "View in Octagon" : undefined,
      actionUrl: options.link ? `${env.APP_URL}${options.link}` : undefined,
    });
  }
}

onDomainEvent("assignment.created", async (event) => {
  const influencer = await db.influencer.findUnique({
    where: { id: event.influencerId },
    include: { user: true },
  });
  const campaign = await db.campaign.findUnique({ where: { id: event.campaignId } });
  if (!influencer?.userId || !campaign) return;

  await notify(
    influencer.userId,
    "ASSIGNMENT_INVITE",
    `You've been invited to "${campaign.name}"`,
    {
      link: `/influencer/assignments/${event.assignmentId}`,
      email: influencer.user?.email,
    },
  );
});

onDomainEvent("assignment.status_changed", async (event) => {
  const assignment = await db.assignment.findUnique({
    where: { id: event.assignmentId },
    include: {
      influencer: { include: { user: true } },
      campaign: { include: { owner: true } },
    },
  });
  if (!assignment) return;

  const influencerUserId = assignment.influencer.userId;
  const isInfluencerActor = event.actorId === influencerUserId;

  // Influencer accepted/declined: tell the campaign owner.
  if (isInfluencerActor && assignment.campaign.ownerId !== event.actorId) {
    await notify(
      assignment.campaign.ownerId,
      "CAMPAIGN_STATUS_CHANGED",
      `${assignment.influencer.displayName} ${event.to.toLowerCase()} the invite for "${assignment.campaign.name}"`,
      {
        link: `/agency/campaigns/${event.campaignId}/assignments/${event.assignmentId}`,
      },
    );
    return;
  }

  // Agency changed status: tell the influencer, if they have portal access.
  if (!isInfluencerActor && influencerUserId) {
    await notify(
      influencerUserId,
      "CAMPAIGN_STATUS_CHANGED",
      `Your assignment on "${assignment.campaign.name}" is now ${event.to.replace("_", " ").toLowerCase()}`,
      {
        link: `/influencer/assignments/${event.assignmentId}`,
        email: assignment.influencer.user?.email,
      },
    );
  }
});

onDomainEvent("campaign.status_changed", async (event) => {
  const campaign = await db.campaign.findUnique({
    where: { id: event.campaignId },
    include: { brand: { include: { members: { include: { user: true } } } } },
  });
  if (!campaign) return;

  await Promise.all(
    campaign.brand.members.map((member) =>
      notify(
        member.userId,
        "CAMPAIGN_STATUS_CHANGED",
        `"${campaign.name}" is now ${event.to.replace("_", " ").toLowerCase()}`,
        {
          link: `/customer/campaigns/${campaign.id}`,
          email: member.user.email,
        },
      ),
    ),
  );
});

onDomainEvent("approval.decided", async (event) => {
  const submission = await db.contentSubmission.findUnique({
    where: { id: event.contentSubmissionId },
    include: {
      deliverable: {
        include: {
          assignment: {
            include: {
              influencer: { include: { user: true } },
              campaign: {
                include: { brand: { include: { members: { include: { user: true } } } } },
              },
            },
          },
        },
      },
    },
  });
  if (!submission) return;

  const { assignment } = submission.deliverable;
  const influencerUserId = assignment.influencer.userId;

  if (event.decision === "APPROVED" && event.stage === "INTERNAL") {
    // Internal cleared it — now it's the client's turn.
    await Promise.all(
      assignment.campaign.brand.members.map((member) =>
        notify(
          member.userId,
          "CONTENT_SUBMITTED",
          `New content ready for your review on "${assignment.campaign.name}"`,
          {
            link: `/customer/approvals`,
            email: member.user.email,
          },
        ),
      ),
    );
    return;
  }

  if (!influencerUserId) return;

  if (event.decision === "APPROVED" && event.stage === "CLIENT") {
    await notify(
      influencerUserId,
      "CONTENT_APPROVED",
      `Your submission for "${submission.deliverable.title}" was approved`,
      {
        link: `/influencer/assignments/${assignment.id}`,
        email: assignment.influencer.user?.email,
      },
    );
    return;
  }

  await notify(
    influencerUserId,
    "CONTENT_CHANGES_REQUESTED",
    `Changes requested on "${submission.deliverable.title}"`,
    {
      link: `/influencer/assignments/${assignment.id}`,
      email: assignment.influencer.user?.email,
    },
  );
});

onDomainEvent("message.sent", async (event) => {
  const influencer = await db.influencer.findUnique({
    where: { id: event.influencerId },
    include: { user: true },
  });
  const campaign = await db.campaign.findUnique({
    where: { id: event.campaignId },
  });
  if (!influencer || !campaign) return;

  const isInfluencerSender = event.senderId === influencer.userId;

  if (isInfluencerSender) {
    await notify(
      campaign.ownerId,
      "NEW_MESSAGE",
      `New message from ${influencer.displayName}`,
      {
        link: `/agency/campaigns/${campaign.id}/assignments`,
      },
    );
  } else if (influencer.userId) {
    await notify(influencer.userId, "NEW_MESSAGE", `New message about "${campaign.name}"`, {
      link: `/influencer/messages`,
      email: influencer.user?.email,
    });
  }
});

onDomainEvent("payment.status_changed", async (event) => {
  const payment = await db.payment.findUnique({
    where: { id: event.paymentId },
    include: { assignment: { include: { influencer: { include: { user: true } } } } },
  });
  if (!payment?.assignment.influencer.userId) return;

  await notify(
    payment.assignment.influencer.userId,
    "PAYMENT_STATUS_CHANGED",
    `Payment ${event.status === "PAID" ? "sent" : "updated"}: $${Number(payment.amount).toLocaleString()}`,
    {
      link: `/influencer/payments`,
      email: payment.assignment.influencer.user?.email,
    },
  );
});
