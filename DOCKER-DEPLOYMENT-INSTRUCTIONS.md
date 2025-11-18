# Docker Production Deployment Instructions

## 🎯 Overview

This guide walks you through deploying the SteppersLife Events Platform to your VPS using Docker containers.

**Deployment Stack:**
- ✅ Docker containers (Next.js app + Nginx)
- ✅ Convex backend (cloud-hosted)
- ✅ VPS: 72.60.28.175 (events-production)
- ❌ NOT using Vercel, Supabase, or Clerk

---

## ✅ Pre-Deployment Checklist

### 1. Code Status
- ✅ **Authentication fixes deployed** to Convex production (`neighborly-swordfish-681`)
- ✅ **All changes committed** and pushed to GitHub (main branch)
- ✅ **Docker configuration updated** for production build
- ✅ **Environment variables configured** in `.env` file

### 2. What Was Fixed
- ✅ Organizer dashboard authentication (no more redirects)
- ✅ ConvexClientProvider auth token fetching
- ✅ My Tickets page "skip" pattern error
- ✅ Payment system separation (Square for organizers only)

---

## 🚀 Quick Deployment

### Option 1: Automated Script (Recommended)

```bash
cd /Users/irawatkins/stepperslife-v2-docker
chmod +x deploy-docker-to-vps.sh
./deploy-docker-to-vps.sh
```

**You'll be prompted for:** VPS root password for 72.60.28.175

**The script will:**
1. Sync all files to VPS (excluding node_modules, .next)
2. Stop existing Docker containers
3. Build new Docker images (production mode)
4. Start containers with updated code
5. Show deployment status

**Expected duration:** 5-10 minutes

---

### Option 2: Manual Deployment

If you prefer manual control:

```bash
# 1. SSH into VPS
ssh events-production  # or ssh root@72.60.28.175

# 2. Navigate to project directory
cd /root/stepperslife-v2-docker

# 3. Pull latest code from GitHub (if repo is set up on VPS)
git pull origin main

# 4. Stop existing containers
docker compose down

# 5. Build fresh images
docker compose build --no-cache

# 6. Start containers
docker compose up -d

# 7. Check status
docker compose ps
docker compose logs --tail=50
```

---

## 📋 Docker Container Architecture

### Services Running

**1. events-app** (Next.js Application)
- **Container:** `events-stepperslife-app`
- **Port:** 3004 (host) → 3000 (container)
- **Mode:** Production (standalone build)
- **Convex:** `neighborly-swordfish-681.convex.cloud`

**2. nginx** (Reverse Proxy)
- **Container:** `events-nginx`
- **Ports:** 80 (HTTP), 443 (HTTPS)
- **SSL:** `/root/stepperslife-v2-docker/nginx/ssl/`
- **Config:** `/root/stepperslife-v2-docker/nginx/nginx.conf`

### Network
- **Network:** `events-network` (bridge)
- **Communication:** nginx → events-app:3000

---

## 🔍 Post-Deployment Verification

### 1. Check Container Status
```bash
ssh events-production 'docker compose ps'
```

**Expected output:**
```
NAME                    STATUS          PORTS
events-nginx            Up X minutes    0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
events-stepperslife-app Up X minutes    0.0.0.0:3004->3000/tcp
```

### 2. Check Application Logs
```bash
ssh events-production 'docker compose logs -f events-app'
```

**Look for:**
- ✅ "Ready in X ms"
- ✅ "Environment validation passed"
- ✅ No authentication errors
- ✅ No Convex connection errors

### 3. Test the Website

**Homepage:**
https://events.stepperslife.com

**Organizer Login:**
1. Visit https://events.stepperslife.com
2. Click "Sign In" → "Sign in with Google"
3. Select organizer account
4. Click "My Events" in navigation
5. **Should see:** Dashboard WITHOUT redirect
6. **Should NOT see:** "Loading..." forever

**My Tickets Page:**
https://events.stepperslife.com/my-tickets
- Should load without console errors
- No "Cannot read properties of undefined" error

### 4. Verify Convex Connection
```bash
# Check if app is connecting to correct Convex
ssh events-production 'docker compose logs events-app | grep -i convex'
```

**Should see:**
- Connections to `neighborly-swordfish-681.convex.cloud`
- No authentication errors
- No WebSocket connection failures

---

## 🛠️ Troubleshooting

### Container Won't Start

```bash
# Check detailed logs
ssh events-production 'docker compose logs events-app'

# Check build errors
ssh events-production 'docker compose build events-app'
```

### Port Already in Use

```bash
# Check what's using port 3004
ssh events-production 'lsof -i :3004'

# Stop conflicting process
ssh events-production 'pkill -f "node.*3004"'

# Restart containers
ssh events-production 'cd /root/stepperslife-v2-docker && docker compose restart'
```

### Nginx SSL Issues

```bash
# Check nginx logs
ssh events-production 'docker compose logs nginx'

# Verify SSL certificates exist
ssh events-production 'ls -la /root/stepperslife-v2-docker/nginx/ssl/'
```

### Environment Variables Not Loading

```bash
# Check .env file exists
ssh events-production 'cat /root/stepperslife-v2-docker/.env | grep CONVEX'

# Should show:
# NEXT_PUBLIC_CONVEX_URL=https://neighborly-swordfish-681.convex.cloud
# CONVEX_URL=https://neighborly-swordfish-681.convex.cloud
```

---

## 📊 Useful Commands

### Container Management

```bash
# View all containers
docker compose ps

# Restart specific service
docker compose restart events-app

# Stop all containers
docker compose down

# Start all containers
docker compose up -d

# Remove everything and rebuild
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

### Logs

```bash
# Follow logs (real-time)
docker compose logs -f

# Follow specific service
docker compose logs -f events-app

# Last 100 lines
docker compose logs --tail=100

# Logs since timestamp
docker compose logs --since="2025-01-17T10:00:00"
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Clean up unused images
docker system prune -a
```

---

## 🔄 Update Deployment (After Code Changes)

Whenever you make code changes and want to deploy:

```bash
# From your local machine
cd /Users/irawatkins/stepperslife-v2-docker
git add -A
git commit -m "Your changes"
git push origin main

# Deploy to VPS
./deploy-docker-to-vps.sh
```

**OR manually:**

```bash
ssh events-production << 'EOF'
cd /root/stepperslife-v2-docker
docker compose down
docker compose build --no-cache events-app
docker compose up -d
EOF
```

---

## ✅ Success Criteria

After deployment, verify:

- ✅ **Containers running**: `docker compose ps` shows both containers "Up"
- ✅ **Website loads**: https://events.stepperslife.com accessible
- ✅ **Organizer login works**: Can access /organizer/events without redirect
- ✅ **My Tickets works**: /my-tickets loads without errors
- ✅ **Convex connected**: Logs show connections to neighborly-swordfish-681
- ✅ **No console errors**: Browser console clean (except cached errors - clear cache)

---

## 📞 Support

If deployment fails:

1. **Check logs**: `docker compose logs --tail=100`
2. **Check container status**: `docker compose ps`
3. **Verify environment**: `cat .env | grep CONVEX`
4. **Check disk space**: `df -h`
5. **Check memory**: `free -h`

---

## 📝 Files Modified in This Deployment

**Docker Configuration:**
- `docker-compose.yml` - Updated Convex URL
- `src/dockerfile/Dockerfile.events` - Production multi-stage build
- `.env` - Production Convex deployment

**Application Code:**
- `src/events-stepperslife/next.config.ts` - Standalone output, CSP updates
- `src/events-stepperslife/components/convex-client-provider.tsx` - Auth token fetching
- `src/events-stepperslife/app/my-tickets/page.tsx` - Fixed skip pattern
- `src/events-stepperslife/convex/schema.ts` - Backward compatible payment types

**Convex Backend:**
- Deployed to: `https://neighborly-swordfish-681.convex.cloud`
- All auth queries updated and working

---

**Last Updated:** 2025-01-17
**Deployment Target:** Production VPS (72.60.28.175)
**Status:** ✅ Ready for deployment
