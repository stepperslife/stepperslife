# SteppersLife Store Integration - Deployment Guide

**Last Updated:** November 20, 2025
**Version:** 1.0.0
**Status:** Production Ready

---

## Overview

This guide covers the complete integration and deployment of the SteppersLife Store system alongside the existing Events system using a micro-frontend architecture with Docker containerization.

### Architecture Summary

```
stepperslife.com
├── /events/*  → Events Application (Port 3001-3002) [Convex DB]
└── /store/*   → Store Application  (Port 3005-3006) [PostgreSQL DB]

Infrastructure:
- PostgreSQL (Port 5432) - Store database
- Redis (Port 6379) - Store cache
- MinIO (Ports 9000-9001) - Store object storage
- Nginx (Ports 80, 443) - Reverse proxy with blue-green routing
```

---

## Prerequisites

### VPS Requirements
- **OS:** Linux (Ubuntu 20.04+ or Debian 11+)
- **CPU:** 4+ cores
- **RAM:** 8GB minimum
- **Disk:** 100GB+ SSD
- **Docker:** v24.0+
- **Docker Compose:** v2.20+

### Required Accounts & Services
- [x] Convex account (for Events system)
- [x] Stripe account (payment processing)
- [x] Square account (payment processing)
- [x] PayPal account (Events only)
- [x] Google Cloud (OAuth & Maps API)
- [x] Resend account (transactional emails)
- [x] Domain with DNS access (stepperslife.com)

---

## Phase 1: Pre-Deployment Setup

### 1.1 Directory Structure

SSH into your VPS and create the required directory structure:

```bash
# Data directories
mkdir -p /root/stepperslife/data/{stepfiles,postgres,redis,minio,store-uploads,ssl}

# Log directories
mkdir -p /root/stepperslife/logs/{app,app-standby,app-stores,app-stores-standby,nginx}

# Set permissions
chmod 700 /root/stepperslife/data/postgres
chmod 700 /root/stepperslife/data/redis
chmod 755 /root/stepperslife/data/minio
chmod 755 /root/stepperslife/data/store-uploads
```

### 1.2 Environment Variables

Copy the template and fill in production values:

```bash
cp .env.production.template .env.production
nano .env.production
```

**Critical Values to Update:**

```bash
# Generate secure secrets
openssl rand -base64 32  # Run multiple times for each secret

# Required variables
NEXTAUTH_SECRET=<generated-32-char-secret>
JWT_SECRET=<generated-32-char-secret>
AUTH_SECRET=<generated-32-char-secret>
POSTGRES_PASSWORD=<generated-32-char-secret>
REDIS_PASSWORD=<generated-32-char-secret>
MINIO_ROOT_PASSWORD=<generated-32-char-secret>

# Payment processors
STRIPE_SECRET_KEY=sk_live_<your-stripe-key>
STRIPE_WEBHOOK_SECRET=whsec_<events-webhook-secret>
STRIPE_WEBHOOK_SECRET_STORES=whsec_<stores-webhook-secret>
SQUARE_ACCESS_TOKEN=<production-access-token>
SQUARE_APPLICATION_ID=<production-app-id>
SQUARE_LOCATION_ID=<production-location-id>

# OAuth
AUTH_GOOGLE_CLIENT_ID=<your-google-client-id>
AUTH_GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Email
RESEND_API_KEY=re_<your-resend-key>
```

### 1.3 Configure Webhooks

#### Stripe Webhooks

**Events System:**
- URL: `https://stepperslife.com/events/api/webhooks/stripe`
- Events: `payment_intent.succeeded`, `charge.refunded`

**Store System:**
- URL: `https://stepperslife.com/store/api/webhooks/stripe`
- Events: `payment_intent.succeeded`, `charge.refunded`, `account.updated`

#### Square Webhooks

**Events System:**
- URL: `https://stepperslife.com/events/api/webhooks/square`
- Events: `payment.created`, `payment.updated`, `refund.created`

**Store System:**
- URL: `https://stepperslife.com/store/api/webhooks/square`
- Events: `payment.created`, `payment.updated`, `refund.created`

#### PayPal Webhooks (Events Only)

- URL: `https://stepperslife.com/events/api/webhooks/paypal`
- Events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.REFUNDED`

---

## Phase 2: Infrastructure Deployment

### 2.1 Deploy Database Services

Deploy PostgreSQL, Redis, and MinIO first:

```bash
cd /root/stepperslife-v2-docker

# Pull latest images
docker-compose -f docker-compose.blue-green.yml pull postgres redis minio

# Start infrastructure services
docker-compose -f docker-compose.blue-green.yml up -d postgres redis minio

# Verify health
docker-compose -f docker-compose.blue-green.yml ps
```

Expected output:
```
NAME                   STATUS              PORTS
stepperslife-postgres  Up (healthy)        5432
stepperslife-redis     Up (healthy)        6379
stepperslife-minio     Up (healthy)        9000-9001
```

### 2.2 Configure MinIO

Access MinIO console at `http://<your-vps-ip>:9001`:

1. Login with `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`
2. Create bucket: `stepperslife-stores`
3. Set bucket policy to "public" for product images
4. (Optional) Configure lifecycle rules for storage optimization

### 2.3 Initialize Store Database

Run Prisma migrations to set up the store database schema:

```bash
# Run migrations
docker-compose -f docker-compose.blue-green.yml run --rm stepperslife-stores npx prisma migrate deploy

# (Optional) Seed initial data
docker-compose -f docker-compose.blue-green.yml run --rm stepperslife-stores npx prisma db seed
```

---

## Phase 3: Application Deployment

### 3.1 Build Application Images

```bash
# Build Events application
docker-compose -f docker-compose.blue-green.yml build stepperslife

# Build Store application
docker-compose -f docker-compose.blue-green.yml build stepperslife-stores
```

### 3.2 Deploy Applications (Blue Environment)

```bash
# Deploy Events (Blue)
docker-compose -f docker-compose.blue-green.yml up -d stepperslife

# Deploy Store (Blue)
docker-compose -f docker-compose.blue-green.yml up -d stepperslife-stores

# Verify health checks
docker-compose -f docker-compose.blue-green.yml ps
```

Expected status:
```
stepperslife          Up (healthy)    3001
stepperslife-stores   Up (healthy)    3005
```

### 3.3 Deploy Nginx & SSL

```bash
# Start nginx
docker-compose -f docker-compose.blue-green.yml up -d nginx

# Obtain SSL certificates (first time only)
docker-compose -f docker-compose.blue-green.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d stepperslife.com \
  -d www.stepperslife.com \
  --email your@email.com \
  --agree-tos \
  --no-eff-email

# Start certbot for auto-renewal
docker-compose -f docker-compose.blue-green.yml up -d certbot

# Reload nginx to use SSL
docker exec stepperslife-nginx nginx -s reload
```

---

## Phase 4: Verification & Testing

### 4.1 Health Check Verification

```bash
# Events health check
curl https://stepperslife.com/events/api/health

# Store health check
curl https://stepperslife.com/store/api/health
```

Expected response (both):
```json
{
  "status": "healthy",
  "timestamp": "2025-11-20T...",
  "checks": {
    "database": "healthy",
    "redis": "healthy",
    "memory": "healthy"
  }
}
```

### 4.2 Functional Testing

**Events System:**
1. Visit `https://stepperslife.com/events`
2. Create test event
3. Purchase test ticket
4. Verify payment webhook

**Store System:**
1. Visit `https://stepperslife.com/store`
2. Register as vendor
3. Create test product
4. Process test order
5. Verify payment webhook

### 4.3 Admin Access Verification

Login with admin accounts:
- `iradwatkins@gmail.com`
- `bobbygwatkins@gmail.com`

Verify admin access to:
- Events: `/events/admin/dashboard`
- Store: `/store/admin/stores`

---

## Phase 5: Blue-Green Deployment Workflow

### 5.1 Deploy to Green Environment

```bash
# Build and deploy updated images to green
docker-compose -f docker-compose.blue-green.yml build stepperslife-standby stepperslife-stores-standby
docker-compose -f docker-compose.blue-green.yml up -d stepperslife-standby stepperslife-stores-standby

# Wait for health checks to pass
docker-compose -f docker-compose.blue-green.yml ps
```

### 5.2 Test Green Environment

```bash
# Test Events on green (port 3002)
curl http://localhost:3002/events/api/health

# Test Store on green (port 3006)
curl http://localhost:3006/store/api/health
```

### 5.3 Switch Traffic to Green

```bash
# Switch nginx upstream to green
cp nginx/conf.d/upstream-green.conf nginx/conf.d/upstream.conf

# Reload nginx (zero downtime)
docker exec stepperslife-nginx nginx -s reload

# Verify traffic is on green
curl https://stepperslife.com/events/api/health
curl https://stepperslife.com/store/api/health
```

### 5.4 Rollback to Blue (if needed)

```bash
# Switch back to blue
cp nginx/conf.d/upstream-blue.conf nginx/conf.d/upstream.conf

# Reload nginx
docker exec stepperslife-nginx nginx -s reload
```

---

## Monitoring & Maintenance

### Log Monitoring

```bash
# Events logs
tail -f /root/stepperslife/logs/app/events.log

# Store logs
tail -f /root/stepperslife/logs/app-stores/store.log

# Nginx access logs
tail -f /root/stepperslife/logs/nginx/access.log

# Database logs
docker logs -f stepperslife-postgres
```

### Database Maintenance

```bash
# PostgreSQL backup
docker exec stepperslife-postgres pg_dump -U postgres stepperslife_stores > backup.sql

# PostgreSQL restore
cat backup.sql | docker exec -i stepperslife-postgres psql -U postgres stepperslife_stores

# Redis backup
docker exec stepperslife-redis redis-cli --rdb /data/dump.rdb
```

### Resource Monitoring

```bash
# Container resource usage
docker stats stepperslife stepperslife-stores postgres redis minio

# Disk usage
df -h /root/stepperslife/

# Memory usage
free -h
```

---

## Troubleshooting

### Common Issues

#### Store Database Connection Failed

**Symptoms:** `DATABASE_URL` connection errors

**Solution:**
```bash
# Verify PostgreSQL is running
docker-compose -f docker-compose.blue-green.yml ps postgres

# Check logs
docker logs stepperslife-postgres

# Verify connection string in .env.production
echo $DATABASE_URL
```

#### Redis Connection Failed

**Symptoms:** Session errors, cache failures

**Solution:**
```bash
# Verify Redis is running
docker-compose -f docker-compose.blue-green.yml ps redis

# Test connection
docker exec stepperslife-redis redis-cli ping

# Check password
docker exec stepperslife-redis redis-cli -a "$REDIS_PASSWORD" ping
```

#### MinIO Upload Failures

**Symptoms:** Product image uploads fail

**Solution:**
```bash
# Verify MinIO is running
docker-compose -f docker-compose.blue-green.yml ps minio

# Check bucket exists
docker exec stepperslife-minio mc ls minio/stepperslife-stores

# Verify credentials
echo $MINIO_ROOT_USER
echo $MINIO_ROOT_PASSWORD
```

#### nginx 502 Bad Gateway

**Symptoms:** "502 Bad Gateway" on store routes

**Solution:**
```bash
# Check store container status
docker-compose -f docker-compose.blue-green.yml ps stepperslife-stores

# Verify upstream configuration
cat nginx/conf.d/upstream.conf

# Test store health internally
docker exec stepperslife-nginx wget -q -O- http://stepperslife-stores:3000/store/api/health
```

---

## Security Checklist

- [ ] All environment variables filled with production values
- [ ] No `REPLACE_WITH_*` placeholders remaining
- [ ] SSL certificates obtained and auto-renewal configured
- [ ] Firewall configured (only ports 80, 443 exposed)
- [ ] Database passwords are 32+ characters
- [ ] All secrets generated with `openssl rand -base64 32`
- [ ] `.env.production` has `chmod 600` permissions
- [ ] Webhook signature verification enabled
- [ ] Admin emails whitelisted in both systems
- [ ] Google OAuth redirect URIs configured
- [ ] Payment processors using PRODUCTION credentials

---

## Performance Optimization

### Nginx Caching

Static assets are cached by nginx for 30 days. Verify caching:

```bash
curl -I https://stepperslife.com/events/_next/static/...
# Should return: Cache-Control: public, max-age=31536000, immutable
```

### Database Connection Pooling

Prisma uses connection pooling by default. Monitor pool usage:

```bash
docker exec stepperslife-stores npx prisma db pull --print
```

### Redis Memory Management

Configure Redis maxmemory policy:

```bash
docker exec stepperslife-redis redis-cli CONFIG SET maxmemory 512mb
docker exec stepperslife-redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

---

## Contact & Support

**Project Lead:** Ira Watkins
**Email:** iradwatkins@gmail.com

**Documentation Location:**
- This file: `/root/stepperslife-v2-docker/STORE-INTEGRATION-DEPLOYMENT-GUIDE.md`
- Environment template: `.env.production.template`
- Docker Compose: `docker-compose.blue-green.yml`

---

## Change Log

### v1.0.0 (2025-11-20)
- Initial store integration completed
- Blue-green deployment for both systems
- PostgreSQL, Redis, MinIO infrastructure added
- Nginx routing configured for `/store` path
- Unified admin access implemented
- Health checks configured for all services

---

**End of Deployment Guide**
