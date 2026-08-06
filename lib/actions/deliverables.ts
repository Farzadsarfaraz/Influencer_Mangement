"use server";

import { revalidatePath } from "next/cache";

import { CAMPAIGN_MANAGER_ROLES } from "@/lib/auth/permissions";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/actions/brands";
import {
  deliverableSchema,
  type DeliverableInput,
} from "@/lib/validations/deliverable";

export async function addDeliverableAction(
  input: DeliverableInput,
): Promise<ActionResult> {
  await requireRole(CAMPAIGN_MANAGER_ROLES);
  const parsed = deliverableSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const assignment = await db.assignment.findUnique({
    where: { id: parsed.data.assignmentId },
  });
  if (!assignment) return { ok: false, error: "Assignment not found." };

  await db.deliverable.create({
    data: {
      assignmentId: parsed.data.assignmentId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      platform: parsed.data.platform,
      contentType: parsed.data.contentType,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    },
  });

  revalidatePath(
    `/agency/campaigns/${assignment.campaignId}/assignments/${assignment.id}`,
  );
  return { ok: true, data: undefined };
}

export async function removeDeliverableAction(
  deliverableId: string,
): Promise<ActionResult> {
  await requireRole(CAMPAIGN_MANAGER_ROLES);

  const deliverable = await db.deliverable.findUnique({
    where: { id: deliverableId },
    include: { assignment: true },
  });
  if (!deliverable) return { ok: false, error: "Deliverable not found." };

  await db.deliverable.delete({ where: { id: deliverableId } });

  revalidatePath(
    `/agency/campaigns/${deliverable.assignment.campaignId}/assignments/${deliverable.assignmentId}`,
  );
  return { ok: true, data: undefined };
}
