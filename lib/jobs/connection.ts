import "server-only";

import Redis from "ioredis";

import { env } from "@/lib/env";

const globalForRedis = globalThis as unknown as { redisConnection?: Redis };

/**
 * Shared connection reused by every BullMQ Queue/Worker in this process.
 * BullMQ requires maxRetriesPerRequest: null on the connection it manages.
 */
export const redisConnection =
  globalForRedis.redisConnection ?? createRedisConnection();

function createRedisConnection() {
  const client = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

  // ioredis retries forever by default and logs a full stack trace on every
  // failed attempt — fine in production (Redis should just be up), miserable
  // in local dev when you haven't started `docker-compose up` yet. Replace
  // that with one throttled, one-line notice instead of silence (an
  // unhandled "error" listener would crash the process) or spam.
  let lastLoggedAt = 0;
  client.on("error", (error: Error) => {
    const now = Date.now();
    if (now - lastLoggedAt > 30_000) {
      lastLoggedAt = now;
      console.warn(
        `[redis] can't reach ${env.REDIS_URL} (${error.message}) — notifications will still work, but emails/reports/reminders won't send until Redis is up. Retrying quietly.`,
      );
    }
  });

  return client;
}

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redisConnection = redisConnection;
}
