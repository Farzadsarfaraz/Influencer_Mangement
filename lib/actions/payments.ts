"use server";

import { revalidatePath } from "next/cache";

import { CAMPAIGN_MANAGER_ROLES } from "@/lib/auth/permissions";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/actions/brands";
import { emitDomainEvent } from "@/lib/events/emitter";
import {
  createPaymentSchema,
  updatePaymentStatusSchema,
  type CreatePaymentInput,
  type UpdatePaymentStatusInput,
} from "@/lib/validations/payment";

export async function createPaymentAction(
  input: CreatePaymentInput,
): Promise<ActionResult> {
  await requireRole(CAMPAIGN_MANAGER_ROLES);
  const parsed = createPaymentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const assignment = await db.assignment.findUnique({
    where: { id: parsed.data.assignmentId },
  });
  if (!assignment) return { ok: false, error: "Assignment not found." };

  await db.payment.create({
    data: {
      assignmentId: parsed.data.assignmentId,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      method: parsed.data.method || null,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    },
  });

  revalidatePath(
    `/agency/campaigns/${assignment.campaignId}/assignments/${assignment.id}`,
  );
  return { ok: true, data: undefined };
}

export async function updatePaymentStatusAction(
  input: UpdatePaymentStatusInput,
): Promise<ActionResult> {
  await requireRole(CAMPAIGN_MANAGER_ROLES);
  const parsed = updatePaymentStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const payment = await db.payment.findUnique({
    where: { id: parsed.data.paymentId },
    include: { assignment: true },
  });
  if (!payment) return { ok: false, error: "Payment not found." };

  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: parsed.data.status,
      paidAt: parsed.data.status === "PAID" ? new Date() : payment.paidAt,
    },
  });

  emitDomainEvent({
    type: "payment.status_changed",
    paymentId: payment.id,
    assignmentId: payment.assignmentId,
    status: parsed.data.status,
  });

  revalidatePath(
    `/agency/campaigns/${payment.assignment.campaignId}/assignments/${payment.assignmentId}`,
  );
  return { ok: true, data: undefined };
}
