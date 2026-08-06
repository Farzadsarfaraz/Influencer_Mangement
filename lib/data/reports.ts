import "server-only";

import { db } from "@/lib/db";

export async function listReportsForCampaign(campaignId: string) {
  return db.report.findMany({
    where: { campaignId },
    include: { requestedBy: true },
    orderBy: { createdAt: "desc" },
  });
}
