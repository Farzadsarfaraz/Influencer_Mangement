import { z } from "zod";

import { platforms } from "@/lib/validations/influencer";

export const metricSnapshotSchema = z.object({
  campaignId: z.string().min(1),
  influencerId: z.string().optional().or(z.literal("")),
  platform: z.enum(platforms).optional(),
  date: z.string().min(1, "Date is required."),
  reach: z.number().int().nonnegative(),
  impressions: z.number().int().nonnegative(),
  engagements: z.number().int().nonnegative(),
  views: z.number().int().nonnegative(),
  clicks: z.number().int().nonnegative(),
  spend: z.number().nonnegative().optional(),
});

export type MetricSnapshotInput = z.infer<typeof metricSnapshotSchema>;

export const importMetricSnapshotsSchema = z.object({
  campaignId: z.string().min(1),
  csv: z.string().min(1, "Paste at least one row."),
});

export type ImportMetricSnapshotsInput = z.infer<typeof importMetricSnapshotsSchema>;
