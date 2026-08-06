import { NextResponse } from "next/server";

import { CAMPAIGN_MANAGER_ROLES } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reportId: string }> },
) {
  const user = await getCurrentUser();
  if (!user || !CAMPAIGN_MANAGER_ROLES.includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { reportId } = await params;
  const report = await db.report.findUnique({ where: { id: reportId } });
  if (!report?.fileAssetId) {
    return NextResponse.json({ error: "Report not ready" }, { status: 404 });
  }

  const file = await db.fileAsset.findUnique({ where: { id: report.fileAssetId } });
  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return NextResponse.redirect(file.url);
}
