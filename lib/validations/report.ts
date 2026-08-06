import { z } from "zod";

export const requestReportSchema = z.object({
  campaignId: z.string().min(1),
  format: z.enum(["PDF", "XLSX"]),
});

export type RequestReportInput = z.infer<typeof requestReportSchema>;
