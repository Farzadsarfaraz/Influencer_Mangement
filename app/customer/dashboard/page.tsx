import { Building2, Megaphone } from "lucide-react";
import type { Metadata } from "next";

import { Reveal } from "@/components/shared/reveal";
import { StatCard } from "@/components/shared/stat-card";
import { getBrandsForUser, getCampaignCountForBrands } from "@/lib/data/brands";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function CustomerDashboardPage() {
  const user = await requireUser();
  const brands = await getBrandsForUser(user.id);
  const campaignCount = await getCampaignCountForBrands(brands.map((b) => b.id));

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">
        {brands.length === 1 ? brands[0].name : "Your Brands"}
      </h1>
      <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Brands" value={brands.length} icon={Building2} />
        <StatCard label="Live campaigns" value={campaignCount} icon={Megaphone} />
      </Reveal>
      {brands.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You don&apos;t have access to any brands yet. Ask your agency
          contact to add you.
        </p>
      ) : null}
    </div>
  );
}
