"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { sendMessageAction } from "@/lib/actions/messages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type MessageItem = {
  id: string;
  body: string;
  createdAt: Date;
  sender: { id: string; name: string };
};

export function MessageThread({
  campaignId,
  influencerId,
  currentUserId,
  messages,
}: {
  campaignId: string;
  influencerId: string;
  currentUserId: string;
  messages: MessageItem[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-3">
      <div className="max-h-80 space-y-2 overflow-y-auto">
        {messages.map((message) => {
          const isMine = message.sender.id === currentUserId;
          return (
            <div
              key={message.id}
              className={
                isMine
                  ? "ml-auto max-w-[80%] rounded-md bg-primary p-2 text-sm text-primary-foreground"
                  : "mr-auto max-w-[80%] rounded-md bg-muted p-2 text-sm"
              }
            >
              <p>{message.body}</p>
              <p className="text-xs opacity-70">
                {message.sender.name} · {message.createdAt.toLocaleString()}
              </p>
            </div>
          );
        })}
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages yet.</p>
        ) : null}
      </div>
      <form
        ref={formRef}
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const body = new FormData(event.currentTarget).get("body");
          if (typeof body !== "string" || !body.trim()) return;

          startTransition(async () => {
            const result = await sendMessageAction({ campaignId, influencerId, body });
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            formRef.current?.reset();
            router.refresh();
          });
        }}
      >
        <Textarea name="body" placeholder="Write a message…" rows={1} required />
        <Button type="submit" disabled={pending}>
          Send
        </Button>
      </form>
    </div>
  );
}
