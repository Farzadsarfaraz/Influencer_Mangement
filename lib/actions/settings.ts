"use server";

import { revalidatePath } from "next/cache";

import { ADMIN_ROLES } from "@/lib/auth/permissions";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/actions/brands";
import { GENERAL_SETTINGS_KEY } from "@/lib/data/settings";
import {
  generalSettingsSchema,
  type GeneralSettingsInput,
} from "@/lib/validations/settings";

export async function updateGeneralSettingsAction(
  input: GeneralSettingsInput,
): Promise<ActionResult> {
  await requireRole(ADMIN_ROLES);
  const parsed = generalSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await db.setting.upsert({
    where: { key: GENERAL_SETTINGS_KEY },
    update: { value: parsed.data },
    create: { key: GENERAL_SETTINGS_KEY, value: parsed.data },
  });

  revalidatePath("/agency/admin/settings");
  return { ok: true, data: undefined };
}
