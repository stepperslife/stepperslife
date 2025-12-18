#!/bin/bash

# SteppersLife Payment System Audit Script
# Runs comprehensive payment tests against production 3 times

set -e

echo "=============================================="
echo "  SteppersLife Payment System Audit"
echo "  Target: https://stepperslife.com"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="https://stepperslife.com"
TOTAL_RUNS=3
RESULTS_DIR="test-results/payment-audit"

# Create results directory
mkdir -p "$RESULTS_DIR"

# Track results
declare -a RUN_RESULTS

echo -e "${YELLOW}Starting payment audit with $TOTAL_RUNS runs...${NC}"
echo ""

# Run tests 3 times
for run in $(seq 1 $TOTAL_RUNS); do
    echo "=============================================="
    echo -e "${YELLOW}Run $run of $TOTAL_RUNS${NC}"
    echo "=============================================="

    RUN_DIR="$RESULTS_DIR/run-$run"
    mkdir -p "$RUN_DIR"

    # Run Playwright tests
    echo "Running payment tests..."

    if BASE_URL="$BASE_URL" npx playwright test tests/payment \
        --project=chromium \
        --reporter=json \
        --output-dir="$RUN_DIR" \
        > "$RUN_DIR/output.log" 2>&1; then
        echo -e "${GREEN}Run $run: PASSED${NC}"
        RUN_RESULTS+=("PASS")
    else
        echo -e "${RED}Run $run: FAILED${NC}"
        RUN_RESULTS+=("FAIL")
        # Show error summary
        echo "Error summary:"
        tail -20 "$RUN_DIR/output.log"
    fi

    echo ""
done

# Summary
echo "=============================================="
echo "           AUDIT SUMMARY"
echo "=============================================="

PASS_COUNT=0
FAIL_COUNT=0

for i in $(seq 0 $((TOTAL_RUNS - 1))); do
    run=$((i + 1))
    result="${RUN_RESULTS[$i]}"

    if [ "$result" == "PASS" ]; then
        echo -e "Run $run: ${GREEN}PASSED${NC}"
        ((PASS_COUNT++))
    else
        echo -e "Run $run: ${RED}FAILED${NC}"
        ((FAIL_COUNT++))
    fi
done

echo ""
echo "Total: $PASS_COUNT passed, $FAIL_COUNT failed out of $TOTAL_RUNS runs"
echo ""

# Generate combined report
echo "Generating combined report..."
node scripts/combine-payment-reports.js 2>/dev/null || echo "Report generation skipped (script not found)"

# Final verdict
if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}=============================================="
    echo "  AUDIT RESULT: ALL TESTS PASSED"
    echo "==============================================${NC}"
    exit 0
else
    echo -e "${RED}=============================================="
    echo "  AUDIT RESULT: SOME TESTS FAILED"
    echo "  Review logs in $RESULTS_DIR"
    echo "==============================================${NC}"
    exit 1
fi
