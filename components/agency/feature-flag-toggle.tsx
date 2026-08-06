"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { toggleFeatureFlagAction } from "@/lib/actions/feature-flags";
import { Switch } from "@/components/ui/switch";

export function FeatureFlagToggle({
  flagId,
  enabled,
}: {
  flagId: string;
  enabled: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Switch
      checked={enabled}
      disabled={pending}
      onCheckedChange={(checked) =>
        startTransition(async () => {
          const result = await toggleFeatureFlagAction(flagId, checked);
          if (!result.ok) toast.error(result.error);
        })
      }
    />
  );
}
