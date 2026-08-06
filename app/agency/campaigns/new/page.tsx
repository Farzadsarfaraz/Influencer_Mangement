import type { Metadata } from "next";

import { CampaignForm } from "@/components/agency/campaign-form";
import { listBrandOptions } from "@/lib/data/brands";
import { listCampaignOwnerOptions } from "@/lib/data/users";

export const metadata: Metadata = { title: "New Campaign" };

export default async function NewCampaignPage() {
  const [brands, owners] = await Promise.all([
    listBrandOptions(),
    listCampaignOwnerOptions(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">New Campaign</h1>
      <CampaignForm brands={brands} owners={owners} />
    </div>
  );
}
