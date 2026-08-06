import { notFound } from "next/navigation";
import { Eye, MousePointerClick, TrendingUp, Users } from "lucide-react";

import { AddMetricSnapshotDialog } from "@/components/agency/add-metric-snapshot-dialog";
import { CampaignTabs } from "@/components/agency/campaign-tabs";
import { ImportMetricsDialog } from "@/components/agency/import-metrics-dialog";
import { CampaignMetricsChart } from "@/components/shared/campaign-metrics-chart";
import { Reveal } from "@/components/shared/reveal";
import { StatCard } from "@/components/shared/stat-card";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCampaignHeader } from "@/lib/data/campaigns";
import {
  getCampaignMetricsByDate,
  getCampaignMetricsByInfluencer,
  getCampaignMetricsSummary,
} from "@/lib/data/metrics";
import { listInfluencerOptions } from "@/lib/data/influencers";

export default async function CampaignPerformancePage(
  props: PageProps<"/agency/campaigns/[campaignId]/performance">,
) {
  const { campaignId } = await props.params;
  const [campaign, summary, byDate, byInfluencer, influencers] =
    await Promise.all([
      getCampaignHeader(campaignId),
      getCampaignMetricsSummary(campaignId),
      getCampaignMetricsByDate(campaignId),
      getCampaignMetricsByInfluencer(campaignId),
      listInfluencerOptions(),
    ]);
  if (!campaign) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{campaign.name}</h1>
        <p className="text-muted-foreground text-sm">{campaign.brand.name}</p>
      </div>

      <CampaignTabs campaignId={campaign.id} />

      <div className="flex justify-end gap-2">
        <ImportMetricsDialog campaignId={campaign.id} />
        <AddMetricSnapshotDialog
          campaignId={campaign.id}
          influencers={influencers}
        />
      </div>

      <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Reach"
          value={summary.reach.toLocaleString()}
          icon={Users}
        />
        <StatCard
          label="Impressions"
          value={summary.impressions.toLocaleString()}
          icon={Eye}
        />
        <StatCard
          label="Engagement rate"
          value={`${summary.engagementRate.toFixed(1)}%`}
          icon={TrendingUp}
        />
        <StatCard
          label="Clicks"
          value={summary.clicks.toLocaleString()}
          icon={MousePointerClick}
        />
      </Reveal>

      <Card>
        <CardHeader>
          <CardTitle>Reach, impressions & engagement over time</CardTitle>
        </CardHeader>
        <CardContent>
          <CampaignMetricsChart data={byDate} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By influencer</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Influencer</TableHead>
                <TableHead>Reach</TableHead>
                <TableHead>Impressions</TableHead>
                <TableHead>Engagements</TableHead>
                <TableHead>Views</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byInfluencer.map((row) => (
                <TableRow key={row.influencerId}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar
                        name={row.displayName}
                        image={null}
                        size="sm"
                      />
                      {row.displayName}
                    </div>
                  </TableCell>
                  <TableCell>{row.reach.toLocaleString()}</TableCell>
                  <TableCell>{row.impressions.toLocaleString()}</TableCell>
                  <TableCell>{row.engagements.toLocaleString()}</TableCell>
                  <TableCell>{row.views.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {byInfluencer.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-muted-foreground text-center"
                  >
                    No per-influencer metrics logged yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
