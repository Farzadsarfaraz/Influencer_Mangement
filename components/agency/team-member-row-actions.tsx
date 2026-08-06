"use client";

import { X } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { removeTeamMemberAction } from "@/lib/actions/teams";
import { Button } from "@/components/ui/button";

export function RemoveTeamMemberButton({
  teamId,
  userId,
}: {
  teamId: string;
  userId: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await removeTeamMemberAction(teamId, userId);
          if (!result.ok) toast.error(result.error);
        })
      }
    >
      <X className="size-4" />
      <span className="sr-only">Remove</span>
    </Button>
  );
}
