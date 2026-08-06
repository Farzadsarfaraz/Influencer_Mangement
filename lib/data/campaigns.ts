import "server-only";

import type { CampaignStatus } from "@prisma/client";

import { db } from "@/lib/db";

const PAGE_SIZE = 25;

export async function listCampaigns(filters: {
  query?: string;
  status?: CampaignStatus;
  brandId?: string;
  page?: number;
}) {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const where = {
    ...(filters.query
      ? { name: { contains: filters.query, mode: "insensitive" as const } }
      : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.brandId ? { brandId: filters.brandId } : {}),
  };

  const [campaigns, total] = await Promise.all([
    db.campaign.findMany({
      where,
      include: {
        brand: true,
        owner: true,
        _count: { select: { assignments: true, flights: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.campaign.count({ where }),
  ]);

  return { campaigns, total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getCampaignHeader(campaignId: string) {
  return db.campaign.findUnique({
    where: { id: campaignId },
    include: { brand: true, owner: true },
  });
}

export async function getCampaignOverview(campaignId: string) {
  return db.campaign.findUnique({
    where: { id: campaignId },
    include: {
      brand: true,
      owner: true,
      _count: { select: { assignments: true, flights: true } },
    },
  });
}

export async function getCampaignFlights(campaignId: string) {
  return db.campaignFlight.findMany({
    where: { campaignId },
    include: { _count: { select: { assignments: true } } },
    orderBy: { startDate: "asc" },
  });
}

export async function getCampaignAssignments(campaignId: string) {
  return db.assignment.findMany({
    where: { campaignId },
    include: {
      influencer: true,
      flight: true,
      _count: { select: { deliverables: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Customer-portal reads — always scoped to the caller's brand memberships.

export async function listCampaignsForBrands(brandIds: string[]) {
  if (brandIds.length === 0) return [];
  return db.campaign.findMany({
    where: { brandId: { in: brandIds } },
    include: { brand: true, _count: { select: { assignments: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCampaignForBrands(campaignId: string, brandIds: string[]) {
  if (brandIds.length === 0) return null;
  return db.campaign.findFirst({
    where: { id: campaignId, brandId: { in: brandIds } },
    include: {
      brand: true,
      owner: true,
      assignments: {
        include: { influencer: true, deliverables: true },
      },
    },
  });
}
