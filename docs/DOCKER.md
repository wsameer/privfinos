# Docker Setup Guide for PrivFinOS

This guide explains how to run PrivFinOS in Docker for production deployments.

## Architecture Overview

The Docker setup includes:
- **App Container**: Runs both the Hono.js API and serves the React frontend as static files
- **PostgreSQL Container**: Database for persistent storage (optional)
- **Multi-stage Build**: Optimized for production with minimal image size
- **Turbo Support**: Leverages Turborepo for efficient monorepo builds

## Prerequisites

- Docker Engine 20.10+ or Docker Desktop
- Docker Compose V2 (comes with Docker Desktop)
- At least 2GB of available memory

## Quick Start

### 1. Setup Environment Variables

Copy the production environment template:
```bash
cp .env.production.example .env.production
```

Edit `.env.production` and set your values:
```env
POSTGRES_PASSWORD=your_secure_password_here
# Add other variables as needed
```

### 2. Build and Start

Using npm scripts (recommended):
```bash
pnpm docker:up
```

Or using docker compose directly:
```bash
docker compose up -d
```

### 3. Access the Application

- **Web Application**: http://localhost:3001
- **API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

### 4. View Logs

```bash
pnpm docker:logs
# or
docker compose logs -f app
```

## Available Docker Scripts

These scripts are defined in the root `package.json`:

```bash
# Build the Docker image
pnpm docker:build

# Start containers in detached mode
pnpm docker:up

# Stop containers
pnpm docker:down

# View logs (follow mode)
pnpm docker:logs

# Restart containers
pnpm docker:restart

# Clean everything (containers, volumes, and dangling images)
pnpm docker:clean

# Rebuild from scratch (no cache)
pnpm docker:rebuild
```

## Development vs Production

### Local Development (Recommended)

For fast development with hot reload, run on your host machine:
```bash
# Terminal 1: Start API
pnpm dev:api

# Terminal 2: Start Web
pnpm dev:web
```

Benefits:
- Fast hot module replacement (HMR)
- No Docker overhead
- Easy debugging
- Quick dependency installation

### Production (Docker)

Use Docker for:
- Production deployments
- Staging environments
- Testing production builds
- Self-hosting setups

## Configuration

### Docker Compose Services

#### App Service
- **Image**: Built from root Dockerfile
- **Port**: 3001 (maps to host 3001)
- **Depends on**: PostgreSQL database
- **Health Check**: Monitors /api/health endpoint
- **Restart Policy**: unless-stopped

#### Database Service (PostgreSQL)
- **Image**: postgres:16-alpine
- **Port**: 5432 (exposed for debugging)
- **Volume**: postgres-data (persistent storage)
- **Health Check**: pg_isready command

### Environment Variables

Key environment variables in `.env.production`:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | production |
| `PORT` | Server port | 3001 |
| `LOG_LEVEL` | Logging level | info |
| `POSTGRES_USER` | Database user | postgres |
| `POSTGRES_PASSWORD` | Database password | (set this!) |
| `POSTGRES_DB` | Database name | privfinos |
| `CORS_ORIGIN` | Allowed CORS origins | http://localhost:3001 |

## Dockerfile Explained

The Dockerfile uses a multi-stage build for optimization:

### Stage 1: Base
- Sets up Node.js and pnpm
- Installs Turbo globally

### Stage 2: Pruner
- Uses `turbo prune` to extract only necessary workspace files
- Creates a minimal build context

### Stage 3: Installer
- Installs all dependencies
- Builds all apps using Turbo
- Leverages build cache for faster builds

### Stage 4: Runner
- Production runtime with minimal footprint
- Copies only built artifacts
- Installs only production dependencies
- Runs as non-root user for security

## Database Management

### Initialize Database

If you're using PostgreSQL, run migrations after starting:
```bash
# Access the app container
docker exec -it privfinos-app sh

# Run your migrations (adjust command based on your setup)
pnpm --filter=api db:migrate
```

### Backup Database

```bash
docker exec privfinos-db pg_dump -U postgres privfinos > backup.sql
```

### Restore Database

```bash
docker exec -i privfinos-db psql -U postgres privfinos < backup.sql
```

### Access Database Directly

```bash
docker exec -it privfinos-db psql -U postgres -d privfinos
```

## Optional Services

### pgAdmin (Database GUI)

Uncomment the pgAdmin service in `docker-compose.yml` to enable:
```yaml
pgadmin:
  image: dpage/pgadmin4:latest
  # ... rest of config
```

Then access at: http://localhost:5050

## Troubleshooting

### Container Won't Start

Check logs:
```bash
docker compose logs app
```

Verify environment variables:
```bash
docker compose config
```

### Build Failures

Clear build cache and rebuild:
```bash
pnpm docker:rebuild
```

### Database Connection Issues

1. Ensure database is healthy:
```bash
docker compose ps
```

2. Check if DATABASE_URL is set correctly in `.env.production`

3. Wait for database to be ready (check health check logs)

### Port Already in Use

Change the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "3002:3001"  # Change left side only
```

### Out of Disk Space

Clean up Docker resources:
```bash
pnpm docker:clean
docker system prune -a --volumes
```

## Production Deployment Tips

### 1. Security

- Always set strong passwords in `.env.production`
- Don't expose PostgreSQL port in production (remove the ports mapping)
- Use Docker secrets for sensitive data
- Keep images updated regularly

### 2. Networking

For production, consider:
- Setting up a reverse proxy (nginx, Traefik, Caddy)
- Enabling HTTPS with Let's Encrypt
- Restricting database access to app container only

### 3. Monitoring

Add monitoring tools:
- Application: Add healthcheck endpoints
- Database: Monitor with pg_stat_statements
- Containers: Use docker stats or monitoring tools

### 4. Backups

Set up automated backups:
```bash
# Add to crontab
0 2 * * * docker exec privfinos-db pg_dump -U postgres privfinos | gzip > /backups/privfinos-$(date +\%Y\%m\%d).sql.gz
```

### 5. Updates

To update the application:
```bash
# Pull latest code
git pull

# Rebuild and restart
pnpm docker:rebuild
```

## Resource Limits

To set resource limits, add to services in `docker-compose.yml`:

```yaml
app:
  deploy:
    resources:
      limits:
        cpus: '1.0'
        memory: 512M
      reservations:
        cpus: '0.5'
        memory: 256M
```

## Self-Hosting Checklist

- [ ] Set strong passwords in `.env.production`
- [ ] Configure DATABASE_URL correctly
- [ ] Set up reverse proxy for HTTPS
- [ ] Configure firewall rules
- [ ] Set up automated backups
- [ ] Configure log rotation
- [ ] Set up monitoring/alerting
- [ ] Test restore procedures
- [ ] Document recovery procedures

## Support

For issues or questions:
- Check the logs first: `pnpm docker:logs`
- Review this documentation
- Check Docker and Docker Compose versions
- Verify system resources (disk space, memory)

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
