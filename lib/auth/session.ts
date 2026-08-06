import "server-only";

import { cache } from "react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Role, UserStatus } from "@prisma/client";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: Role;
  status: UserStatus;
};

/**
 * The single source of truth for "who is making this request" inside
 * Server Components, Server Actions, and Route Handlers. Re-reads status
 * and tokenVersion from the database on every call (cached per-request via
 * React `cache`) so a revoked user (tokenVersion bumped, status flipped to
 * SUSPENDED) loses data access immediately, even though their JWT is still
 * technically valid until it expires — see docs/ARCHITECTURE.md §3/§12.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth();
  if (!session?.user) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      status: true,
      tokenVersion: true,
    },
  });

  if (
    !user ||
    user.status !== "ACTIVE" ||
    user.tokenVersion !== session.user.tokenVersion
  ) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    status: user.status,
  };
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function requireRole(allowed: Role[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (!allowed.includes(user.role)) throw new Error("FORBIDDEN");
  return user;
}
