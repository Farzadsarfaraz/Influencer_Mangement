import { notFound, redirect } from "next/navigation";

import { InvitationResponseButtons } from "@/components/influencer/invitation-response-buttons";
import { ContentUploader } from "@/components/shared/content-uploader";
import { MessageThread } from "@/components/shared/message-thread";
import { SubmissionCard } from "@/components/shared/submission-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { getAssignmentDetail } from "@/lib/data/assignments";
import { getDeliverableWithSubmissions } from "@/lib/data/content";
import { getConversation } from "@/lib/data/messaging";

export default async function InfluencerAssignmentPage(
  props: PageProps<"/influencer/assignments/[assignmentId]">,
) {
  const user = await requireUser();
  const { assignmentId } = await props.params;
  const assignment = await getAssignmentDetail(assignmentId);
  if (!assignment) notFound();
  if (assignment.influencer.userId !== user.id) redirect("/influencer/dashboard");

  const [deliverablesWithSubmissions, conversation] = await Promise.all([
    Promise.all(
      assignment.deliverables.map((deliverable) =>
        getDeliverableWithSubmissions(deliverable.id),
      ),
    ),
    getConversation(assignment.campaignId, assignment.influencerId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{assignment.campaign.name}</h1>
          <p className="text-sm text-muted-foreground">
            {assignment.campaign.brand.name} · Status:{" "}
            <Badge variant="secondary">{assignment.status.replace("_", " ")}</Badge>
          </p>
        </div>
        {assignment.status === "INVITED" ? (
          <InvitationResponseButtons assignmentId={assignment.id} />
        ) : null}
      </div>

      {assignment.campaign.objective ? (
        <Card>
          <CardHeader>
            <CardTitle>Briefing</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>{assignment.campaign.objective}</p>
            {assignment.campaign.description ? (
              <p className="mt-2 text-muted-foreground">
                {assignment.campaign.description}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {assignment.notes ? (
        <p className="max-w-2xl text-sm text-muted-foreground">{assignment.notes}</p>
      ) : null}

      <div className="space-y-6">
        {deliverablesWithSubmissions.map((entry) => {
          if (!entry) return null;
          const { deliverable, submissions } = entry;
          return (
            <Card key={deliverable.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{deliverable.title}</CardTitle>
                  <Badge variant="outline">{deliverable.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {deliverable.platform} · {deliverable.contentType}
                  {deliverable.dueDate
                    ? ` · due ${deliverable.dueDate.toLocaleDateString()}`
                    : ""}
                </p>
                {deliverable.description ? (
                  <p className="text-sm">{deliverable.description}</p>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-4">
                <ContentUploader deliverableId={deliverable.id} />
                {submissions.map((submission) => (
                  <SubmissionCard key={submission.id} submission={submission} />
                ))}
              </CardContent>
            </Card>
          );
        })}
        {assignment.deliverables.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No deliverables have been defined for this assignment yet.
          </p>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <MessageThread
            campaignId={assignment.campaignId}
            influencerId={assignment.influencerId}
            currentUserId={user.id}
            messages={conversation?.messages ?? []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
