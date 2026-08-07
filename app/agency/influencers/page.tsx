import { Plus } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

import { InfluencerCardGrid } from "@/components/agency/influencer-card-grid";
import { InfluencerFilters } from "@/components/agency/influencer-filters";
import { OctagonBackground } from "@/components/agency/octagon-background";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
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
    <div className="relative isolate min-h-[calc(100vh-8rem)] space-y-4">
      <OctagonBackground />
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Influencers</h1>
        <Button asChild>
          <Link href="/agency/influencers/new">
            <Plus /> New influencer
          </Link>
        </Button>
      </div>

      <InfluencerFilters />

      <InfluencerCardGrid influencers={influencers} />

      <Pagination
        page={page}
        pageCount={pageCount}
        basePath="/agency/influencers"
        searchParams={{ q: query, tier, status }}
      />
    </div>
  );
}
