import { Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddInfluencerNoteForm } from "@/components/agency/add-influencer-note-form";
import { AddSocialAccountDialog } from "@/components/agency/add-social-account-dialog";
import { InviteInfluencerButton } from "@/components/agency/invite-influencer-button";
import { RemoveSocialAccountButton } from "@/components/agency/social-account-row-actions";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getEntityActivity } from "@/lib/data/activity";
import { getInfluencerDetail } from "@/lib/data/influencers";

export default async function InfluencerDetailPage(
  props: PageProps<"/agency/influencers/[influencerId]">,
) {
  const { influencerId } = await props.params;
  const [influencer, activity] = await Promise.all([
    getInfluencerDetail(influencerId),
    getEntityActivity("Influencer", influencerId),
  ]);
  if (!influencer) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-semibold">{influencer.displayName}</h1>
            <Badge variant="secondary">{influencer.status}</Badge>
            {influencer.tier ? <Badge variant="outline">{influencer.tier}</Badge> : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {influencer.email ?? "No email"}
            {influencer.location ? ` · ${influencer.location}` : ""}
          </p>
          <div className="mt-2 flex gap-1">
            {influencer.tags.map((tag) => (
              <Badge key={tag.id} variant="outline">
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!influencer.userId ? (
            <InviteInfluencerButton influencerId={influencer.id} />
          ) : (
            <Badge>Has portal access</Badge>
          )}
          <Button variant="outline" asChild>
            <Link href={`/agency/influencers/${influencer.id}/edit`}>
              <Pencil /> Edit
            </Link>
          </Button>
        </div>
      </div>

      {influencer.bio ? (
        <p className="max-w-2xl text-sm text-muted-foreground">{influencer.bio}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Social accounts</CardTitle>
            <AddSocialAccountDialog influencerId={influencer.id} />
          </CardHeader>
          <CardContent className="space-y-3">
            {influencer.socialAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between rounded-md border p-3 text-sm"
              >
                <div>
                  <div className="font-medium">
                    {account.platform} · {account.handle}
                  </div>
                  <div className="text-muted-foreground">
                    {account.followerCount?.toLocaleString() ?? "—"} followers
                    {account.engagementRate != null
                      ? ` · ${account.engagementRate}% engagement`
                      : ""}
                  </div>
                </div>
                <RemoveSocialAccountButton
                  influencerId={influencer.id}
                  socialAccountId={account.id}
                />
              </div>
            ))}
            {influencer.socialAccounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No social accounts yet.</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {influencer.assignments.map((assignment) => (
              <Link
                key={assignment.id}
                href={`/agency/campaigns/${assignment.campaignId}/assignments/${assignment.id}`}
                className="block rounded-md border p-3 text-sm hover:bg-accent"
              >
                <div className="font-medium">{assignment.campaign.name}</div>
                <div className="text-muted-foreground">
                  {assignment.status.replace("_", " ")}
                </div>
              </Link>
            ))}
            {influencer.assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assignments yet.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Internal notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AddInfluencerNoteForm influencerId={influencer.id} />
          <Separator />
          <div className="space-y-3">
            {influencer.notes.map((note) => (
              <div key={note.id} className="text-sm">
                <p>{note.body}</p>
                <p className="text-xs text-muted-foreground">
                  {note.author.name} · {note.createdAt.toLocaleDateString()}
                </p>
              </div>
            ))}
            {influencer.notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <ActivityTimeline events={activity} />
    </div>
  );
}
