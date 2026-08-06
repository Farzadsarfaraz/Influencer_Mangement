import "server-only";

import { db } from "@/lib/db";

export async function listPaymentsForAssignment(assignmentId: string) {
  return db.payment.findMany({
    where: { assignmentId },
    orderBy: { createdAt: "desc" },
  });
}

export async function listPaymentsForInfluencer(influencerId: string) {
  return db.payment.findMany({
    where: { assignment: { influencerId } },
    include: { assignment: { include: { campaign: { include: { brand: true } } } } },
    orderBy: { createdAt: "desc" },
  });
}
