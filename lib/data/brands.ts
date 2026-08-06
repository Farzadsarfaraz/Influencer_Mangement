import "server-only";

import { db } from "@/lib/db";

/**
 * Brands a CLIENT_* user can see, scoped through BrandMember. This is the
 * pattern every read in lib/data follows: the caller's identity goes into
 * the `where` clause itself, never applied after the fact — see
 * docs/ARCHITECTURE.md §5.
 */
export async function getBrandsForUser(userId: string) {
  return db.brand.findMany({
    where: { members: { some: { userId } } },
    orderBy: { name: "asc" },
  });
}

export async function getCampaignCountForBrands(brandIds: string[]) {
  if (brandIds.length === 0) return 0;
  return db.campaign.count({
    where: {
      brandId: { in: brandIds },
      status: { in: ["ACTIVE", "PENDING_APPROVAL"] },
    },
  });
}

// Agency-side reads — no BrandMember scoping, agency roles see every brand.

const PAGE_SIZE = 25;

export async function listBrands(filters: { query?: string; page?: number }) {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const where = filters.query
    ? { name: { contains: filters.query, mode: "insensitive" as const } }
    : undefined;

  const [brands, total] = await Promise.all([
    db.brand.findMany({
      where,
      include: { _count: { select: { campaigns: true, members: true } } },
      orderBy: { name: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.brand.count({ where }),
  ]);

  return { brands, total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getBrandDetail(brandId: string) {
  return db.brand.findUnique({
    where: { id: brandId },
    include: {
      members: { include: { user: true }, orderBy: { role: "asc" } },
      campaigns: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getBrandBySlug(slug: string) {
  return db.brand.findUnique({ where: { slug } });
}

export async function listBrandOptions() {
  return db.brand.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
