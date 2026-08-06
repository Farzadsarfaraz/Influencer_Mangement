import { z } from "zod";

export const paymentStatuses = [
  "PENDING",
  "SCHEDULED",
  "PAID",
  "FAILED",
  "CANCELLED",
] as const;

export const createPaymentSchema = z.object({
  assignmentId: z.string().min(1),
  amount: z.number().positive("Amount must be greater than zero."),
  currency: z.string().min(3).max(3),
  method: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export const updatePaymentStatusSchema = z.object({
  paymentId: z.string().min(1),
  status: z.enum(paymentStatuses),
});

export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
