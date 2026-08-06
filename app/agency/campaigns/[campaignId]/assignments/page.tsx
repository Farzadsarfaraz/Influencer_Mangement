import Link from "next/link";
import { notFound } from "next/navigation";

import { AssignInfluencerDialog } from "@/components/agency/assign-influencer-dialog";
import { CampaignTabs } from "@/components/agency/campaign-tabs";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getCampaignAssignments,
  getCampaignFlights,
  getCampaignHeader,
} from "@/lib/data/campaigns";
import { listInfluencerOptions } from "@/lib/data/influencers";

export default async function CampaignAssignmentsPage(
  props: PageProps<"/agency/campaigns/[campaignId]/assignments">,
) {
  const { campaignId } = await props.params;
  const [campaign, assignments, flights, influencers] = await Promise.all([
    getCampaignHeader(campaignId),
    getCampaignAssignments(campaignId),
    getCampaignFlights(campaignId),
    listInfluencerOptions(),
  ]);
  if (!campaign) notFound();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold">{campaign.name}</h1>
        <p className="text-muted-foreground text-sm">{campaign.brand.name}</p>
      </div>

      <CampaignTabs campaignId={campaign.id} />

      <div className="flex justify-end">
        <AssignInfluencerDialog
          campaignId={campaign.id}
          influencers={influencers}
          flights={flights}
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Influencer</TableHead>
              <TableHead>Flight</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deliverables</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/agency/campaigns/${campaign.id}/assignments/${assignment.id}`}
                    className="flex items-center gap-2.5 hover:underline"
                  >
                    <UserAvatar
                      name={assignment.influencer.displayName}
                      image={assignment.influencer.avatarUrl}
                      size="sm"
                    />
                    {assignment.influencer.displayName}
                  </Link>
                </TableCell>
                <TableCell>{assignment.flight?.name ?? "—"}</TableCell>
                <TableCell>
                  {assignment.fee
                    ? `$${Number(assignment.fee).toLocaleString()}`
                    : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {assignment.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>{assignment._count.deliverables}</TableCell>
              </TableRow>
            ))}
            {assignments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground text-center"
                >
                  No assignments yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
