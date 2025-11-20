# SteppersLife.com Restoration Guide

## Backup Date
November 18, 2025

## Contents
- `/code/` - Complete source code (Next.js application with Prisma)
- `/configs/` - Environment files, ecosystem config, nginx config
- `/database/` - Database notes (no active database found)
- `/redis/` - Redis notes (no dedicated container found)
- `/uploads/` - MinIO/uploads notes (no dedicated container found)
- `/docker/` - Docker compose infrastructure file

## Prerequisites
- Node.js 22.x (via NVM)
- PostgreSQL 16
- Redis 7
- MinIO
- Nginx with SSL

## Restoration Steps

### 1. Restore Code
```bash
# Copy code to target location
cp -r code/* /root/websites/stepperslife/

# Install dependencies
cd /root/websites/stepperslife
npm install
```

### 2. Setup Database
```bash
# Create PostgreSQL container
docker run -d \
  --name stepperslife-postgres \
  -e POSTGRES_USER=stepperslife \
  -e POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD \
  -e POSTGRES_DB=stepperslife \
  -p 5439:5432 \
  -v stepperslife_postgres_data:/var/lib/postgresql/data \
  postgres:16-alpine

# Run migrations
npx prisma migrate deploy
```

### 3. Setup Redis
```bash
docker run -d \
  --name stepperslife-redis \
  -p 6309:6379 \
  redis:7-alpine
```

### 4. Setup MinIO
```bash
docker run -d \
  --name stepperslife-minio \
  -p 9009:9000 \
  -p 9109:9001 \
  -e MINIO_ROOT_USER=stepperslife_minio \
  -e MINIO_ROOT_PASSWORD=YOUR_SECURE_PASSWORD \
  -v stepperslife_minio_data:/data \
  minio/minio:latest server /data --console-address ":9001"
```

### 5. Update Environment
Edit `/root/websites/stepperslife/.env`:
- Update DATABASE_URL with new port (5439)
- Update REDIS_URL with new port (6309)
- Update MINIO_PORT with new port (9009)
- Update all credentials

### 6. Restore Nginx Config
```bash
cp configs/nginx/stepperslife /etc/nginx/sites-available/
ln -sf /etc/nginx/sites-available/stepperslife /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### 7. Build and Start
```bash
cd /root/websites/stepperslife
npm run build
npm start
# Or use PM2:
pm2 start ecosystem.config.js
```

## Important Notes
- **Port 3001** is reserved for stepperslife.com
- **Port 3000** is FORBIDDEN for all websites
- SSL certificates should be renewed via certbot

## Environment Variables
Key variables to configure:
- DATABASE_URL
- REDIS_URL
- NEXTAUTH_SECRET
- GOOGLE_CLIENT_ID/SECRET
- SQUARE_* payment keys
- RESEND_API_KEY
- MINIO_* storage keys

## Contact
Backup created by Claude Code automation.
