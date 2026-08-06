import "server-only";

import { headers } from "next/headers";

import { redisConnection } from "@/lib/jobs/connection";

const REDIS_TIMEOUT_MS = 1500;

/**
 * Fixed-window counter in Redis. Good enough for the two spots that need it
 * (sign-in, invite-accept) — no need for a sliding-window/token-bucket
 * algorithm's precision to blunt credential stuffing.
 *
 * Fails open (allows the request) on timeout or error. The shared Redis
 * connection is configured with maxRetriesPerRequest: null for BullMQ's
 * sake — great for jobs that should wait for Redis to come back, terrible
 * here, since it means a command would otherwise hang indefinitely while
 * Redis is unreachable and take sign-in down with it. Rate limiting is
 * defense in depth, not a hard dependency; an infra hiccup in Redis
 * shouldn't become a site-wide outage.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const redisKey = `ratelimit:${key}`;
  try {
    const count = await Promise.race([
      redisConnection.incr(redisKey),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("rate-limit check timed out")), REDIS_TIMEOUT_MS),
      ),
    ]);
    if (count === 1) {
      await redisConnection.expire(redisKey, windowSeconds);
    }
    return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
  } catch (error) {
    console.warn(`[rate-limit] check failed for "${key}", failing open`, error);
    return { allowed: true, remaining: limit };
  }
}

export async function getRequestIp(): Promise<string | null> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return headerList.get("x-real-ip");
}
