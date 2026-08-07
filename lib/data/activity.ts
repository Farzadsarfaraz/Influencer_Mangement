import "server-only";

import { db } from "@/lib/db";

/** Agency-wide feed for the dashboard — every campaign, most recent first. */
export async function getRecentAgencyActivity(take = 8) {
  return db.activityEvent.findMany({
    include: { actor: true, campaign: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getCampaignActivity(campaignId: string, take = 50) {
  return db.activityEvent.findMany({
    where: { campaignId },
    include: { actor: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getEntityActivity(
  entityType: string,
  entityId: string,
  take = 50,
) {
  return db.activityEvent.findMany({
    where: { entityType, entityId },
    include: { actor: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}
