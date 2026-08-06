import { NextResponse } from "next/server";

import { AGENCY_ROLES } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
import { getDeliverableAccessContext } from "@/lib/data/content";
import { buildStorageKey, createPresignedUploadUrl } from "@/lib/storage/presign";
import { presignContentUploadSchema } from "@/lib/validations/upload";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = presignContentUploadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const context = await getDeliverableAccessContext(parsed.data.deliverableId);
  if (!context) {
    return NextResponse.json({ error: "Deliverable not found." }, { status: 404 });
  }

  const isOwningInfluencer = context.influencerUserId === user.id;
  const isAgencyStaff = AGENCY_ROLES.includes(user.role);
  if (!isOwningInfluencer && !isAgencyStaff) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const key = buildStorageKey(
    `content-submissions/${parsed.data.deliverableId}`,
    parsed.data.fileName,
  );
  const { uploadUrl, publicUrl } = await createPresignedUploadUrl(
    key,
    parsed.data.mimeType,
  );

  return NextResponse.json({ uploadUrl, storageKey: key, publicUrl });
}
