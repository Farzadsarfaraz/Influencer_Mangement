import { notFound } from "next/navigation";

import { InfluencerForm } from "@/components/agency/influencer-form";
import { getInfluencerDetail } from "@/lib/data/influencers";

export default async function EditInfluencerPage(
  props: PageProps<"/agency/influencers/[influencerId]/edit">,
) {
  const { influencerId } = await props.params;
  const influencer = await getInfluencerDetail(influencerId);
  if (!influencer) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Edit {influencer.displayName}</h1>
      <InfluencerForm
        influencerId={influencer.id}
        avatarUrl={influencer.avatarUrl}
        defaultValues={{
          displayName: influencer.displayName,
          email: influencer.email ?? "",
          phone: influencer.phone ?? "",
          bio: influencer.bio ?? "",
          location: influencer.location ?? "",
          tier: influencer.tier ?? undefined,
          status: influencer.status,
          tags: influencer.tags.map((tag) => tag.name).join(", "),
        }}
      />
    </div>
  );
}
