"use server";

import argon2 from "argon2";
import { randomUUID } from "crypto";

import { db } from "@/lib/db";
import { checkRateLimit, getRequestIp } from "@/lib/security/rate-limit";
import { acceptInviteSchema } from "@/lib/validations/invite";

const INVITE_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const INVITE_ATTEMPTS_PER_IP = 10;
const INVITE_WINDOW_SECONDS = 15 * 60;

/**
 * Issues a one-time invite token for a user created in INVITED status.
 * Reuses Auth.js's VerificationToken table rather than adding a bespoke
 * invite-token model — it's already exactly this shape (identifier,
 * single-use token, expiry).
 */
export async function issueInviteToken(userEmail: string): Promise<string> {
  const token = randomUUID();
  await db.verificationToken.create({
    data: {
      identifier: userEmail,
      token,
      expires: new Date(Date.now() + INVITE_TOKEN_TTL_MS),
    },
  });
  return token;
}

export type AcceptInviteState = { error?: string; success?: boolean };

export async function acceptInviteAction(
  _prevState: AcceptInviteState,
  formData: FormData,
): Promise<AcceptInviteState> {
  const ip = await getRequestIp();
  if (ip) {
    const { allowed } = await checkRateLimit(
      `invite-accept:ip:${ip}`,
      INVITE_ATTEMPTS_PER_IP,
      INVITE_WINDOW_SECONDS,
    );
    if (!allowed) {
      return { error: "Too many attempts. Try again in a few minutes." };
    }
  }

  const parsed = acceptInviteSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { token, password } = parsed.data;

  const verificationToken = await db.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return { error: "This invite link is invalid or has expired." };
  }

  const user = await db.user.findUnique({
    where: { email: verificationToken.identifier },
  });

  if (!user || user.status !== "INVITED") {
    return { error: "This invite has already been used." };
  }

  const passwordHash = await argon2.hash(password);

  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: { passwordHash, status: "ACTIVE" },
    }),
    db.verificationToken.delete({
      where: { token },
    }),
  ]);

  return { success: true };
}
