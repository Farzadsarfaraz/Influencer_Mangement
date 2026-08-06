"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/session";
import { AGENCY_ROLES, CAMPAIGN_MANAGER_ROLES } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/actions/brands";
import { issueInviteToken } from "@/lib/actions/invite";
import {
  influencerAvatarSchema,
  influencerNoteSchema,
  influencerSchema,
  socialAccountSchema,
  type InfluencerAvatarInput,
  type InfluencerInput,
  type InfluencerNoteInput,
  type SocialAccountInput,
} from "@/lib/validations/influencer";

function parseTags(raw?: string) {
  if (!raw) return [];
  return [
    ...new Set(
      raw
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ];
}

export async function createInfluencerAction(
  input: InfluencerInput,
): Promise<ActionResult<{ influencerId: string }>> {
  const actor = await requireRole(CAMPAIGN_MANAGER_ROLES);
  const parsed = influencerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const tagNames = parseTags(parsed.data.tags);

  const influencer = await db.influencer.create({
    data: {
      createdById: actor.id,
      displayName: parsed.data.displayName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      bio: parsed.data.bio || null,
      location: parsed.data.location || null,
      tier: parsed.data.tier,
      status: parsed.data.status,
      tags: {
        connectOrCreate: tagNames.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
    },
  });

  await db.activityEvent.create({
    data: {
      actorId: actor.id,
      verb: "influencer.created",
      entityType: "Influencer",
      entityId: influencer.id,
      metadata: { displayName: influencer.displayName },
    },
  });

  revalidatePath("/agency/influencers");
  return { ok: true, data: { influencerId: influencer.id } };
}

export async function updateInfluencerAction(
  influencerId: string,
  input: InfluencerInput,
): Promise<ActionResult> {
  await requireRole(CAMPAIGN_MANAGER_ROLES);
  const parsed = influencerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const tagNames = parseTags(parsed.data.tags);

  await db.influencer.update({
    where: { id: influencerId },
    data: {
      displayName: parsed.data.displayName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      bio: parsed.data.bio || null,
      location: parsed.data.location || null,
      tier: parsed.data.tier,
      status: parsed.data.status,
      tags: {
        set: [],
        connectOrCreate: tagNames.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
    },
  });

  revalidatePath(`/agency/influencers/${influencerId}`);
  return { ok: true, data: undefined };
}

export async function updateInfluencerAvatarAction(
  input: InfluencerAvatarInput,
): Promise<ActionResult> {
  await requireRole(CAMPAIGN_MANAGER_ROLES);
  const parsed = influencerAvatarSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  await db.influencer.update({
    where: { id: parsed.data.influencerId },
    data: { avatarUrl: parsed.data.avatarUrl },
  });

  revalidatePath(`/agency/influencers/${parsed.data.influencerId}`);
  revalidatePath("/agency/influencers");
  return { ok: true, data: undefined };
}

export async function addSocialAccountAction(
  input: SocialAccountInput,
): Promise<ActionResult> {
  await requireRole(CAMPAIGN_MANAGER_ROLES);
  const parsed = socialAccountSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  await db.influencerSocialAccount.create({
    data: {
      influencerId: parsed.data.influencerId,
      platform: parsed.data.platform,
      handle: parsed.data.handle,
      url: parsed.data.url || null,
      followerCount: parsed.data.followerCount,
      engagementRate: parsed.data.engagementRate,
    },
  });

  revalidatePath(`/agency/influencers/${parsed.data.influencerId}`);
  return { ok: true, data: undefined };
}

export async function removeSocialAccountAction(
  influencerId: string,
  socialAccountId: string,
): Promise<ActionResult> {
  await requireRole(CAMPAIGN_MANAGER_ROLES);
  await db.influencerSocialAccount.delete({ where: { id: socialAccountId } });
  revalidatePath(`/agency/influencers/${influencerId}`);
  return { ok: true, data: undefined };
}

export async function addInfluencerNoteAction(
  input: InfluencerNoteInput,
): Promise<ActionResult> {
  const actor = await requireRole(AGENCY_ROLES);
  const parsed = influencerNoteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  await db.influencerNote.create({
    data: {
      influencerId: parsed.data.influencerId,
      authorId: actor.id,
      body: parsed.data.body,
    },
  });

  revalidatePath(`/agency/influencers/${parsed.data.influencerId}`);
  return { ok: true, data: undefined };
}

export async function inviteInfluencerToPortalAction(
  influencerId: string,
): Promise<ActionResult<{ inviteUrl: string }>> {
  await requireRole(CAMPAIGN_MANAGER_ROLES);

  const influencer = await db.influencer.findUnique({
    where: { id: influencerId },
  });
  if (!influencer) return { ok: false, error: "Influencer not found." };
  if (influencer.userId)
    return { ok: false, error: "Already has portal access." };
  if (!influencer.email) {
    return { ok: false, error: "Add an email address before inviting." };
  }

  let user = await db.user.findUnique({ where: { email: influencer.email } });
  if (user && user.role !== "INFLUENCER") {
    return {
      ok: false,
      error: "This email belongs to a non-influencer account.",
    };
  }

  if (!user) {
    user = await db.user.create({
      data: {
        name: influencer.displayName,
        email: influencer.email,
        role: "INFLUENCER",
        status: "INVITED",
      },
    });
  }

  await db.influencer.update({
    where: { id: influencerId },
    data: { userId: user.id },
  });

  let inviteUrl = "";
  if (user.status === "INVITED") {
    const token = await issueInviteToken(user.email);
    inviteUrl = `/invite/${token}`;
  }

  revalidatePath(`/agency/influencers/${influencerId}`);
  return { ok: true, data: { inviteUrl } };
}
