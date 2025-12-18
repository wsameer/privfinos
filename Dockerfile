# syntax=docker/dockerfile:1

# Production Dockerfile for Privfinos Turbo Monorepo
# This builds both the web (React + Vite) and api (Hono.js) apps

ARG NODE_VERSION=24.11.0

################################################################################
# Base stage - Setup pnpm
################################################################################
FROM node:${NODE_VERSION}-alpine AS base

# Install pnpm with explicit version
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Set working directory
WORKDIR /app

################################################################################
# Pruner stage - Extract only necessary workspace files
################################################################################
FROM base AS pruner

COPY . .

# Prune the workspace for the apps we want to build
# This creates a minimal workspace with only the necessary dependencies
# Using pnpm dlx to download and execute turbo without global install
RUN pnpm dlx turbo@2.6.3 prune web api --docker

################################################################################
# Installer stage - Install dependencies
################################################################################
FROM base AS installer

# Copy pruned lockfile and package.json files
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Install dependencies (including devDependencies for build)
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
  pnpm install --frozen-lockfile

# Copy pruned source code
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

# Build all apps and packages
# Using turbo from devDependencies installed via pnpm install
RUN pnpm turbo build

################################################################################
# Runner stage - Production runtime with minimal footprint
################################################################################
FROM node:${NODE_VERSION}-alpine AS runner

ARG NODE_VERSION=24.11.0

# Install pnpm with explicit version
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 hono

# Set to production environment
ENV NODE_ENV=production

# Copy necessary files from installer
COPY --from=installer /app/package.json ./package.json
COPY --from=installer /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=installer /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Copy built applications
COPY --from=installer --chown=hono:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=installer --chown=hono:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=installer --chown=hono:nodejs /app/apps/web/dist ./apps/web/dist
COPY --from=installer --chown=hono:nodejs /app/apps/web/package.json ./apps/web/package.json

# Copy workspace packages
COPY --from=installer --chown=hono:nodejs /app/packages ./packages

# Install only production dependencies
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
  pnpm install --prod --frozen-lockfile

USER hono

# Expose the API port
EXPOSE 3001

# Start the API server (which will also serve the web app static files)
CMD ["pnpm", "--filter=api", "start"]
