"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { setBrandStatusAction } from "@/lib/actions/brands";
import { Button } from "@/components/ui/button";

export function BrandStatusToggle({
  brandId,
  status,
}: {
  brandId: string;
  status: "ACTIVE" | "INACTIVE";
}) {
  const [pending, startTransition] = useTransition();
  const next = status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await setBrandStatusAction(brandId, next);
          if (!result.ok) toast.error(result.error);
        })
      }
    >
      {status === "ACTIVE" ? "Deactivate" : "Activate"}
    </Button>
  );
}
