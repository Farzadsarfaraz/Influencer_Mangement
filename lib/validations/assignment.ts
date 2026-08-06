import { z } from "zod";

export const assignmentStatuses = [
  "INVITED",
  "ACCEPTED",
  "DECLINED",
  "IN_PROGRESS",
  "SUBMITTED",
  "IN_REVIEW",
  "APPROVED",
  "REVISION_REQUESTED",
  "COMPLETED",
  "CANCELLED",
] as const;

export const assignmentSchema = z.object({
  campaignId: z.string().min(1),
  flightId: z.string().optional().or(z.literal("")),
  influencerId: z.string().min(1, "Choose an influencer."),
  fee: z.number().nonnegative().optional(),
  currency: z.string().min(3).max(3),
  dueDate: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type AssignmentInput = z.infer<typeof assignmentSchema>;

export const assignmentStatusChangeSchema = z.object({
  assignmentId: z.string().min(1),
  status: z.enum(assignmentStatuses),
});

export type AssignmentStatusChangeInput = z.infer<
  typeof assignmentStatusChangeSchema
>;
