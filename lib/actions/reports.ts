"use server";

import { revalidatePath } from "next/cache";

import { CAMPAIGN_MANAGER_ROLES } from "@/lib/auth/permissions";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/actions/brands";
import { listReportsForCampaign } from "@/lib/data/reports";
import { enqueueReportGeneration } from "@/lib/jobs/report-queue";
import {
  requestReportSchema,
  type RequestReportInput,
} from "@/lib/validations/report";

/** Read-only Server Action for client-side polling — see notifications.ts. */
export async function getReportsForCampaignAction(campaignId: string) {
  await requireRole(CAMPAIGN_MANAGER_ROLES);
  return listReportsForCampaign(campaignId);
}

export async function requestReportAction(
  input: RequestReportInput,
): Promise<ActionResult<{ reportId: string }>> {
  const actor = await requireRole(CAMPAIGN_MANAGER_ROLES);
  const parsed = requestReportSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const report = await db.report.create({
    data: {
      campaignId: parsed.data.campaignId,
      requestedById: actor.id,
      type: "CAMPAIGN_SUMMARY",
      format: parsed.data.format,
      status: "PENDING",
    },
  });

  await enqueueReportGeneration(report.id);

  revalidatePath(`/agency/campaigns/${parsed.data.campaignId}/reports`);
  return { ok: true, data: { reportId: report.id } };
}
