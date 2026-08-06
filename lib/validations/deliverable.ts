import { z } from "zod";

import { platforms } from "@/lib/validations/influencer";

export const contentTypes = [
  "POST",
  "STORY",
  "REEL",
  "VIDEO",
  "SHORT",
  "BLOG",
  "LIVESTREAM",
  "OTHER",
] as const;

export const deliverableSchema = z.object({
  assignmentId: z.string().min(1),
  title: z.string().min(2, "Title must be at least 2 characters."),
  description: z.string().optional().or(z.literal("")),
  platform: z.enum(platforms),
  contentType: z.enum(contentTypes),
  dueDate: z.string().optional().or(z.literal("")),
});

export type DeliverableInput = z.infer<typeof deliverableSchema>;
