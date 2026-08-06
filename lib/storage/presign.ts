import "server-only";

import { randomUUID } from "crypto";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@/lib/env";
import { s3Client } from "@/lib/storage/s3";

const PRESIGN_EXPIRY_SECONDS = 60 * 5;

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
}

export function buildStorageKey(namespace: string, fileName: string) {
  return `${namespace}/${randomUUID()}-${sanitizeFileName(fileName)}`;
}

export async function createPresignedUploadUrl(
  key: string,
  mimeType: string,
) {
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: PRESIGN_EXPIRY_SECONDS,
  });

  return { uploadUrl, publicUrl: publicUrlForKey(key) };
}

export function publicUrlForKey(key: string) {
  return `${env.S3_PUBLIC_URL}/${key}`;
}
