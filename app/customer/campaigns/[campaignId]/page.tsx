import { notFound } from "next/navigation";

import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { CampaignMetricsChart } from "@/components/shared/campaign-metrics-chart";
import { Reveal } from "@/components/shared/reveal";
import { StatCard } from "@/components/shared/stat-card";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { getCampaignActivity } from "@/lib/data/activity";
import { getBrandsForUser } from "@/lib/data/brands";
import { getCampaignForBrands } from "@/lib/data/campaigns";
import { getApprovedSubmissionsForCampaign } from "@/lib/data/content";
import {
  getCampaignMetricsByDate,
  getCampaignMetricsSummary,
} from "@/lib/data/metrics";
import {
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  TrendingUp,
  Users,
} from "lucide-react";

export default async function CustomerCampaignDetailPage(
  props: PageProps<"/customer/campaigns/[campaignId]">,
) {
  const user = await requireUser();
  const { campaignId } = await props.params;
  const brands = await getBrandsForUser(user.id);
  const campaign = await getCampaignForBrands(
    campaignId,
    brands.map((b) => b.id),
  );
  if (!campaign) notFound();

  const [approvedSubmissions, activity, metricsSummary, metricsByDate] =
    await Promise.all([
      getApprovedSubmissionsForCampaign(campaignId),
      getCampaignActivity(campaignId),
      getCampaignMetricsSummary(campaignId),
      getCampaignMetricsByDate(campaignId),
    ]);

  const deliverables = campaign.assignments.flatMap((a) => a.deliverables);
  const approvedCount = deliverables.filter(
    (d) => d.status === "APPROVED",
  ).length;
  const inProgressCount = deliverables.filter((d) =>
    ["PENDING", "IN_PROGRESS", "SUBMITTED"].includes(d.status),
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-semibold">{campaign.name}</h1>
          <Badge variant="secondary">{campaign.status.replace("_", " ")}</Badge>
        </div>
        <p className="text-muted-foreground text-sm">{campaign.objective}</p>
      </div>

      <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Influencers"
          value={campaign.assignments.length}
          icon={Users}
        />
        <StatCard
          label="Deliverables"
          value={deliverables.length}
          icon={FileText}
        />
        <StatCard label="Approved" value={approvedCount} icon={CheckCircle2} />
        <StatCard label="In progress" value={inProgressCount} icon={Clock} />
      </Reveal>

      <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Reach"
          value={metricsSummary.reach.toLocaleString()}
          icon={Users}
        />
        <StatCard
          label="Impressions"
          value={metricsSummary.impressions.toLocaleString()}
          icon={Eye}
        />
        <StatCard
          label="Engagement rate"
          value={`${metricsSummary.engagementRate.toFixed(1)}%`}
          icon={TrendingUp}
        />
        <StatCard
          label="Views"
          value={metricsSummary.views.toLocaleString()}
          icon={Eye}
        />
      </Reveal>

      {metricsByDate.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Performance over time</CardTitle>
          </CardHeader>
          <CardContent>
            <CampaignMetricsChart data={metricsByDate} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Approved deliverables</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {approvedSubmissions.map((submission) => (
            <div
              key={submission.id}
              className="flex gap-2.5 rounded-md border p-3 text-sm"
            >
              <UserAvatar
                name={submission.deliverable.assignment.influencer.displayName}
                image={null}
                size="sm"
                className="mt-0.5 shrink-0"
              />
              <div>
                <div className="font-medium">
                  {submission.deliverable.title} ·{" "}
                  {submission.deliverable.assignment.influencer.displayName}
                </div>
                {submission.caption ? (
                  <p className="text-muted-foreground">{submission.caption}</p>
                ) : null}
                <div className="mt-1 flex flex-wrap gap-3">
                  {submission.files.map((file) => (
                    <a
                      key={file.id}
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      {file.fileName}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {approvedSubmissions.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nothing approved yet — check back once content clears review.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <ActivityTimeline events={activity} title="Timeline" />
    </div>
  );
}
