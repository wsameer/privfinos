# syntax=docker/dockerfile:1

ARG NODE_VERSION=20

################################################################################
# Base stage with pnpm
FROM node:${NODE_VERSION}-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

################################################################################
# Dependencies stage
FROM base AS deps

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/

# Install dependencies
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

################################################################################
# Build stage
FROM deps AS build

# Copy source files
COPY apps/web ./apps/web
COPY packages/ui ./packages/ui
COPY packages/typescript-config ./packages/typescript-config
COPY packages/eslint-config ./packages/eslint-config
COPY turbo.json ./

# Build the web app
RUN pnpm --filter=web build

################################################################################
# Production stage - serve with nginx
FROM nginx:alpine AS production

# Copy custom nginx config
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

# Create non-root user
RUN addgroup --system --gid 1001 nginx-user && \
    adduser --system --uid 1001 --ingroup nginx-user nginx-user && \
    chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /var/run/nginx.pid

USER nginx-user

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
