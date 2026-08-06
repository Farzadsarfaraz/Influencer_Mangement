import react from "@vitejs/plugin-react";
import { config as loadEnv } from "dotenv";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Same pattern as prisma.config.ts: pick up the real DATABASE_URL (and
// anything else already configured) from .env/.env.local if present.
// dotenv doesn't override already-set process.env values, so this is a
// no-op in CI, where the workflow sets these directly.
loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

// lib/env.ts validates the full schema eagerly at import time — anything
// that transitively imports lib/db.ts (basically all of lib/data/*) needs
// every var present, even ones a given test never touches. Fill in inert
// defaults for the ones that aren't DATABASE_URL so tests aren't required
// to configure S3/SMTP/etc. just to import a data-layer function.
const testEnvDefaults = {
  AUTH_SECRET: process.env.AUTH_SECRET ?? "test-secret",
  AUTH_URL: process.env.AUTH_URL ?? "http://localhost:3000",
  REDIS_URL: process.env.REDIS_URL ?? "redis://localhost:6379",
  S3_ENDPOINT: process.env.S3_ENDPOINT ?? "http://localhost:9000",
  S3_REGION: process.env.S3_REGION ?? "us-east-1",
  S3_BUCKET: process.env.S3_BUCKET ?? "octagon-test",
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID ?? "test",
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY ?? "test",
  S3_FORCE_PATH_STYLE: process.env.S3_FORCE_PATH_STYLE ?? "true",
  S3_PUBLIC_URL: process.env.S3_PUBLIC_URL ?? "http://localhost:9000/octagon-test",
  SMTP_HOST: process.env.SMTP_HOST ?? "localhost",
  SMTP_PORT: process.env.SMTP_PORT ?? "1025",
  SMTP_FROM: process.env.SMTP_FROM ?? "Octagon <test@octagon.dev>",
  APP_URL: process.env.APP_URL ?? "http://localhost:3000",
};

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      // The "server-only" package throws unconditionally unless resolved
      // through the "react-server" export condition, which only Next.js's
      // own bundler sets. Outside that bundler (i.e. here, in Vitest),
      // alias it to the package's own no-op build instead.
      "server-only": fileURLToPath(
        new URL("./node_modules/server-only/empty.js", import.meta.url),
      ),
    },
  },
  plugins: [react()],
  test: {
    environment: "jsdom",
    env: testEnvDefaults,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}", "tests/integration/**/*.test.{ts,tsx}"],
  },
});
