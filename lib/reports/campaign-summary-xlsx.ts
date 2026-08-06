import ExcelJS from "exceljs";

import type { CampaignSummaryReportData } from "@/lib/reports/data";

export async function buildCampaignSummaryWorkbook(
  data: CampaignSummaryReportData,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Octagon";
  workbook.created = data.generatedAt;

  const overview = workbook.addWorksheet("Overview");
  overview.columns = [
    { header: "Field", key: "field", width: 24 },
    { header: "Value", key: "value", width: 40 },
  ];
  overview.addRows([
    { field: "Campaign", value: data.campaign.name },
    { field: "Brand", value: data.campaign.brandName },
    { field: "Status", value: data.campaign.status },
    { field: "Objective", value: data.campaign.objective ?? "" },
    {
      field: "Budget",
      value: data.campaign.budget
        ? `${data.campaign.budget.toLocaleString()} ${data.campaign.currency}`
        : "",
    },
    { field: "Reach", value: data.summary.reach },
    { field: "Impressions", value: data.summary.impressions },
    { field: "Engagements", value: data.summary.engagements },
    { field: "Engagement rate", value: `${data.summary.engagementRate.toFixed(2)}%` },
    { field: "Views", value: data.summary.views },
    { field: "Clicks", value: data.summary.clicks },
  ]);
  overview.getRow(1).font = { bold: true };

  const byInfluencer = workbook.addWorksheet("By influencer");
  byInfluencer.columns = [
    { header: "Influencer", key: "displayName", width: 28 },
    { header: "Reach", key: "reach", width: 14 },
    { header: "Impressions", key: "impressions", width: 14 },
    { header: "Engagements", key: "engagements", width: 14 },
    { header: "Views", key: "views", width: 14 },
  ];
  byInfluencer.addRows(data.byInfluencer);
  byInfluencer.getRow(1).font = { bold: true };

  const assignments = workbook.addWorksheet("Assignments");
  assignments.columns = [
    { header: "Influencer", key: "influencerName", width: 28 },
    { header: "Status", key: "status", width: 20 },
    { header: "Fee", key: "fee", width: 14 },
    { header: "Deliverables", key: "deliverableCount", width: 14 },
  ];
  assignments.addRows(data.assignments);
  assignments.getRow(1).font = { bold: true };

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
