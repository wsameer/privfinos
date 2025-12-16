# PrivFinOS - Private Financial Operating System

A self-hosted, lightweight, privacy-first financial OS built with modern technologies.

## Tech Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Frontend**: React 19 + Vite + TypeScript + PWA
- **Backend**: Hono.js + Node.js
- **Database**: PostgreSQL 16 + Drizzle ORM
- **Validation**: Zod
- **Logging**: Pino
- **Container**: Docker + Docker Compose

## Project Structure

```
privfinos/
├── apps/
│   ├── api/                      # Hono.js backend API
│   │   ├── src/
│   │   │   ├── lib/              # Utilities (logger, env, db)
│   │   │   ├── middleware/       # Request middleware
│   │   │   ├── routes/           # API routes
│   │   │   └── index.ts          # Entry point + static file serving
│   │   └── package.json
│   └── web/                      # React + Vite PWA frontend
│       ├── src/
│       ├── vite.config.ts        # PWA configuration
│       └── package.json
├── packages/
│   ├── db/                       # Drizzle ORM + schemas
│   ├── types/                    # Shared TypeScript types + Zod schemas
│   ├── ui/                       # Shared React components
│   ├── typescript-config/        # Shared TS configs
│   └── eslint-config/            # Shared ESLint configs
├── Dockerfile                    # Multi-stage production build
├── docker-compose.yml            # Container orchestration
├── .env.example                  # Environment template
└── turbo.json                    # Turborepo configuration
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

1. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env if you need to change any values (defaults should work)
```

2. **Start PostgreSQL database**:
```bash
docker compose up -d db
```

3. **Set up database schema and seed data**:
```bash
# Push schema to database
pnpm db:push

# Seed with sample data (optional but recommended)
pnpm db:seed
```

4. **Start the dev servers** (runs both API and Web with hot reload):
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

5. **Access the app**:
   - Frontend: http://localhost:5173
   - API: http://localhost:3001
   - API Health: http://localhost:3001/api/health
   - Drizzle Studio: `pnpm db:studio` → http://localhost:4983

#### Option 2: Full Docker Stack (Production)

1. **Configure environment**:
```bash
cp .env.production.example .env.production
# Edit .env.production and set a secure database password
```

2. **Start all services** (app + database):
```bash
pnpm docker:up
```

3. **Set up database** (first time only):
```bash
# Access the app container
docker exec -it privfinos-app sh

# Push schema and seed data
pnpm db:push
pnpm db:seed
exit
```

4. **Access the app**:
   - App: http://localhost:3001
   - API: http://localhost:3001/api
   - Health: http://localhost:3001/api/health

5. **View logs**:
```bash
pnpm docker:logs
```

6. **Stop services**:
```bash
pnpm docker:down
```

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

**Database:**
- `pnpm db:generate` - Generate migrations from schema
- `pnpm db:push` - Push schema to database
- `pnpm db:studio` - Open Drizzle Studio (visual DB browser)
- `pnpm db:seed` - Seed database with sample data

**Docker (Production):**
- `pnpm docker:build` - Build Docker image
- `pnpm docker:up` - Start all services (app + db)
- `pnpm docker:down` - Stop all services
- `pnpm docker:logs` - View logs
- `pnpm docker:restart` - Restart services
- `pnpm docker:clean` - Remove containers and volumes
- `pnpm docker:rebuild` - Rebuild from scratch

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
- **pnpm**: Fast, efficient, great monorepo support
- **Turborepo**: Optimal build caching and task orchestration
- **PWA**: Installable on iOS/Android for native-like experience

### Key Features

✅ **Type-Safe**: End-to-end type safety with shared types package
✅ **Validated**: Runtime validation with Zod schemas
✅ **Observable**: Structured logging with Pino
✅ **Database**: PostgreSQL + Drizzle ORM with migrations
✅ **Production-Ready**: Docker, health checks, graceful shutdown
✅ **Developer-Friendly**: Hot reload, clear errors, fast builds
✅ **Self-Hostable**: Easy deployment with Docker Compose
✅ **PWA-Ready**: Install on iOS/Android devices

## What's Included

### ✅ Already Set Up
1. Monorepo with Turborepo + pnpm workspaces
2. Type-safe API with Hono.js
3. React + Vite PWA frontend
4. PostgreSQL database with Drizzle ORM
5. Shared types and validation with Zod
6. Database schema for accounts, transactions, categories
7. Docker production deployment
8. Structured logging and error handling

### 🚧 Coming Soon
- [ ] API endpoints for CRUD operations
- [ ] Frontend UI components and pages
- [ ] Transaction management features
- [ ] Budget tracking
- [ ] Reports and analytics
- [ ] Data export/import
- [ ] Set up CI/CD pipeline

## Contributing

This is a personal project, but suggestions are welcome via issues.

## License

See [LICENSE](./LICENSE) file.
