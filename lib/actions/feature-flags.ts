"use server";

import { revalidatePath } from "next/cache";

import { ADMIN_ROLES } from "@/lib/auth/permissions";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/actions/brands";
import {
  createFeatureFlagSchema,
  type CreateFeatureFlagInput,
} from "@/lib/validations/feature-flag";

export async function createFeatureFlagAction(
  input: CreateFeatureFlagInput,
): Promise<ActionResult> {
  await requireRole(ADMIN_ROLES);
  const parsed = createFeatureFlagSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await db.featureFlag.findUnique({ where: { key: parsed.data.key } });
  if (existing) return { ok: false, error: "A flag with this key already exists." };

  await db.featureFlag.create({
    data: {
      key: parsed.data.key,
      name: parsed.data.name,
      description: parsed.data.description || null,
      enabled: false,
    },
  });

  revalidatePath("/agency/admin/feature-flags");
  return { ok: true, data: undefined };
}

export async function toggleFeatureFlagAction(
  flagId: string,
  enabled: boolean,
): Promise<ActionResult> {
  await requireRole(ADMIN_ROLES);
  await db.featureFlag.update({ where: { id: flagId }, data: { enabled } });
  revalidatePath("/agency/admin/feature-flags");
  return { ok: true, data: undefined };
}
