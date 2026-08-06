import type {
  ApprovalDecision,
  ApprovalStage,
  AssignmentStatus,
  CampaignStatus,
  PaymentStatus,
} from "@prisma/client";

export type DomainEvent =
  | {
      type: "assignment.created";
      assignmentId: string;
      campaignId: string;
      influencerId: string;
    }
  | {
      type: "assignment.status_changed";
      assignmentId: string;
      campaignId: string;
      influencerId: string;
      from: AssignmentStatus;
      to: AssignmentStatus;
      actorId: string;
    }
  | {
      type: "campaign.status_changed";
      campaignId: string;
      from: CampaignStatus;
      to: CampaignStatus;
      actorId: string;
    }
  | {
      type: "content.submitted";
      contentSubmissionId: string;
      deliverableId: string;
      actorId: string;
    }
  | {
      type: "approval.decided";
      approvalRequestId: string;
      contentSubmissionId: string;
      stage: ApprovalStage;
      decision: Exclude<ApprovalDecision, "PENDING">;
      actorId: string;
    }
  | {
      type: "message.sent";
      conversationId: string;
      campaignId: string;
      influencerId: string;
      senderId: string;
    }
  | {
      type: "payment.status_changed";
      paymentId: string;
      assignmentId: string;
      status: PaymentStatus;
    }
  | { type: "deliverable.due_soon"; deliverableId: string; assignmentId: string };
