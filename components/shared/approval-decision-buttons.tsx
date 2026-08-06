"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { decideApprovalAction } from "@/lib/actions/content";
import { Button } from "@/components/ui/button";

export function ApprovalDecisionButtons({
  approvalRequestId,
}: {
  approvalRequestId: string;
}) {
  const [pending, startTransition] = useTransition();

  function decide(decision: "APPROVED" | "CHANGES_REQUESTED" | "REJECTED") {
    startTransition(async () => {
      const result = await decideApprovalAction({ approvalRequestId, decision });
      if (!result.ok) toast.error(result.error);
    });
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" disabled={pending} onClick={() => decide("APPROVED")}>
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => decide("CHANGES_REQUESTED")}
      >
        Request changes
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={pending}
        onClick={() => decide("REJECTED")}
      >
        Reject
      </Button>
    </div>
  );
}
