# Local Development Setup Guide

Complete guide to setting up and running the events-stepperslife application locally using Docker.

## Prerequisites

- **Docker Desktop** (version 4.x or higher)
- **Docker Compose** (included with Docker Desktop)
- **Git**
- **Mac/Linux/Windows with WSL2**

## Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/iradwatkins/event.stepperslife.v2.git
cd event.stepperslife.v2
```

### 2. Setup Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit with your credentials
nano .env.local  # or open in your editor
```

**Key variables to update:**
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -hex 32`
- `SQUARE_ACCESS_TOKEN` - Your Square test token
- `STRIPE_SECRET_KEY` - Your Stripe test key
- `PAYPAL_CLIENT_ID` / `PAYPAL_SECRET_KEY` - PayPal test credentials
- `RESEND_API_KEY` - Email service key (optional for local)
- `GEMINI_API_KEY` - Google AI key (optional for local)

### 3. Start Docker Containers

```bash
# Build and start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs in real-time
docker-compose logs -f events-app
```

### 4. Initialize Database

```bash
# Wait for PostgreSQL to be ready (check with ps command above)
# Then run the initialization script

docker-compose exec postgres psql -U eventuser -d events_db < scripts/init-db.sql
```

### 5. Install Application Dependencies

```bash
# Install Next.js dependencies
docker-compose exec events-app npm install

# Build Next.js application
docker-compose exec events-app npm run build
```

### 6. Access Applications

Once everything is running, access:

| Service | URL | Credentials |
|---------|-----|-------------|
| **Events App** | http://localhost:3004 | - |
| **Database Admin** | http://localhost:8080 | postgres / eventpass123 |
| **MinIO Console** | http://localhost:9001 | minioadmin / minioadmin123 |
| **Nginx Status** | http://localhost/health | - |

## Common Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f events-app
docker-compose logs -f postgres
docker-compose logs -f redis

# Last N lines
docker-compose logs --tail=100 events-app
```

### Database Operations

```bash
# Connect to PostgreSQL CLI
docker-compose exec postgres psql -U eventuser -d events_db

# Backup database
docker-compose exec postgres pg_dump -U eventuser events_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U eventuser events_db < backup.sql

# Drop and recreate database
docker-compose exec postgres dropdb -U eventuser events_db
docker-compose exec postgres createdb -U eventuser events_db
docker-compose exec postgres psql -U eventuser -d events_db < scripts/init-db.sql
```

### Redis Operations

```bash
# Connect to Redis CLI
docker-compose exec redis redis-cli -a redispass123

# Clear all Redis data
docker-compose exec redis redis-cli -a redispass123 FLUSHALL

# Monitor Redis commands
docker-compose exec redis redis-cli -a redispass123 MONITOR
```

### MinIO Operations

```bash
# Create a bucket
docker-compose exec minio mc mb minio/events

# List buckets
docker-compose exec minio mc ls minio/

# Upload a file
docker-compose exec minio mc cp /path/to/file minio/events/
```

### Application Management

```bash
# Rebuild application
docker-compose exec events-app npm run build

# Restart application
docker-compose restart events-app

# View application health
curl http://localhost:3004/api/health

# Run npm scripts
docker-compose exec events-app npm run dev
docker-compose exec events-app npm test
```

### Container Management

```bash
# Stop all services
docker-compose down

# Stop services and remove volumes
docker-compose down -v

# Rebuild specific service
docker-compose build --no-cache events-app

# Rebuild and restart
docker-compose up -d --build events-app
```

## Troubleshooting

### Port Already in Use

```bash
# Find and kill process on port 3004
lsof -i :3004
kill -9 <PID>

# Or use docker-compose override
docker-compose override
# Add:
# services:
#   events-app:
#     ports:
#       - "3005:3000"
```

### PostgreSQL Won't Start

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Remove volume and restart (WARNING: data loss)
docker-compose down -v
docker-compose up -d postgres
```

### Application Won't Build

```bash
# Clear Next.js cache
docker-compose exec events-app rm -rf .next

# Reinstall dependencies
docker-compose exec events-app rm -rf node_modules package-lock.json
docker-compose exec events-app npm install

# Rebuild
docker-compose exec events-app npm run build
```

### Redis Connection Issues

```bash
# Check Redis connectivity
docker-compose exec events-app redis-cli -h redis -a redispass123 ping

# Clear Redis and restart
docker-compose exec redis redis-cli -a redispass123 FLUSHALL
docker-compose restart events-app
```

### MinIO Bucket Missing

```bash
# Create event bucket
docker-compose exec minio mc mb minio/events

# Set bucket policy (public read)
docker-compose exec minio mc policy set public minio/events
```

## Monitoring & Health Checks

### Check Service Health

```bash
# Check all services
docker-compose ps

# Check specific service health
docker-compose exec postgres pg_isready -U eventuser
docker-compose exec redis redis-cli -a redispass123 ping
curl -I http://localhost:3004/api/health
```

### Monitor Resource Usage

```bash
# Docker stats
docker stats

# Specific container
docker stats events-stepperslife-app
```

### View Application Metrics

```bash
# Application metrics endpoint
curl http://localhost:3004/api/metrics

# Database connections
docker-compose exec postgres psql -U eventuser -d events_db \
  -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"
```

## Development Workflow

### Making Code Changes

1. Edit files in `src/events-stepperslife/`
2. Changes are automatically synced via volume mount
3. Next.js hot-reload will trigger
4. Check logs: `docker-compose logs -f events-app`

### Database Migrations

```bash
# Create new migration
docker-compose exec events-app npm run prisma migrate dev --name add_new_column

# Apply pending migrations
docker-compose exec events-app npm run prisma migrate deploy

# Reset database to initial state
docker-compose exec events-app npm run prisma migrate reset
```

### Testing

```bash
# Run tests
docker-compose exec events-app npm test

# Run tests in watch mode
docker-compose exec events-app npm test -- --watch

# Coverage report
docker-compose exec events-app npm test -- --coverage
```

## Performance Tuning

### Increase Resource Limits

Edit `docker-compose.yml`:

```yaml
events-app:
  # ...
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
      reservations:
        cpus: '1'
        memory: 1G
```

### Optimize Database

```bash
# Analyze query performance
docker-compose exec postgres psql -U eventuser -d events_db \
  -c "ANALYZE;"

# Vacuum database
docker-compose exec postgres psql -U eventuser -d events_db \
  -c "VACUUM ANALYZE;"
```

## Cleanup

### Remove All Local Data

```bash
# Stop and remove all containers
docker-compose down -v

# Remove Docker images
docker rmi events-stepperslife-app
```

### Full Reset

```bash
# Remove everything including volumes
docker-compose down -v

# Rebuild from scratch
docker-compose up -d --build

# Reinitialize database
docker-compose exec postgres psql -U eventuser -d events_db < scripts/init-db.sql
```

## Getting Help

Check logs for errors:
```bash
docker-compose logs --tail=200 <service-name>
```

Run health checks:
```bash
bash scripts/health-check.sh
```

## Next Steps

- Review [Architecture Guide](./ARCHITECTURE.md)
- Check [Deployment Guide](./DEPLOYMENT.md)
- Read [API Documentation](./API.md)
