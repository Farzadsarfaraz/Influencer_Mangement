import "server-only";

import { db } from "@/lib/db";

const PAGE_SIZE = 30;

export async function listAuditLog(filters: { entityType?: string; page?: number }) {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const where = filters.entityType ? { entityType: filters.entityType } : {};

  const [entries, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      include: { actor: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.auditLog.count({ where }),
  ]);

  return { entries, total, page, pageSize: PAGE_SIZE, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function listAuditLogEntityTypes() {
  const rows = await db.auditLog.findMany({
    select: { entityType: true },
    distinct: ["entityType"],
    orderBy: { entityType: "asc" },
  });
  return rows.map((row) => row.entityType);
}
