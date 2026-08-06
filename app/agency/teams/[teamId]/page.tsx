import { notFound } from "next/navigation";

import { AddTeamMemberDialog } from "@/components/agency/add-team-member-dialog";
import { RemoveTeamMemberButton } from "@/components/agency/team-member-row-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTeamDetail, listAgencyUsersNotInTeam } from "@/lib/data/teams";

export default async function TeamDetailPage(
  props: PageProps<"/agency/teams/[teamId]">,
) {
  const { teamId } = await props.params;
  const [team, candidates] = await Promise.all([
    getTeamDetail(teamId),
    listAgencyUsersNotInTeam(teamId),
  ]);
  if (!team) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">{team.name}</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Members</CardTitle>
          <AddTeamMemberDialog teamId={team.id} candidates={candidates} />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="font-medium">{member.user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {member.user.email}
                    </div>
                  </TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>
                    <RemoveTeamMemberButton teamId={team.id} userId={member.userId} />
                  </TableCell>
                </TableRow>
              ))}
              {team.members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No members yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
