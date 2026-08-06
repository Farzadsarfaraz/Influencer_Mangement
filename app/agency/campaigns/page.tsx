import { Plus } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

import { CampaignFilters } from "@/components/agency/campaign-filters";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listCampaigns } from "@/lib/data/campaigns";
import type { CampaignStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Campaigns" };

export default async function CampaignsPage(
  props: PageProps<"/agency/campaigns">,
) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const status =
    typeof searchParams.status === "string"
      ? (searchParams.status as CampaignStatus)
      : undefined;
  const page = typeof searchParams.page === "string" ? Number(searchParams.page) : 1;

  const { campaigns, pageCount } = await listCampaigns({ query, status, page });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Campaigns</h1>
        <Button asChild>
          <Link href="/agency/campaigns/new">
            <Plus /> New campaign
          </Link>
        </Button>
      </div>

      <CampaignFilters />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Flights</TableHead>
              <TableHead>Assignments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/agency/campaigns/${campaign.id}`}
                    className="hover:underline"
                  >
                    {campaign.name}
                  </Link>
                </TableCell>
                <TableCell>{campaign.brand.name}</TableCell>
                <TableCell>{campaign.owner.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{campaign.status.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell>{campaign._count.flights}</TableCell>
                <TableCell>{campaign._count.assignments}</TableCell>
              </TableRow>
            ))}
            {campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No campaigns found.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <Pagination
        page={page}
        pageCount={pageCount}
        basePath="/agency/campaigns"
        searchParams={{ q: query, status }}
      />
    </div>
  );
}
