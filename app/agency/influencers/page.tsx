import { Plus } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

import { InfluencerFilters } from "@/components/agency/influencer-filters";
import { Pagination } from "@/components/shared/pagination";
import { UserAvatar } from "@/components/shared/user-avatar";
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
import { listInfluencers } from "@/lib/data/influencers";
import type { InfluencerStatus, InfluencerTier } from "@prisma/client";

export const metadata: Metadata = { title: "Influencers" };

export default async function InfluencersPage(
  props: PageProps<"/agency/influencers">,
) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const tier =
    typeof searchParams.tier === "string"
      ? (searchParams.tier as InfluencerTier)
      : undefined;
  const status =
    typeof searchParams.status === "string"
      ? (searchParams.status as InfluencerStatus)
      : undefined;
  const page =
    typeof searchParams.page === "string" ? Number(searchParams.page) : 1;

  const { influencers, pageCount } = await listInfluencers({
    query,
    tier,
    status,
    page,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Influencers</h1>
        <Button asChild>
          <Link href="/agency/influencers/new">
            <Plus /> New influencer
          </Link>
        </Button>
      </div>

      <InfluencerFilters />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Platforms</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Assignments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {influencers.map((influencer) => (
              <TableRow key={influencer.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/agency/influencers/${influencer.id}`}
                    className="flex items-center gap-2.5 hover:underline"
                  >
                    <UserAvatar
                      name={influencer.displayName}
                      image={influencer.avatarUrl}
                      size="sm"
                    />
                    {influencer.displayName}
                  </Link>
                </TableCell>
                <TableCell>{influencer.tier ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{influencer.status}</Badge>
                </TableCell>
                <TableCell>{influencer.socialAccounts.length}</TableCell>
                <TableCell className="space-x-1">
                  {influencer.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline">
                      {tag.name}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell>{influencer._count.assignments}</TableCell>
              </TableRow>
            ))}
            {influencers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground text-center"
                >
                  No influencers found.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <Pagination
        page={page}
        pageCount={pageCount}
        basePath="/agency/influencers"
        searchParams={{ q: query, tier, status }}
      />
    </div>
  );
}
