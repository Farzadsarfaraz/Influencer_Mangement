import "server-only";

import { PutObjectCommand } from "@aws-sdk/client-s3";

import { env } from "@/lib/env";
import { s3Client } from "@/lib/storage/s3";
import { publicUrlForKey } from "@/lib/storage/presign";

/**
 * Server-to-server upload for files the app itself generates (reports) —
 * unlike user content uploads, there's no browser involved, so no need to
 * presign; the worker already holds S3 credentials.
 */
export async function uploadBuffer(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<{ url: string }> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return { url: publicUrlForKey(key) };
}
