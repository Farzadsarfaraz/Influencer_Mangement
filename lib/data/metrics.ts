import "server-only";

import { db } from "@/lib/db";

export async function getCampaignMetricsSummary(campaignId: string) {
  const totals = await db.campaignMetricSnapshot.aggregate({
    where: { campaignId },
    _sum: {
      reach: true,
      impressions: true,
      engagements: true,
      views: true,
      clicks: true,
      spend: true,
    },
  });

  const reach = totals._sum.reach ?? 0;
  const impressions = totals._sum.impressions ?? 0;
  const engagements = totals._sum.engagements ?? 0;
  const views = totals._sum.views ?? 0;
  const clicks = totals._sum.clicks ?? 0;
  const spend = totals._sum.spend ? Number(totals._sum.spend) : 0;

  return {
    reach,
    impressions,
    engagements,
    views,
    clicks,
    spend,
    engagementRate: impressions > 0 ? (engagements / impressions) * 100 : 0,
  };
}

export async function getCampaignMetricsByDate(campaignId: string) {
  const snapshots = await db.campaignMetricSnapshot.groupBy({
    by: ["date"],
    where: { campaignId },
    _sum: { reach: true, impressions: true, engagements: true },
    orderBy: { date: "asc" },
  });

  return snapshots.map((row) => ({
    date: row.date,
    reach: row._sum.reach ?? 0,
    impressions: row._sum.impressions ?? 0,
    engagements: row._sum.engagements ?? 0,
  }));
}

export async function getCampaignMetricsByInfluencer(campaignId: string) {
  const rows = await db.campaignMetricSnapshot.groupBy({
    by: ["influencerId"],
    where: { campaignId, influencerId: { not: null } },
    _sum: { reach: true, impressions: true, engagements: true, views: true },
  });

  const influencers = await db.influencer.findMany({
    where: { id: { in: rows.map((r) => r.influencerId).filter((id): id is string => !!id) } },
    select: { id: true, displayName: true },
  });
  const byId = new Map(influencers.map((i) => [i.id, i.displayName]));

  return rows
    .filter((row) => row.influencerId)
    .map((row) => ({
      influencerId: row.influencerId as string,
      displayName: byId.get(row.influencerId as string) ?? "Unknown",
      reach: row._sum.reach ?? 0,
      impressions: row._sum.impressions ?? 0,
      engagements: row._sum.engagements ?? 0,
      views: row._sum.views ?? 0,
    }));
}

export async function listMetricSnapshots(campaignId: string) {
  return db.campaignMetricSnapshot.findMany({
    where: { campaignId },
    orderBy: { date: "desc" },
    take: 100,
  });
}
