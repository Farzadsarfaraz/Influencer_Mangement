import "server-only";

import { db } from "@/lib/db";
import { getCampaignAssignments, getCampaignHeader } from "@/lib/data/campaigns";
import {
  getCampaignMetricsByInfluencer,
  getCampaignMetricsSummary,
} from "@/lib/data/metrics";

export async function getCampaignSummaryReportData(campaignId: string) {
  const campaign = await getCampaignHeader(campaignId);
  if (!campaign) return null;

  const [summary, byInfluencer, assignments] = await Promise.all([
    getCampaignMetricsSummary(campaignId),
    getCampaignMetricsByInfluencer(campaignId),
    getCampaignAssignments(campaignId),
  ]);

  const deliverableCounts = await db.deliverable.groupBy({
    by: ["status"],
    where: { assignment: { campaignId } },
    _count: true,
  });

  return {
    campaign: {
      name: campaign.name,
      brandName: campaign.brand.name,
      status: campaign.status,
      objective: campaign.objective,
      budget: campaign.budget ? Number(campaign.budget) : null,
      currency: campaign.currency,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
    },
    summary,
    byInfluencer,
    assignments: assignments.map((a) => ({
      influencerName: a.influencer.displayName,
      status: a.status,
      fee: a.fee ? Number(a.fee) : null,
      deliverableCount: a._count.deliverables,
    })),
    deliverablesByStatus: deliverableCounts.map((row) => ({
      status: row.status,
      count: row._count,
    })),
    generatedAt: new Date(),
  };
}

export type CampaignSummaryReportData = NonNullable<
  Awaited<ReturnType<typeof getCampaignSummaryReportData>>
>;
