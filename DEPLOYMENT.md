# SteppersLife Blue/Green Deployment Guide

Complete guide for zero-downtime blue/green deployment on your VPS using Docker.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Deployment Workflow](#deployment-workflow)
- [Rollback Procedure](#rollback-procedure)
- [Troubleshooting](#troubleshooting)
- [Advanced Usage](#advanced-usage)

## Overview

This blue/green deployment system enables zero-downtime deployments by maintaining two identical production environments (blue and green). Traffic is routed to one environment while the other is updated, then switched atomically.

### Key Features

- **Zero Downtime**: Traffic switches instantly between environments
- **Automatic Rollback**: Failed deployments automatically revert to the previous version
- **Health Checks**: New deployments are validated before receiving traffic
- **Simple Workflow**: One command to deploy: `./deploy.sh`
- **Quick Rollback**: One command to rollback: `./rollback.sh`
- **Platform Compatible**: Builds for linux/amd64 from Mac M4 Pro

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    Nginx     │
                    │ Reverse Proxy│
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
    ┌──────────────────┐      ┌──────────────────┐
    │   Blue Container │      │  Green Container │
    │  stepperlife-blue│      │ stepperlife-green│
    │   Port: 3001     │      │   Port: 3002     │
    └──────────────────┘      └──────────────────┘
```

### Components

1. **Nginx**: Routes traffic to active environment based on `/etc/nginx/conf.d/active-env.conf`
2. **Blue Container**: One production environment on port 3001
3. **Green Container**: Alternate production environment on port 3002
4. **Docker Network**: `app-network` connects containers

## Prerequisites

### Local Machine

- Docker Desktop installed and running
- Git configured with remote repository
- SSH access to your VPS
- macOS (for Mac M4 Pro) or Linux

### VPS Requirements

- Ubuntu 20.04+ or Debian 11+
- Root or sudo access
- Minimum 2GB RAM, 2 CPU cores
- 20GB available disk space
- Ports 22, 80, 443 open

## Initial Setup

### Step 1: Configure Environment Variables

Create `.env.deployment` in your project root:

```bash
# VPS Configuration
VPS_USER="root"
VPS_HOST="your-vps-ip-address"
VPS_DIR="/var/www/stepperlife"
VPS_PORT="22"

# Application Configuration
DOMAIN="stepperslife.com"

# Git Configuration
GIT_REMOTE="origin"
GIT_BRANCH="main"
```

### Step 2: Prepare Production Environment File

Create `.env.production` with your production environment variables:

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Authentication
NEXTAUTH_URL="https://stepperslife.com"
NEXTAUTH_SECRET="your-secret-here"

# Convex
NEXT_PUBLIC_CONVEX_URL="https://your-deployment.convex.cloud"
CONVEX_DEPLOYMENT="your-deployment"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# PayPal
PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."

# Add all other production environment variables
```

### Step 3: Ensure Health Endpoint Exists

Your Next.js app must have a health check endpoint at `/health` or `/api/health`:

```typescript
// app/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
}
```

Or for pages router:

```typescript
// pages/api/health.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
}
```

### Step 4: Run VPS Setup

Execute the one-time VPS setup script:

```bash
./setup-vps.sh
```

This will:
- Install Docker and Nginx
- Create directory structure
- Upload Nginx configuration
- Configure firewall
- Upload .env file to VPS

### Step 5: Obtain SSL Certificates

SSH into your VPS and run:

```bash
ssh root@your-vps-ip
sudo certbot --nginx -d stepperslife.com -d www.stepperslife.com
```

Follow the prompts to obtain Let's Encrypt certificates.

## Deployment Workflow

### Standard Deployment

Deploy your application with a single command:

```bash
./deploy.sh
```

### What Happens During Deployment

1. **Git Operations** ✓
   - Commits all changes with timestamp
   - Pushes to remote repository

2. **Docker Build** ✓
   - Builds image for linux/amd64 platform
   - Tags as `stepperlife:blue` or `stepperlife:green`

3. **Image Transfer** ✓
   - Saves Docker image to .tar file
   - Transfers to VPS via SCP
   - Loads image on VPS
   - Cleans up local .tar file

4. **Container Deployment** ✓
   - Stops old container in target environment
   - Starts new container with latest image
   - Connects to app-network
   - Loads environment variables from .env

5. **Health Check** ✓
   - Waits 5 seconds for startup
   - Polls /health endpoint every 2 seconds
   - Maximum wait time: 30 seconds
   - Proceeds if health check passes

6. **Traffic Switch** ✓
   - Updates nginx configuration
   - Tests nginx config validity
   - Reloads nginx (zero downtime)
   - Traffic now flows to new environment

7. **Cleanup** ✓
   - Waits 30 seconds for connection drain
   - Stops old container
   - Deployment complete!

### Deployment Output Example

```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║      SteppersLife Blue/Green Deployment Script         ║
║                                                        ║
╚════════════════════════════════════════════════════════╝

[INFO] Current active environment: blue
[INFO] Deploying to environment: green

Continue with deployment? [y/N]: y

==> Committing and pushing changes to Git

[INFO] Staging all changes...
[INFO] Creating commit...
[SUCCESS] Changes committed
[INFO] Pushing to origin/main...
[SUCCESS] Changes pushed to remote

==> Building Docker image: stepperlife:green

[INFO] Building for linux/amd64 platform (VPS compatibility)...
[SUCCESS] Docker image built: stepperlife:green

==> Transferring Docker image to VPS

[INFO] Saving Docker image to file...
[SUCCESS] Image saved: stepperlife-green.tar
[INFO] Transferring to VPS...
[SUCCESS] Image transferred

==> Loading Docker image on VPS

[SUCCESS] Image loaded on VPS

==> Deploying container: stepperlife-green

[SUCCESS] Container deployed: stepperlife-green

==> Running health check for green environment

[INFO] Waiting for application to start...
[INFO] Health check attempt 1...
[SUCCESS] Health check passed! Application is healthy

==> Switching nginx traffic to green

[SUCCESS] Traffic switched to green environment

==> Gracefully stopping old container

[INFO] Waiting 30s for connections to drain...
[SUCCESS] Old container stopped: stepperlife-blue

╔════════════════════════════════════════════════════════╗
║                                                        ║
║            🎉  DEPLOYMENT SUCCESSFUL! 🎉               ║
║                                                        ║
╚════════════════════════════════════════════════════════╝

Deployment Summary:
  • Environment: green
  • Container: stepperlife-green
  • Port: 3002
  • Duration: 127s
  • Status: ACTIVE

Access your application:
  • https://stepperslife.com

Note: Old container (blue) has been stopped
Tip: If issues occur, run ./rollback.sh to revert
```

## Rollback Procedure

If issues are detected after deployment, quickly rollback to the previous version:

```bash
./rollback.sh
```

### What Happens During Rollback

1. Detects current active environment
2. Checks if previous container is running
3. Starts previous container if stopped
4. Switches nginx traffic back
5. Stops current (failed) container

### Rollback Output Example

```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║         SteppersLife Rollback Script                   ║
║                                                        ║
╚════════════════════════════════════════════════════════╝

[INFO] Current active environment: green
[INFO] Will rollback to environment: blue
[INFO] Previous container status: stopped

This will switch traffic from green to blue
Continue with rollback? [y/N]: y

==> Previous container is stopped, starting it...

[INFO] Starting container: stepperlife-blue
[SUCCESS] Container started

==> Switching nginx to blue environment

[SUCCESS] Nginx switched to blue

╔════════════════════════════════════════════════════════╗
║                                                        ║
║            ✓  ROLLBACK SUCCESSFUL! ✓                   ║
║                                                        ║
╚════════════════════════════════════════════════════════╝

Rollback Summary:
  • Rolled back from: green
  • Active environment: blue
  • Container: stepperlife-blue
  • Status: ACTIVE

Access your application:
  • https://stepperslife.com
```

## Troubleshooting

### Health Check Fails

**Problem**: Deployment fails at health check stage

**Solutions**:

1. Check container logs:
   ```bash
   ssh root@your-vps-ip
   docker logs stepperlife-blue  # or stepperlife-green
   ```

2. Verify health endpoint locally:
   ```bash
   curl http://localhost:3000/health
   ```

3. Check environment variables:
   ```bash
   ssh root@your-vps-ip
   cat /var/www/stepperlife/.env
   ```

4. Manually test container:
   ```bash
   ssh root@your-vps-ip
   docker exec stepperlife-green curl http://localhost:3000/health
   ```

### Docker Build Fails

**Problem**: Image build fails on local machine

**Solutions**:

1. Check Dockerfile syntax
2. Ensure all dependencies are in package.json
3. Verify build context (should be project root)
4. Try building manually:
   ```bash
   docker build --platform linux/amd64 -t stepperlife:test .
   ```

### SSH Connection Issues

**Problem**: Cannot connect to VPS

**Solutions**:

1. Verify VPS IP address:
   ```bash
   ping your-vps-ip
   ```

2. Check SSH key permissions:
   ```bash
   chmod 600 ~/.ssh/id_rsa
   ```

3. Test SSH connection:
   ```bash
   ssh -v root@your-vps-ip
   ```

4. Verify firewall allows port 22

### Nginx Configuration Errors

**Problem**: Nginx fails to reload

**Solutions**:

1. Test nginx config on VPS:
   ```bash
   ssh root@your-vps-ip
   nginx -t
   ```

2. Check nginx error logs:
   ```bash
   ssh root@your-vps-ip
   tail -f /var/log/nginx/error.log
   ```

3. Verify active-env.conf exists:
   ```bash
   ssh root@your-vps-ip
   cat /etc/nginx/conf.d/active-env.conf
   ```

### Container Won't Start

**Problem**: Container starts then immediately stops

**Solutions**:

1. Check container logs:
   ```bash
   docker logs stepperlife-blue
   ```

2. Verify .env file on VPS:
   ```bash
   cat /var/www/stepperlife/.env
   ```

3. Check Docker network:
   ```bash
   docker network ls
   docker network inspect app-network
   ```

4. Try running container interactively:
   ```bash
   docker run -it --rm stepperlife:blue sh
   ```

### Both Containers Running

**Problem**: Both blue and green containers are active

**Solutions**:

1. Check which environment is active:
   ```bash
   ssh root@your-vps-ip
   cat /var/www/stepperlife/current-env
   ```

2. Stop the inactive container:
   ```bash
   ssh root@your-vps-ip
   docker stop stepperlife-blue  # or stepperlife-green
   ```

## Advanced Usage

### Manual Deployment to Specific Environment

Force deployment to a specific environment:

```bash
# Edit deploy.sh and modify the get_next_env function
# Or manually set on VPS before deploying
ssh root@your-vps-ip
echo "blue" > /var/www/stepperlife/current-env
```

Then run deployment normally.

### Checking Current Environment

```bash
ssh root@your-vps-ip
cat /var/www/stepperlife/current-env
```

### Viewing Container Status

```bash
ssh root@your-vps-ip
docker ps -a | grep stepperlife
```

### Viewing Application Logs

```bash
ssh root@your-vps-ip

# Real-time logs
docker logs -f stepperlife-blue

# Last 100 lines
docker logs --tail 100 stepperlife-green

# With timestamps
docker logs -f --timestamps stepperlife-blue
```

### Manually Switching Traffic

```bash
ssh root@your-vps-ip

# Switch to blue
echo "set \$active_env blue;" > /etc/nginx/conf.d/active-env.conf
echo "blue" > /var/www/stepperlife/current-env
nginx -t && nginx -s reload

# Switch to green
echo "set \$active_env green;" > /etc/nginx/conf.d/active-env.conf
echo "green" > /var/www/stepperlife/current-env
nginx -t && nginx -s reload
```

### Testing Health Endpoint

```bash
# From VPS
ssh root@your-vps-ip
curl http://localhost:3001/health  # Blue
curl http://localhost:3002/health  # Green

# Through nginx
curl https://stepperslife.com/health
```

### Cleaning Up Old Images

```bash
ssh root@your-vps-ip

# List all images
docker images | grep stepperlife

# Remove specific image
docker rmi stepperlife:blue

# Remove dangling images
docker image prune -f
```

### Database Migrations

If you need to run database migrations:

```bash
# Option 1: Run migrations in container
ssh root@your-vps-ip
docker exec stepperlife-blue npm run db:migrate

# Option 2: Run before container starts
# Add migration command to Dockerfile or startup script
```

### Environment-Specific Configuration

If you need different configs for blue/green:

```bash
# Create separate env files
ssh root@your-vps-ip
cp /var/www/stepperlife/.env /var/www/stepperlife/.env.blue
cp /var/www/stepperlife/.env /var/www/stepperlife/.env.green

# Modify deploy.sh to use correct env file:
# --env-file $VPS_DIR/.env.${env}
```

### Monitoring and Alerts

Set up monitoring:

```bash
# Install monitoring tools on VPS
ssh root@your-vps-ip
apt-get install -y prometheus-node-exporter

# Monitor container health
docker stats stepperlife-blue stepperlife-green

# Set up log aggregation
docker logs stepperlife-blue 2>&1 | grep ERROR
```

## Maintenance

### Regular Tasks

1. **Update SSL Certificates**: Certbot auto-renews, but verify:
   ```bash
   ssh root@your-vps-ip
   certbot renew --dry-run
   ```

2. **Clean Docker Resources**: Weekly cleanup:
   ```bash
   ssh root@your-vps-ip
   docker system prune -f
   ```

3. **Backup Environment Files**:
   ```bash
   scp root@your-vps-ip:/var/www/stepperlife/.env ./backups/.env.$(date +%Y%m%d)
   ```

4. **Monitor Disk Space**:
   ```bash
   ssh root@your-vps-ip
   df -h
   ```

### Security Best Practices

1. Keep VPS updated:
   ```bash
   ssh root@your-vps-ip
   apt-get update && apt-get upgrade -y
   ```

2. Use SSH keys (disable password auth)
3. Keep .env files secure (never commit to git)
4. Regularly rotate secrets
5. Monitor nginx access logs for suspicious activity

## Files Reference

### Local Files

- `deploy.sh` - Main deployment script
- `rollback.sh` - Rollback script
- `setup-vps.sh` - One-time VPS setup
- `nginx-vps.conf` - Main nginx configuration
- `nginx-site.conf` - Site-specific nginx config
- `.env.deployment` - Deployment configuration
- `.env.production` - Production environment variables

### VPS Files

- `/var/www/stepperlife/.env` - Application environment variables
- `/var/www/stepperlife/current-env` - Active environment marker (blue/green)
- `/etc/nginx/nginx.conf` - Main nginx configuration
- `/etc/nginx/conf.d/stepperslife.conf` - Site configuration
- `/etc/nginx/conf.d/active-env.conf` - Active environment variable
- `/var/log/nginx/access.log` - Nginx access logs
- `/var/log/nginx/error.log` - Nginx error logs

## Support

For issues or questions:

1. Check this guide's troubleshooting section
2. Review container logs
3. Verify VPS configuration
4. Check nginx configuration

---

**Happy Deploying!** 🚀
