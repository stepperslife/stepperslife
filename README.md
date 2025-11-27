# Events SteppersLife v2

A fully containerized Docker environment for the events-stepperslife application with PostgreSQL, Redis, MinIO, and Nginx.

## Quick Start

```bash
# Clone repository
git clone https://github.com/iradwatkins/event.stepperslife.v2.git
cd event.stepperslife.v2

# Copy environment file
cp .env.example .env.local

# Start all containers
docker-compose up -d

# Initialize database
docker-compose exec postgres psql -U eventuser -d events_db < scripts/init-db.sql

# View logs
docker-compose logs -f events-app
```

## Access Points

- **Frontend**: http://localhost:3004
- **Database Admin**: http://localhost:8080 (Adminer)
- **MinIO Console**: http://localhost:9001

## Architecture

### Containers
- **PostgreSQL 16**: Event database (replaces Convex)
- **Redis 7**: Session and cache layer
- **MinIO**: S3-compatible object storage
- **Next.js 16**: Events application
- **Nginx**: Reverse proxy
- **Adminer**: Database administration (dev-only)

### Data
- PostgreSQL: ~180MB (from Convex snapshot)
- MinIO: ~500MB (images and uploads)
- Redis: In-memory cache

## Environment Setup

See `.env.example` for all required variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Authentication secret
- `NEXTAUTH_URL` - Application URL for auth callbacks
- Payment processor keys (Square, Stripe, PayPal)

## Development

```bash
# View real-time logs
docker-compose logs -f

# Access database
docker-compose exec postgres psql -U eventuser -d events_db

# Stop all containers
docker-compose down

# Remove volumes and start fresh
docker-compose down -v
docker-compose up -d
```

## Production Deployment

See `docs/DEPLOYMENT.md` for blue-green deployment strategy.

## Documentation

- [Local Setup Guide](docs/LOCAL_SETUP.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## License

Private repository - iradwatkins
