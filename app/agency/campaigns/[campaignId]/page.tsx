import { notFound } from "next/navigation";

import { CampaignStatusControl } from "@/components/agency/campaign-status-control";
import { CampaignTabs } from "@/components/agency/campaign-tabs";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { Reveal } from "@/components/shared/reveal";
import { StatCard } from "@/components/shared/stat-card";
import { Calendar, Megaphone, Users, Wallet } from "lucide-react";
import { getCampaignActivity } from "@/lib/data/activity";
import { getCampaignOverview } from "@/lib/data/campaigns";

export default async function CampaignOverviewPage(
  props: PageProps<"/agency/campaigns/[campaignId]">,
) {
  const { campaignId } = await props.params;
  const [campaign, activity] = await Promise.all([
    getCampaignOverview(campaignId),
    getCampaignActivity(campaignId),
  ]);
  if (!campaign) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{campaign.name}</h1>
          <p className="text-sm text-muted-foreground">
            {campaign.brand.name} · Owned by {campaign.owner.name}
          </p>
        </div>
        <CampaignStatusControl campaignId={campaign.id} status={campaign.status} />
      </div>

      <CampaignTabs campaignId={campaign.id} />

      {campaign.objective ? (
        <p className="max-w-2xl text-sm text-muted-foreground">{campaign.objective}</p>
      ) : null}

      <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Budget"
          value={campaign.budget ? `$${Number(campaign.budget).toLocaleString()}` : "—"}
          icon={Wallet}
        />
        <StatCard label="Flights" value={campaign._count.flights} icon={Megaphone} />
        <StatCard
          label="Assignments"
          value={campaign._count.assignments}
          icon={Users}
        />
        <StatCard
          label="Timeline"
          value={
            campaign.startDate
              ? new Date(campaign.startDate).toLocaleDateString()
              : "—"
          }
          icon={Calendar}
        />
      </Reveal>

      {campaign.description ? (
        <p className="max-w-2xl text-sm">{campaign.description}</p>
      ) : null}

      <ActivityTimeline events={activity} />
    </div>
  );
}
