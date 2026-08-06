"use client";

import { X } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { removeBrandMemberAction } from "@/lib/actions/brands";
import { Button } from "@/components/ui/button";

export function RemoveBrandMemberButton({
  brandId,
  userId,
}: {
  brandId: string;
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
          const result = await removeBrandMemberAction(brandId, userId);
          if (!result.ok) toast.error(result.error);
        })
      }
    >
      <X className="size-4" />
      <span className="sr-only">Remove</span>
    </Button>
  );
}
