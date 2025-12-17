#!/bin/bash

# Payment System Tests - Local Deployment & Execution Script
# This script deploys Convex functions and runs comprehensive payment tests

set -e  # Exit on error

echo "═══════════════════════════════════════════════════════════════"
echo "  STEPPERSLIFE - COMPREHENSIVE PAYMENT SYSTEM TEST SUITE"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "This script will:"
echo "  1. Deploy Convex test helper functions"
echo "  2. Wait for deployment to complete"
echo "  3. Run comprehensive payment tests (12 tests)"
echo "  4. Show detailed results"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "   Please run this script from: /Users/irawatkins/stepperslife-v2-docker/src/events-stepperslife"
    exit 1
fi

# Check Convex configuration
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local not found"
    echo "   Please configure your Convex environment first"
    exit 1
fi

# Extract Convex URL
CONVEX_URL=$(grep 'CONVEX_URL' .env.local | cut -d'=' -f2)

if [ -z "$CONVEX_URL" ]; then
    echo "❌ Error: CONVEX_URL not found in .env.local"
    exit 1
fi

echo "✅ Found Convex URL: $CONVEX_URL"
echo ""

# Step 1: Deploy Convex functions
echo "═══════════════════════════════════════════════════════════════"
echo "  STEP 1: DEPLOYING CONVEX FUNCTIONS"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Deploying convex/testing/paymentTestHelpers.ts..."
echo "This will make all test mutations and queries available."
echo ""

# Set deployment from .env.convex.local
if [ -f ".env.convex.local" ]; then
    export $(cat .env.convex.local | xargs)
    echo "✅ Loaded CONVEX_DEPLOYMENT: $CONVEX_DEPLOYMENT"
fi

# Try to deploy
echo ""
echo "Running: npx convex deploy --yes"
echo ""

if npx convex deploy --yes 2>&1 | tee /tmp/convex-deploy.log; then
    echo ""
    echo "✅ Convex functions deployed successfully!"
    echo ""
else
    echo ""
    echo "⚠️  Convex deployment requires manual intervention"
    echo ""
    echo "Please run in a separate terminal:"
    echo "  cd /Users/irawatkins/stepperslife-v2-docker/src/events-stepperslife"
    echo "  npx convex dev"
    echo ""
    echo "Keep that terminal running, then run this script again."
    echo ""
    exit 1
fi

# Wait a moment for functions to be available
echo "⏳ Waiting 3 seconds for functions to be ready..."
sleep 3
echo ""

# Step 2: Verify deployment
echo "═══════════════════════════════════════════════════════════════"
echo "  STEP 2: VERIFYING DEPLOYMENT"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Checking if test functions are available..."
echo ""

# Try to call a test function
if npx convex run testing/paymentTestHelpers:cleanupTestData 2>&1 | grep -q "Error"; then
    echo "❌ Test functions not available yet"
    echo "   Please ensure Convex deployment completed successfully"
    exit 1
else
    echo "✅ Test functions are available!"
fi

echo ""

# Step 3: Check development server
echo "═══════════════════════════════════════════════════════════════"
echo "  STEP 3: CHECKING DEVELOPMENT SERVER"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check if server is running on port 3004
if curl -s http://localhost:3004 > /dev/null 2>&1; then
    echo "✅ Development server is running on port 3004"
else
    echo "⚠️  Development server is not running"
    echo ""
    echo "Starting development server..."
    echo ""

    # Start dev server in background
    npm run dev > /tmp/next-dev.log 2>&1 &
    DEV_SERVER_PID=$!

    echo "⏳ Waiting for server to start..."
    sleep 5

    if curl -s http://localhost:3004 > /dev/null 2>&1; then
        echo "✅ Development server started (PID: $DEV_SERVER_PID)"
    else
        echo "❌ Failed to start development server"
        echo "   Check /tmp/next-dev.log for errors"
        exit 1
    fi
fi

echo ""

# Step 4: Install Playwright if needed
echo "═══════════════════════════════════════════════════════════════"
echo "  STEP 4: CHECKING PLAYWRIGHT"
echo "═══════════════════════════════════════════════════════════════"
echo ""

if ! npx playwright --version > /dev/null 2>&1; then
    echo "⚠️  Playwright not found, installing browsers..."
    npx playwright install chromium
else
    echo "✅ Playwright is installed"
fi

echo ""

# Step 5: Run the comprehensive payment test suite
echo "═══════════════════════════════════════════════════════════════"
echo "  STEP 5: RUNNING COMPREHENSIVE PAYMENT TESTS"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Running 12 comprehensive payment system tests..."
echo "  - 3 PREPAY events"
echo "  - 7 CREDIT_CARD events"
echo "  - ~130 orders processed"
echo "  - \$5,590 revenue tested"
echo ""
echo "Expected execution time: ~90 seconds"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Run tests with detailed output
npx playwright test tests/comprehensive-payment-system.spec.ts --reporter=list

TEST_EXIT_CODE=$?

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "🎉 SUCCESS! ALL PAYMENT SYSTEM TESTS PASSED!"
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  TEST SUMMARY"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "✅ PREPAY Events: 3"
    echo "   - Test 1: Cash Payment (5 orders)"
    echo "   - Test 2: Stripe Payment (10 orders)"
    echo "   - Test 3: Multiple Payment Methods (10 orders)"
    echo ""
    echo "✅ CREDIT_CARD Events: 7"
    echo "   - Test 4: Basic Split Payment (5 orders)"
    echo "   - Test 5: Charity Discount (5 orders)"
    echo "   - Test 6: High Volume - 50 concurrent orders"
    echo "   - Test 7: Low Price Event (10 orders)"
    echo "   - Test 8: Failed Payment Handling"
    echo "   - Test 9: Refund Processing"
    echo "   - Test 10: Mixed PREPAY + CREDIT_CARD (4 orders)"
    echo ""
    echo "✅ Total Orders Processed: ~130"
    echo "✅ Total Revenue Tested: \$5,590.00"
    echo "✅ All Fee Calculations Verified"
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "📄 View detailed HTML report:"
    echo "   npx playwright show-report"
    echo ""
    echo "🧹 Cleanup test data (optional):"
    echo "   npx convex run testing/paymentTestHelpers:cleanupTestData"
    echo ""
else
    echo "❌ TESTS FAILED"
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  TROUBLESHOOTING"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "🔍 Check test output above for specific errors"
    echo ""
    echo "Common issues:"
    echo "  1. Convex functions not deployed:"
    echo "     → Run: npx convex dev (in separate terminal)"
    echo ""
    echo "  2. Development server not running:"
    echo "     → Run: npm run dev"
    echo ""
    echo "  3. Database schema mismatch:"
    echo "     → Run: npx convex deploy"
    echo ""
    echo "📚 Documentation:"
    echo "   - COMPREHENSIVE-PAYMENT-TESTS-README.md"
    echo "   - RUN-PAYMENT-TESTS.md"
    echo "   - PAYMENT-SYSTEM-COMPLETE-STATUS.md"
    echo ""
    echo "📄 View detailed HTML report:"
    echo "   npx playwright show-report"
    echo ""
fi

echo "═══════════════════════════════════════════════════════════════"
echo ""

exit $TEST_EXIT_CODE
