"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { setUserStatusAction } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import type { UserStatus } from "@prisma/client";

export function UserStatusToggle({
  userId,
  status,
  disabled,
}: {
  userId: string;
  status: UserStatus;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (status === "INVITED") {
    return <span className="text-sm text-muted-foreground">Awaiting activation</span>;
  }

  const next = status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

  return (
    <Button
      variant={status === "ACTIVE" ? "outline" : "default"}
      size="sm"
      disabled={disabled || pending}
      onClick={() =>
        startTransition(async () => {
          const result = await setUserStatusAction(userId, next);
          if (!result.ok) toast.error(result.error);
        })
      }
    >
      {status === "ACTIVE" ? "Suspend" : "Reactivate"}
    </Button>
  );
}
