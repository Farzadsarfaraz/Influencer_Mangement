import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      tokenVersion: number;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    tokenVersion: number;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: Role;
    tokenVersion: number;
  }
}
