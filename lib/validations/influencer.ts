import { z } from "zod";

export const influencerTiers = [
  "NANO",
  "MICRO",
  "MID",
  "MACRO",
  "MEGA",
] as const;
export const influencerStatuses = [
  "PROSPECT",
  "ACTIVE",
  "INACTIVE",
  "DO_NOT_USE",
] as const;
export const platforms = [
  "INSTAGRAM",
  "TIKTOK",
  "YOUTUBE",
  "TWITTER_X",
  "TWITCH",
  "FACEBOOK",
  "LINKEDIN",
  "PINTEREST",
  "OTHER",
] as const;

export const influencerSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters."),
  email: z.email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  bio: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  tier: z.enum(influencerTiers).optional(),
  status: z.enum(influencerStatuses),
  tags: z.string().optional().or(z.literal("")),
});

export type InfluencerInput = z.infer<typeof influencerSchema>;

export const socialAccountSchema = z.object({
  influencerId: z.string().min(1),
  platform: z.enum(platforms),
  handle: z.string().min(1, "Handle is required."),
  url: z.url().optional().or(z.literal("")),
  followerCount: z.number().int().nonnegative().optional(),
  engagementRate: z.number().nonnegative().optional(),
});

export type SocialAccountInput = z.infer<typeof socialAccountSchema>;

export const influencerNoteSchema = z.object({
  influencerId: z.string().min(1),
  body: z.string().min(1, "Note can't be empty."),
});

export type InfluencerNoteInput = z.infer<typeof influencerNoteSchema>;

export const influencerAvatarSchema = z.object({
  influencerId: z.string().min(1),
  avatarUrl: z.url(),
});

export type InfluencerAvatarInput = z.infer<typeof influencerAvatarSchema>;
