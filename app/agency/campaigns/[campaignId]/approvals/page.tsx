import { notFound } from "next/navigation";

import { CampaignTabs } from "@/components/agency/campaign-tabs";
import { SubmissionCard } from "@/components/shared/submission-card";
import {
  getCampaignApprovalQueue,
  getContentSubmissionDetail,
} from "@/lib/data/content";
import { getCampaignHeader } from "@/lib/data/campaigns";

export default async function CampaignApprovalsPage(
  props: PageProps<"/agency/campaigns/[campaignId]/approvals">,
) {
  const { campaignId } = await props.params;
  const campaign = await getCampaignHeader(campaignId);
  if (!campaign) notFound();

  const [internalQueue, clientQueue] = await Promise.all([
    getCampaignApprovalQueue(campaignId, "INTERNAL"),
    getCampaignApprovalQueue(campaignId, "CLIENT"),
  ]);

  const internalSubmissions = await Promise.all(
    internalQueue.map((request) =>
      getContentSubmissionDetail(request.contentSubmissionId),
    ),
  );
  const clientSubmissions = await Promise.all(
    clientQueue.map((request) =>
      getContentSubmissionDetail(request.contentSubmissionId),
    ),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{campaign.name}</h1>
        <p className="text-sm text-muted-foreground">{campaign.brand.name}</p>
      </div>

      <CampaignTabs campaignId={campaign.id} />

      <div>
        <h2 className="mb-3 text-lg font-medium">Awaiting internal review</h2>
        <div className="space-y-4">
          {internalSubmissions.map(
            (submission) =>
              submission && (
                <SubmissionCard
                  key={submission.id}
                  submission={submission}
                  decidableStage="INTERNAL"
                />
              ),
          )}
          {internalSubmissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing pending.</p>
          ) : null}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">Awaiting client review</h2>
        <div className="space-y-4">
          {clientSubmissions.map(
            (submission) =>
              submission && <SubmissionCard key={submission.id} submission={submission} />,
          )}
          {clientSubmissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing pending.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
