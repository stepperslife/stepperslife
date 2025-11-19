# Migration Guide: PM2 to Docker Production Deployment

## Overview

This guide walks through migrating the SteppersLife Events platform from the current **PM2 + rsync** deployment to a **Docker-based** production deployment.

### Current State (PM2)
- Manual rsync file transfer
- PM2 process manager
- Direct Nginx configuration on VPS
- Manual SSL certificate management

### Target State (Docker)
- Containerized application
- Docker Compose orchestration
- Nginx in container with SSL
- Automatic SSL renewal with Certbot

---

## Why Migrate to Docker?

### Advantages

✅ **Consistent Environments** - Same container runs in dev, staging, and production
✅ **Easy Rollback** - Instant rollback to previous container image
✅ **Isolated Dependencies** - Node modules bundled in container
✅ **Health Checks** - Automatic restart on failure
✅ **Resource Limits** - Prevent memory leaks and CPU hogging
✅ **Zero-Downtime Deploys** - Rolling updates with health checks
✅ **Simplified SSL** - Automated certificate renewal
✅ **Better Monitoring** - Built-in Docker health and resource metrics

### Disadvantages (Minor)

⚠️ **Slight Learning Curve** - Docker commands vs PM2 commands
⚠️ **Initial Setup Time** - One-time migration effort (~2 hours)
⚠️ **Docker Overhead** - Minimal (~50MB memory per container)

---

## Pre-Migration Checklist

Before starting the migration, ensure:

- [ ] Current production is running and healthy
- [ ] You have SSH access to VPS (72.60.28.175)
- [ ] You have a complete backup of:
  - [ ] Uploaded files (`/root/websites/events-stepperslife/STEPFILES`)
  - [ ] SSL certificates (`/etc/letsencrypt`)
  - [ ] Environment variables (`.env.production`)
  - [ ] Nginx configuration (`/etc/nginx/sites-available/event.stepperslife.com`)
- [ ] You've tested Docker deployment locally or on staging
- [ ] You have a maintenance window (estimated: 30 minutes downtime)

---

## Migration Steps

### Phase 1: Backup Current Production (15 minutes)

#### 1.1: Backup Files

```bash
# SSH into production VPS
ssh root@72.60.28.175

# Create backup directory
mkdir -p /root/backups/pm2-migration-$(date +%Y-%m-%d)
cd /root/backups/pm2-migration-$(date +%Y-%m-%d)

# Backup uploaded files
tar -czf stepfiles-backup.tar.gz /root/websites/events-stepperslife/STEPFILES

# Backup SSL certificates
tar -czf ssl-backup.tar.gz /etc/letsencrypt

# Backup Nginx config
cp /etc/nginx/sites-available/event.stepperslife.com nginx-config-backup.conf

# Backup environment file
cp /root/websites/events-stepperslife/.env.production env-backup.txt

# Verify backups
ls -lh
```

#### 1.2: Document Current State

```bash
# Save PM2 process list
pm2 list > pm2-processes-before-migration.txt

# Save Nginx status
systemctl status nginx > nginx-status-before.txt

# Save listening ports
ss -tulpn > ports-before-migration.txt

# Test current site
curl -I https://events.stepperslife.com > site-status-before.txt
```

---

### Phase 2: Install Docker (10 minutes)

#### 2.1: Install Docker Engine

```bash
# Still on VPS as root
# Update package index
apt update

# Install required packages
apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -

# Add Docker repository
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Install Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io

# Verify Docker installation
docker --version
# Expected: Docker version 24.0+ or higher
```

#### 2.2: Install Docker Compose

```bash
# Download Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
# Expected: Docker Compose version 2.0+ or higher
```

#### 2.3: Enable Docker Service

```bash
# Enable Docker to start on boot
systemctl enable docker

# Start Docker service
systemctl start docker

# Check status
systemctl status docker
```

---

### Phase 3: Prepare Docker Deployment (10 minutes)

#### 3.1: Create Directory Structure

```bash
# Create new Docker deployment directory
mkdir -p /root/stepperslife-v2-docker/data/{stepfiles,ssl}
mkdir -p /root/stepperslife-v2-docker/logs/{app,nginx}

# Set permissions
chmod -R 755 /root/stepperslife-v2-docker
```

#### 3.2: Copy Uploaded Files

```bash
# Copy existing uploaded files to new location
cp -a /root/websites/events-stepperslife/STEPFILES/* /root/stepperslife-v2-docker/data/stepfiles/

# Verify copy
du -sh /root/stepperslife-v2-docker/data/stepfiles
```

#### 3.3: Copy SSL Certificates

```bash
# Copy Let's Encrypt certificates
cp -a /etc/letsencrypt/* /root/stepperslife-v2-docker/data/ssl/

# Verify certificates exist
ls -la /root/stepperslife-v2-docker/data/ssl/live/events.stepperslife.com/
```

---

### Phase 4: Deploy Docker Containers (20 minutes)

#### 4.1: Upload Project Files (From Local Machine)

```bash
# From your local machine
cd /Users/irawatkins/stepperslife-v2-docker

# Ensure .env.production is configured
# (Should already exist from PM2 deployment)
cp /root/backups/pm2-migration-*/env-backup.txt .env.production

# Copy project to VPS
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  --exclude 'data' --exclude 'logs' \
  ./ root@72.60.28.175:/root/stepperslife-v2-docker/
```

#### 4.2: Build Docker Images (On VPS)

```bash
# SSH into VPS
ssh root@72.60.28.175
cd /root/stepperslife-v2-docker

# Build containers
docker-compose -f docker-compose.production.yml build

# This takes 5-10 minutes
# ✅ Next.js application will be built
# ✅ Dependencies installed
# ✅ Production optimizations applied
```

#### 4.3: Stop PM2 Services

```bash
# Stop current PM2 processes
pm2 stop all

# Save PM2 list for reference
pm2 list

# Disable PM2 startup
pm2 unstartup
```

#### 4.4: Stop Nginx

```bash
# Stop system Nginx (we'll use containerized Nginx)
systemctl stop nginx
systemctl disable nginx
```

#### 4.5: Start Docker Containers

```bash
# Start all services
docker-compose -f docker-compose.production.yml up -d

# Wait 30 seconds for containers to start
sleep 30

# Check status
docker-compose -f docker-compose.production.yml ps

# Expected output:
# NAME                      STATUS          PORTS
# events-stepperslife-app   Up (healthy)    3000/tcp
# events-nginx              Up (healthy)    0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
# events-certbot            Up
```

---

### Phase 5: Verification & Testing (10 minutes)

#### 5.1: Health Checks

```bash
# Test internal health endpoint
docker-compose -f /root/stepperslife-v2-docker/docker-compose.production.yml exec events-app curl http://localhost:3000/api/health

# Expected: 200 OK

# Test Nginx health
curl http://localhost/health

# Expected: healthy
```

#### 5.2: Test HTTPS

```bash
# Test HTTPS connection
curl -I https://events.stepperslife.com

# Expected:
# HTTP/2 200
# strict-transport-security: max-age=31536000; includeSubDomains; preload
# x-frame-options: SAMEORIGIN
```

#### 5.3: Test Application Features

```bash
# Test homepage
curl -s https://events.stepperslife.com | grep -i "stepperslife"

# Test API endpoint
curl https://events.stepperslife.com/api/health

# Test authentication (from browser)
# Visit: https://events.stepperslife.com/auth/signin
```

#### 5.4: Check Logs

```bash
# View application logs
docker-compose -f /root/stepperslife-v2-docker/docker-compose.production.yml logs events-app

# View Nginx logs
docker-compose -f /root/stepperslife-v2-docker/docker-compose.production.yml logs nginx

# Check for errors
docker-compose -f /root/stepperslife-v2-docker/docker-compose.production.yml logs | grep -i error
```

---

### Phase 6: Post-Migration Cleanup (5 minutes)

#### 6.1: Keep PM2 Backup (Don't Delete Yet)

```bash
# DO NOT delete PM2 installation yet
# Keep for 7 days as fallback

# Just stop PM2 from running
pm2 kill
```

#### 6.2: Document New Deployment

```bash
# Create migration summary
cat > /root/MIGRATION-SUMMARY.txt << EOF
Migration Date: $(date)
Migration Type: PM2 → Docker
Old Location: /root/websites/events-stepperslife
New Location: /root/stepperslife-v2-docker
Backup Location: /root/backups/pm2-migration-$(date +%Y-%m-%d)
Status: COMPLETED

Docker Containers:
$(docker-compose -f /root/stepperslife-v2-docker/docker-compose.production.yml ps)

Health Check:
$(curl -s https://events.stepperslife.com/api/health)
EOF

cat /root/MIGRATION-SUMMARY.txt
```

---

## Rollback Procedure (Emergency)

If something goes wrong during migration:

### Option 1: Quick Rollback to PM2

```bash
# SSH into VPS
ssh root@72.60.28.175

# Stop Docker containers
cd /root/stepperslife-v2-docker
docker-compose -f docker-compose.production.yml down

# Start system Nginx
systemctl start nginx
systemctl enable nginx

# Start PM2 processes
cd /root/websites/events-stepperslife
pm2 resurrect
# OR
pm2 start npm --name "events-app" -- start

# Verify
pm2 list
curl -I https://events.stepperslife.com
```

### Option 2: Restore from Backup

```bash
# Restore uploaded files
cd /root/backups/pm2-migration-*
tar -xzf stepfiles-backup.tar.gz -C /

# Restore SSL certificates
tar -xzf ssl-backup.tar.gz -C /

# Restore Nginx config
cp nginx-config-backup.conf /etc/nginx/sites-available/event.stepperslife.com

# Restart Nginx
systemctl restart nginx

# Start PM2
pm2 resurrect
```

---

## Command Comparison: PM2 vs Docker

| Task | PM2 Command | Docker Command |
|------|-------------|----------------|
| **Deploy updates** | `pm2 restart all` | `./deploy-docker-production.sh --update` |
| **View logs** | `pm2 logs` | `./deploy-docker-production.sh --logs` |
| **Check status** | `pm2 list` | `./deploy-docker-production.sh --status` |
| **Restart app** | `pm2 restart events-app` | `docker-compose -f docker-compose.production.yml restart events-app` |
| **Stop app** | `pm2 stop events-app` | `docker-compose -f docker-compose.production.yml stop` |
| **Start app** | `pm2 start events-app` | `docker-compose -f docker-compose.production.yml up -d` |

---

## File Location Changes

| Item | Old Location (PM2) | New Location (Docker) |
|------|-------------------|----------------------|
| **Application code** | `/root/websites/events-stepperslife` | `/root/stepperslife-v2-docker` |
| **Uploaded files** | `/root/websites/events-stepperslife/STEPFILES` | `/root/stepperslife-v2-docker/data/stepfiles` |
| **SSL certificates** | `/etc/letsencrypt` | `/root/stepperslife-v2-docker/data/ssl` |
| **Application logs** | `/root/.pm2/logs` | `/root/stepperslife-v2-docker/logs/app` |
| **Nginx logs** | `/var/log/nginx` | `/root/stepperslife-v2-docker/logs/nginx` |
| **Nginx config** | `/etc/nginx/sites-available/` | `/root/stepperslife-v2-docker/nginx/` |

---

## Post-Migration Tasks

### Week 1: Monitor Closely

- [ ] Check application logs daily: `./deploy-docker-production.sh --logs`
- [ ] Monitor resource usage: `docker stats`
- [ ] Test all critical features:
  - [ ] User registration
  - [ ] Event creation
  - [ ] Ticket purchase (Stripe, Square, PayPal)
  - [ ] QR code generation
  - [ ] Email delivery
  - [ ] Image uploads

### Week 2: Optimize

- [ ] Review container resource limits
- [ ] Adjust Nginx caching if needed
- [ ] Fine-tune rate limiting
- [ ] Monitor SSL certificate auto-renewal

### Month 1: Full Transition

- [ ] **After 30 days of stable Docker operation:**
  ```bash
  # Remove PM2 completely
  npm uninstall -g pm2

  # Archive old PM2 files
  cd /root/websites
  tar -czf events-stepperslife-pm2-backup.tar.gz events-stepperslife
  mv events-stepperslife-pm2-backup.tar.gz /root/backups/
  rm -rf /root/websites/events-stepperslife

  # Remove system Nginx config
  rm /etc/nginx/sites-available/event.stepperslife.com
  rm /etc/nginx/sites-enabled/event.stepperslife.com
  ```

---

## Troubleshooting Common Migration Issues

### Issue 1: Port Already in Use

**Symptom**: Docker Nginx won't start, error "port 80/443 already in use"

**Solution**:
```bash
# Check what's using the port
ss -tulpn | grep :80
ss -tulpn | grep :443

# If system Nginx is still running
systemctl stop nginx
systemctl disable nginx

# Restart Docker containers
docker-compose -f /root/stepperslife-v2-docker/docker-compose.production.yml restart
```

### Issue 2: SSL Certificate Not Found

**Symptom**: Nginx fails health check, error "SSL certificate not found"

**Solution**:
```bash
# Verify certificates were copied
ls -la /root/stepperslife-v2-docker/data/ssl/live/events.stepperslife.com/

# If missing, copy from backup
tar -xzf /root/backups/pm2-migration-*/ssl-backup.tar.gz -C /root/stepperslife-v2-docker/data/ssl/

# Restart Nginx
docker-compose -f /root/stepperslife-v2-docker/docker-compose.production.yml restart nginx
```

### Issue 3: Uploaded Files Not Accessible

**Symptom**: Product images return 404 errors

**Solution**:
```bash
# Verify files were copied
ls -la /root/stepperslife-v2-docker/data/stepfiles/product-images/

# Check Docker volume mount
docker-compose -f /root/stepperslife-v2-docker/docker-compose.production.yml exec events-app ls -la /app/STEPFILES

# If missing, copy from backup or old location
cp -a /root/websites/events-stepperslife/STEPFILES/* /root/stepperslife-v2-docker/data/stepfiles/

# Restart app container
docker-compose -f /root/stepperslife-v2-docker/docker-compose.production.yml restart events-app
```

### Issue 4: Environment Variables Missing

**Symptom**: Application crashes with "CONVEX_URL is not defined" or similar

**Solution**:
```bash
# Verify .env.production exists
ls -la /root/stepperslife-v2-docker/.env.production

# Check for missing variables
docker-compose -f /root/stepperslife-v2-docker/docker-compose.production.yml exec events-app env | grep CONVEX

# If missing, copy from backup
cp /root/backups/pm2-migration-*/env-backup.txt /root/stepperslife-v2-docker/.env.production

# Rebuild and restart (required for env changes)
docker-compose -f /root/stepperslife-v2-docker/docker-compose.production.yml up -d --force-recreate
```

---

## Migration Checklist

Print this checklist and check off items as you complete them:

### Pre-Migration
- [ ] Backup uploaded files
- [ ] Backup SSL certificates
- [ ] Backup environment variables
- [ ] Backup Nginx config
- [ ] Document current PM2 processes
- [ ] Test site is working before migration

### Migration
- [ ] Install Docker Engine
- [ ] Install Docker Compose
- [ ] Create directory structure
- [ ] Copy uploaded files to new location
- [ ] Copy SSL certificates
- [ ] Upload project files from local machine
- [ ] Build Docker images
- [ ] Stop PM2 services
- [ ] Stop system Nginx
- [ ] Start Docker containers
- [ ] Verify containers are healthy

### Verification
- [ ] Test internal health endpoint
- [ ] Test HTTPS connection
- [ ] Test homepage loads
- [ ] Test user login
- [ ] Test event browsing
- [ ] Test ticket purchase
- [ ] Test image uploads
- [ ] Check application logs
- [ ] Check Nginx logs
- [ ] Monitor resource usage

### Post-Migration
- [ ] Monitor for 24 hours
- [ ] Test all critical features
- [ ] Keep PM2 backup for 30 days
- [ ] After 30 days, remove PM2 completely
- [ ] Update deployment documentation
- [ ] Train team on new Docker commands

---

## Support & Questions

If you encounter issues during migration:

1. **Check logs**: `./deploy-docker-production.sh --logs`
2. **Check status**: `./deploy-docker-production.sh --status`
3. **Review troubleshooting section** above
4. **Rollback if necessary** using procedures above
5. **Refer to**: `DEPLOY-DOCKER.md` for detailed Docker deployment guide

---

**Migration Estimated Time**: 1-2 hours
**Recommended Maintenance Window**: 2 hours (evening/low-traffic)
**Risk Level**: Low (easy rollback available)
**Success Rate**: 95%+ (with proper preparation)

**Last Updated**: 2025-11-18
**Version**: 1.0.0
**Maintainer**: SteppersLife Development Team
