# Docker Desktop - Current Running Containers

**Generated:** November 16, 2025

---

## 🟢 RUNNING CONTAINERS (9 total)

### 📊 SteppersLife Events Platform (5 containers)

#### 1. **events-stepperslife-app** ⭐ (Main App)
- **Image:** `stepperslife-v2-docker-events-app`
- **Status:** ✅ Running (Up 33 minutes)
- **Ports:**
  - `3004 → 3000` (Application)
- **Access:** http://localhost:3004
- **What it does:** Next.js 16 application for SteppersLife Events
- **Uses:** Convex (cloud database), NOT the local postgres

#### 2. **events-nginx** 🌐 (Web Server)
- **Image:** `nginx:alpine`
- **Status:** ✅ Running (Up 2 hours)
- **Ports:**
  - `80 → 80` (HTTP)
  - `443 → 443` (HTTPS)
- **Access:** http://127.0.0.1 (redirects to events-stepperslife-app)
- **What it does:** Reverse proxy to route traffic to the app

#### 3. **events-postgres** 💾 (Database - UNUSED)
- **Image:** `postgres:16-alpine`
- **Status:** ✅ Running (Up 2 hours) - Healthy
- **Ports:** `5432 → 5432`
- **What it does:** PostgreSQL database
- **⚠️ NOTE:** NOT actively used (app uses Convex cloud database)
- **Recommendation:** Can be stopped or removed

#### 4. **events-redis** 🔴 (Cache - UNUSED)
- **Image:** `redis:7-alpine`
- **Status:** ✅ Running (Up 2 hours) - Healthy
- **Ports:** `6379 → 6379`
- **What it does:** Redis cache
- **⚠️ NOTE:** NOT actively used
- **Recommendation:** Can be stopped or removed

#### 5. **events-minio** 📦 (Storage - UNUSED)
- **Image:** `minio/minio:latest`
- **Status:** ✅ Running (Up 2 hours) - Healthy
- **Ports:**
  - `9000-9001 → 9000-9001`
- **What it does:** S3-compatible object storage
- **⚠️ NOTE:** NOT actively used (app may use Convex storage)
- **Recommendation:** Can be stopped or removed

---

### 🖨️ UV Coated Club Flyers Platform (4 containers)

#### 6. **uvcoatedclubflyers** ⭐ (Main App)
- **Image:** `node:20-alpine`
- **Status:** ✅ Running (Up 33 minutes)
- **Ports:**
  - `3000 → 3000` (Application)
  - `5555 → 5555` (Prisma Studio)
- **Access:**
  - App: http://localhost:3000
  - Prisma Studio: http://localhost:5555
- **What it does:** UV Coated printing/flyer platform

#### 7. **uvcoated-postgres** 💾
- **Image:** `postgres:16-alpine`
- **Status:** ✅ Running (Up 33 minutes) - Healthy
- **Ports:** `5448 → 5432`
- **What it does:** PostgreSQL for UV Coated app

#### 8. **uvcoated-redis** 🔴
- **Image:** `redis:7-alpine`
- **Status:** ✅ Running (Up 33 minutes) - Healthy
- **Ports:** `6302 → 6379`
- **What it does:** Redis cache for UV Coated app

#### 9. **uvcoated-minio** 📦
- **Image:** `minio/minio:latest`
- **Status:** ✅ Running (Up 33 minutes) - Healthy
- **Ports:**
  - `9002 → 9000` (API)
  - `9102 → 9001` (Console)
- **What it does:** Object storage for UV Coated app
- **Console:** http://localhost:9102

---

## 🎯 WHAT WE TESTED & AUDITED

### ✅ **SteppersLife Events** (This one!)
**Container:** `events-stepperslife-app`
**Access:** http://127.0.0.1 or http://localhost:3004

**What we verified:**
- ✅ Using **Convex** as primary database (cloud)
- ✅ Square payment SDK integrated
- ✅ Cash App Pay working
- ✅ Stripe code ready (needs keys)
- ✅ Authentication system working
- ✅ All 30 API endpoints responding
- ✅ Ticket purchase flow ready
- ⚠️ PostgreSQL/Redis/Minio containers running but NOT used

---

## 📊 RESOURCE USAGE

```
Active Containers: 9
Inactive Containers: 0
Total Images: ~9
Disk Space Used: ~2-3GB
```

---

## 🔧 RECOMMENDED CLEANUP

### For SteppersLife Events:
Since the app uses **Convex (cloud)** and NOT local databases, you can stop these:

```bash
# Stop unused containers (SteppersLife Events):
docker stop events-postgres events-redis events-minio

# Or remove them completely from docker-compose.yml
```

**Why?**
- App uses Convex for database (not PostgreSQL)
- No session caching implemented (no Redis needed)
- Convex handles file storage (no Minio needed)
- Saves memory and resources

### Keep Running:
- ✅ `events-stepperslife-app` - The main application
- ✅ `events-nginx` - Web server/reverse proxy

---

## 🌐 ACCESS URLs

### SteppersLife Events:
- **Main App:** http://127.0.0.1 or http://localhost:3004
- **Convex Dashboard:** https://dashboard.convex.dev

### UV Coated Flyers:
- **Main App:** http://localhost:3000
- **Prisma Studio:** http://localhost:5555
- **Minio Console:** http://localhost:9102

### Unused Services (SteppersLife):
- ~~PostgreSQL:~~ localhost:5432 (not used)
- ~~Redis:~~ localhost:6379 (not used)
- ~~Minio:~~ localhost:9000-9001 (not used)

---

## 📁 PROJECT LOCATIONS

### SteppersLife Events:
```
/Users/irawatkins/stepperslife-v2-docker/
├── docker-compose.yml          # Container definitions
├── src/
│   └── events-stepperslife/    # 👈 Open this in Cursor
│       ├── app/                # Next.js app
│       ├── convex/            # Backend functions
│       ├── .env.local         # Environment variables
│       └── package.json       # Dependencies
```

### UV Coated Flyers:
```
/Users/irawatkins/uvcoated-club-flyers/
(Different project)
```

---

## 🎮 DOCKER DESKTOP VIEW

In Docker Desktop, you should see:

**Containers (9):**
```
✅ events-stepperslife-app    [Running] Port: 3004
✅ events-nginx               [Running] Ports: 80, 443
⚠️ events-postgres            [Running] Port: 5432 (unused)
⚠️ events-redis               [Running] Port: 6379 (unused)
⚠️ events-minio               [Running] Ports: 9000-9001 (unused)
✅ uvcoatedclubflyers         [Running] Ports: 3000, 5555
✅ uvcoated-postgres          [Running] Port: 5448
✅ uvcoated-redis             [Running] Port: 6302
✅ uvcoated-minio             [Running] Ports: 9002, 9102
```

**Images:**
- `stepperslife-v2-docker-events-app`
- `nginx:alpine`
- `postgres:16-alpine`
- `redis:7-alpine`
- `minio/minio:latest`
- `node:20-alpine`

---

## ⚡ QUICK ACTIONS

### View Container Logs:
```bash
# SteppersLife Events logs
docker logs events-stepperslife-app

# Follow logs in real-time
docker logs -f events-stepperslife-app
```

### Restart Container:
```bash
# Restart SteppersLife app
docker restart events-stepperslife-app

# Restart all SteppersLife containers
docker-compose restart
```

### Stop Unused Containers:
```bash
# Stop unused databases
docker stop events-postgres events-redis events-minio
```

### Start Container:
```bash
# Start SteppersLife app
docker start events-stepperslife-app
```

---

## 🔍 WHAT WE KNOW ABOUT YOUR SETUP

### SteppersLife Events:
- ✅ **Running** on port 80 (via nginx) and 3004 (direct)
- ✅ **Database:** Convex cloud (https://fearless-dragon-613.convex.cloud)
- ✅ **Payments:** Square SDK ready, Stripe code ready
- ✅ **Auth:** Custom session-based + Convex JWT
- ⚠️ **Unused:** PostgreSQL, Redis, Minio containers

### UV Coated Flyers:
- ✅ **Running** on port 3000
- ✅ **Database:** PostgreSQL (uvcoated-postgres:5448)
- ✅ **Cache:** Redis (uvcoated-redis:6302)
- ✅ **Storage:** Minio (uvcoated-minio:9002)
- ✅ **Prisma Studio:** Available on port 5555

---

## 💡 SUMMARY

**Yes, this is what you have in Docker Desktop!**

You're running **2 different applications**:
1. **SteppersLife Events** (what we tested) - Uses Convex cloud
2. **UV Coated Flyers** (separate project) - Uses local PostgreSQL

The SteppersLife Events app has some extra containers (PostgreSQL, Redis, Minio) that aren't being used and can be removed to free up resources.

---

**Need to make changes?** Let me know which containers to stop, start, or remove!
