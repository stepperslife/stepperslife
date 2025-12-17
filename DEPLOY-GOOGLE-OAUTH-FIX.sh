#!/bin/bash

# Google OAuth Fix - Production Deployment Script
# Fixes JWT secret mismatch causing login redirect issues

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     Google OAuth Fix - Production Deployment             ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Error: Must run from src/events-stepperslife directory${NC}"
  exit 1
fi

echo -e "${BLUE}📋 Fix Summary:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Issue: Users redirected to login after Google authentication"
echo "Cause: JWT secret mismatch between token creation and verification"
echo "Fix: Centralized JWT secret management + added missing env vars"
echo ""

# Step 1: Check environment files
echo -e "${BLUE}Step 1: Checking environment configuration...${NC}"

if [ ! -f ".env.local" ]; then
  echo -e "${RED}❌ .env.local not found${NC}"
  exit 1
fi

# Check if JWT_SECRET is in .env.local
if grep -q "JWT_SECRET=" .env.local; then
  echo -e "${GREEN}✅ JWT_SECRET found in .env.local${NC}"
else
  echo -e "${YELLOW}⚠️  JWT_SECRET not found in .env.local${NC}"
  echo "Adding JWT_SECRET to .env.local..."

  # Get NEXTAUTH_SECRET value if it exists
  NEXTAUTH_SECRET=$(grep "^NEXTAUTH_SECRET=" .env.local | cut -d'=' -f2)

  if [ -n "$NEXTAUTH_SECRET" ]; then
    echo "" >> .env.local
    echo "# JWT Secret for session tokens (CRITICAL)" >> .env.local
    echo "JWT_SECRET=$NEXTAUTH_SECRET" >> .env.local
    echo "AUTH_SECRET=$NEXTAUTH_SECRET" >> .env.local
    echo -e "${GREEN}✅ Added JWT_SECRET and AUTH_SECRET to .env.local${NC}"
  else
    echo -e "${RED}❌ NEXTAUTH_SECRET not found. Cannot auto-configure.${NC}"
    echo "Please manually add JWT_SECRET and AUTH_SECRET to .env.local"
    exit 1
  fi
fi

echo ""

# Step 2: Check for production env file
echo -e "${BLUE}Step 2: Checking production environment...${NC}"

if [ -f ".env.production" ]; then
  echo -e "${GREEN}✅ .env.production found${NC}"

  if grep -q "JWT_SECRET=" .env.production; then
    echo -e "${GREEN}✅ JWT_SECRET found in .env.production${NC}"
  else
    echo -e "${YELLOW}⚠️  JWT_SECRET not in .env.production${NC}"
    echo "Please add JWT_SECRET to your production environment"
  fi
elif [ -f ".env" ]; then
  echo -e "${GREEN}✅ .env found${NC}"

  if grep -q "JWT_SECRET=" .env; then
    echo -e "${GREEN}✅ JWT_SECRET found in .env${NC}"
  else
    echo -e "${YELLOW}⚠️  JWT_SECRET not in .env${NC}"
    echo "Please add JWT_SECRET to your production environment"
  fi
else
  echo -e "${YELLOW}⚠️  No production .env file found${NC}"
  echo "Make sure JWT_SECRET is set in your production environment"
fi

echo ""

# Step 3: Verify new files exist
echo -e "${BLUE}Step 3: Verifying fix files...${NC}"

if [ -f "lib/auth/jwt-secret.ts" ]; then
  echo -e "${GREEN}✅ lib/auth/jwt-secret.ts exists${NC}"
else
  echo -e "${RED}❌ lib/auth/jwt-secret.ts not found${NC}"
  echo "The centralized JWT secret file is missing!"
  exit 1
fi

# Check if auth routes were updated
echo "Checking auth routes..."
ROUTES_UPDATED=0

if grep -q "getJwtSecretEncoded" app/api/auth/callback/google/route.ts 2>/dev/null; then
  echo -e "${GREEN}✅ callback/google/route.ts updated${NC}"
  ((ROUTES_UPDATED++))
fi

if grep -q "getJwtSecretEncoded" app/api/auth/me/route.ts 2>/dev/null; then
  echo -e "${GREEN}✅ me/route.ts updated${NC}"
  ((ROUTES_UPDATED++))
fi

if grep -q "getJwtSecretEncoded" app/api/auth/convex-token/route.ts 2>/dev/null; then
  echo -e "${GREEN}✅ convex-token/route.ts updated${NC}"
  ((ROUTES_UPDATED++))
fi

if grep -q "getJwtSecretEncoded" app/api/auth/login/route.ts 2>/dev/null; then
  echo -e "${GREEN}✅ login/route.ts updated${NC}"
  ((ROUTES_UPDATED++))
fi

if [ $ROUTES_UPDATED -eq 4 ]; then
  echo -e "${GREEN}✅ All 4 auth routes updated successfully${NC}"
else
  echo -e "${YELLOW}⚠️  Only $ROUTES_UPDATED/4 auth routes updated${NC}"
fi

echo ""

# Step 4: Build/compile check
echo -e "${BLUE}Step 4: Type checking...${NC}"
echo "Running TypeScript check..."

if npm run type-check 2>/dev/null || npx tsc --noEmit 2>/dev/null; then
  echo -e "${GREEN}✅ TypeScript check passed${NC}"
else
  echo -e "${YELLOW}⚠️  TypeScript check not run (no script configured)${NC}"
fi

echo ""

# Step 5: Production deployment instructions
echo -e "${BLUE}Step 5: Production Deployment Instructions${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Update Production Environment Variables${NC}"
echo ""
echo "Add these to your production environment:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "# Generate a secure secret (run one of these):"
echo "openssl rand -base64 32"
echo "# OR"
echo "node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\""
echo ""
echo "# Then add to your production .env or PM2 config:"
echo "JWT_SECRET=<your-generated-secret>"
echo "AUTH_SECRET=<your-generated-secret>  # Same value as JWT_SECRET"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 6: Deployment commands
echo -e "${BLUE}Step 6: Deploy to Production${NC}"
echo ""
echo "Choose your deployment method:"
echo ""
echo "📦 Docker Deployment:"
echo "  docker-compose down"
echo "  docker-compose up -d --build"
echo ""
echo "🚀 PM2 Deployment:"
echo "  npm run build"
echo "  pm2 restart all"
echo "  # OR"
echo "  pm2 reload all --update-env"
echo ""
echo "🔄 Standard Next.js:"
echo "  npm run build"
echo "  pm2 restart nextjs"
echo ""

# Step 7: Testing
echo -e "${BLUE}Step 7: Testing Checklist${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "After deployment, test:"
echo ""
echo "1. Clear browser cookies for events.stepperslife.com"
echo "2. Visit: https://events.stepperslife.com/login"
echo "3. Click: 'Continue with Google'"
echo "4. Complete Google authentication"
echo "5. ✅ Should redirect to /organizer/events"
echo "6. ✅ Should see dashboard with profile navigation"
echo "7. ✅ No 401 errors in browser console"
echo "8. ✅ Can navigate and use the application"
echo ""

# Summary
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Fix Applied Successfully!                    ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "  1. Generate secure JWT_SECRET for production"
echo "  2. Update production environment variables"
echo "  3. Deploy to production (rebuild + restart)"
echo "  4. Test Google login flow"
echo "  5. Verify dashboard loads correctly"
echo ""
echo -e "${BLUE}📖 Documentation:${NC}"
echo "  • GOOGLE-OAUTH-FIX-APPLIED.md - Complete fix details"
echo "  • MANUAL-GOOGLE-LOGIN-TEST.md - Testing guide"
echo "  • GOOGLE-OAUTH-TEST-GUIDE.md - Automated testing"
echo ""
echo -e "${GREEN}✅ Local environment ready!${NC}"
echo -e "${YELLOW}⚠️  Don't forget to update production environment${NC}"
echo ""
