# ── Stage 1: deps ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
# Install system dependencies required for node-gyp and prisma
RUN apk add --no-cache libc6-compat python3 make g++ openssl
COPY package.json package-lock.json ./
# Clean install to ensure correct dependency resolution
RUN npm ci

# ── Stage 2: development ──────────────────────────────────────────────────────
FROM node:22-alpine AS development
WORKDIR /app
# We need openssl for Prisma
RUN apk add --no-cache openssl bash
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma Client for dev
RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "run", "dev"]

# ── Stage 3: builder ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js application
# Disabling linting and type checking during docker build is common if already done in CI
RUN npm run build

# ── Stage 3: production ───────────────────────────────────────────────────────
FROM node:22-alpine AS production
# bash for potential scripting needs, su-exec for dropping privileges, openssl for prisma
RUN apk add --no-cache bash su-exec openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy essential files for Next.js and Prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json         ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts       ./next.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/.next                ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public               ./public

# Copy node_modules and prisma directory for runtime usage and migrations
COPY --from=builder --chown=nextjs:nodejs /app/node_modules         ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/prisma               ./prisma

# Copy entrypoint script
COPY --chown=nextjs:nodejs entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3000

# We set the entrypoint so our script handles migrations and starting the app
ENTRYPOINT ["./entrypoint.sh"]
# Default command arguments passed to entrypoint.sh
CMD ["npm", "run", "start"]
