import "server-only";

import { Queue } from "bullmq";

import { redisConnection } from "@/lib/jobs/connection";
import type { NotificationEmailPayload } from "@/lib/email/send";

export const emailQueue = new Queue<NotificationEmailPayload>("email", {
  connection: redisConnection,
});

export async function enqueueEmail(payload: NotificationEmailPayload) {
  await emailQueue.add("send-email", payload, {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  });
}
