import { z } from "zod";

export const campaignStatuses = [
  "DRAFT",
  "PENDING_APPROVAL",
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "CANCELLED",
  "ARCHIVED",
] as const;

export const campaignSchema = z.object({
  brandId: z.string().min(1, "Choose a brand."),
  ownerId: z.string().min(1, "Choose an owner."),
  name: z.string().min(2, "Name must be at least 2 characters."),
  objective: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  budget: z.number().nonnegative().optional(),
  currency: z.string().min(3).max(3),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
});

export type CampaignInput = z.infer<typeof campaignSchema>;

export const campaignStatusChangeSchema = z.object({
  campaignId: z.string().min(1),
  status: z.enum(campaignStatuses),
});

export type CampaignStatusChangeInput = z.infer<typeof campaignStatusChangeSchema>;
