import { z } from "zod";

export const flightSchema = z.object({
  campaignId: z.string().min(1),
  name: z.string().min(2, "Name must be at least 2 characters."),
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().min(1, "End date is required."),
  budget: z.number().nonnegative().optional(),
});

export type FlightInput = z.infer<typeof flightSchema>;

export const flightStatuses = ["PLANNED", "ACTIVE", "COMPLETED"] as const;
