"use server";

import { revalidatePath } from "next/cache";

import { CAMPAIGN_MANAGER_ROLES } from "@/lib/auth/permissions";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { issueInviteToken } from "@/lib/actions/invite";
import { slugify } from "@/lib/utils";
import {
  brandSchema,
  inviteBrandMemberSchema,
  type BrandInput,
  type InviteBrandMemberInput,
} from "@/lib/validations/brand";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function uniqueSlug(base: string) {
  const root = slugify(base);
  let candidate = root;
  let attempt = 1;
  while (await db.brand.findUnique({ where: { slug: candidate } })) {
    attempt += 1;
    candidate = `${root}-${attempt}`;
  }
  return candidate;
}

export async function createBrandAction(
  input: BrandInput,
): Promise<ActionResult<{ brandId: string }>> {
  const actor = await requireRole(CAMPAIGN_MANAGER_ROLES);
  const parsed = brandSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const slug = await uniqueSlug(parsed.data.slug || parsed.data.name);

  const brand = await db.brand.create({
    data: {
      name: parsed.data.name,
      slug,
      industry: parsed.data.industry || null,
      website: parsed.data.website || null,
      primaryContactName: parsed.data.primaryContactName || null,
      primaryContactEmail: parsed.data.primaryContactEmail || null,
    },
  });

  await db.activityEvent.create({
    data: {
      actorId: actor.id,
      verb: "brand.created",
      entityType: "Brand",
      entityId: brand.id,
      metadata: { name: brand.name },
    },
  });

  revalidatePath("/agency/brands");
  return { ok: true, data: { brandId: brand.id } };
}

export async function setBrandStatusAction(
  brandId: string,
  status: "ACTIVE" | "INACTIVE",
): Promise<ActionResult> {
  await requireRole(CAMPAIGN_MANAGER_ROLES);
  await db.brand.update({ where: { id: brandId }, data: { status } });
  revalidatePath("/agency/brands");
  revalidatePath(`/agency/brands/${brandId}`);
  return { ok: true, data: undefined };
}

export async function inviteBrandMemberAction(
  input: InviteBrandMemberInput,
): Promise<ActionResult<{ inviteUrl: string }>> {
  const actor = await requireRole(CAMPAIGN_MANAGER_ROLES);
  const parsed = inviteBrandMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { brandId, name, email, role } = parsed.data;

  const brand = await db.brand.findUnique({ where: { id: brandId } });
  if (!brand) return { ok: false, error: "Brand not found." };

  let user = await db.user.findUnique({ where: { email } });

  if (user && user.role !== "CLIENT_ADMIN" && user.role !== "CLIENT_VIEWER") {
    return { ok: false, error: "This email belongs to a non-client account." };
  }

  if (!user) {
    user = await db.user.create({
      data: {
        name,
        email,
        role: role === "ADMIN" ? "CLIENT_ADMIN" : "CLIENT_VIEWER",
        status: "INVITED",
      },
    });
  }

  await db.brandMember.upsert({
    where: { brandId_userId: { brandId, userId: user.id } },
    update: { role },
    create: { brandId, userId: user.id, role },
  });

  await db.activityEvent.create({
    data: {
      actorId: actor.id,
      verb: "brand.member_invited",
      entityType: "Brand",
      entityId: brandId,
      metadata: { email },
    },
  });

  let inviteUrl = "";
  if (user.status === "INVITED") {
    const token = await issueInviteToken(user.email);
    inviteUrl = `/invite/${token}`;
  }

  revalidatePath(`/agency/brands/${brandId}`);
  return { ok: true, data: { inviteUrl } };
}

export async function removeBrandMemberAction(
  brandId: string,
  userId: string,
): Promise<ActionResult> {
  await requireRole(CAMPAIGN_MANAGER_ROLES);
  await db.brandMember.delete({
    where: { brandId_userId: { brandId, userId } },
  });
  revalidatePath(`/agency/brands/${brandId}`);
  return { ok: true, data: undefined };
}
