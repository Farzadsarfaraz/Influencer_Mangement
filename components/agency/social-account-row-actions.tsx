"use client";

import { X } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { removeSocialAccountAction } from "@/lib/actions/influencers";
import { Button } from "@/components/ui/button";

export function RemoveSocialAccountButton({
  influencerId,
  socialAccountId,
}: {
  influencerId: string;
  socialAccountId: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await removeSocialAccountAction(
            influencerId,
            socialAccountId,
          );
          if (!result.ok) toast.error(result.error);
        })
      }
    >
      <X className="size-4" />
      <span className="sr-only">Remove</span>
    </Button>
  );
}
