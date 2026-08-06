import { z } from "zod";

export const addCommentSchema = z.object({
  contentSubmissionId: z.string().min(1),
  body: z.string().min(1, "Comment can't be empty."),
  parentId: z.string().optional().or(z.literal("")),
});

export type AddCommentInput = z.infer<typeof addCommentSchema>;
