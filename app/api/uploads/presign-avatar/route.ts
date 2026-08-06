import { NextResponse } from "next/server";

import { CAMPAIGN_MANAGER_ROLES } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
import { buildStorageKey, createPresignedUploadUrl } from "@/lib/storage/presign";
import { presignAvatarUploadSchema } from "@/lib/validations/upload";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !CAMPAIGN_MANAGER_ROLES.includes(user.role)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = presignAvatarUploadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const key = buildStorageKey(
    `influencer-avatars/${parsed.data.influencerId}`,
    parsed.data.fileName,
  );
  const { uploadUrl, publicUrl } = await createPresignedUploadUrl(
    key,
    parsed.data.mimeType,
  );

  return NextResponse.json({ uploadUrl, storageKey: key, publicUrl });
}
