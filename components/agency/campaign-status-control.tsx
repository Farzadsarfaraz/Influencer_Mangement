"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { transitionCampaignStatusAction } from "@/lib/actions/campaigns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CAMPAIGN_TRANSITIONS } from "@/lib/workflow/campaign";
import type { CampaignStatus } from "@prisma/client";

export function CampaignStatusControl({
  campaignId,
  status,
}: {
  campaignId: string;
  status: CampaignStatus;
}) {
  const [pending, startTransition] = useTransition();
  const options = CAMPAIGN_TRANSITIONS[status];

  return (
    <Select
      value={status}
      disabled={pending || options.length === 0}
      onValueChange={(next) =>
        startTransition(async () => {
          const result = await transitionCampaignStatusAction({
            campaignId,
            status: next as CampaignStatus,
          });
          if (!result.ok) toast.error(result.error);
        })
      }
    >
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={status}>{status.replace("_", " ")}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            Move to {option.replace("_", " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
