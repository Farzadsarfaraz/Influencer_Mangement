import "server-only";

import type { InfluencerStatus, InfluencerTier } from "@prisma/client";

import { db } from "@/lib/db";

// Agency-side CRM reads.

export async function listInfluencerOptions() {
  return db.influencer.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, displayName: true, tier: true },
    orderBy: { displayName: "asc" },
  });
}

const PAGE_SIZE = 25;

export async function listInfluencers(filters: {
  query?: string;
  tier?: InfluencerTier;
  status?: InfluencerStatus;
  page?: number;
}) {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const where = {
    ...(filters.query
      ? {
          OR: [
            { displayName: { contains: filters.query, mode: "insensitive" as const } },
            { email: { contains: filters.query, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(filters.tier ? { tier: filters.tier } : {}),
    ...(filters.status ? { status: filters.status } : {}),
  };

  const [influencers, total] = await Promise.all([
    db.influencer.findMany({
      where,
      include: {
        socialAccounts: true,
        tags: true,
        _count: { select: { assignments: true } },
      },
      orderBy: { displayName: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.influencer.count({ where }),
  ]);

  return { influencers, total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getInfluencerDetail(influencerId: string) {
  return db.influencer.findUnique({
    where: { id: influencerId },
    include: {
      user: true,
      socialAccounts: { orderBy: { platform: "asc" } },
      tags: true,
      notes: { include: { author: true }, orderBy: { createdAt: "desc" } },
      assignments: {
        include: { campaign: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getInfluencerForUser(userId: string) {
  return db.influencer.findUnique({
    where: { userId },
  });
}

export async function listAssignmentsForInfluencer(influencerId: string) {
  return db.assignment.findMany({
    where: { influencerId },
    include: {
      campaign: { include: { brand: true } },
      _count: { select: { deliverables: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAssignmentCountsForInfluencer(influencerId: string) {
  const [active, awaitingResponse] = await Promise.all([
    db.assignment.count({
      where: {
        influencerId,
        status: { in: ["ACCEPTED", "IN_PROGRESS", "SUBMITTED", "IN_REVIEW"] },
      },
    }),
    db.assignment.count({
      where: { influencerId, status: "INVITED" },
    }),
  ]);
  return { active, awaitingResponse };
}
