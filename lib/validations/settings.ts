import { z } from "zod";

export const generalSettingsSchema = z.object({
  companyName: z.string().min(1, "Required."),
  defaultCurrency: z.string().min(3).max(3),
  supportEmail: z.email(),
});

export type GeneralSettingsInput = z.infer<typeof generalSettingsSchema>;
