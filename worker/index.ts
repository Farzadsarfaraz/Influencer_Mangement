import { Queue, Worker } from "bullmq";

import { redisConnection } from "@/lib/jobs/connection";
import { runDeadlineReminderSweep } from "@/lib/jobs/deadline-reminders";
import { generateReport } from "@/lib/jobs/generate-report";
import type { GenerateReportJobData } from "@/lib/jobs/report-queue";
import { sendNotificationEmail } from "@/lib/email/send";
import type { NotificationEmailPayload } from "@/lib/email/send";

const emailWorker = new Worker<NotificationEmailPayload>(
  "email",
  async (job) => {
    await sendNotificationEmail(job.data);
  },
  { connection: redisConnection, concurrency: 5 },
);

const deadlineReminderQueue = new Queue("deadline-reminders", {
  connection: redisConnection,
});

const deadlineReminderWorker = new Worker(
  "deadline-reminders",
  async () => {
    const result = await runDeadlineReminderSweep();
    console.log(
      `[deadline-reminders] scanned ${result.scanned}, notified ${result.notified}`,
    );
  },
  { connection: redisConnection, concurrency: 1 },
);

async function scheduleDeadlineSweep() {
  await deadlineReminderQueue.upsertJobScheduler(
    "deadline-reminder-sweep",
    { every: 60 * 60 * 1000 },
    { name: "sweep", opts: { removeOnComplete: 5, removeOnFail: 20 } },
  );
}

const reportWorker = new Worker<GenerateReportJobData>(
  "reports",
  async (job) => {
    await generateReport(job.data.reportId);
  },
  { connection: redisConnection, concurrency: 2 },
);

for (const worker of [emailWorker, deadlineReminderWorker, reportWorker]) {
  worker.on("failed", (job, error) => {
    console.error(`[worker:${worker.name}] job ${job?.id} failed`, error);
  });
}

scheduleDeadlineSweep()
  .then(() => console.log("Worker started: email, deadline-reminders (hourly), reports"))
  .catch((error) => {
    console.error("Failed to schedule deadline reminder sweep", error);
    process.exit(1);
  });

async function shutdown() {
  await Promise.all([
    emailWorker.close(),
    deadlineReminderWorker.close(),
    deadlineReminderQueue.close(),
    reportWorker.close(),
  ]);
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
