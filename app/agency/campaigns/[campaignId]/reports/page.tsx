import { notFound } from "next/navigation";

import { CampaignTabs } from "@/components/agency/campaign-tabs";
import { RequestReportDialog } from "@/components/agency/request-report-dialog";
import { ReportHistory } from "@/components/agency/report-history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCampaignHeader } from "@/lib/data/campaigns";
import { listReportsForCampaign } from "@/lib/data/reports";

export default async function CampaignReportsPage(
  props: PageProps<"/agency/campaigns/[campaignId]/reports">,
) {
  const { campaignId } = await props.params;
  const [campaign, reports] = await Promise.all([
    getCampaignHeader(campaignId),
    listReportsForCampaign(campaignId),
  ]);
  if (!campaign) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{campaign.name}</h1>
        <p className="text-sm text-muted-foreground">{campaign.brand.name}</p>
      </div>

      <CampaignTabs campaignId={campaign.id} />

      <div className="flex justify-end">
        <RequestReportDialog campaignId={campaign.id} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report history</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportHistory campaignId={campaign.id} initialReports={reports} />
        </CardContent>
      </Card>
    </div>
  );
}
