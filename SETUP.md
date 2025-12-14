# Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Development Environment

**Option A: Local development (recommended)**

```bash
# Start database in Docker
pnpm docker:dev:up

# In another terminal, start all dev servers
pnpm dev
```

This will start:
- API on http://localhost:3001
- Web on http://localhost:5173
- PostgreSQL on localhost:5432

**Option B: Full Docker stack**

```bash
# Build and start everything
pnpm docker:prod:build
pnpm docker:prod:up
```

Access via Caddy on http://localhost

### 3. Verify Setup

Test the API:
```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "version": "0.0.1"
}
```

## Development Workflow

### Running Individual Services

```bash
# API only
pnpm dev:api

# Web only
pnpm dev:web
```

### Building

```bash
# Build everything
pnpm build

# Or individually
pnpm build:api
pnpm build:web
```

### Code Quality

```bash
# Type checking
pnpm check-types

# Linting
pnpm lint

# Formatting
pnpm format

# Check formatting without changing
pnpm format:check
```

## Project Structure

```
apps/
├── api/              Backend API (Hono.js)
│   ├── src/
│   │   ├── lib/      Logger, env validation, errors
│   │   ├── middleware/  Request logger, error handler
│   │   └── routes/   API routes (health, etc.)
│   └── .env         Environment variables
└── web/              Frontend (React + Vite)
    ├── src/
    └── .env         Environment variables

packages/
├── types/            Shared TypeScript types + Zod schemas
├── ui/               Shared React components
├── typescript-config/  Shared TS configs
└── eslint-config/    Shared ESLint configs
```

## Environment Variables

### Root `.env`
```env
POSTGRES_DB=privfinos
POSTGRES_USER=postgres
POSTGRES_PASSWORD=changeme
```

### API `.env` (apps/api/.env)
```env
NODE_ENV=development
PORT=3001
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:5173
# DATABASE_URL=postgresql://... (will be needed with Drizzle)
```

### Web `.env` (apps/web/.env)
```env
NODE_ENV=development
VITE_API_URL=http://localhost:3001
```

## Docker

### Development (DB only)
```bash
# Start
pnpm docker:dev:up

# Stop
pnpm docker:dev:down

# Logs
pnpm docker:dev:logs
```

### Production (Full stack)
```bash
# Build
pnpm docker:prod:build

# Start
pnpm docker:prod:up

# Stop
pnpm docker:prod:down

# Logs
pnpm docker:prod:logs
```

## Troubleshooting

### Port Already in Use

If you get port conflicts:
- API (3001): Change `PORT` in `apps/api/.env`
- Web (5173): Vite will auto-increment
- DB (5432): Change port mapping in docker-compose.dev.yml

### TypeScript Errors

Run type checking:
```bash
pnpm check-types
```

### Clean Install

```bash
pnpm clean
pnpm install
```

## Next Steps

1. Add Drizzle ORM + database migrations
2. Implement authentication
3. Add your financial domain models
4. Build API endpoints
5. Create frontend components

See [README.md](./README.md) for more details.
