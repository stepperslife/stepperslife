#!/bin/bash

# Google OAuth Testing Suite Runner
# This script runs all Google OAuth tests using Playwright and Puppeteer

set -e  # Exit on error

echo "🔐 Google OAuth Testing Suite"
echo "================================"
echo ""

# Colors for output
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

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}⚠️  node_modules not found. Running npm install...${NC}"
  npm install
fi

# Create test results directories
echo -e "${BLUE}📁 Creating test results directories...${NC}"
mkdir -p test-results/screenshots
mkdir -p test-results/puppeteer-screenshots
mkdir -p test-results/puppeteer-pdfs
mkdir -p test-results/puppeteer-logs
mkdir -p thunder-tests

# Check environment variables
echo -e "${BLUE}🔍 Checking environment configuration...${NC}"

if [ -f ".env.local" ]; then
  source .env.local
  echo -e "${GREEN}✓ Loaded .env.local${NC}"
else
  echo -e "${YELLOW}⚠️  .env.local not found${NC}"
fi

if [ -z "$AUTH_GOOGLE_CLIENT_ID" ]; then
  echo -e "${YELLOW}⚠️  AUTH_GOOGLE_CLIENT_ID not set${NC}"
else
  echo -e "${GREEN}✓ AUTH_GOOGLE_CLIENT_ID configured${NC}"
fi

if [ -z "$AUTH_GOOGLE_CLIENT_SECRET" ]; then
  echo -e "${YELLOW}⚠️  AUTH_GOOGLE_CLIENT_SECRET not set${NC}"
else
  echo -e "${GREEN}✓ AUTH_GOOGLE_CLIENT_SECRET configured${NC}"
fi

echo ""

# Function to run Playwright tests
run_playwright_tests() {
  echo -e "${BLUE}🎭 Running Playwright Tests...${NC}"
  echo "================================"

  npx playwright test tests/google-oauth-login.spec.ts --reporter=list,html

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Playwright tests completed${NC}"
  else
    echo -e "${YELLOW}⚠️  Some Playwright tests may have failed (check report)${NC}"
  fi
  echo ""
}

# Function to run Puppeteer tests
run_puppeteer_tests() {
  echo -e "${BLUE}🤖 Running Puppeteer Tests...${NC}"
  echo "================================"

  npx ts-node tests/google-oauth-puppeteer.ts

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Puppeteer tests completed${NC}"
  else
    echo -e "${YELLOW}⚠️  Some Puppeteer tests may have failed (check logs)${NC}"
  fi
  echo ""
}

# Function to display test results summary
show_summary() {
  echo -e "${BLUE}📊 Test Results Summary${NC}"
  echo "================================"
  echo ""

  echo -e "${GREEN}Playwright Test Results:${NC}"
  echo "  - HTML Report: test-results/html-report/index.html"
  echo "  - Screenshots: test-results/screenshots/"
  echo "  - Network Logs: test-results/google-oauth-network-logs.json"
  echo "  - Console Logs: test-results/google-oauth-console-logs.json"
  echo "  - Performance: test-results/google-oauth-performance-metrics.json"
  echo "  - Endpoints: test-results/google-oauth-endpoints.json"
  echo ""

  echo -e "${GREEN}Puppeteer Test Results:${NC}"
  echo "  - Screenshots: test-results/puppeteer-screenshots/"
  echo "  - PDFs: test-results/puppeteer-pdfs/"
  echo "  - Network Logs: test-results/puppeteer-logs/network-logs.json"
  echo "  - Console Logs: test-results/puppeteer-logs/console-logs.json"
  echo "  - Performance: test-results/puppeteer-logs/performance-metrics.json"
  echo "  - Summary: test-results/puppeteer-logs/test-summary.json"
  echo "  - Cookies: test-results/puppeteer-logs/cookies.json"
  echo ""

  echo -e "${GREEN}Thunder Client API Tests:${NC}"
  echo "  - Collection: thunder-tests/google-oauth-api-tests.json"
  echo "  - Import into Thunder Client VSCode extension to run API tests"
  echo ""

  # Check for errors
  if [ -f "test-results/puppeteer-logs/error.json" ]; then
    echo -e "${RED}⚠️  Errors detected - see test-results/puppeteer-logs/error.json${NC}"
  fi

  echo ""
  echo -e "${BLUE}To view Playwright HTML report:${NC}"
  echo "  npx playwright show-report test-results/html-report"
  echo ""
}

# Main execution
main() {
  echo -e "${BLUE}Starting test suite...${NC}"
  echo ""

  # Parse command line arguments
  RUN_PLAYWRIGHT=true
  RUN_PUPPETEER=true

  while [[ $# -gt 0 ]]; do
    case $1 in
      --playwright-only)
        RUN_PUPPETEER=false
        shift
        ;;
      --puppeteer-only)
        RUN_PLAYWRIGHT=false
        shift
        ;;
      --help)
        echo "Usage: ./RUN-GOOGLE-OAUTH-TESTS.sh [options]"
        echo ""
        echo "Options:"
        echo "  --playwright-only   Run only Playwright tests"
        echo "  --puppeteer-only    Run only Puppeteer tests"
        echo "  --help             Show this help message"
        exit 0
        ;;
      *)
        echo -e "${RED}Unknown option: $1${NC}"
        exit 1
        ;;
    esac
  done

  # Run tests
  if [ "$RUN_PLAYWRIGHT" = true ]; then
    run_playwright_tests
  fi

  if [ "$RUN_PUPPETEER" = true ]; then
    run_puppeteer_tests
  fi

  # Show summary
  show_summary

  echo -e "${GREEN}✅ All tests completed!${NC}"
  echo ""
  echo -e "${BLUE}Next steps:${NC}"
  echo "1. Review test reports and logs"
  echo "2. Check screenshots for visual verification"
  echo "3. Import Thunder Client collection for API testing"
  echo "4. For actual Google OAuth testing, configure test user credentials"
  echo ""
}

# Run main function
main "$@"
