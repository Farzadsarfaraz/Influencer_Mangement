import "server-only";

import { db } from "@/lib/db";
import { enqueueEmail } from "@/lib/jobs/email-queue";
import { env } from "@/lib/env";

const REMINDER_WINDOW_HOURS = 24;
const DEDUPE_WINDOW_HOURS = 20;

/**
 * Finds deliverables due within the next 24h that haven't been submitted
 * yet, and notifies the assigned influencer once per dedupe window. Meant
 * to run on a BullMQ repeatable schedule from the worker process — see
 * worker/index.ts.
 */
export async function runDeadlineReminderSweep() {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_HOURS * 60 * 60 * 1000);
  const dedupeSince = new Date(now.getTime() - DEDUPE_WINDOW_HOURS * 60 * 60 * 1000);

  const dueDeliverables = await db.deliverable.findMany({
    where: {
      dueDate: { gte: now, lte: windowEnd },
      status: { in: ["PENDING", "IN_PROGRESS"] },
    },
    include: {
      assignment: { include: { influencer: true, campaign: true } },
    },
  });

  let notified = 0;

  for (const deliverable of dueDeliverables) {
    const { assignment } = deliverable;
    if (!assignment.influencer.userId) continue;

    const link = `/influencer/assignments/${assignment.id}`;

    const alreadyNotified = await db.notification.findFirst({
      where: {
        userId: assignment.influencer.userId,
        type: "DELIVERABLE_DUE_SOON",
        link,
        createdAt: { gte: dedupeSince },
      },
    });
    if (alreadyNotified) continue;

    const title = `"${deliverable.title}" is due soon`;
    const body = `Due ${deliverable.dueDate?.toLocaleDateString()} for ${assignment.campaign.name}.`;

    await db.notification.create({
      data: {
        userId: assignment.influencer.userId,
        type: "DELIVERABLE_DUE_SOON",
        title,
        body,
        link,
      },
    });

    if (assignment.influencer.email) {
      await enqueueEmail({
        to: assignment.influencer.email,
        title,
        body,
        actionLabel: "View assignment",
        actionUrl: `${env.APP_URL}${link}`,
      });
    }

    notified += 1;
  }

  return { scanned: dueDeliverables.length, notified };
}
