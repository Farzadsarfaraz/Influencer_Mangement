import type { Metadata } from "next";

import { CreateAgencyUserDialog } from "@/components/agency/create-agency-user-dialog";
import { UserRoleSelect } from "@/components/agency/user-role-select";
import { UserStatusToggle } from "@/components/agency/user-status-toggle";
import { SearchForm } from "@/components/shared/search-form";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireUser } from "@/lib/auth/session";
import { listUsers } from "@/lib/data/users";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage(
  props: PageProps<"/agency/admin/users">,
) {
  const actor = await requireUser();
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const page = typeof searchParams.page === "string" ? Number(searchParams.page) : 1;

  const { users, total, pageCount } = await listUsers({ query: q, page });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">{total} total</p>
        </div>
        <CreateAgencyUserDialog canGrantSuperAdmin={actor.role === "SUPER_ADMIN"} />
      </div>

      <SearchForm defaultValue={q} placeholder="Search users…" />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-32" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isSelf = user.id === actor.id;
              const isProtectedSuperAdmin =
                user.role === "SUPER_ADMIN" && actor.role !== "SUPER_ADMIN";
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    {user.role === "CLIENT_ADMIN" ||
                    user.role === "CLIENT_VIEWER" ||
                    user.role === "INFLUENCER" ? (
                      <Badge variant="outline">{user.role.replace("_", " ")}</Badge>
                    ) : (
                      <UserRoleSelect
                        userId={user.id}
                        role={user.role}
                        disabled={isSelf || isProtectedSuperAdmin}
                        canGrantSuperAdmin={actor.role === "SUPER_ADMIN"}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "ACTIVE" ? "default" : "secondary"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <UserStatusToggle
                      userId={user.id}
                      status={user.status}
                      disabled={isSelf || isProtectedSuperAdmin}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <Pagination
        page={page}
        pageCount={pageCount}
        basePath="/agency/admin/users"
        searchParams={{ q }}
      />
    </div>
  );
}
