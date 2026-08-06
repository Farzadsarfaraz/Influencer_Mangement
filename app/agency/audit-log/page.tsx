import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { Pagination } from "@/components/shared/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ADMIN_ROLES } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
import { listAuditLog } from "@/lib/data/audit-log";

export const metadata: Metadata = { title: "Audit log" };

export default async function AuditLogPage(props: PageProps<"/agency/audit-log">) {
  const user = await getCurrentUser();
  if (!user || !ADMIN_ROLES.includes(user.role)) redirect("/agency/dashboard");

  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === "string" ? Number(searchParams.page) : 1;
  const { entries, total, pageCount } = await listAuditLog({ page });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold">Audit log</h1>
        <p className="text-sm text-muted-foreground">{total} entries</p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-sm text-muted-foreground">
                  {entry.createdAt.toLocaleString()}
                </TableCell>
                <TableCell>{entry.actor?.name ?? "System"}</TableCell>
                <TableCell>
                  <code className="text-xs">{entry.action}</code>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {entry.entityType} · {entry.entityId.slice(0, 8)}
                </TableCell>
                <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                  {entry.before ? `${JSON.stringify(entry.before)} → ` : ""}
                  {entry.after ? JSON.stringify(entry.after) : ""}
                </TableCell>
              </TableRow>
            ))}
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No audit log entries yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <Pagination page={page} pageCount={pageCount} basePath="/agency/audit-log" />
    </div>
  );
}
