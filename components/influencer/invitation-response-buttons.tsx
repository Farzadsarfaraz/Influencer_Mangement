"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { respondToInvitationAction } from "@/lib/actions/assignments";
import { Button } from "@/components/ui/button";

export function InvitationResponseButtons({ assignmentId }: { assignmentId: string }) {
  const [pending, startTransition] = useTransition();

  function respond(response: "ACCEPTED" | "DECLINED") {
    startTransition(async () => {
      const result = await respondToInvitationAction(assignmentId, response);
      if (!result.ok) toast.error(result.error);
    });
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" disabled={pending} onClick={() => respond("ACCEPTED")}>
        Accept
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => respond("DECLINED")}
      >
        Decline
      </Button>
    </div>
  );
}
