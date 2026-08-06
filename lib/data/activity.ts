import "server-only";

import { db } from "@/lib/db";

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
