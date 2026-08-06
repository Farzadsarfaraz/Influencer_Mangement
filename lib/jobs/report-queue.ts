import "server-only";

import { Queue } from "bullmq";

import { redisConnection } from "@/lib/jobs/connection";

export type GenerateReportJobData = { reportId: string };

export const reportQueue = new Queue<GenerateReportJobData>("reports", {
  connection: redisConnection,
});

export async function enqueueReportGeneration(reportId: string) {
  await reportQueue.add(
    "generate",
    { reportId },
    { attempts: 2, removeOnComplete: 50, removeOnFail: 100 },
  );
}
