# SteppersLife Complete Website Backup

## Backup Information
- **Date Created**: November 18, 2025 10:56:59 AM
- **Backup ID**: 2025-11-18-105659
- **Project**: SteppersLife Events Platform
- **Repository**: https://github.com/iradwatkins/event.stepperslife.v2.git

## Contents

### 1. source-code.tar.gz (8.9MB)
Complete source code excluding:
- node_modules (reinstall with `npm install`)
- .next (rebuild with `npm run build`)
- test-results, build artifacts
- .git directory

### 2. environment-backup.tar.gz
Contains sensitive API keys and credentials:
- .env (production environment variables)
- .env.local (development environment variables)

**⚠️ CRITICAL SECURITY WARNING**: This file contains:
- Payment processor keys (Square, Stripe, PayPal)
- OAuth credentials (Google)
- JWT secrets and authentication keys
- API keys (Resend, Gemini, etc.)

**IMPORTANT**: This backup is NOT encrypted. For security:
1. Encrypt this file immediately: `zip -er environment-secrets.zip environment-backup.tar.gz`
2. Delete the unencrypted version
3. Store the password in a secure password manager

### 3. convex-export.zip
Complete database export from Convex including:
- All database tables (users, events, tickets, orders, payments, etc.)
- User data and authentication records
- Event listings and configurations
- Payment records and transactions
- **File storage** (event images, user uploads)

**Source**: https://dazzling-mockingbird-241.convex.cloud

### 4. package.json & package-lock.json
Exact dependency versions for reproducible builds

### 5. npm-packages.txt
Complete list of all installed packages and versions

### 6. git-*.txt files
Git repository state information:
- git-last-commit.txt: Last commit hash and message
- git-status.txt: Current repository status
- git-remotes.txt: Remote repository URLs

## Deployment Information

### Convex Cloud Database
- **Production**: https://neighborly-swordfish-681.convex.cloud
- **Development**: https://dazzling-mockingbird-241.convex.cloud
- **Exported From**: Development deployment (dazzling-mockingbird-241)

### VPS Server
- **IP Address**: 72.60.28.175
- **SSH Alias**: events-production
- **Deployment Path**: /root/stepperslife-v2-docker
- **Method**: Docker Compose

### Domain
- **Production URL**: https://events.stepperslife.com

### Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: Convex (Cloud NoSQL with real-time sync)
- **UI Library**: React 19, shadcn/ui, Tailwind CSS
- **Authentication**: Convex Auth (JWT-based)
- **Payment Processors**:
  - Square (organizer payments)
  - Stripe (customer checkout)
  - PayPal (alternative payment method)
- **Email Service**: Resend
- **AI Integration**: Google Gemini
- **Runtime**: Node.js 22

## Restoration Instructions

### Prerequisites
- Ubuntu 22.04+ or similar Linux distribution
- Docker and Docker Compose installed
- Node.js 22 installed
- Domain DNS configured to point to server

### Quick Restore Steps

1. **Extract Backup**
   ```bash
   tar -xzf stepperslife-complete-backup-2025-11-18-105659.tar.gz
   cd 2025-11-18-105659/
   ```

2. **Restore Source Code**
   ```bash
   mkdir -p /root/stepperslife-v2-docker
   tar -xzf source-code.tar.gz -C /root/stepperslife-v2-docker
   ```

3. **Restore Environment Variables**
   ```bash
   # Extract environment files
   tar -xzf environment-backup.tar.gz
   cp env-temp/.env.production /root/stepperslife-v2-docker/.env
   cp env-temp/.env.local /root/stepperslife-v2-docker/src/events-stepperslife/.env.local
   rm -rf env-temp/  # Clean up
   ```

4. **Install Dependencies**
   ```bash
   cd /root/stepperslife-v2-docker/src/events-stepperslife
   npm install
   ```

5. **Restore Convex Database**

   **Option A**: Import to New Deployment (Recommended for new infrastructure)
   ```bash
   cd /root/stepperslife-v2-docker/src/events-stepperslife

   # Initialize new Convex deployment
   npx convex init

   # Import the database and files
   npx convex import ../../../2025-11-18-105659/convex-export.zip

   # Update environment variables with new Convex URL
   # Edit .env and .env.local to point to your new deployment
   ```

   **Option B**: Use Existing Production Deployment
   - If restoring to same infrastructure, data already exists
   - Just ensure CONVEX_URL in .env points to: https://neighborly-swordfish-681.convex.cloud

6. **Deploy with Docker**
   ```bash
   cd /root/stepperslife-v2-docker
   docker compose build
   docker compose up -d
   ```

7. **Verify Deployment**
   ```bash
   # Check containers
   docker compose ps

   # Check logs
   docker compose logs -f events-app

   # Test the website
   curl https://events.stepperslife.com
   ```

## Database Schema (30+ Tables)

The Convex database includes:
- `users` - User accounts & profiles
- `events` - Event listings
- `tickets` - Individual tickets with QR codes
- `ticketTiers` - Pricing tiers & inventory
- `orders` - Purchase transactions
- `ticketBundles` - Package deals
- `eventStaff` - Staff assignments & commissions
- `eventPaymentConfig` - Payment processor settings
- `seatingCharts` - Venue layouts
- `organizerCredits` - Prepaid ticket system
- `discountCodes` - Promotional codes
- `products` - Merchandise
- And 18+ more tables...

## File Storage

The Convex export includes all uploaded files:
- Event flyer images
- Event cover photos
- User profile pictures
- Organizer logos
- Custom graphics

## Security Notes

### ⚠️ CRITICAL: Protect This Backup

This backup contains:
- **Live payment processor credentials** worth thousands of dollars
- **OAuth secrets** for Google authentication
- **JWT tokens** and session secrets
- **API keys** for email, AI, and other services

### Immediate Security Steps Required:

1. **Encrypt the environment files**:
   ```bash
   cd ~/stepperslife-backups/2025-11-18-105659
   zip -er environment-secrets.zip environment-backup.tar.gz
   # Enter a strong password when prompted
   # Store password in 1Password, LastPass, or similar
   rm environment-backup.tar.gz  # Delete unencrypted version
   ```

2. **Secure storage**:
   - Do NOT upload unencrypted to cloud storage
   - Do NOT commit to version control
   - Do NOT share via email or messaging apps
   - Store in encrypted cloud storage (AWS S3 with encryption, etc.)

3. **If backup is compromised**:
   - Immediately rotate all API keys:
     - Square: https://developer.squareup.com
     - Stripe: https://dashboard.stripe.com
     - PayPal: https://developer.paypal.com
     - Google OAuth: https://console.cloud.google.com
     - Resend: https://resend.com
     - Gemini: https://makersuite.google.com

### Credential Rotation Schedule
- **Immediately**: If backup is compromised
- **Quarterly**: Recommended for production systems
- **After team changes**: When developers leave the team

## Backup Verification

### Verify Archive Integrity
```bash
# Check file sizes
ls -lh

# Test source code extraction
tar -tzf source-code.tar.gz | head -20

# Verify Convex export
unzip -l convex-export.zip | head -20
```

### Expected File Sizes
- source-code.tar.gz: ~8-10MB
- environment-backup.tar.gz: ~10KB
- convex-export.zip: Variable (depends on uploaded content)
- Total backup: ~10-100MB (without large media files)

## Restoration Testing

It's recommended to test restoration annually:
1. Spin up a test server
2. Follow restoration instructions
3. Verify all functionality:
   - User authentication
   - Event browsing
   - Ticket purchase flow
   - Payment processing (use test mode)
   - File uploads
   - Email sending

## Support & Documentation

### Additional Resources
- **Main Repository**: https://github.com/iradwatkins/event.stepperslife.v2
- **Convex Docs**: https://docs.convex.dev
- **Next.js Docs**: https://nextjs.org/docs
- **Deployment Guide**: See docker-compose.yml and deployment scripts

### For Help
- Check README.md in the source code
- Review deployment scripts in the backup
- Consult Convex documentation for database restoration

## Maintenance Recommendations

### Backup Frequency
- **Source Code**: Continuous (use Git)
- **Database**:
  - Daily for production systems
  - Weekly minimum for development
- **Environment Variables**: After any credential changes
- **Full Backup**: Weekly recommended

### Version Control
- Keep last 4 weeks of backups (rolling)
- Archive monthly snapshots
- Test restoration quarterly

### Monitoring
After restoration, monitor:
- Convex function execution
- Payment processor webhooks
- Email delivery
- File upload functionality
- Authentication flows

---

## Backup Contents Summary

✅ **Included in this backup**:
- Complete source code (8.9MB)
- All environment variables and secrets
- Complete Convex database export with file storage
- Package dependencies list
- Git repository state
- Deployment configuration
- This documentation

❌ **Not included** (regenerable):
- node_modules (973MB) - run `npm install`
- .next build output - run `npm run build`
- Test results
- Git history (use GitHub as source)

---

**Backup Created**: November 18, 2025 10:56:59 AM
**Backup ID**: 2025-11-18-105659
**Total Size**: ~10-20MB compressed
**Restoration Time**: 30-60 minutes
**Valid Until**: Indefinitely (keep credentials current)

**⚠️ REMEMBER**: Encrypt the environment-backup.tar.gz file immediately for security!
