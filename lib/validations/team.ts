import { z } from "zod";

export const teamSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
});

export type TeamInput = z.infer<typeof teamSchema>;

export const addTeamMemberSchema = z.object({
  teamId: z.string().min(1),
  userId: z.string().min(1),
  role: z.enum(["LEAD", "MEMBER"]),
});

export type AddTeamMemberInput = z.infer<typeof addTeamMemberSchema>;
