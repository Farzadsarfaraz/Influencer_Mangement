import { ApprovalDecisionButtons } from "@/components/shared/approval-decision-buttons";
import { CommentThread } from "@/components/shared/comment-thread";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import type { ApprovalStage } from "@prisma/client";

type SubmissionFile = {
  id: string;
  fileName: string;
  url: string;
  mimeType: string;
};
type ApprovalRequestItem = {
  id: string;
  stage: ApprovalStage;
  decision: string;
  comment: string | null;
  reviewer: { name: string; image: string | null } | null;
};
type CommentItem = {
  id: string;
  body: string;
  createdAt: Date;
  author: { name: string; image: string | null };
};

export function SubmissionCard({
  submission,
  decidableStage,
}: {
  submission: {
    id: string;
    version: number;
    caption: string | null;
    status: string;
    submittedBy: { name: string; image: string | null };
    createdAt: Date;
    files: SubmissionFile[];
    approvalRequests: ApprovalRequestItem[];
    comments: CommentItem[];
  };
  decidableStage?: ApprovalStage;
}) {
  const decidableRequest = decidableStage
    ? submission.approvalRequests.find(
        (request) =>
          request.stage === decidableStage && request.decision === "PENDING",
      )
    : undefined;

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-2.5">
          <UserAvatar
            name={submission.submittedBy.name}
            image={submission.submittedBy.image}
            size="sm"
          />
          <div>
            <div className="font-medium">Version {submission.version}</div>
            <div className="text-muted-foreground text-sm">
              {submission.submittedBy.name} ·{" "}
              {submission.createdAt.toLocaleString()}
            </div>
          </div>
        </div>
        <Badge variant="secondary">{submission.status.replace("_", " ")}</Badge>
      </div>

      {submission.caption ? (
        <p className="text-sm">{submission.caption}</p>
      ) : null}

      <div className="space-y-2">
        {submission.files.map((file) => (
          <div key={file.id} className="text-sm">
            {file.mimeType.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={file.url}
                alt={file.fileName}
                className="max-h-64 rounded-md border object-contain"
              />
            ) : file.mimeType.startsWith("video/") ? (
              <video
                src={file.url}
                controls
                className="max-h-64 rounded-md border"
              />
            ) : null}
            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              {file.fileName}
            </a>
          </div>
        ))}
      </div>

      <div className="space-y-1">
        {submission.approvalRequests.map((request) => (
          <div
            key={request.id}
            className="text-muted-foreground flex items-center gap-1.5 text-xs"
          >
            {request.reviewer ? (
              <UserAvatar
                name={request.reviewer.name}
                image={request.reviewer.image}
                size="sm"
              />
            ) : null}
            <span>
              {request.stage}: {request.decision}
              {request.reviewer ? ` by ${request.reviewer.name}` : ""}
              {request.comment ? ` — "${request.comment}"` : ""}
            </span>
          </div>
        ))}
      </div>

      {decidableRequest ? (
        <ApprovalDecisionButtons approvalRequestId={decidableRequest.id} />
      ) : null}

      <CommentThread
        contentSubmissionId={submission.id}
        comments={submission.comments}
      />
    </div>
  );
}
