"use server";

import { revalidatePath } from "next/cache";

import { CAMPAIGN_MANAGER_ROLES } from "@/lib/auth/permissions";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/actions/brands";
import { emitDomainEvent } from "@/lib/events/emitter";
import { slugify } from "@/lib/utils";
import { canTransitionCampaign } from "@/lib/workflow/campaign";
import {
  campaignSchema,
  campaignStatusChangeSchema,
  type CampaignInput,
  type CampaignStatusChangeInput,
} from "@/lib/validations/campaign";

async function uniqueCampaignSlug(base: string) {
  const root = slugify(base);
  let candidate = root;
  let attempt = 1;
  while (await db.campaign.findUnique({ where: { slug: candidate } })) {
    attempt += 1;
    candidate = `${root}-${attempt}`;
  }
  return candidate;
}

export async function createCampaignAction(
  input: CampaignInput,
): Promise<ActionResult<{ campaignId: string }>> {
  const actor = await requireRole(CAMPAIGN_MANAGER_ROLES);
  const parsed = campaignSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const slug = await uniqueCampaignSlug(parsed.data.name);

  const campaign = await db.campaign.create({
    data: {
      brandId: parsed.data.brandId,
      ownerId: parsed.data.ownerId,
      createdById: actor.id,
      name: parsed.data.name,
      slug,
      objective: parsed.data.objective || null,
      description: parsed.data.description || null,
      budget: parsed.data.budget,
      currency: parsed.data.currency,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    },
  });

  await db.activityEvent.create({
    data: {
      campaignId: campaign.id,
      actorId: actor.id,
      verb: "campaign.created",
      entityType: "Campaign",
      entityId: campaign.id,
      metadata: { name: campaign.name },
    },
  });

  revalidatePath("/agency/campaigns");
  return { ok: true, data: { campaignId: campaign.id } };
}

export async function transitionCampaignStatusAction(
  input: CampaignStatusChangeInput,
): Promise<ActionResult> {
  const actor = await requireRole(CAMPAIGN_MANAGER_ROLES);
  const parsed = campaignStatusChangeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const campaign = await db.campaign.findUnique({
    where: { id: parsed.data.campaignId },
  });
  if (!campaign) return { ok: false, error: "Campaign not found." };

  if (!canTransitionCampaign(campaign.status, parsed.data.status)) {
    return {
      ok: false,
      error: `Can't move a campaign from ${campaign.status} to ${parsed.data.status}.`,
    };
  }

  await db.$transaction([
    db.campaign.update({
      where: { id: campaign.id },
      data: { status: parsed.data.status },
    }),
    db.activityEvent.create({
      data: {
        campaignId: campaign.id,
        actorId: actor.id,
        verb: "campaign.status_changed",
        entityType: "Campaign",
        entityId: campaign.id,
        metadata: { from: campaign.status, to: parsed.data.status },
      },
    }),
    db.auditLog.create({
      data: {
        actorId: actor.id,
        action: "campaign.status_changed",
        entityType: "Campaign",
        entityId: campaign.id,
        before: { status: campaign.status },
        after: { status: parsed.data.status },
      },
    }),
  ]);

  emitDomainEvent({
    type: "campaign.status_changed",
    campaignId: campaign.id,
    from: campaign.status,
    to: parsed.data.status,
    actorId: actor.id,
  });

  revalidatePath(`/agency/campaigns/${campaign.id}`);
  return { ok: true, data: undefined };
}
