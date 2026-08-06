import type { Metadata } from "next";

import { InfluencerForm } from "@/components/agency/influencer-form";

export const metadata: Metadata = { title: "New Influencer" };

export default function NewInfluencerPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">New Influencer</h1>
      <InfluencerForm />
    </div>
  );
}
