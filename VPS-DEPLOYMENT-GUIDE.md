# SteppersLife VPS Deployment Guide
## Events + Store Modules - Direct Git-Based Deployment

Complete guide for deploying both Events and Store modules to your VPS using git workflow.

---

## Quick Start

```bash
# 1. Configure and push code
./deploy-to-vps.sh
```

That's it! The script handles everything: git commit → push → VPS pull → Docker rebuild → deploy.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [First-Time Setup](#first-time-setup)
4. [Daily Deployment](#daily-deployment)
5. [VPS Manual Setup](#vps-manual-setup)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance](#maintenance)

---

## Overview

### What Gets Deployed

✅ **Events Module** (`src/events-stepperslife/`)
- Next.js event ticketing platform
- Uses Convex for database (cloud)
- Runs on port 3001 (blue) / 3002 (green)
- Accessible at: `https://stepperslife.com/events`

✅ **Store Module** (`src/stores-stepperslife/`)
- Next.js e-commerce platform
- Uses PostgreSQL, Redis, MinIO
- Runs on port 3005 (blue) / 3006 (green)
- Accessible at: `https://stepperslife.com/store`

❌ **Unified Platform** - Not deployed (still in development)

### Deployment Method

**Git-Based Workflow:**
1. Commit changes locally
2. Push to GitHub
3. VPS pulls latest code
4. Docker rebuilds images on VPS
5. Containers restart with new code
6. ~30-60 second downtime during update

### Infrastructure

```
GitHub Repository
      ↓
  VPS pulls code
      ↓
 Docker builds images
      ↓
  ┌─────────────────┐
  │     Nginx       │ (Reverse Proxy)
  │  Port 80/443    │
  └────────┬────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
 events-blue   store-blue
 (Port 3001)   (Port 3005)
    │             │
    │         ┌───┴────┐
    │         │        │
    │      postgres  redis  minio
```

---

## Prerequisites

### Local Machine

- [x] Git installed and configured
- [x] SSH access to VPS (key-based recommended)
- [x] VPS IP: `72.60.28.175`
- [x] VPS User: `root`

### VPS Requirements

- [x] Ubuntu 20.04+ or Debian 11+
- [x] Docker & Docker Compose installed
- [x] Nginx installed and configured
- [x] Git installed
- [x] Minimum 4GB RAM, 2 CPU cores
- [x] 40GB available disk space
- [x] Ports 22, 80, 443, 5432, 6379, 9000 open

---

## First-Time Setup

### Step 1: Verify SSH Access

```bash
# Test SSH connection
ssh root@72.60.28.175 "echo 'Connection successful!'"
```

If this fails, set up SSH keys:

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy key to VPS
ssh-copy-id root@72.60.28.175
```

### Step 2: Create VPS Directory Structure

SSH into your VPS and create required directories:

```bash
ssh root@72.60.28.175

# Create main directory
mkdir -p /root/stepperslife

# Create data directories
mkdir -p /root/stepperslife/data/{stepfiles,postgres,redis,minio,store-uploads,ssl}

# Create log directories
mkdir -p /root/stepperslife/logs/{app,app-standby,app-stores,app-stores-standby,nginx}

# Set permissions
chmod -R 755 /root/stepperslife

# Verify
ls -la /root/stepperslife/
```

### Step 3: Create .env File on VPS

```bash
# Still on VPS
cd /root/stepperslife

# Create .env file
nano .env
```

Copy the contents from `.env.vps.template` and fill in all required values:

**Critical Variables to Set:**
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `JWT_SECRET` - Generate with: `openssl rand -base64 32`
- `AUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `POSTGRES_PASSWORD` - Generate with: `openssl rand -base64 32`
- `REDIS_PASSWORD` - Generate with: `openssl rand -base64 32`
- `MINIO_ROOT_PASSWORD` - Generate with: `openssl rand -base64 32`
- `STRIPE_SECRET_KEY` - From Stripe dashboard
- `SQUARE_ACCESS_TOKEN` - From Square dashboard
- `PAYPAL_CLIENT_ID` - From PayPal dashboard
- `AUTH_GOOGLE_CLIENT_ID` - From Google Cloud Console
- `AUTH_GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `RESEND_API_KEY` - From Resend dashboard

Save and exit (`Ctrl+X`, then `Y`, then `Enter`).

### Step 4: Verify Docker & Docker Compose

```bash
# Check Docker
docker --version
docker-compose --version

# If not installed, install them:
curl -fsSL https://get.docker.com | sh
apt-get install docker-compose-plugin
```

### Step 5: Set Up SSL Certificates (If Not Already Done)

```bash
# Install certbot
apt-get install -y certbot python3-certbot-nginx

# Get certificates
certbot certonly --webroot \
  -w /var/www/certbot \
  -d stepperslife.com \
  -d www.stepperslife.com \
  -d events.stepperslife.com \
  -d storage.stepperslife.com

# Copy certificates to project directory
cp -r /etc/letsencrypt/* /root/stepperslife/data/ssl/
```

### Step 6: Run First Deployment

From your **local machine**:

```bash
# Deploy to VPS
./deploy-to-vps.sh
```

This will:
1. Commit and push code to GitHub
2. Clone/pull repository on VPS
3. Build Docker images
4. Start all containers
5. Run health checks

### Step 7: Verify Deployment

```bash
# Check container status
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml ps'

# Check logs
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml logs --tail=50'

# Test health endpoints
curl https://stepperslife.com/events/api/health
curl https://stepperslife.com/store/api/health
```

---

## Daily Deployment

### Standard Deployment Workflow

```bash
# Make your code changes
# ... edit files ...

# Deploy (commits, pushes, and deploys automatically)
./deploy-to-vps.sh

# OR deploy without pushing to GitHub (if already pushed)
./deploy-to-vps.sh --no-push

# OR deploy and show logs afterward
./deploy-to-vps.sh --logs
```

### What Happens During Deployment

1. **Commits changes** - All uncommitted changes are staged and committed
2. **Pushes to GitHub** - Code is pushed to origin/main
3. **VPS pulls code** - VPS pulls latest from GitHub
4. **Builds images** - Docker builds new images for events and store
5. **Stops containers** - Existing containers are stopped (~10s downtime)
6. **Starts new containers** - New containers start with updated code
7. **Health checks** - Verifies both modules are responding
8. **Success!** - Deployment complete

**Total time:** ~2-5 minutes depending on code changes

---

## VPS Manual Setup

If you need to manually set up or reset the VPS:

### Initialize Git Repository

```bash
ssh root@72.60.28.175

cd /root/stepperslife

# Clone repository (first time)
git clone https://github.com/iradwatkins/stepperslife.git .

# OR if already exists, reset it
git fetch origin
git reset --hard origin/main
```

### Build and Start Containers

```bash
cd /root/stepperslife

# Build images
docker-compose -f docker-compose.blue-green.yml build events-blue store-blue

# Start all services
docker-compose -f docker-compose.blue-green.yml up -d

# Check status
docker-compose -f docker-compose.blue-green.yml ps
```

### Initialize Database (Store Module)

```bash
# Run Prisma migrations
docker-compose -f docker-compose.blue-green.yml exec store-blue npm run db:migrate

# Generate Prisma client (if needed)
docker-compose -f docker-compose.blue-green.yml exec store-blue npx prisma generate
```

### Create MinIO Bucket (Store Module)

```bash
# Access MinIO console
# Open browser: http://72.60.28.175:9001
# Login with MINIO_ROOT_USER and MINIO_ROOT_PASSWORD from .env

# Create bucket named: stepperslife-stores
# Set policy to: public (or custom as needed)
```

---

## Troubleshooting

### Deployment Fails at Health Check

**Problem:** Health check endpoints not responding

**Solutions:**

1. Check container logs:
```bash
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml logs events-blue'
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml logs store-blue'
```

2. Verify health endpoints exist:
   - Events: `src/events-stepperslife/app/events/api/health/route.ts`
   - Store: `src/stores-stepperslife/app/store/api/health/route.ts`

3. Check .env file on VPS:
```bash
ssh root@72.60.28.175 'cat /root/stepperslife/.env | grep -v PASSWORD'
```

### Cannot Connect to VPS

**Problem:** SSH connection refused or times out

**Solutions:**

1. Verify VPS is running:
```bash
ping 72.60.28.175
```

2. Check SSH key permissions:
```bash
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
```

3. Try with password (if key fails):
```bash
ssh -o PreferredAuthentications=password root@72.60.28.175
```

### Docker Build Fails

**Problem:** Image build errors on VPS

**Solutions:**

1. Check Docker disk space:
```bash
ssh root@72.60.28.175 'df -h'
ssh root@72.60.28.175 'docker system df'
```

2. Clean up Docker:
```bash
ssh root@72.60.28.175 'docker system prune -af --volumes'
```

3. Check Dockerfile syntax:
   - `src/dockerfile/Dockerfile.events`
   - `src/dockerfile/Dockerfile.stores`

### Database Connection Errors (Store Module)

**Problem:** Store module can't connect to PostgreSQL

**Solutions:**

1. Check PostgreSQL is running:
```bash
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml ps postgres'
```

2. Verify DATABASE_URL in .env:
```bash
ssh root@72.60.28.175 'cat /root/stepperslife/.env | grep DATABASE_URL'
```

3. Test PostgreSQL connection:
```bash
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml exec postgres psql -U postgres -d stepperslife_stores -c "\dt"'
```

4. Run migrations:
```bash
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml exec store-blue npm run db:migrate'
```

### Redis Connection Errors

**Problem:** Store module can't connect to Redis

**Solutions:**

1. Check Redis is running:
```bash
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml ps redis'
```

2. Test Redis connection:
```bash
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml exec redis redis-cli -a $REDIS_PASSWORD ping'
```

### MinIO/Storage Errors

**Problem:** File uploads failing in store module

**Solutions:**

1. Check MinIO is running:
```bash
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml ps minio'
```

2. Verify bucket exists:
   - Access MinIO console: `http://72.60.28.175:9001`
   - Check for `stepperslife-stores` bucket

3. Check MinIO credentials in .env

### Nginx Not Routing Traffic

**Problem:** Can't access site or getting 502/504 errors

**Solutions:**

1. Check nginx status:
```bash
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml ps events-nginx'
```

2. Test nginx configuration:
```bash
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml exec events-nginx nginx -t'
```

3. Check upstream configuration:
```bash
ssh root@72.60.28.175 'cat /root/stepperslife/nginx/conf.d/upstream.conf'
```

4. Reload nginx:
```bash
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml exec events-nginx nginx -s reload'
```

---

## Maintenance

### View Logs

```bash
# All services
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml logs -f'

# Specific service
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml logs -f events-blue'
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml logs -f store-blue'

# Last 100 lines
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml logs --tail=100 events-blue'
```

### Restart Services

```bash
# Restart specific service
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml restart events-blue'
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml restart store-blue'

# Restart all
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml restart'
```

### Database Backup (PostgreSQL)

```bash
# Backup database
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml exec postgres pg_dump -U postgres stepperslife_stores > /root/backups/db_$(date +%Y%m%d_%H%M%S).sql'

# Restore database
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml exec -T postgres psql -U postgres stepperslife_stores < /root/backups/db_20250120_120000.sql'
```

### Clean Up Docker

```bash
# Remove unused images
ssh root@72.60.28.175 'docker image prune -af'

# Remove unused volumes
ssh root@72.60.28.175 'docker volume prune -f'

# Full cleanup (WARNING: removes all unused data)
ssh root@72.60.28.175 'docker system prune -af --volumes'
```

### Update SSL Certificates

```bash
# Renew certificates
ssh root@72.60.28.175 'certbot renew'

# Copy to project directory
ssh root@72.60.28.175 'cp -r /etc/letsencrypt/* /root/stepperslife/data/ssl/'

# Reload nginx
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml exec events-nginx nginx -s reload'
```

### Monitor Resources

```bash
# Container resource usage
ssh root@72.60.28.175 'docker stats --no-stream'

# Disk usage
ssh root@72.60.28.175 'df -h'

# Docker disk usage
ssh root@72.60.28.175 'docker system df'

# Memory usage
ssh root@72.60.28.175 'free -h'
```

---

## Quick Reference

### Useful Commands

```bash
# Deploy to VPS
./deploy-to-vps.sh

# Check deployment status
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml ps'

# View logs
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml logs -f'

# Restart all services
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml restart'

# Pull latest code manually
ssh root@72.60.28.175 'cd /root/stepperslife && git pull origin main'

# Rebuild and restart
ssh root@72.60.28.175 'cd /root/stepperslife && docker-compose -f docker-compose.blue-green.yml up -d --build'
```

### File Locations

**On VPS:**
- Code: `/root/stepperslife/`
- Environment: `/root/stepperslife/.env`
- Data: `/root/stepperslife/data/`
- Logs: `/root/stepperslife/logs/`
- Nginx config: `/root/stepperslife/nginx/`
- SSL certificates: `/root/stepperslife/data/ssl/`

**Locally:**
- Deployment script: `./deploy-to-vps.sh`
- Docker Compose: `./docker-compose.blue-green.yml`
- Env template: `./.env.vps.template`
- This guide: `./VPS-DEPLOYMENT-GUIDE.md`

### Port Mapping

| Service | Internal Port | External Port | Purpose |
|---------|--------------|---------------|---------|
| events-blue | 3000 | 3001 | Events application |
| events-green | 3000 | 3002 | Events standby |
| store-blue | 3000 | 3005 | Store application |
| store-green | 3000 | 3006 | Store standby |
| nginx | 80/443 | 80/443 | Web server |
| postgres | 5432 | 5432 | Database |
| redis | 6379 | 6379 | Cache |
| minio | 9000/9001 | 9000/9001 | Object storage |

### URLs

- **Events**: https://stepperslife.com/events
- **Store**: https://stepperslife.com/store
- **MinIO Console**: http://72.60.28.175:9001

---

## Support & Resources

- **Full Deployment Docs**: `DEPLOYMENT.md`
- **Quick Start**: `DEPLOYMENT-QUICK-START.md`
- **Blue/Green System**: `BLUE-GREEN-DEPLOYMENT-COMPLETE.md`
- **Store Integration**: `STORE-INTEGRATION-DEPLOYMENT-GUIDE.md`

---

**Happy Deploying!** 🚀

*Last Updated: 2025-11-20*
