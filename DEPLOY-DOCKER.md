# SteppersLife Events - Docker Production Deployment Guide

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture](#architecture)
4. [First-Time Deployment](#first-time-deployment)
5. [Updating Production](#updating-production)
6. [SSL Certificate Management](#ssl-certificate-management)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)
9. [Rollback Procedures](#rollback-procedures)
10. [Security Best Practices](#security-best-practices)

---

## Overview

This guide covers deploying the SteppersLife Events platform to production using Docker containers. The deployment includes:

- **Next.js Application** (events-stepperslife-app)
- **Nginx Reverse Proxy** (SSL termination, load balancing)
- **Certbot** (Automatic SSL certificate management)
- **Convex Cloud Database** (Managed NoSQL database)

### Key Features

✅ **Zero-downtime deployments** with health checks
✅ **Automatic SSL certificate renewal** via Let's Encrypt
✅ **Production-grade security headers** (HSTS, CSP, X-Frame-Options)
✅ **Rate limiting** on API endpoints
✅ **Persistent storage** for uploads and logs
✅ **Resource limits** to prevent memory leaks
✅ **Automatic container restart** on failure

---

## Prerequisites

### On Your Local Machine

- Git repository access
- SSH access to production VPS (72.60.28.175)
- Completed `.env.production` file (from `.env.production.template`)

### On Production VPS

- **OS**: Ubuntu 20.04+ or similar Linux distribution
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+
- **Open Ports**: 80 (HTTP), 443 (HTTPS)
- **Domain**: events.stepperslife.com pointing to VPS IP
- **Resources**: 2+ CPU cores, 4GB+ RAM, 20GB+ disk space

### Install Docker on VPS (if not already installed)

```bash
# SSH into VPS
ssh root@72.60.28.175

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

---

## Architecture

### Docker Services

```
┌─────────────────────────────────────────────────────────┐
│                      Internet                            │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────▼───────────┐
         │  Nginx (Port 80/443)  │
         │  - SSL Termination    │
         │  - Reverse Proxy      │
         │  - Rate Limiting      │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │  Next.js App (3000)   │
         │  - SteppersLife App   │
         │  - Health Checks      │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │  Convex Cloud         │
         │  - Database           │
         │  - Real-time Queries  │
         └───────────────────────┘

    Certbot (runs every 12h)
    - Auto SSL renewal
```

### Volume Mounts

| Volume | Purpose | Location on VPS |
|--------|---------|-----------------|
| `stepfiles-data` | User uploads, product images | `/root/stepperslife-v2-docker/data/stepfiles` |
| `nginx-ssl` | SSL certificates (Let's Encrypt) | `/root/stepperslife-v2-docker/data/ssl` |
| `app-logs` | Application logs | `/root/stepperslife-v2-docker/logs/app` |
| `nginx-logs` | Nginx access/error logs | `/root/stepperslife-v2-docker/logs/nginx` |
| `certbot-webroot` | Certbot ACME challenge | Docker-managed volume |

---

## First-Time Deployment

### Step 1: Prepare Environment File

```bash
# On your local machine
cd /Users/irawatkins/stepperslife-v2-docker

# Copy template and fill in production values
cp .env.production.template .env.production
nano .env.production  # Edit with your credentials

# Verify no placeholders remain
grep -r "REPLACE_WITH" .env.production
# Should return nothing if all filled in

# Secure the file
chmod 600 .env.production
```

**Important**: Ensure all payment processors use **PRODUCTION** credentials:
- Square: Production access token (not sandbox)
- Stripe: Live keys (`sk_live_*`, `pk_live_*`)
- PayPal: Live client ID and secret

### Step 2: Run First-Time Deployment

```bash
# From your local machine, run the deployment script
./deploy-docker-production.sh --first-time
```

This will:
1. ✅ Create directory structure on VPS
2. ✅ Copy project files via rsync
3. ✅ Build Docker containers
4. ✅ Start application container
5. ✅ Obtain SSL certificates from Let's Encrypt
6. ✅ Start Nginx with SSL enabled
7. ✅ Enable automatic SSL renewal

### Step 3: Verify Deployment

```bash
# Check container status
./deploy-docker-production.sh --status

# Expected output:
# ✅ events-stepperslife-app: healthy
# ✅ events-nginx: healthy
# ✅ events-certbot: running
```

Visit https://events.stepperslife.com to verify the site is live.

---

## Updating Production

### Standard Update Process

```bash
# From your local machine
cd /Users/irawatkins/stepperslife-v2-docker

# Commit your changes (optional but recommended)
git add .
git commit -m "Your update description"
git push

# Deploy updates to production
./deploy-docker-production.sh --update
```

The update process:
1. ✅ Syncs updated files to VPS
2. ✅ Rebuilds Docker containers with latest code
3. ✅ Performs rolling restart (zero downtime)
4. ✅ Runs health checks
5. ✅ Shows deployment status

### Update Options

| Command | Use Case |
|---------|----------|
| `--update` | Standard code/config updates |
| `--update --no-cache` | Force rebuild (ignores Docker cache) |
| `--ssl-renew` | Manually renew SSL certificates |
| `--rollback` | Revert to previous version |

---

## SSL Certificate Management

### Automatic Renewal

SSL certificates are automatically renewed by Certbot every 12 hours. No manual intervention required.

### Manual SSL Renewal

```bash
# Force SSL renewal
./deploy-docker-production.sh --ssl-renew

# Check certificate status
ssh root@72.60.28.175 "docker-compose -f /root/stepperslife-v2-docker/docker-compose.production.yml exec certbot certbot certificates"
```

### Certificate Expiration Check

```bash
# Check expiration date
echo | openssl s_client -servername events.stepperslife.com -connect events.stepperslife.com:443 2>/dev/null | openssl x509 -noout -dates
```

### First-Time SSL Setup (if needed manually)

```bash
ssh root@72.60.28.175
cd /root/stepperslife-v2-docker

docker-compose -f docker-compose.production.yml run --rm certbot \
  certonly --webroot -w /var/www/certbot \
  -d events.stepperslife.com \
  --email admin@stepperslife.com \
  --agree-tos --non-interactive
```

---

## Monitoring & Maintenance

### Check Deployment Status

```bash
# Comprehensive status check
./deploy-docker-production.sh --status

# Shows:
# - Container health
# - SSL certificate status
# - Disk usage
# - Recent logs
```

### View Live Logs

```bash
# Stream logs from all containers
./deploy-docker-production.sh --logs

# View specific container logs
ssh root@72.60.28.175 "cd /root/stepperslife-v2-docker && docker-compose -f docker-compose.production.yml logs -f events-app"
ssh root@72.60.28.175 "cd /root/stepperslife-v2-docker && docker-compose -f docker-compose.production.yml logs -f nginx"
```

### Container Management

```bash
# SSH into VPS
ssh root@72.60.28.175
cd /root/stepperslife-v2-docker

# View running containers
docker-compose -f docker-compose.production.yml ps

# Restart a specific service
docker-compose -f docker-compose.production.yml restart events-app
docker-compose -f docker-compose.production.yml restart nginx

# Stop all services
docker-compose -f docker-compose.production.yml down

# Start all services
docker-compose -f docker-compose.production.yml up -d
```

### Resource Monitoring

```bash
# Check resource usage
ssh root@72.60.28.175 "docker stats --no-stream"

# Check disk usage
ssh root@72.60.28.175 "df -h /root/stepperslife-v2-docker"

# Check Docker disk usage
ssh root@72.60.28.175 "docker system df"
```

### Log Management

Logs are automatically rotated:
- **Application logs**: Max 20MB per file, 10 files retained
- **Nginx logs**: Max 10MB per file, 5 files retained

```bash
# View application logs
ssh root@72.60.28.175 "tail -f /root/stepperslife-v2-docker/logs/app/*.log"

# View Nginx logs
ssh root@72.60.28.175 "tail -f /root/stepperslife-v2-docker/logs/nginx/*.log"
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check container logs for errors
ssh root@72.60.28.175 "cd /root/stepperslife-v2-docker && docker-compose -f docker-compose.production.yml logs events-app"

# Common issues:
# 1. Environment variable missing
# 2. Port already in use
# 3. Insufficient resources
```

### Health Check Failing

```bash
# Test health endpoint directly
ssh root@72.60.28.175 "curl http://localhost:3000/api/health"

# Check if app is running
ssh root@72.60.28.175 "docker-compose -f /root/stepperslife-v2-docker/docker-compose.production.yml exec events-app ps aux"
```

### SSL Certificate Issues

```bash
# Check Nginx configuration
ssh root@72.60.28.175 "docker-compose -f /root/stepperslife-v2-docker/docker-compose.production.yml exec nginx nginx -t"

# Check certificate files
ssh root@72.60.28.175 "ls -la /root/stepperslife-v2-docker/data/ssl/live/events.stepperslife.com/"

# Manually renew
./deploy-docker-production.sh --ssl-renew
```

### 502 Bad Gateway

```bash
# Check if app container is healthy
ssh root@72.60.28.175 "docker-compose -f /root/stepperslife-v2-docker/docker-compose.production.yml ps"

# Check upstream connection
ssh root@72.60.28.175 "docker-compose -f /root/stepperslife-v2-docker/docker-compose.production.yml exec nginx curl http://events-stepperslife-app:3000/api/health"
```

### Database Connection Issues

```bash
# Check Convex connection
# View app logs for Convex errors
ssh root@72.60.28.175 "docker-compose -f /root/stepperslife-v2-docker/docker-compose.production.yml logs events-app | grep -i convex"

# Verify environment variables
ssh root@72.60.28.175 "docker-compose -f /root/stepperslife-v2-docker/docker-compose.production.yml exec events-app env | grep CONVEX"
```

### Out of Disk Space

```bash
# Clean up Docker images and containers
ssh root@72.60.28.175 "docker system prune -a --volumes"

# Remove old logs
ssh root@72.60.28.175 "find /root/stepperslife-v2-docker/logs -name '*.log.*' -mtime +30 -delete"
```

---

## Rollback Procedures

### Automatic Rollback

```bash
# Rollback to previous Git commit
./deploy-docker-production.sh --rollback

# This will:
# 1. Reset Git to HEAD~1
# 2. Rebuild containers
# 3. Restart services
```

### Manual Rollback

```bash
ssh root@72.60.28.175
cd /root/stepperslife-v2-docker

# Find the commit to rollback to
git log --oneline -10

# Rollback to specific commit
git reset --hard <commit-hash>

# Rebuild and restart
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d --force-recreate
```

### Rollback to Previous Image

```bash
# List previous Docker images
ssh root@72.60.28.175 "docker images | grep events-stepperslife-app"

# Tag and use previous image
ssh root@72.60.28.175 "docker tag <old-image-id> events-stepperslife-app:latest"
ssh root@72.60.28.175 "cd /root/stepperslife-v2-docker && docker-compose -f docker-compose.production.yml up -d --force-recreate"
```

---

## Security Best Practices

### Environment Variables

✅ **Never commit `.env.production` to Git**
✅ **Use strong random secrets** (32+ characters)
✅ **Restrict file permissions**: `chmod 600 .env.production`
✅ **Rotate secrets regularly** (every 90 days)

```bash
# Generate secure secrets
openssl rand -base64 32
```

### SSH Security

```bash
# Use SSH keys instead of passwords
# Disable root password login
# Enable fail2ban for brute force protection
```

### Docker Security

✅ **Run containers as non-root user** (already configured)
✅ **Resource limits set** (CPU: 1.5 cores, Memory: 1GB)
✅ **Read-only file systems where possible**
✅ **Security headers enabled** in Nginx

### SSL/TLS

✅ **TLS 1.2 and 1.3 only** (older versions disabled)
✅ **Strong cipher suites**
✅ **HSTS enabled** (max-age: 1 year)
✅ **OCSP stapling** for better performance

### Firewall Configuration

```bash
# Allow only necessary ports
ssh root@72.60.28.175

ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw enable
```

### Regular Updates

```bash
# Update system packages monthly
ssh root@72.60.28.175
apt update && apt upgrade -y

# Update Docker images
cd /root/stepperslife-v2-docker
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d
```

---

## Backup Procedures

### What to Backup

1. **Convex Database** - Managed by Convex (automatic backups)
2. **Uploaded Files** - `/root/stepperslife-v2-docker/data/stepfiles`
3. **SSL Certificates** - `/root/stepperslife-v2-docker/data/ssl`
4. **Environment Variables** - `.env.production`

### Backup Script

```bash
#!/bin/bash
# backup-production.sh

BACKUP_DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/root/backups/stepperslife-${BACKUP_DATE}"

ssh root@72.60.28.175 "mkdir -p ${BACKUP_DIR}"

# Backup uploaded files
ssh root@72.60.28.175 "tar -czf ${BACKUP_DIR}/stepfiles.tar.gz /root/stepperslife-v2-docker/data/stepfiles"

# Backup SSL certificates
ssh root@72.60.28.175 "tar -czf ${BACKUP_DIR}/ssl.tar.gz /root/stepperslife-v2-docker/data/ssl"

# Backup environment file (encrypted)
ssh root@72.60.28.175 "gpg --encrypt --recipient admin@stepperslife.com /root/stepperslife-v2-docker/.env.production > ${BACKUP_DIR}/env.production.gpg"

echo "Backup complete: ${BACKUP_DIR}"
```

### Restore Procedure

```bash
# Restore uploaded files
ssh root@72.60.28.175 "tar -xzf /root/backups/stepperslife-YYYY-MM-DD/stepfiles.tar.gz -C /"

# Restore SSL certificates
ssh root@72.60.28.175 "tar -xzf /root/backups/stepperslife-YYYY-MM-DD/ssl.tar.gz -C /"

# Restart containers
ssh root@72.60.28.175 "cd /root/stepperslife-v2-docker && docker-compose -f docker-compose.production.yml restart"
```

---

## Additional Resources

- **Convex Dashboard**: https://dashboard.convex.dev/
- **Docker Documentation**: https://docs.docker.com/
- **Let's Encrypt**: https://letsencrypt.org/
- **Next.js Production Checklist**: https://nextjs.org/docs/deployment

---

## Support

For deployment issues:

1. Check this documentation
2. Review container logs: `./deploy-docker-production.sh --logs`
3. Check deployment status: `./deploy-docker-production.sh --status`
4. Review troubleshooting section above

---

**Last Updated**: 2025-11-18
**Version**: 1.0.0
**Maintainer**: SteppersLife Development Team
