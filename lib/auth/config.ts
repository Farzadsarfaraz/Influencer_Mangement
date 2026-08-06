import type { NextAuthConfig } from "next-auth";

/**
 * Provider-free base config shared by the full server-side Auth.js setup
 * (lib/auth/index.ts) and by proxy.ts. Keeping it free of Prisma/argon2
 * means the request-gating path in proxy never has to load native
 * dependencies just to read a JWT claim.
 */
export const authConfig = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/sign-in" },
  providers: [],
} satisfies NextAuthConfig;
