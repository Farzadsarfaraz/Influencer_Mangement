import { Clock, Sparkles } from "lucide-react";
import type { Metadata } from "next";

import { Reveal } from "@/components/shared/reveal";
import { StatCard } from "@/components/shared/stat-card";
import {
  getAssignmentCountsForInfluencer,
  getInfluencerForUser,
} from "@/lib/data/influencers";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function InfluencerDashboardPage() {
  const user = await requireUser();
  const influencer = await getInfluencerForUser(user.id);

  if (!influencer) {
    return (
      <p className="text-sm text-muted-foreground">
        Your creator profile hasn&apos;t been linked yet. Contact your agency
        contact for help.
      </p>
    );
  }

  const { active, awaitingResponse } = await getAssignmentCountsForInfluencer(
    influencer.id,
  );

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Welcome, {influencer.displayName}</h1>
      <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Active assignments" value={active} icon={Sparkles} />
        <StatCard label="Awaiting your response" value={awaitingResponse} icon={Clock} />
      </Reveal>
    </div>
  );
}
