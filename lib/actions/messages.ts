"use server";

import { revalidatePath } from "next/cache";

import { AGENCY_ROLES } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/actions/brands";
import { emitDomainEvent } from "@/lib/events/emitter";
import { sendMessageSchema, type SendMessageInput } from "@/lib/validations/message";

export async function sendMessageAction(
  input: SendMessageInput,
): Promise<ActionResult> {
  const actor = await requireUser();
  const parsed = sendMessageSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const influencer = await db.influencer.findUnique({
    where: { id: parsed.data.influencerId },
  });
  if (!influencer) return { ok: false, error: "Influencer not found." };

  const isAgencyStaff = AGENCY_ROLES.includes(actor.role);
  const isOwningInfluencer = influencer.userId === actor.id;
  if (!isAgencyStaff && !isOwningInfluencer) {
    return { ok: false, error: "You don't have access to this conversation." };
  }

  const conversation = await db.conversation.upsert({
    where: {
      campaignId_influencerId: {
        campaignId: parsed.data.campaignId,
        influencerId: parsed.data.influencerId,
      },
    },
    update: {},
    create: {
      campaignId: parsed.data.campaignId,
      influencerId: parsed.data.influencerId,
    },
  });

  await db.message.create({
    data: {
      conversationId: conversation.id,
      senderId: actor.id,
      body: parsed.data.body,
    },
  });

  emitDomainEvent({
    type: "message.sent",
    conversationId: conversation.id,
    campaignId: parsed.data.campaignId,
    influencerId: parsed.data.influencerId,
    senderId: actor.id,
  });

  revalidatePath(
    `/agency/campaigns/${parsed.data.campaignId}/assignments`,
    "layout",
  );
  revalidatePath("/influencer/assignments", "layout");
  revalidatePath("/influencer/messages");
  return { ok: true, data: undefined };
}
