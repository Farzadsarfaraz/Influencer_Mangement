import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInfluencerForUser } from "@/lib/data/influencers";
import { listPaymentsForInfluencer } from "@/lib/data/payments";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Payments" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  PAID: "default",
  PENDING: "secondary",
  SCHEDULED: "secondary",
  FAILED: "destructive",
  CANCELLED: "destructive",
};

export default async function InfluencerPaymentsPage() {
  const user = await requireUser();
  const influencer = await getInfluencerForUser(user.id);
  if (!influencer) redirect("/influencer/dashboard");

  const payments = await listPaymentsForInfluencer(influencer.id);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Payments</h1>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">
                  {payment.assignment.campaign.name}
                  <div className="text-sm text-muted-foreground">
                    {payment.assignment.campaign.brand.name}
                  </div>
                </TableCell>
                <TableCell>
                  ${Number(payment.amount).toLocaleString()} {payment.currency}
                </TableCell>
                <TableCell>
                  {payment.dueDate ? payment.dueDate.toLocaleDateString() : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[payment.status] ?? "secondary"}>
                    {payment.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No payments yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
