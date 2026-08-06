import type { Metadata } from "next";

import { SubmissionCard } from "@/components/shared/submission-card";
import { getBrandsForUser } from "@/lib/data/brands";
import { getClientApprovalQueue, getContentSubmissionDetail } from "@/lib/data/content";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Approvals" };

export default async function CustomerApprovalsPage() {
  const user = await requireUser();
  const brands = await getBrandsForUser(user.id);
  const queue = await getClientApprovalQueue(brands.map((brand) => brand.id));

  const submissions = await Promise.all(
    queue.map((request) => getContentSubmissionDetail(request.contentSubmissionId)),
  );

  const canDecide = user.role === "CLIENT_ADMIN";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold">Content Approvals</h1>
        <p className="text-sm text-muted-foreground">
          {canDecide
            ? "Content your agency team has cleared and is ready for your sign-off."
            : "You can view and comment — ask a brand admin on your team to approve or request changes."}
        </p>
      </div>

      <div className="space-y-4">
        {submissions.map(
          (submission) =>
            submission && (
              <SubmissionCard
                key={submission.id}
                submission={submission}
                decidableStage={canDecide ? "CLIENT" : undefined}
              />
            ),
        )}
        {submissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing pending your review.</p>
        ) : null}
      </div>
    </div>
  );
}
