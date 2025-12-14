# PrivFinOS - Private Financial Operating System

A self-hosted, lightweight, privacy-first financial OS built with modern technologies.

## Tech Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Frontend**: React 19 + Vite + TypeScript
- **Backend**: Hono.js + Node.js
- **Database**: PostgreSQL + Drizzle ORM (coming soon)
- **Validation**: Zod
- **Logging**: Pino
- **Reverse Proxy**: Caddy
- **Container**: Docker + Docker Compose

## Project Structure

```
privfinos/
├── apps/
│   ├── api/              # Hono.js backend API
│   │   ├── src/
│   │   │   ├── lib/      # Utilities (logger, env, errors)
│   │   │   ├── middleware/  # Express middleware
│   │   │   ├── routes/   # API routes
│   │   │   └── index.ts  # Entry point
│   │   ├── Dockerfile
│   │   └── package.json
│   └── web/              # React frontend
│       ├── src/
│       ├── Dockerfile
│       ├── nginx.conf
│       └── package.json
├── packages/
│   ├── types/            # Shared TypeScript types + Zod schemas
│   ├── ui/               # Shared React components
│   ├── typescript-config/  # Shared TS configs
│   └── eslint-config/    # Shared ESLint configs
├── docker-compose.yml          # Production setup
├── docker-compose.dev.yml      # Development (DB only)
├── Caddyfile                   # Production Caddy config
├── Caddyfile.dev              # Dev Caddy config
└── turbo.json
```

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 9.0.0
- Docker & Docker Compose (optional, for containerized setup)

### Install Dependencies

```bash
pnpm install
```

### Development

#### Option 1: Local Development (Recommended for development)

1. Start the database:
```bash
pnpm docker:dev:up
```

2. Start the dev servers (runs both API and Web with hot reload):
```bash
pnpm dev
```

Or run them separately:
```bash
# Terminal 1 - API
pnpm dev:api

# Terminal 2 - Web
pnpm dev:web
```

3. Access the app:
   - Frontend: http://localhost:5173
   - API: http://localhost:3001
   - API Health: http://localhost:3001/health

#### Option 2: Full Docker Stack (Production-like)

```bash
# Build and start all services (API, Web, DB, Caddy)
pnpm docker:prod:build
pnpm docker:prod:up

# View logs
pnpm docker:prod:logs

# Stop services
pnpm docker:prod:down
```

Access via Caddy:
- Frontend: http://localhost
- API: http://localhost/api
- Health: http://localhost/health

### Environment Variables

Copy the example files and customize:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Key variables:
- `POSTGRES_PASSWORD`: Database password
- `PORT`: API port (default: 3001)
- `VITE_API_URL`: API URL for frontend
- `CORS_ORIGIN`: Allowed CORS origins

### Building for Production

```bash
# Build all apps
pnpm build

# Or build individually
pnpm build:api
pnpm build:web
```

### Available Scripts

**Development:**
- `pnpm dev` - Run all apps in dev mode
- `pnpm dev:api` - Run only API
- `pnpm dev:web` - Run only Web

**Build:**
- `pnpm build` - Build all apps
- `pnpm build:api` - Build API
- `pnpm build:web` - Build Web

**Docker (Development - DB only):**
- `pnpm docker:dev:up` - Start database
- `pnpm docker:dev:down` - Stop database
- `pnpm docker:dev:logs` - View database logs

**Docker (Production - Full Stack):**
- `pnpm docker:prod:build` - Build all containers
- `pnpm docker:prod:up` - Start all services
- `pnpm docker:prod:down` - Stop all services
- `pnpm docker:prod:logs` - View all logs

**Code Quality:**
- `pnpm lint` - Run linters
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check formatting
- `pnpm check-types` - Run TypeScript type checking

**Database (coming soon with Drizzle):**
- `pnpm db:studio` - Open Drizzle Studio
- `pnpm db:push` - Push schema changes
- `pnpm db:migrate` - Run migrations

## Architecture Decisions

### Why This Stack?

- **Hono.js**: Ultra-lightweight, edge-ready, great TypeScript support
- **Zod**: Runtime type validation, pairs perfectly with TypeScript
- **Pino**: Fast, structured JSON logging
- **Caddy**: Automatic HTTPS, simple config, great for self-hosting
- **pnpm**: Fast, efficient, great monorepo support
- **Turborepo**: Optimal build caching and task orchestration

### Key Features

✅ **Type-Safe**: End-to-end type safety with shared types package
✅ **Validated**: Runtime validation with Zod schemas
✅ **Observable**: Structured logging with Pino
✅ **Secure**: CORS, security headers, error handling
✅ **Production-Ready**: Docker, health checks, graceful shutdown
✅ **Developer-Friendly**: Hot reload, clear errors, fast builds
✅ **Self-Hostable**: Easy deployment with Docker Compose + Caddy

## Next Steps

### Immediate Tasks
1. ✅ Set up repository structure
2. ✅ Configure shared types and configs
3. ✅ Add environment variable validation
4. ✅ Set up logging and error handling
5. ✅ Create Docker setup with Caddy

### Coming Soon
- [ ] Add Drizzle ORM + PostgreSQL integration
- [ ] Implement authentication (JWT)
- [ ] Add your financial domain models
- [ ] Create API endpoints for your use cases
- [ ] Build frontend components
- [ ] Add database migrations
- [ ] Set up CI/CD pipeline

## Contributing

This is a personal project, but suggestions are welcome via issues.

## License

See [LICENSE](./LICENSE) file.
