"use client";

import { X } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { removeDeliverableAction } from "@/lib/actions/deliverables";
import { Button } from "@/components/ui/button";

export function RemoveDeliverableButton({ deliverableId }: { deliverableId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await removeDeliverableAction(deliverableId);
          if (!result.ok) toast.error(result.error);
        })
      }
    >
      <X className="size-4" />
      <span className="sr-only">Remove</span>
    </Button>
  );
}
