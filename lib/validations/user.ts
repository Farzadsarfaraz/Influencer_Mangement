import { z } from "zod";

export const agencyRoles = [
  "SUPER_ADMIN",
  "AGENCY_ADMIN",
  "AGENCY_MANAGER",
  "AGENCY_MEMBER",
] as const;

export const createAgencyUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.email(),
  role: z.enum(agencyRoles),
});

export type CreateAgencyUserInput = z.infer<typeof createAgencyUserSchema>;
