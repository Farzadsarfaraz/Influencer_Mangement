"use server";

import { revalidatePath } from "next/cache";

import { ADMIN_ROLES } from "@/lib/auth/permissions";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/actions/brands";
import { issueInviteToken } from "@/lib/actions/invite";
import {
  createAgencyUserSchema,
  type CreateAgencyUserInput,
} from "@/lib/validations/user";
import type { Role } from "@prisma/client";

export async function createAgencyUserAction(
  input: CreateAgencyUserInput,
): Promise<ActionResult<{ inviteUrl: string }>> {
  const actor = await requireRole(ADMIN_ROLES);
  const parsed = createAgencyUserSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  if (parsed.data.role === "SUPER_ADMIN" && actor.role !== "SUPER_ADMIN") {
    return { ok: false, error: "Only a super admin can grant super admin access." };
  }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { ok: false, error: "A user with this email already exists." };

  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      status: "INVITED",
    },
  });

  const token = await issueInviteToken(user.email);

  revalidatePath("/agency/admin/users");
  return { ok: true, data: { inviteUrl: `/invite/${token}` } };
}

export async function changeUserRoleAction(
  userId: string,
  newRole: Role,
): Promise<ActionResult> {
  const actor = await requireRole(ADMIN_ROLES);

  if (userId === actor.id) {
    return { ok: false, error: "You can't change your own role." };
  }

  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target) return { ok: false, error: "User not found." };

  if (
    (newRole === "SUPER_ADMIN" || target.role === "SUPER_ADMIN") &&
    actor.role !== "SUPER_ADMIN"
  ) {
    return { ok: false, error: "Only a super admin can grant or revoke super admin access." };
  }

  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { role: newRole, tokenVersion: { increment: 1 } },
    }),
    db.auditLog.create({
      data: {
        actorId: actor.id,
        action: "user.role_changed",
        entityType: "User",
        entityId: userId,
        before: { role: target.role },
        after: { role: newRole },
      },
    }),
  ]);

  revalidatePath("/agency/admin/users");
  return { ok: true, data: undefined };
}

export async function setUserStatusAction(
  userId: string,
  status: "ACTIVE" | "SUSPENDED",
): Promise<ActionResult> {
  const actor = await requireRole(ADMIN_ROLES);

  if (userId === actor.id) {
    return { ok: false, error: "You can't change your own account status." };
  }

  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target) return { ok: false, error: "User not found." };
  if (target.role === "SUPER_ADMIN" && actor.role !== "SUPER_ADMIN") {
    return { ok: false, error: "Only a super admin can manage another super admin." };
  }

  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { status, tokenVersion: { increment: 1 } },
    }),
    db.auditLog.create({
      data: {
        actorId: actor.id,
        action: "user.status_changed",
        entityType: "User",
        entityId: userId,
        before: { status: target.status },
        after: { status },
      },
    }),
  ]);

  revalidatePath("/agency/admin/users");
  return { ok: true, data: undefined };
}
