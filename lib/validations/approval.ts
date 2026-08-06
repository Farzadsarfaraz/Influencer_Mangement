import { z } from "zod";

export const decideApprovalSchema = z.object({
  approvalRequestId: z.string().min(1),
  decision: z.enum(["APPROVED", "CHANGES_REQUESTED", "REJECTED"]),
  comment: z.string().optional().or(z.literal("")),
});

export type DecideApprovalInput = z.infer<typeof decideApprovalSchema>;
