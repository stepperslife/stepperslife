# Comprehensive Organizer & Staff System Test Guide

## Overview

This test suite validates the complete organizer/staff/commission workflow including:
- Organizer registration and authentication
- Credit purchases (Square & Cash App Pay dev mode)
- Event creation (3 events with PREPAY model)
- Staff assignment (3 Team Members per event @ 100% commission)
- Associate assignment (random $ per ticket commission)
- Customer purchases via Stripe (dev mode)
- Commission tracking and settlement verification

## Test Coverage

### Phase 1: Organizer Setup
- ✅ Register organizer account
- ✅ Purchase 500 credits via Square (dev mode)
- ✅ Purchase 500 credits via Cash App Pay (dev mode)
- ✅ Verify total: 1,000 credits

### Phase 2: Event Creation
- ✅ Create Event 1 (500 tickets @ $25) - Receives 1,000 FREE credits bonus
- ✅ Create Event 2 (500 tickets @ $30) - Uses purchased credits
- ✅ Create Event 3 (500 tickets @ $20) - Uses purchased credits
- ✅ Verify PREPAY payment model configured
- ✅ Verify 1,500 credits allocated (500 per event)
- ✅ Verify 500 credits remaining

### Phase 3: Staff Assignment
- ✅ Add 3 Team Members to Event 1 (random allocations totaling 500)
- ✅ Add 3 Team Members to Event 2 (random allocations totaling 500)
- ✅ Add 3 Team Members to Event 3 (random allocations totaling 500)
- ✅ Set commission: 100% (Team Members keep all profit from allocated tickets)
- ✅ Enable permissions: canSellTickets, canAssignSubSellers, acceptCashInPerson

### Phase 4: Associate Assignment
- ✅ Each Team Member assigns 1-2 Associates
- ✅ Associates receive random ticket allocations (20-50 each)
- ✅ Associates earn FIXED commission ($2-$8 per ticket)
- ✅ Total: ~9-18 Associates across all events

### Phase 5: Customer Purchases
- ✅ Simulate 10 customer purchases per event (30 total)
- ✅ Use Stripe test cards (dev mode: 4242 4242 4242 4242)
- ✅ Verify orders created and tickets generated
- ✅ Verify commission tracking for Team Members and Associates

### Phase 6: Verification
- ✅ Verify final credit balance: 500 credits
- ✅ Verify Team Member commissions = 100% of ticket price
- ✅ Verify Associate commissions = $ per ticket sold
- ✅ Verify settlement dashboard calculations
- ✅ Verify admin panel records

## Prerequisites

### 1. Environment Setup

Ensure the following are running:

```bash
# Check Docker containers are up
docker-compose ps

# Expected output:
#   events-nginx (running)
#   events-stepperslife-app (running)
```

### 2. Environment Variables

Required in `.env.local`:

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://dazzling-mockingbird-241.convex.cloud
CONVEX_DEPLOYMENT=dazzling-mockingbird-241

# Square (Dev Mode)
SQUARE_ACCESS_TOKEN=<dev-token>
SQUARE_APPLICATION_ID=<dev-app-id>
SQUARE_LOCATION_ID=<dev-location-id>

# Cash App Pay (Dev Mode)
CASHAPP_ACCESS_TOKEN=<dev-token>
CASHAPP_APPLICATION_ID=<dev-app-id>

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# JWT Secret
JWT_SECRET=<your-secret>
```

### 3. Playwright Installation

```bash
# Install Playwright and browsers
npx playwright install chromium

# Or install all browsers
npx playwright install
```

## Running the Tests

### Option 1: Run Complete Suite

```bash
# Run all tests in order
npx playwright test tests/comprehensive-organizer-staff-system.spec.ts --project=chromium

# With UI mode for debugging
npx playwright test tests/comprehensive-organizer-staff-system.spec.ts --project=chromium --ui

# With headed browser (watch execution)
npx playwright test tests/comprehensive-organizer-staff-system.spec.ts --project=chromium --headed
```

### Option 2: Run Individual Test Steps

```bash
# Run specific test by name
npx playwright test --grep "Step 1: Register new organizer"

# Run all Phase 1 tests (Organizer Setup)
npx playwright test --grep "STEP (1|2|3):"

# Run all Phase 2 tests (Event Creation)
npx playwright test --grep "STEP (4|5|6):"

# Run all Phase 3 tests (Staff Assignment)
npx playwright test --grep "STEP (7|8|9):"

# Run verification only
npx playwright test --grep "STEP (16|17|18):"
```

### Option 3: Run with Specific Options

```bash
# Run with video recording
npx playwright test tests/comprehensive-organizer-staff-system.spec.ts --project=chromium --video=on

# Run with trace (for debugging failures)
npx playwright test tests/comprehensive-organizer-staff-system.spec.ts --project=chromium --trace=on

# Run in parallel (NOT recommended - tests are serial)
# npx playwright test tests/comprehensive-organizer-staff-system.spec.ts --workers=1

# Generate HTML report
npx playwright test tests/comprehensive-organizer-staff-system.spec.ts --project=chromium --reporter=html
```

## Test Execution Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1: Organizer Setup (Steps 1-3)                          │
│ - Register organizer                                            │
│ - Purchase 500 credits (Square)                                │
│ - Purchase 500 credits (Cash App)                              │
│ Duration: ~2-3 minutes                                          │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 2: Event Creation (Steps 4-6)                           │
│ - Create Event 1 (FREE 1000 credits bonus)                    │
│ - Create Event 2 (PAID from purchased credits)                │
│ - Create Event 3 (PAID from purchased credits)                │
│ Duration: ~3-4 minutes                                          │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 3: Staff Assignment (Steps 7-9)                         │
│ - Add 3 Team Members to each event (9 total)                  │
│ - Set 100% commission for each Team Member                    │
│ - Allocate random tickets totaling 500 per event              │
│ Duration: ~4-5 minutes                                          │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 4: Associate Assignment (Steps 10-12)                   │
│ - Each Team Member assigns 1-2 Associates                     │
│ - Associates get $2-$8 per ticket commission                  │
│ - Transfer random tickets to Associates                       │
│ Duration: ~5-6 minutes                                          │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 5: Customer Purchases (Steps 13-15)                     │
│ - 10 customer purchases per event (30 total)                  │
│ - Stripe test card payments                                   │
│ - Verify orders and commission tracking                       │
│ Duration: ~10-15 minutes                                        │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 6: Verification (Steps 16-18)                           │
│ - Verify credit balance (500 remaining)                       │
│ - Verify Team Member commissions (100%)                       │
│ - Verify Associate commissions ($ per ticket)                 │
│ - Verify settlement dashboard                                 │
│ Duration: ~2-3 minutes                                          │
└─────────────────────────────────────────────────────────────────┘

Total Duration: ~26-36 minutes
```

## Expected Test Results

### Credit Flow
```
Starting Balance:       0 credits
Square Purchase:      +500 credits
Cash App Purchase:    +500 credits
First Event Bonus:  +1,000 credits (FREE)
─────────────────────────────────
Total Available:     2,000 credits

Event 1 Allocation:   -500 credits
Event 2 Allocation:   -500 credits
Event 3 Allocation:   -500 credits
─────────────────────────────────
Final Balance:         500 credits ✓
```

### Staff Structure (per event)
```
Event → 3 Team Members (100% commission)
         ├─ Team Member 1 (150-200 tickets)
         │   ├─ Associate 1-1 ($X/ticket, 20-50 tickets)
         │   └─ Associate 1-2 ($X/ticket, 20-50 tickets) [optional]
         │
         ├─ Team Member 2 (150-200 tickets)
         │   ├─ Associate 2-1 ($X/ticket, 20-50 tickets)
         │   └─ Associate 2-2 ($X/ticket, 20-50 tickets) [optional]
         │
         └─ Team Member 3 (150-200 tickets)
             ├─ Associate 3-1 ($X/ticket, 20-50 tickets)
             └─ Associate 3-2 ($X/ticket, 20-50 tickets) [optional]
```

### Commission Example
```
Event 1: $25 tickets
  Team Member A1: 100% of $25 = $25 per ticket
  Associate 1-1: $5 per ticket (fixed)

If 10 tickets sold by Team Member A1:
  → Team Member earns: $250 ($25 × 10)

If 10 tickets sold by Associate 1-1:
  → Associate earns: $50 ($5 × 10)
  → Team Member A1 earns: $0 (Associate's tickets)
```

## Screenshots

All screenshots are automatically saved to:
```
test-results/screenshots/
├── 01-organizer-registered-*.png
├── 02-square-purchase-500-credits-*.png
├── 03-cashapp-purchase-500-credits-*.png
├── 04-event1-created-free-credits-*.png
├── 05-event2-created-paid-*.png
├── 06-event3-created-paid-*.png
├── 07-event1-team-members-*.png
├── 08-event2-team-members-*.png
├── 09-event3-team-members-*.png
├── 10-event1-associates-*.png
├── 11-event2-associates-*.png
├── 12-event3-associates-*.png
├── 13-event1-customer-purchases-*.png
├── 14-event2-customer-purchases-*.png
├── 15-event3-customer-purchases-*.png
├── 16-final-credit-balance-*.png
├── 17-event1-settlement-dashboard-*.png
├── 17-event2-settlement-dashboard-*.png
├── 17-event3-settlement-dashboard-*.png
└── 18-organizer-events-list-*.png
```

## Test Reports

### HTML Report
```bash
# Generate and open HTML report
npx playwright show-report
```

### JSON Report
```bash
# Run with JSON reporter
npx playwright test tests/comprehensive-organizer-staff-system.spec.ts --reporter=json
```

### JUnit Report (for CI/CD)
```bash
# Run with JUnit reporter
npx playwright test tests/comprehensive-organizer-staff-system.spec.ts --reporter=junit
```

## Thunder Client API Tests

Import the collection:
```
File: thunder-tests/organizer-staff-api-tests.json
```

Run in order:
1. Authentication → Register Organizer
2. Authentication → Login Organizer
3. Credit Purchases → Purchase 500 Credits - Square
4. Credit Purchases → Purchase 500 Credits - Cash App
5. Event Management → Create Ticketed Event
6. Event Management → Configure Event Payment (PREPAY)
7. Staff Management → Add Team Member to Event
8. Staff Management → Add Associate to Team Member
9. Orders & Purchases → Create Order (Customer Purchase)
10. Orders & Purchases → Get Settlement Dashboard

## Troubleshooting

### Test Fails: "Cannot find element"
- **Issue:** Page load timeout or element selector changed
- **Fix:** Increase timeout in `playwright.config.ts` or update selectors in test helpers

### Test Fails: "Credit purchase failed"
- **Issue:** Square/Cash App dev credentials not configured
- **Fix:** Verify `SQUARE_ACCESS_TOKEN` and `CASHAPP_ACCESS_TOKEN` in `.env.local`

### Test Fails: "First event bonus not applied"
- **Issue:** Organizer already has events (not first event)
- **Fix:** Use fresh organizer account or clear test data

### Test Fails: "Stripe payment declined"
- **Issue:** Using wrong test card or Stripe not in test mode
- **Fix:** Use `4242 4242 4242 4242` and verify `STRIPE_SECRET_KEY` starts with `sk_test_`

### Screenshots Not Saving
- **Issue:** `test-results/screenshots/` directory doesn't exist
- **Fix:** Create directory manually or update path in helpers

## Cleanup

After test execution:

```bash
# Option 1: Keep test data for review
# (No cleanup - review in admin panel)

# Option 2: Clean up test data
# Use admin panel to delete test events/users

# Option 3: Reset Convex database (CAUTION!)
# npx convex run admin/cleanup:completeReset
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Organizer & Staff Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install chromium
      - run: npx playwright test tests/comprehensive-organizer-staff-system.spec.ts
        env:
          NEXT_PUBLIC_CONVEX_URL: ${{ secrets.CONVEX_URL }}
          SQUARE_ACCESS_TOKEN: ${{ secrets.SQUARE_DEV_TOKEN }}
          CASHAPP_ACCESS_TOKEN: ${{ secrets.CASHAPP_DEV_TOKEN }}
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_TEST_KEY }}
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

## Success Criteria

All 18 test steps should pass with:
- ✅ 1 organizer account registered
- ✅ 1,000 credits purchased (500 Square + 500 Cash App)
- ✅ 1,000 FREE credits bonus received (first event)
- ✅ 3 events created (total 1,500 tickets)
- ✅ 9 Team Members assigned (3 per event @ 100% commission)
- ✅ 9-18 Associates assigned (1-2 per Team Member)
- ✅ 30 customer purchases completed (10 per event)
- ✅ Commissions calculated correctly
- ✅ Settlements dashboard shows correct balances
- ✅ 500 credits remaining

---

**Created:** January 17, 2025
**Test Suite:** Comprehensive Organizer & Staff System
**Browser:** Chromium (Playwright)
**Environment:** Development (local + production Convex)
