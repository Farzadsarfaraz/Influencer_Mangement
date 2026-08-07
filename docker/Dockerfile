# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
WORKDIR /app
RUN corepack disable

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Build-time-only placeholders: prisma.config.ts resolves DATABASE_URL
# eagerly just to load (even for `generate`, which never connects), and
# lib/env.ts's zod schema is parsed at import time by server code `next
# build` touches while compiling. Neither needs real connectivity here —
# actual runtime config comes from the container's real env at `docker run`.
ENV DATABASE_URL=postgresql://octagon:octagon@localhost:5432/octagon
ENV AUTH_SECRET=docker-build-placeholder
ENV AUTH_URL=http://localhost:3000
ENV REDIS_URL=redis://localhost:6379
ENV S3_ENDPOINT=http://localhost:9000
ENV S3_REGION=us-east-1
ENV S3_BUCKET=octagon-build
ENV S3_ACCESS_KEY_ID=octagon
ENV S3_SECRET_ACCESS_KEY=octagon-secret
ENV S3_FORCE_PATH_STYLE=true
ENV S3_PUBLIC_URL=http://localhost:9000/octagon-build
ENV SMTP_HOST=localhost
ENV SMTP_PORT=1025
ENV SMTP_FROM="Octagon <build@octagon.dev>"
ENV APP_URL=http://localhost:3000
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
