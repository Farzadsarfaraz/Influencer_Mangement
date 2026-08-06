import "server-only";

import { renderToBuffer } from "@react-pdf/renderer";

import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { enqueueEmail } from "@/lib/jobs/email-queue";
import { CampaignSummaryPdf } from "@/lib/reports/campaign-summary-pdf";
import { buildCampaignSummaryWorkbook } from "@/lib/reports/campaign-summary-xlsx";
import { getCampaignSummaryReportData } from "@/lib/reports/data";
import { buildStorageKey } from "@/lib/storage/presign";
import { uploadBuffer } from "@/lib/storage/upload";

export async function generateReport(reportId: string) {
  const report = await db.report.findUnique({
    where: { id: reportId },
    include: { campaign: true, requestedBy: true },
  });
  if (!report) return;

  await db.report.update({
    where: { id: reportId },
    data: { status: "PROCESSING" },
  });

  try {
    if (!report.campaignId) {
      throw new Error("Report has no campaign to summarize.");
    }

    const data = await getCampaignSummaryReportData(report.campaignId);
    if (!data) throw new Error("Campaign not found.");

    const fileName = `${data.campaign.name.replace(/[^a-zA-Z0-9]+/g, "-")}-summary.${report.format === "PDF" ? "pdf" : "xlsx"}`;
    const key = buildStorageKey("reports", fileName);

    let buffer: Buffer;
    let contentType: string;
    if (report.format === "PDF") {
      buffer = await renderToBuffer(CampaignSummaryPdf({ data }));
      contentType = "application/pdf";
    } else {
      buffer = await buildCampaignSummaryWorkbook(data);
      contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }

    const { url } = await uploadBuffer(key, buffer, contentType);

    const fileAsset = await db.fileAsset.create({
      data: {
        entityType: "REPORT",
        entityId: reportId,
        uploadedById: report.requestedById,
        fileName,
        mimeType: contentType,
        sizeBytes: buffer.byteLength,
        storageKey: key,
        url,
      },
    });

    await db.report.update({
      where: { id: reportId },
      data: { status: "READY", fileAssetId: fileAsset.id, completedAt: new Date() },
    });

    await db.notification.create({
      data: {
        userId: report.requestedById,
        type: "REPORT_READY",
        title: `Your report for "${data.campaign.name}" is ready`,
        link: `/agency/campaigns/${report.campaignId}/reports`,
      },
    });

    if (report.requestedBy.email) {
      await enqueueEmail({
        to: report.requestedBy.email,
        title: `Your report for "${data.campaign.name}" is ready`,
        actionLabel: "Download report",
        actionUrl: `${env.APP_URL}/agency/campaigns/${report.campaignId}/reports`,
      });
    }
  } catch (error) {
    console.error(`[reports] generation failed for ${reportId}`, error);
    await db.report.update({
      where: { id: reportId },
      data: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
}
