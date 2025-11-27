#!/bin/bash

# Comprehensive Payment System Test Runner
# This script deploys Convex functions and runs the payment system tests

set -e # Exit on error

echo "🚀 Starting Comprehensive Payment System Tests"
echo "=============================================="
echo ""

# Check if Convex is configured
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
echo "📦 Step 1: Deploying Convex functions..."
echo "========================================="
echo ""

# Check if Convex is already running
if pgrep -f "convex dev" > /dev/null; then
    echo "⚠️  Warning: Convex dev is already running"
    echo "   Using existing deployment..."
else
    echo "Deploying to production Convex..."

    # Try to deploy (may require manual intervention)
    if ! npx convex deploy --prod --yes 2>&1 | tee /tmp/convex-deploy.log; then
        echo ""
        echo "⚠️  Convex deployment failed or requires manual setup"
        echo "   Please run: npx convex dev"
        echo "   Or: npx convex deploy --prod"
        echo ""
        echo "   After deployment completes, run this script again"
        exit 1
    fi
fi

echo ""
echo "✅ Convex functions deployed successfully"
echo ""

# Step 2: Check if development server is running
echo "🔍 Step 2: Checking development server..."
echo "=========================================="
echo ""

if curl -s http://localhost:3004 > /dev/null 2>&1; then
    echo "✅ Development server is running on port 3004"
else
    echo "❌ Error: Development server is not running"
    echo "   Please start it with: npm run dev"
    exit 1
fi

echo ""

# Step 3: Install Playwright if needed
echo "🎭 Step 3: Checking Playwright installation..."
echo "==============================================="
echo ""

if ! npx playwright --version > /dev/null 2>&1; then
    echo "⚠️  Playwright not found, installing browsers..."
    npx playwright install
else
    echo "✅ Playwright is installed"
fi

echo ""

# Step 4: Run the test suite
echo "🧪 Step 4: Running Comprehensive Payment Tests..."
echo "=================================================="
echo ""

# Run tests with list reporter for detailed output
npx playwright test tests/comprehensive-payment-system.spec.ts --reporter=list

TEST_EXIT_CODE=$?

echo ""
echo "=============================================="
echo ""

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "🎉 SUCCESS! All payment system tests passed!"
    echo ""
    echo "📊 Summary:"
    echo "   - 3 PREPAY events tested"
    echo "   - 7 CREDIT_CARD events tested"
    echo "   - ~130 orders processed"
    echo "   - All fee calculations verified"
    echo ""
    echo "📄 View detailed results:"
    echo "   npx playwright show-report"
else
    echo "❌ FAILED! Some tests did not pass."
    echo ""
    echo "🔍 Troubleshooting:"
    echo "   1. Check test output above for specific errors"
    echo "   2. Ensure Convex functions are deployed"
    echo "   3. Verify development server is running"
    echo "   4. Check COMPREHENSIVE-PAYMENT-TESTS-README.md for help"
    echo ""
    echo "📄 View detailed results:"
    echo "   npx playwright show-report"
fi

echo ""
echo "🧹 Cleanup:"
echo "   Test data is automatically cleaned up"
echo "   Manual cleanup: npx convex run testing/paymentTestHelpers:cleanupTestData"
echo ""

exit $TEST_EXIT_CODE
