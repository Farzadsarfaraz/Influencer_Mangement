import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { portalForRole, type Portal } from "@/lib/auth/permissions";

/**
 * Portal gate only — reads the JWT session and checks the role/portal
 * match. Does not touch the database (see lib/auth/session.ts for the
 * authoritative, revocation-aware check every Server Action/data read
 * performs before returning or mutating anything).
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;

  const portalForPath: Portal | null = pathname.startsWith("/agency")
    ? "agency"
    : pathname.startsWith("/customer")
      ? "customer"
      : pathname.startsWith("/influencer")
        ? "influencer"
        : null;

  if (!portalForPath) return NextResponse.next();

  if (!req.auth?.user) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Logged in but wrong portal: 404 instead of 403 so we don't confirm to
  // a probing client that an agency-only route exists for other roles.
  if (portalForRole(req.auth.user.role) !== portalForPath) {
    return NextResponse.rewrite(new URL("/not-found", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sign-in|invite).*)",
  ],
};
