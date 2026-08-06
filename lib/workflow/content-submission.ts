import type {
  ApprovalDecision,
  ApprovalStage,
  ContentSubmissionStatus,
  DeliverableStatus,
} from "@prisma/client";

/**
 * Content submissions don't move through a simple from/to list like
 * Campaign or Assignment — the next status depends on *which* approval
 * stage decided and *what* they decided. INTERNAL approval doesn't finish
 * the submission, it hands it to CLIENT; only a CLIENT approval finishes it.
 */
export function nextContentSubmissionStatus(
  stage: ApprovalStage,
  decision: Exclude<ApprovalDecision, "PENDING">,
): ContentSubmissionStatus {
  if (decision === "CHANGES_REQUESTED") return "CHANGES_REQUESTED";
  if (decision === "REJECTED") return "REJECTED";
  // decision === "APPROVED"
  return stage === "INTERNAL" ? "IN_REVIEW" : "APPROVED";
}

export function nextDeliverableStatus(
  stage: ApprovalStage,
  decision: Exclude<ApprovalDecision, "PENDING">,
): DeliverableStatus {
  if (decision === "CHANGES_REQUESTED") return "IN_PROGRESS";
  if (decision === "REJECTED") return "REJECTED";
  return stage === "INTERNAL" ? "SUBMITTED" : "APPROVED";
}
