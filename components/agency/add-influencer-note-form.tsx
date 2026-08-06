"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";

import { addInfluencerNoteAction } from "@/lib/actions/influencers";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AddInfluencerNoteForm({ influencerId }: { influencerId: string }) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        const body = new FormData(event.currentTarget).get("body");
        if (typeof body !== "string" || !body.trim()) return;

        startTransition(async () => {
          const result = await addInfluencerNoteAction({ influencerId, body });
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          formRef.current?.reset();
        });
      }}
    >
      <Textarea name="body" placeholder="Add an internal note…" rows={2} required />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Add note"}
      </Button>
    </form>
  );
}
