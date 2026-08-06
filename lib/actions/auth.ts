"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/lib/auth";
import { portalForRole } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { checkRateLimit, getRequestIp } from "@/lib/security/rate-limit";

const SIGN_IN_ATTEMPTS_PER_EMAIL = 5;
const SIGN_IN_ATTEMPTS_PER_IP = 20;
const SIGN_IN_WINDOW_SECONDS = 15 * 60;

export type SignInState =
  | { status: "error"; message: string }
  | { status: "success"; redirectTo: string }
  | undefined;

export async function signInAction(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = formData.get("email");
  const password = formData.get("password");

  const ip = await getRequestIp();
  const [byEmail, byIp] = await Promise.all([
    typeof email === "string"
      ? checkRateLimit(
          `sign-in:email:${email.toLowerCase()}`,
          SIGN_IN_ATTEMPTS_PER_EMAIL,
          SIGN_IN_WINDOW_SECONDS,
        )
      : { allowed: true, remaining: 1 },
    ip
      ? checkRateLimit(
          `sign-in:ip:${ip}`,
          SIGN_IN_ATTEMPTS_PER_IP,
          SIGN_IN_WINDOW_SECONDS,
        )
      : { allowed: true, remaining: 1 },
  ]);
  if (!byEmail.allowed || !byIp.allowed) {
    return {
      status: "error",
      message: "Too many sign-in attempts. Try again in a few minutes.",
    };
  }

  let redirectTo = "/";
  if (typeof email === "string") {
    const user = await db.user.findUnique({
      where: { email },
      select: { role: true },
    });
    if (user) redirectTo = `/${portalForRole(user.role)}/dashboard`;
  }

  try {
    // redirect: false — the client renders a full-screen splash on success
    // and navigates itself once that animation finishes, instead of
    // NextAuth's default server-side redirect cutting straight to the
    // dashboard. The session cookie is still set on this response either way.
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return { status: "error", message: "Invalid email or password." };
    }
    throw error;
  }

  return { status: "success", redirectTo };
}

export async function signOutAction() {
  await signOut({ redirectTo: "/sign-in" });
}
