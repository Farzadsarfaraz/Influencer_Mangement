import "server-only";

import type { Role, UserStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { CAMPAIGN_MANAGER_ROLES } from "@/lib/auth/permissions";

export async function listCampaignOwnerOptions() {
  return db.user.findMany({
    where: { role: { in: CAMPAIGN_MANAGER_ROLES }, status: "ACTIVE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

const PAGE_SIZE = 25;

export async function listUsers(filters: {
  query?: string;
  role?: Role;
  status?: UserStatus;
  page?: number;
}) {
  const page = filters.page && filters.page > 0 ? filters.page : 1;

  const where = {
    ...(filters.query
      ? {
          OR: [
            { name: { contains: filters.query, mode: "insensitive" as const } },
            { email: { contains: filters.query, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(filters.role ? { role: filters.role } : {}),
    ...(filters.status ? { status: filters.status } : {}),
  };

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.user.count({ where }),
  ]);

  return { users, total, page, pageSize: PAGE_SIZE, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}
