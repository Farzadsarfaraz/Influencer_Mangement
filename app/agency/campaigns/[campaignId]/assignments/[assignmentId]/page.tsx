import Link from "next/link";
import { notFound } from "next/navigation";

import { AddDeliverableDialog } from "@/components/agency/add-deliverable-dialog";
import { AddPaymentDialog } from "@/components/agency/add-payment-dialog";
import { AssignmentStatusControl } from "@/components/agency/assignment-status-control";
import { RemoveDeliverableButton } from "@/components/agency/deliverable-row-actions";
import { PaymentStatusControl } from "@/components/agency/payment-status-control";
import { MessageThread } from "@/components/shared/message-thread";
import { Reveal } from "@/components/shared/reveal";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { getAssignmentDetail } from "@/lib/data/assignments";
import { getConversation } from "@/lib/data/messaging";
import { listPaymentsForAssignment } from "@/lib/data/payments";

export default async function AssignmentDetailPage(
  props: PageProps<"/agency/campaigns/[campaignId]/assignments/[assignmentId]">,
) {
  const user = await requireUser();
  const { campaignId, assignmentId } = await props.params;
  const assignment = await getAssignmentDetail(assignmentId);
  if (!assignment || assignment.campaignId !== campaignId) notFound();

  const [conversation, payments] = await Promise.all([
    getConversation(campaignId, assignment.influencerId),
    listPaymentsForAssignment(assignmentId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/agency/campaigns/${campaignId}/assignments`}
          className="text-muted-foreground text-sm hover:underline"
        >
          ← Back to assignments
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <UserAvatar
            name={assignment.influencer.displayName}
            image={null}
            size="lg"
          />
          <div>
            <h1 className="text-3xl font-semibold">
              {assignment.influencer.displayName}
            </h1>
            <p className="text-muted-foreground text-sm">
              {assignment.campaign.name} · {assignment.campaign.brand.name}
              {assignment.flight ? ` · ${assignment.flight.name}` : ""}
            </p>
          </div>
        </div>
        <AssignmentStatusControl
          assignmentId={assignment.id}
          status={assignment.status}
        />
      </div>

      <Reveal className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Fee
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold">
            {assignment.fee
              ? `$${Number(assignment.fee).toLocaleString()}`
              : "—"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Due date
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold">
            {assignment.dueDate ? assignment.dueDate.toLocaleDateString() : "—"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">
              {assignment.status.replace("_", " ")}
            </Badge>
          </CardContent>
        </Card>
      </Reveal>

      {assignment.notes ? (
        <p className="text-muted-foreground max-w-2xl text-sm">
          {assignment.notes}
        </p>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Deliverables</CardTitle>
          <AddDeliverableDialog assignmentId={assignment.id} />
        </CardHeader>
        <CardContent className="space-y-3">
          {assignment.deliverables.map((deliverable) => (
            <div
              key={deliverable.id}
              className="flex items-center justify-between rounded-md border p-3 text-sm"
            >
              <div>
                <div className="font-medium">{deliverable.title}</div>
                <div className="text-muted-foreground">
                  {deliverable.platform} · {deliverable.contentType}
                  {deliverable.dueDate
                    ? ` · due ${deliverable.dueDate.toLocaleDateString()}`
                    : ""}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{deliverable.status}</Badge>
                <RemoveDeliverableButton deliverableId={deliverable.id} />
              </div>
            </div>
          ))}
          {assignment.deliverables.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No deliverables yet.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payments</CardTitle>
          <AddPaymentDialog assignmentId={assignment.id} />
        </CardHeader>
        <CardContent className="space-y-3">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between rounded-md border p-3 text-sm"
            >
              <div>
                <div className="font-medium">
                  ${Number(payment.amount).toLocaleString()} {payment.currency}
                </div>
                <div className="text-muted-foreground">
                  {payment.dueDate
                    ? `Due ${payment.dueDate.toLocaleDateString()}`
                    : "No due date"}
                  {payment.method ? ` · ${payment.method}` : ""}
                </div>
              </div>
              <PaymentStatusControl
                paymentId={payment.id}
                status={payment.status}
              />
            </div>
          ))}
          {payments.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No payments scheduled.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <MessageThread
            campaignId={campaignId}
            influencerId={assignment.influencerId}
            currentUserId={user.id}
            messages={conversation?.messages ?? []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
