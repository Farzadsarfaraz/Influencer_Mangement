"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { updatePaymentStatusAction } from "@/lib/actions/payments";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { paymentStatuses } from "@/lib/validations/payment";
import type { PaymentStatus } from "@prisma/client";

export function PaymentStatusControl({
  paymentId,
  status,
}: {
  paymentId: string;
  status: PaymentStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      disabled={pending}
      onValueChange={(next) =>
        startTransition(async () => {
          const result = await updatePaymentStatusAction({
            paymentId,
            status: next as PaymentStatus,
          });
          if (!result.ok) toast.error(result.error);
        })
      }
    >
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {paymentStatuses.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
