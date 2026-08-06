import Link from "next/link";
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
import { getInfluencerForUser, listAssignmentsForInfluencer } from "@/lib/data/influencers";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "My Assignments" };

export default async function InfluencerAssignmentsPage() {
  const user = await requireUser();
  const influencer = await getInfluencerForUser(user.id);
  if (!influencer) redirect("/influencer/dashboard");

  const assignments = await listAssignmentsForInfluencer(influencer.id);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">My Assignments</h1>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deliverables</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/influencer/assignments/${assignment.id}`}
                    className="hover:underline"
                  >
                    {assignment.campaign.name}
                  </Link>
                </TableCell>
                <TableCell>{assignment.campaign.brand.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{assignment.status.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell>{assignment._count.deliverables}</TableCell>
              </TableRow>
            ))}
            {assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No assignments yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
