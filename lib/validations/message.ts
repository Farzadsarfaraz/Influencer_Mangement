import { z } from "zod";

export const sendMessageSchema = z.object({
  campaignId: z.string().min(1),
  influencerId: z.string().min(1),
  body: z.string().min(1, "Message can't be empty."),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
