import "server-only";

import { db } from "@/lib/db";

export async function listFeatureFlags() {
  return db.featureFlag.findMany({ orderBy: { key: "asc" } });
}
