"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { inviteInfluencerToPortalAction } from "@/lib/actions/influencers";
import { Button } from "@/components/ui/button";

export function InviteInfluencerButton({ influencerId }: { influencerId: string }) {
  const [pending, startTransition] = useTransition();
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  if (inviteUrl) {
    return (
      <div className="space-y-2 rounded-md border p-3 text-sm">
        <p>
          Account created. Share this activation link (email delivery isn&apos;t
          wired up yet):
        </p>
        <code className="block truncate rounded-md bg-muted p-2 text-xs">
          {inviteUrl}
        </code>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await inviteInfluencerToPortalAction(influencerId);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          setInviteUrl(new URL(result.data.inviteUrl, window.location.origin).toString());
        })
      }
    >
      {pending ? "Inviting…" : "Invite to influencer portal"}
    </Button>
  );
}
