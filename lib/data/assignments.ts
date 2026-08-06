import "server-only";

import { db } from "@/lib/db";

export async function getAssignmentDetail(assignmentId: string) {
  return db.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      campaign: { include: { brand: true } },
      flight: true,
      influencer: true,
      deliverables: { orderBy: { dueDate: "asc" } },
      payments: true,
    },
  });
}
