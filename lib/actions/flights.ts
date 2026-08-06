"use server";

import { revalidatePath } from "next/cache";

import { CAMPAIGN_MANAGER_ROLES } from "@/lib/auth/permissions";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/actions/brands";
import { flightSchema, type FlightInput } from "@/lib/validations/flight";

export async function createFlightAction(
  input: FlightInput,
): Promise<ActionResult<{ flightId: string }>> {
  await requireRole(CAMPAIGN_MANAGER_ROLES);
  const parsed = flightSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const startDate = new Date(parsed.data.startDate);
  const endDate = new Date(parsed.data.endDate);
  if (endDate < startDate) {
    return { ok: false, error: "End date must be on or after the start date." };
  }

  const flight = await db.campaignFlight.create({
    data: {
      campaignId: parsed.data.campaignId,
      name: parsed.data.name,
      startDate,
      endDate,
      budget: parsed.data.budget,
    },
  });

  revalidatePath(`/agency/campaigns/${parsed.data.campaignId}/flights`);
  return { ok: true, data: { flightId: flight.id } };
}
