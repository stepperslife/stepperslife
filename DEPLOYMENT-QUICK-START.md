# SteppersLife Blue/Green Deployment - Quick Start Guide

## One-Time Setup (5 minutes)

### 1. Configure Deployment Settings

```bash
# Copy the example file
cp .env.deployment.example .env.deployment

# Edit with your VPS details
nano .env.deployment
```

Required values:
- `VPS_USER`: Your VPS SSH user (usually `root`)
- `VPS_HOST`: Your VPS IP address
- `DOMAIN`: Your domain name (stepperslife.com)

### 2. Prepare Production Environment

```bash
# Copy your production environment file
cp .env.production.example .env.production

# Edit with your production secrets
nano .env.production
```

### 3. Setup VPS (One Time)

```bash
# Run the automated setup script
./setup-vps.sh
```

This installs Docker, Nginx, and configures everything.

### 4. Get SSL Certificates

```bash
# SSH into VPS
ssh root@your-vps-ip

# Get Let's Encrypt certificates
sudo certbot --nginx -d stepperslife.com -d www.stepperslife.com
```

## Daily Usage

### Deploy to Production

```bash
./deploy.sh
```

That's it! The script will:
- Commit and push your changes
- Build Docker image (linux/amd64)
- Transfer to VPS
- Deploy to inactive environment
- Run health checks
- Switch traffic (zero downtime)
- Stop old container

### Rollback if Needed

```bash
./rollback.sh
```

Instantly switches back to previous version.

## Quick Commands

### View Logs

```bash
# SSH into VPS
ssh root@your-vps-ip

# View logs for active container
docker logs -f stepperlife-blue    # or stepperlife-green
```

### Check Status

```bash
# Current active environment
ssh root@your-vps-ip cat /var/www/stepperlife/current-env

# Container status
ssh root@your-vps-ip docker ps | grep stepperlife
```

### Test Health Endpoint

```bash
# From internet
curl https://stepperslife.com/health

# From VPS
ssh root@your-vps-ip curl http://localhost:3001/health
```

## Troubleshooting

### Deployment Fails

1. Check container logs:
   ```bash
   ssh root@your-vps-ip docker logs stepperlife-blue
   ```

2. Verify .env file:
   ```bash
   ssh root@your-vps-ip cat /var/www/stepperlife/.env
   ```

3. Run rollback:
   ```bash
   ./rollback.sh
   ```

### Can't Connect to VPS

```bash
# Test connection
ssh root@your-vps-ip echo "Connected"

# Check .env.deployment settings
cat .env.deployment
```

## File Structure

```
stepperslife/
├── deploy.sh                    # Main deployment script
├── rollback.sh                  # Rollback script
├── setup-vps.sh                 # One-time VPS setup
├── .env.deployment              # VPS connection config
├── .env.production              # Production environment vars
├── nginx-vps.conf              # Nginx main config
├── nginx-site.conf             # Nginx site config
├── DEPLOYMENT.md               # Full documentation
└── DEPLOYMENT-QUICK-START.md   # This file
```

## Support

- Full docs: See `DEPLOYMENT.md`
- Issues: Check troubleshooting section
- Logs: `ssh root@your-vps-ip docker logs stepperlife-blue`

---

**Ready to deploy?** Run `./deploy.sh` 🚀
