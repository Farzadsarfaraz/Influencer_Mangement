import { z } from "zod";

export const createFeatureFlagSchema = z.object({
  key: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only."),
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional().or(z.literal("")),
});

export type CreateFeatureFlagInput = z.infer<typeof createFeatureFlagSchema>;
