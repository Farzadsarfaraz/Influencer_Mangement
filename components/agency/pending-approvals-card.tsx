import { CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";

import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { listPendingInternalApprovals } from "@/lib/data/content";

type ApprovalRequests = Awaited<
  ReturnType<typeof listPendingInternalApprovals>
>["requests"];

/**
 * Agency-wide internal review queue — the one dashboard widget that's
 * directly actionable, not just informational. Each row deep-links to that
 * campaign's approvals tab.
 */
export function PendingApprovalsCard({
  requests,
  total,
}: {
  requests: ApprovalRequests;
  total: number;
}) {
  return (
    <Card className="shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold">
          Needs your review
        </CardTitle>
        {total > 0 ? <Badge variant="secondary">{total}</Badge> : null}
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-muted-foreground flex items-center gap-2 py-6 text-sm">
            <CheckCircle2 className="size-4" />
            All caught up — no pending internal reviews.
          </div>
        ) : (
          <ul className="divide-y">
            {requests.map((request) => {
              const { assignment } = request.contentSubmission.deliverable;
              return (
                <li key={request.id}>
                  <Link
                    href={`/agency/campaigns/${assignment.campaignId}/approvals`}
                    className="hover:bg-accent/50 -mx-1 flex items-center gap-2.5 rounded-md px-1 py-2.5 transition-colors"
                  >
                    <UserAvatar
                      name={assignment.influencer.displayName}
                      image={assignment.influencer.avatarUrl}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {assignment.influencer.displayName}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {assignment.campaign.name}
                      </p>
                    </div>
                    <ChevronRight className="text-muted-foreground size-4 shrink-0" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {total > requests.length ? (
          <p className="text-muted-foreground mt-2 text-xs">
            +{total - requests.length} more awaiting review
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
