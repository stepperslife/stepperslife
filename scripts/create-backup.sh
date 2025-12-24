#!/bin/bash

# SteppersLife Complete Backup Script
# Creates a timestamped backup of the entire project

set -e

# Configuration
BACKUP_DIR="$HOME/Desktop/stepperslife-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="stepperslife_backup_$TIMESTAMP"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "========================================"
echo "SteppersLife Complete Backup"
echo "========================================"
echo "Timestamp: $TIMESTAMP"
echo "Project: $PROJECT_DIR"
echo "Backup to: $BACKUP_DIR/$BACKUP_NAME"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create temporary directory for backup
TEMP_DIR=$(mktemp -d)
BACKUP_TEMP="$TEMP_DIR/$BACKUP_NAME"
mkdir -p "$BACKUP_TEMP"

echo "1. Copying source code..."
# Copy everything except node_modules, .next, and other generated files
rsync -av --progress "$PROJECT_DIR/" "$BACKUP_TEMP/code/" \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude 'test-results' \
  --exclude '.vercel' \
  --exclude 'convex/_generated' \
  --exclude '*.log' \
  --exclude '.git' \
  --exclude 'playwright-report'

echo ""
echo "2. Exporting git history..."
cd "$PROJECT_DIR"
git bundle create "$BACKUP_TEMP/repository.bundle" --all
echo "   Git bundle created"

echo ""
echo "3. Creating environment template..."
cat > "$BACKUP_TEMP/env.template" << 'ENVTEMPLATE'
# SteppersLife Environment Variables Template
# Copy this to .env.local and fill in your values

# Convex (Get from Convex dashboard)
CONVEX_DEPLOYMENT=prod:expert-vulture-775
NEXT_PUBLIC_CONVEX_URL=https://expert-vulture-775.convex.cloud

# Authentication - RSA Keys (Generate new ones for security)
AUTH_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
YOUR_PRIVATE_KEY_HERE
-----END RSA PRIVATE KEY-----"
AUTH_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
YOUR_PUBLIC_KEY_HERE
-----END PUBLIC KEY-----"
AUTH_KEY_ID=stepperslife-auth-key-1
AUTH_ISSUER=https://stepperslife.com

# Stripe (Get from Stripe dashboard)
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# PayPal (Get from PayPal developer dashboard)
PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx
PAYPAL_WEBHOOK_ID=xxx
PAYPAL_MODE=live

# Resend Email (Get from Resend dashboard)
RESEND_API_KEY=re_xxx
EMAIL_FROM=SteppersLife <noreply@stepperslife.com>

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Sentry (Optional - Get from Sentry dashboard)
SENTRY_DSN=xxx

# Site URL
NEXT_PUBLIC_SITE_URL=https://stepperslife.com
ENVTEMPLATE

echo ""
echo "4. Creating restore instructions..."
cat > "$BACKUP_TEMP/RESTORE.md" << 'RESTORE'
# SteppersLife Restore Instructions

## Prerequisites
- Node.js 20+
- Git
- Convex CLI
- Vercel CLI

## Step 1: Extract Code
```bash
# The code/ directory contains the full source
cd code/
```

## Step 2: Restore Git History (Optional)
```bash
# If you want full git history:
git clone repository.bundle stepperslife
cd stepperslife
```

## Step 3: Install Dependencies
```bash
npm install
npx playwright install  # For E2E tests
```

## Step 4: Configure Environment
1. Copy `env.template` to `.env.local`
2. Fill in all required values (see BACKUP-REBUILD-GUIDE.md)

## Step 5: Setup Convex
```bash
npx convex login
npx convex deploy
```

## Step 6: Setup Vercel
```bash
vercel link
# Add all environment variables to Vercel
vercel env add CONVEX_DEPLOYMENT
# ... add other vars
```

## Step 7: Deploy
```bash
vercel --prod
```

## Step 8: Configure Webhooks
- Stripe: Add webhook endpoint in Stripe dashboard
- PayPal: Add webhook endpoint in PayPal dashboard

## Verification
```bash
# Run E2E tests to verify
BASE_URL=https://your-domain.com npx playwright test
```

See BACKUP-REBUILD-GUIDE.md for detailed instructions.
RESTORE

echo ""
echo "5. Including documentation..."
cp "$PROJECT_DIR/BACKUP-REBUILD-GUIDE.md" "$BACKUP_TEMP/"
cp "$PROJECT_DIR/AI-REBUILD-PROMPT.md" "$BACKUP_TEMP/"
cp "$PROJECT_DIR/CLAUDE.md" "$BACKUP_TEMP/" 2>/dev/null || true

echo ""
echo "6. Creating backup archive..."
cd "$TEMP_DIR"
zip -r "$BACKUP_DIR/$BACKUP_NAME.zip" "$BACKUP_NAME" -x "*.DS_Store"

# Calculate sizes
CODE_SIZE=$(du -sh "$BACKUP_TEMP/code" | cut -f1)
ZIP_SIZE=$(du -sh "$BACKUP_DIR/$BACKUP_NAME.zip" | cut -f1)

echo ""
echo "========================================"
echo "BACKUP COMPLETE"
echo "========================================"
echo ""
echo "Backup location: $BACKUP_DIR/$BACKUP_NAME.zip"
echo "Source code size: $CODE_SIZE"
echo "Archive size: $ZIP_SIZE"
echo ""
echo "Contents:"
echo "  - code/          Full source code (without node_modules)"
echo "  - repository.bundle   Complete git history"
echo "  - env.template        Environment variables template"
echo "  - RESTORE.md          Restore instructions"
echo "  - BACKUP-REBUILD-GUIDE.md   Full documentation"
echo "  - AI-REBUILD-PROMPT.md      AI context document"
echo ""
echo "To restore from this backup, see RESTORE.md inside the archive."
echo ""

# Cleanup
rm -rf "$TEMP_DIR"

# Open backup folder
open "$BACKUP_DIR" 2>/dev/null || echo "Backup saved to: $BACKUP_DIR"
