import type { AssignmentStatus } from "@prisma/client";

export const ASSIGNMENT_TRANSITIONS: Record<AssignmentStatus, AssignmentStatus[]> = {
  INVITED: ["ACCEPTED", "DECLINED", "CANCELLED"],
  ACCEPTED: ["IN_PROGRESS", "CANCELLED"],
  DECLINED: [],
  IN_PROGRESS: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["IN_REVIEW", "CANCELLED"],
  IN_REVIEW: ["APPROVED", "REVISION_REQUESTED", "CANCELLED"],
  REVISION_REQUESTED: ["IN_PROGRESS", "SUBMITTED", "CANCELLED"],
  APPROVED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransitionAssignment(
  from: AssignmentStatus,
  to: AssignmentStatus,
): boolean {
  return ASSIGNMENT_TRANSITIONS[from].includes(to);
}
