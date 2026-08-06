import type { Metadata } from "next";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Roles" };

const ROLES = [
  {
    role: "SUPER_ADMIN",
    portal: "Agency",
    description: "Full platform access, including granting/revoking other super admins.",
  },
  {
    role: "AGENCY_ADMIN",
    portal: "Agency",
    description: "Manage users, brands, teams, feature flags, settings, all campaigns.",
  },
  {
    role: "AGENCY_MANAGER",
    portal: "Agency",
    description: "Create and manage campaigns, assignments, and approvals.",
  },
  {
    role: "AGENCY_MEMBER",
    portal: "Agency",
    description: "Work assigned campaigns: upload, review, message — no admin access.",
  },
  {
    role: "CLIENT_ADMIN",
    portal: "Customer",
    description: "Brand-scoped: manage which client users can see the brand, approve content.",
  },
  {
    role: "CLIENT_VIEWER",
    portal: "Customer",
    description: "Brand-scoped, read-only: dashboards, deliverables, reports.",
  },
  {
    role: "INFLUENCER",
    portal: "Influencer",
    description: "Self-scoped: own assignments, uploads, messages, payments.",
  },
];

export default function RolesReferencePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold">Roles</h1>
        <p className="text-sm text-muted-foreground">
          Roles are fixed, not custom-configurable — this is a reference for what each one
          can do. Change a person&apos;s role from the Users page.
        </p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Portal</TableHead>
              <TableHead>What they can do</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ROLES.map((row) => (
              <TableRow key={row.role}>
                <TableCell>
                  <Badge variant="outline">{row.role.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.portal}</TableCell>
                <TableCell className="text-sm">{row.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
