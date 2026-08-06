import "server-only";

import { db } from "@/lib/db";

export const GENERAL_SETTINGS_KEY = "app.general";

export type GeneralSettings = {
  companyName: string;
  defaultCurrency: string;
  supportEmail: string;
};

const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  companyName: "Octagon",
  defaultCurrency: "USD",
  supportEmail: "support@octagon.dev",
};

export async function getGeneralSettings(): Promise<GeneralSettings> {
  const row = await db.setting.findUnique({ where: { key: GENERAL_SETTINGS_KEY } });
  if (!row) return DEFAULT_GENERAL_SETTINGS;
  return { ...DEFAULT_GENERAL_SETTINGS, ...(row.value as Partial<GeneralSettings>) };
}
