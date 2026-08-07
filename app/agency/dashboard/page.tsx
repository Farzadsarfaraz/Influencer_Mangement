import { Building2, Megaphone, Users } from "lucide-react";
import type { Metadata } from "next";

import { Reveal } from "@/components/shared/reveal";
import { StatCard } from "@/components/shared/stat-card";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AgencyDashboardPage() {
  const [brandCount, campaignCount, influencerCount] = await Promise.all([
    db.brand.count({ where: { status: "ACTIVE" } }),
    db.campaign.count({
      where: { status: { in: ["ACTIVE", "PENDING_APPROVAL"] } },
    }),
    db.influencer.count({ where: { status: "ACTIVE" } }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Agency Dashboard</h1>
      <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Active brands" value={brandCount} icon={Building2} />
        <StatCard
          label="Live campaigns"
          value={campaignCount}
          icon={Megaphone}
        />
        <StatCard
          label="Active influencers"
          value={influencerCount}
          icon={Users}
        />
      </Reveal>
    </div>
  );
}
