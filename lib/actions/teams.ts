"use server";

import { revalidatePath } from "next/cache";

import { isAdmin } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/actions/brands";
import {
  addTeamMemberSchema,
  teamSchema,
  type AddTeamMemberInput,
  type TeamInput,
} from "@/lib/validations/team";

async function requireAdmin() {
  const user = await requireUser();
  if (!isAdmin(user.role)) throw new Error("FORBIDDEN");
  return user;
}

export async function createTeamAction(
  input: TeamInput,
): Promise<ActionResult<{ teamId: string }>> {
  await requireAdmin();
  const parsed = teamSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const team = await db.team.create({ data: { name: parsed.data.name } });
  revalidatePath("/agency/teams");
  return { ok: true, data: { teamId: team.id } };
}

export async function addTeamMemberAction(
  input: AddTeamMemberInput,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = addTeamMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await db.teamMember.upsert({
    where: {
      teamId_userId: {
        teamId: parsed.data.teamId,
        userId: parsed.data.userId,
      },
    },
    update: { role: parsed.data.role },
    create: parsed.data,
  });

  revalidatePath(`/agency/teams/${parsed.data.teamId}`);
  return { ok: true, data: undefined };
}

export async function removeTeamMemberAction(
  teamId: string,
  userId: string,
): Promise<ActionResult> {
  await requireAdmin();
  await db.teamMember.delete({ where: { teamId_userId: { teamId, userId } } });
  revalidatePath(`/agency/teams/${teamId}`);
  return { ok: true, data: undefined };
}
