"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { transitionAssignmentStatusAction } from "@/lib/actions/assignments";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ASSIGNMENT_TRANSITIONS } from "@/lib/workflow/assignment";
import type { AssignmentStatus } from "@prisma/client";

export function AssignmentStatusControl({
  assignmentId,
  status,
}: {
  assignmentId: string;
  status: AssignmentStatus;
}) {
  const [pending, startTransition] = useTransition();
  const options = ASSIGNMENT_TRANSITIONS[status];

  return (
    <Select
      value={status}
      disabled={pending || options.length === 0}
      onValueChange={(next) =>
        startTransition(async () => {
          const result = await transitionAssignmentStatusAction({
            assignmentId,
            status: next as AssignmentStatus,
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
