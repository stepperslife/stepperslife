# Stores.SteppersLife.com Restoration Guide

## Backup Date
November 18, 2025

## Contents
- `/code/` - Complete source code (Next.js + Prisma)
- `/database/` - PostgreSQL database dump
- `/minio/` - MinIO object storage data
- `/configs/` - Environment files, docker-compose, nginx config

## Infrastructure
- PostgreSQL: Port 5447 (stepperslife_store database)
- MinIO: Ports 9008/9108
- Redis: Port 6308

## Restoration Steps

### 1. Restore Code
```bash
cp -r code/* /root/websites/stores-stepperslife/
cd /root/websites/stores-stepperslife
npm install
```

### 2. Start Docker Services
```bash
docker-compose up -d postgres minio redis
```

### 3. Restore Database
```bash
docker exec -i stores-postgres psql -U stepperslife stepperslife_store < database/stores_database.sql
```

### 4. Restore MinIO Data
```bash
docker run --rm -v stores_minio_data:/data -v $(pwd)/minio:/backup alpine tar xzf /backup/minio_data.tar.gz -C /data
```

### 5. Run Prisma Migrations
```bash
npx prisma migrate deploy
```

### 6. Build and Start
```bash
npm run build
npm start
```

## Environment Variables
Key variables in .env:
- DATABASE_URL
- MINIO credentials
- Redis URL
- Square payment keys
