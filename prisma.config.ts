import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Prisma's CLI only auto-loads `.env`, not Next.js's `.env.local` — load both
// explicitly so `prisma migrate`/`db seed` see the same DATABASE_URL the app does.
loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
