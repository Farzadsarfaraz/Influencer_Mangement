"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";

import { addCommentAction } from "@/lib/actions/comments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type CommentItem = {
  id: string;
  body: string;
  createdAt: Date;
  author: { name: string };
};

export function CommentThread({
  contentSubmissionId,
  comments,
}: {
  contentSubmissionId: string;
  comments: CommentItem[];
}) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {comments.map((comment) => (
          <div key={comment.id} className="rounded-md bg-muted/50 p-2 text-sm">
            <p>{comment.body}</p>
            <p className="text-xs text-muted-foreground">
              {comment.author.name} · {comment.createdAt.toLocaleString()}
            </p>
          </div>
        ))}
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        ) : null}
      </div>
      <form
        ref={formRef}
        className="space-y-2"
        onSubmit={(event) => {
          event.preventDefault();
          const body = new FormData(event.currentTarget).get("body");
          if (typeof body !== "string" || !body.trim()) return;

          startTransition(async () => {
            const result = await addCommentAction({ contentSubmissionId, body });
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            formRef.current?.reset();
          });
        }}
      >
        <Textarea name="body" placeholder="Add a comment…" rows={2} required />
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Posting…" : "Comment"}
        </Button>
      </form>
    </div>
  );
}
