import "server-only";

import { db } from "@/lib/db";
import { AGENCY_ROLES } from "@/lib/auth/permissions";

export async function listTeams() {
  return db.team.findMany({
    include: { _count: { select: { members: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getTeamDetail(teamId: string) {
  return db.team.findUnique({
    where: { id: teamId },
    include: {
      members: { include: { user: true }, orderBy: { role: "asc" } },
    },
  });
}

export async function listAgencyUsersNotInTeam(teamId: string) {
  return db.user.findMany({
    where: {
      role: { in: AGENCY_ROLES },
      teamMemberships: { none: { teamId } },
    },
    orderBy: { name: "asc" },
  });
}
