"use server";

import { revalidatePath } from "next/cache";

import { AGENCY_ROLES } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/actions/brands";
import { getContentSubmissionAccessContext } from "@/lib/data/content";
import { addCommentSchema, type AddCommentInput } from "@/lib/validations/comment";

export async function addCommentAction(
  input: AddCommentInput,
): Promise<ActionResult> {
  const actor = await requireUser();
  const parsed = addCommentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const context = await getContentSubmissionAccessContext(
    parsed.data.contentSubmissionId,
  );
  if (!context) return { ok: false, error: "Submission not found." };

  const isAgencyStaff = AGENCY_ROLES.includes(actor.role);
  const isOwningInfluencer = context.influencerUserId === actor.id;
  let isBrandMember = false;
  if (!isAgencyStaff && !isOwningInfluencer) {
    const membership = await db.brandMember.findUnique({
      where: { brandId_userId: { brandId: context.brandId, userId: actor.id } },
    });
    isBrandMember = !!membership;
  }

  if (!isAgencyStaff && !isOwningInfluencer && !isBrandMember) {
    return { ok: false, error: "You don't have access to this submission." };
  }

  await db.comment.create({
    data: {
      contentSubmissionId: parsed.data.contentSubmissionId,
      authorId: actor.id,
      body: parsed.data.body,
      parentId: parsed.data.parentId || null,
    },
  });

  revalidatePath(`/agency/campaigns/${context.campaignId}/approvals`);
  revalidatePath("/customer/approvals");
  revalidatePath(`/influencer/assignments/${context.assignmentId}`);
  return { ok: true, data: undefined };
}
