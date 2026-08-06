import { z } from "zod";

export const ALLOWED_CONTENT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/quicktime",
] as const;

export const MAX_CONTENT_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500MB

export const presignContentUploadSchema = z.object({
  deliverableId: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.enum(ALLOWED_CONTENT_MIME_TYPES),
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_CONTENT_FILE_SIZE_BYTES, "File is too large."),
});

export type PresignContentUploadInput = z.infer<
  typeof presignContentUploadSchema
>;

export const submitContentSchema = z.object({
  deliverableId: z.string().min(1),
  caption: z.string().optional().or(z.literal("")),
  storageKey: z.string().min(1),
  url: z.url(),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
});

export type SubmitContentInput = z.infer<typeof submitContentSchema>;

export const ALLOWED_AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_AVATAR_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const presignAvatarUploadSchema = z.object({
  influencerId: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.enum(ALLOWED_AVATAR_MIME_TYPES),
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_AVATAR_FILE_SIZE_BYTES, "Image is too large."),
});

export type PresignAvatarUploadInput = z.infer<
  typeof presignAvatarUploadSchema
>;
