import "server-only";

import { db } from "@/lib/db";

export async function getConversation(campaignId: string, influencerId: string) {
  return db.conversation.findUnique({
    where: { campaignId_influencerId: { campaignId, influencerId } },
    include: {
      messages: { include: { sender: true }, orderBy: { createdAt: "asc" } },
    },
  });
}

export async function listConversationsForInfluencer(influencerId: string) {
  const conversations = await db.conversation.findMany({
    where: { influencerId },
    include: {
      campaign: { include: { brand: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const assignments = await db.assignment.findMany({
    where: { influencerId, campaignId: { in: conversations.map((c) => c.campaignId) } },
    select: { id: true, campaignId: true },
  });
  const assignmentByCampaign = new Map(assignments.map((a) => [a.campaignId, a.id]));

  return conversations.map((conversation) => ({
    ...conversation,
    assignmentId: assignmentByCampaign.get(conversation.campaignId) ?? null,
  }));
}
