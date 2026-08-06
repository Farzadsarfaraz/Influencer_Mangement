import { z } from "zod";

import { slugify } from "@/lib/utils";

export const brandSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  slug: z
    .string()
    .min(2)
    .transform(slugify)
    .optional()
    .or(z.literal("")),
  industry: z.string().optional().or(z.literal("")),
  website: z.url("Enter a valid URL.").optional().or(z.literal("")),
  primaryContactName: z.string().optional().or(z.literal("")),
  primaryContactEmail: z.email().optional().or(z.literal("")),
});

export type BrandInput = z.infer<typeof brandSchema>;

export const inviteBrandMemberSchema = z.object({
  brandId: z.string().min(1),
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.email(),
  role: z.enum(["ADMIN", "VIEWER"]),
});

export type InviteBrandMemberInput = z.infer<typeof inviteBrandMemberSchema>;
