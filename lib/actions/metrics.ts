"use server";

import { revalidatePath } from "next/cache";

import { CAMPAIGN_MANAGER_ROLES } from "@/lib/auth/permissions";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/actions/brands";
import {
  importMetricSnapshotsSchema,
  metricSnapshotSchema,
  type ImportMetricSnapshotsInput,
  type MetricSnapshotInput,
} from "@/lib/validations/metric";
import type { MetricSource, Platform } from "@prisma/client";

type SnapshotCounts = {
  reach: number;
  impressions: number;
  engagements: number;
  views: number;
  clicks: number;
  spend?: number;
};

/**
 * Postgres unique constraints treat NULL as distinct from every other NULL,
 * so the generated compound-unique `where` (which Prisma only types for
 * non-null values) can't be used to upsert "campaign total" rows —
 * influencerId/platform are null there. Doing an explicit find-then-write
 * instead of `upsert` sidesteps that: `findFirst` with `influencerId: null`
 * correctly compiles to `IS NULL`, unlike the unique-index lookup.
 */
async function upsertMetricSnapshot(params: {
  campaignId: string;
  influencerId: string | null;
  platform: Platform | null;
  date: Date;
  counts: SnapshotCounts;
  source: MetricSource;
}) {
  const existing = await db.campaignMetricSnapshot.findFirst({
    where: {
      campaignId: params.campaignId,
      influencerId: params.influencerId,
      platform: params.platform,
      date: params.date,
    },
    select: { id: true },
  });

  if (existing) {
    await db.campaignMetricSnapshot.update({
      where: { id: existing.id },
      data: { ...params.counts, source: params.source },
    });
    return;
  }

  await db.campaignMetricSnapshot.create({
    data: {
      campaignId: params.campaignId,
      influencerId: params.influencerId,
      platform: params.platform,
      date: params.date,
      ...params.counts,
      source: params.source,
    },
  });
}

export async function addMetricSnapshotAction(
  input: MetricSnapshotInput,
): Promise<ActionResult> {
  await requireRole(CAMPAIGN_MANAGER_ROLES);
  const parsed = metricSnapshotSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { campaignId, influencerId, platform, date, ...counts } = parsed.data;

  await upsertMetricSnapshot({
    campaignId,
    influencerId: influencerId || null,
    platform: platform ?? null,
    date: new Date(date),
    counts,
    source: "MANUAL",
  });

  revalidatePath(`/agency/campaigns/${campaignId}/performance`);
  revalidatePath(`/customer/campaigns/${campaignId}`);
  return { ok: true, data: undefined };
}

const CSV_COLUMNS = [
  "date",
  "platform",
  "reach",
  "impressions",
  "engagements",
  "views",
  "clicks",
] as const;

/**
 * Minimal CSV import: one header row (date,platform,reach,impressions,
 * engagements,views,clicks) then one row per day/platform. No influencer
 * column — bulk import is for campaign-level totals; per-influencer numbers
 * go through the manual entry form.
 */
export async function importMetricSnapshotsAction(
  input: ImportMetricSnapshotsInput,
): Promise<ActionResult<{ imported: number }>> {
  await requireRole(CAMPAIGN_MANAGER_ROLES);
  const parsed = importMetricSnapshotsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const lines = parsed.data.csv
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) {
    return { ok: false, error: "Include a header row plus at least one data row." };
  }

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const missing = CSV_COLUMNS.filter((col) => !header.includes(col));
  if (missing.length > 0) {
    return { ok: false, error: `Missing columns: ${missing.join(", ")}` };
  }

  const rows = lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    return Object.fromEntries(header.map((col, i) => [col, cells[i]])) as Record<
      string,
      string
    >;
  });

  let imported = 0;
  for (const row of rows) {
    const date = new Date(row.date);
    if (Number.isNaN(date.getTime())) continue;

    await upsertMetricSnapshot({
      campaignId: parsed.data.campaignId,
      influencerId: null,
      platform: (row.platform || null) as Platform | null,
      date,
      counts: {
        reach: Number(row.reach) || 0,
        impressions: Number(row.impressions) || 0,
        engagements: Number(row.engagements) || 0,
        views: Number(row.views) || 0,
        clicks: Number(row.clicks) || 0,
      },
      source: "IMPORT",
    });
    imported += 1;
  }

  revalidatePath(`/agency/campaigns/${parsed.data.campaignId}/performance`);
  return { ok: true, data: { imported } };
}
