# syntax=docker/dockerfile:1

ARG NODE_VERSION=20

################################################################################
# Base stage with pnpm
FROM node:${NODE_VERSION}-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

################################################################################
# Dependencies stage - install all workspace dependencies
FROM base AS deps

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install dependencies
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

################################################################################
# Build stage
FROM deps AS build

# Copy source files
COPY apps/api ./apps/api
COPY packages/types ./packages/types
COPY packages/typescript-config ./packages/typescript-config
COPY turbo.json ./

# Build the API
RUN pnpm --filter=api build

################################################################################
# Production stage
FROM base AS production

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 hono

# Copy built files and dependencies
COPY --from=build --chown=hono:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=hono:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=build --chown=hono:nodejs /app/apps/api/package.json ./apps/api/
COPY --from=build --chown=hono:nodejs /app/packages ./packages

WORKDIR /app/apps/api

USER hono

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3001/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "dist/index.js"]
