import { Building2, Megaphone, Users } from "lucide-react";
import type { Metadata } from "next";

import { PendingApprovalsCard } from "@/components/agency/pending-approvals-card";
import { RecentActivityCard } from "@/components/agency/recent-activity-card";
import { CampaignMetricsChart } from "@/components/shared/campaign-metrics-chart";
import { Reveal } from "@/components/shared/reveal";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { getRecentAgencyActivity } from "@/lib/data/activity";
import { listPendingInternalApprovals } from "@/lib/data/content";
import { getAgencyMetricsByDate } from "@/lib/data/metrics";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AgencyDashboardPage() {
  const [
    brandCount,
    campaignCount,
    influencerCount,
    pendingApprovals,
    recentActivity,
    metricsByDate,
  ] = await Promise.all([
    db.brand.count({ where: { status: "ACTIVE" } }),
    db.campaign.count({
      where: { status: { in: ["ACTIVE", "PENDING_APPROVAL"] } },
    }),
    db.influencer.count({ where: { status: "ACTIVE" } }),
    listPendingInternalApprovals(5),
    getRecentAgencyActivity(8),
    getAgencyMetricsByDate(30),
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
      <Reveal>
        <Card>
          <CardHeader>
            <CardTitle>Reach, impressions & engagement — last 30 days</CardTitle>
          </CardHeader>
          <CardContent>
            <CampaignMetricsChart data={metricsByDate} />
          </CardContent>
        </Card>
      </Reveal>
      <Reveal className="grid gap-4 lg:grid-cols-2">
        <PendingApprovalsCard
          requests={pendingApprovals.requests}
          total={pendingApprovals.total}
        />
        <RecentActivityCard events={recentActivity} />
      </Reveal>
    </div>
  );
}
