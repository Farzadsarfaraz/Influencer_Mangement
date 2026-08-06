import Link from "next/link";
import type { Metadata } from "next";

import { CreateTeamDialog } from "@/components/agency/create-team-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listTeams } from "@/lib/data/teams";

export const metadata: Metadata = { title: "Teams" };

export default async function TeamsPage() {
  const teams = await listTeams();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Teams</h1>
        <CreateTeamDialog />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Members</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell className="font-medium">
                  <Link href={`/agency/teams/${team.id}`} className="hover:underline">
                    {team.name}
                  </Link>
                </TableCell>
                <TableCell>{team._count.members}</TableCell>
              </TableRow>
            ))}
            {teams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  No teams yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
