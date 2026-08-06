import Link from "next/link";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireUser } from "@/lib/auth/session";
import { getBrandsForUser } from "@/lib/data/brands";
import { listCampaignsForBrands } from "@/lib/data/campaigns";

export const metadata: Metadata = { title: "Campaigns" };

export default async function CustomerCampaignsPage() {
  const user = await requireUser();
  const brands = await getBrandsForUser(user.id);
  const campaigns = await listCampaignsForBrands(brands.map((b) => b.id));

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Campaigns</h1>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Influencers</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/customer/campaigns/${campaign.id}`}
                    className="hover:underline"
                  >
                    {campaign.name}
                  </Link>
                </TableCell>
                <TableCell>{campaign.brand.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{campaign.status.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell>{campaign._count.assignments}</TableCell>
              </TableRow>
            ))}
            {campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No campaigns yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
