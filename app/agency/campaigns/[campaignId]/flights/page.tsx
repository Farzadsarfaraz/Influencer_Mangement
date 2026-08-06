import { notFound } from "next/navigation";

import { CampaignTabs } from "@/components/agency/campaign-tabs";
import { CreateFlightDialog } from "@/components/agency/create-flight-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCampaignFlights, getCampaignHeader } from "@/lib/data/campaigns";

export default async function CampaignFlightsPage(
  props: PageProps<"/agency/campaigns/[campaignId]/flights">,
) {
  const { campaignId } = await props.params;
  const [campaign, flights] = await Promise.all([
    getCampaignHeader(campaignId),
    getCampaignFlights(campaignId),
  ]);
  if (!campaign) notFound();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold">{campaign.name}</h1>
        <p className="text-sm text-muted-foreground">{campaign.brand.name}</p>
      </div>

      <CampaignTabs campaignId={campaign.id} />

      <div className="flex justify-end">
        <CreateFlightDialog campaignId={campaign.id} />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assignments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flights.map((flight) => (
              <TableRow key={flight.id}>
                <TableCell className="font-medium">{flight.name}</TableCell>
                <TableCell>
                  {flight.startDate.toLocaleDateString()} –{" "}
                  {flight.endDate.toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {flight.budget ? `$${Number(flight.budget).toLocaleString()}` : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{flight.status}</Badge>
                </TableCell>
                <TableCell>{flight._count.assignments}</TableCell>
              </TableRow>
            ))}
            {flights.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No flights yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
