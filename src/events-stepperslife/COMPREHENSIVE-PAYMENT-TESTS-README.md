# Comprehensive Payment System Test Suite

## Overview

A complete test suite for the SteppersLife payment system covering all payment flows:
- **3 PREPAY events** (organizer pre-purchases tickets)
- **7 CREDIT_CARD events** (Stripe split payment)
- Client purchases from both models
- Comprehensive fee verification

---

## 📁 Files Created

### 1. Convex Test Helpers
**File:** `convex/testing/paymentTestHelpers.ts`

Contains backend mutations and queries for creating and managing test data:

**Mutations:**
- `setupTestOrganizer` - Create organizer with credits
- `setupTestEvent` - Create event with payment config and tickets
- `simulateOrder` - Create complete order with tickets
- `cleanupTestData` - Delete all test data

**Queries:**
- `verifyCredits` - Check organizer credit balance
- `verifyOrder` - Verify order and fee calculations
- `getEventStats` - Get comprehensive event statistics

### 2. Test Helper Functions
**File:** `tests/helpers/payment-test-helpers.ts`

TypeScript helper functions for Playwright tests:

**Functions:**
- `createTestOrganizer()` - Create test organizer
- `createPrepayEvent()` - Create PREPAY event
- `createCreditCardEvent()` - Create CREDIT_CARD event
- `simulatePurchase()` - Simulate ticket purchase
- `verifyCredits()` - Verify credit balance
- `verifyOrder()` - Verify order details
- `getEventStats()` - Get event statistics
- `cleanupTestData()` - Clean up all test data
- `calculatePrepayFees()` - Calculate expected PREPAY fees
- `calculateCreditCardFees()` - Calculate expected CREDIT_CARD fees
- `verifyFeeCalculations()` - Verify fees match expected values

### 3. Comprehensive Test Suite
**File:** `tests/comprehensive-payment-system.spec.ts`

Contains 12 tests (including setup and summary):

1. **Setup: Create test organizers**
2. **Test 1: PREPAY with Cash Payment**
3. **Test 2: PREPAY with Stripe Payment**
4. **Test 3: PREPAY Multiple Payment Methods**
5. **Test 4: Basic Split Payment**
6. **Test 5: Charity Discount (50% off)**
7. **Test 6: High Volume Sales** (50 concurrent purchases)
8. **Test 7: Low Price Event** (Under $20, auto discount)
9. **Test 8: Failed Payment Handling**
10. **Test 9: Refund Processing**
11. **Test 10: Mixed PREPAY + CREDIT_CARD Purchases**
12. **Final Summary: Verify All Test Results**

### 4. Test Data Fixtures
**File:** `tests/fixtures/payment-test-data.json`

JSON configuration for test scenarios including:
- Organizer profiles
- Event configurations
- Buyer profiles
- Fee calculation parameters
- Test scenario definitions

---

## 🚀 How to Run the Tests

### Prerequisites

1. **Deploy Convex Functions** (Required!)
   ```bash
   cd /Users/irawatkins/stepperslife-v2-docker/src/events-stepperslife
   npx convex dev
   # OR
   npx convex deploy --prod
   ```

2. **Ensure Development Server is Running**
   ```bash
   npm run dev
   ```

3. **Playwright Installed**
   ```bash
   npx playwright install
   ```

### Run the Test Suite

**Full test suite:**
```bash
npx playwright test tests/comprehensive-payment-system.spec.ts --reporter=list
```

**With UI mode (recommended for debugging):**
```bash
npx playwright test tests/comprehensive-payment-system.spec.ts --ui
```

**Run specific test:**
```bash
npx playwright test tests/comprehensive-payment-system.spec.ts -g "Test 1"
```

**With verbose output:**
```bash
npx playwright test tests/comprehensive-payment-system.spec.ts --reporter=list --trace on
```

---

## 📊 Test Coverage

### PREPAY Model Tests (3 tests)

#### Test 1: PREPAY with Cash Payment
- Creates event with 100 tickets @ $25
- Simulates 5 cash purchases
- Verifies:
  - Orders in PENDING_ACTIVATION status
  - Activation codes generated
  - Credits deducted (5 used, 995 remaining)
  - Platform fee = $0
  - No processing fees (cash payment)

#### Test 2: PREPAY with Stripe Payment
- Creates event with 200 tickets @ $30
- Simulates 10 Stripe purchases
- Verifies:
  - Orders in COMPLETED status
  - Tickets marked VALID with QR codes
  - Credits deducted (15 total used)
  - Platform fee = $0
  - Processing fee = 2.9% only

#### Test 3: PREPAY Multiple Payment Methods
- Creates event with 150 tickets @ $20
- Accepts CASH, STRIPE, and PAYPAL
- Simulates:
  - 3 cash purchases
  - 4 Stripe purchases
  - 3 PayPal purchases
- Verifies correct fee calculations for each method

### CREDIT_CARD Model Tests (7 tests)

#### Test 4: Basic Split Payment
- Creates event with 100 tickets @ $50
- Simulates 5 Stripe split payments
- Verifies:
  - Platform fee = 3.7% + $1.79 per ticket
  - Processing fee = 2.9%
  - Automatic split to organizer Stripe Connect account

#### Test 5: Charity Discount (50% off)
- Creates charity event with 100 tickets @ $40
- Simulates 5 purchases
- Verifies:
  - Platform fee = 1.85% + $0.90 (50% off)
  - Processing fee = 2.9%
  - Total savings compared to regular fees

#### Test 6: High Volume Sales
- Creates event with 500 tickets @ $75
- Simulates **50 concurrent purchases**
- Verifies:
  - No race conditions
  - All orders processed correctly
  - Ticket sold count accurate with optimistic locking

#### Test 7: Low Price Event (Under $20)
- Creates event with 200 tickets @ $15
- Automatic 50% discount for tickets under $20
- Simulates 10 purchases
- Verifies discounted fees applied

#### Test 8: Failed Payment Handling
- Tests payment failure scenarios
- Verifies error handling
- *Note: Full implementation requires Stripe webhook integration*

#### Test 9: Refund Processing
- Creates orders
- Tests refund flow
- *Note: Full implementation requires admin panel integration*

#### Test 10: Mixed PREPAY + CREDIT_CARD Purchases
- Simulates simultaneous purchases from both payment models
- Verifies correct fee calculations for each model
- Tests system handles concurrent purchases across different payment types

---

## 💰 Fee Calculations

### PREPAY Model

**Formula:**
```
Platform Fee = $0 (always)
Processing Fee = subtotal × 2.9% (if online payment)
Total = subtotal + processing fee
```

**Example:** 1 ticket @ $25.00
- Subtotal: $25.00
- Platform Fee: $0.00
- Processing Fee: $0.73 (2.9%)
- **Total: $25.73**

**Organizer Revenue:**
- Keeps 100% of ticket price
- Only pays Stripe processing fees (if using online payment)
- Already paid $0.30 per ticket upfront to SteppersLife

### CREDIT_CARD Model

**Regular Formula:**
```
Platform Fee = (subtotal × 3.7%) + $1.79
Processing Fee = (subtotal + platform fee) × 2.9%
Total = subtotal + platform fee + processing fee
```

**Example:** 1 ticket @ $50.00
- Subtotal: $50.00
- Platform Fee: $3.64 (3.7% + $1.79)
- Processing Fee: $1.56 (2.9%)
- **Total: $55.20**

**Charity/Low-Price Discount (50% off):**
```
Platform Fee = (subtotal × 1.85%) + $0.90
Processing Fee = (subtotal + platform fee) × 2.9%
```

**Example:** 1 charity ticket @ $40.00
- Subtotal: $40.00
- Platform Fee: $1.64 (1.85% + $0.90)
- Processing Fee: $1.21 (2.9%)
- **Total: $42.85**

---

## 🔍 What Each Test Verifies

### All Tests Verify:
✅ Event created successfully
✅ Payment model configured correctly
✅ Tickets allocated/connected properly
✅ Orders created with correct status
✅ Fees calculated accurately (platform + processing)
✅ Tickets generated with QR codes
✅ Database state consistent

### PREPAY Tests Verify:
✅ Credits deducted correctly
✅ No platform fees charged
✅ Processing fees only for online payments
✅ Cash orders remain in PENDING_ACTIVATION
✅ Activation codes generated for cash tickets

### CREDIT_CARD Tests Verify:
✅ Platform fees calculated correctly
✅ Charity/low-price discounts applied
✅ Split payment to Stripe Connect account
✅ Concurrent order processing
✅ High-volume transaction handling

---

## 📈 Expected Test Results

When run successfully, you should see:

```
Running 12 tests using 1 worker

=== SETUP: Creating Test Organizers ===
✅ Created PREPAY organizer: test-organizer-prepay@stepperslife.test
✅ Created CREDIT_CARD organizer: test-organizer-creditcard@stepperslife.test

=== TEST 1: PREPAY with Cash Payment ===
✅ Created event: PREPAY Cash Event 1234567890
📊 Simulating 5 cash purchases...
💳 Credits Status: Used: 5 | Remaining: 995
📈 Event Statistics: Total Orders: 5

... (additional test output)

=== FINAL SUMMARY ===
💳 PREPAY Organizer Final Credits:
   Total: 1000 | Used: 25 | Remaining: 975

📊 PREPAY Events Summary:
   TOTAL: 25 orders, $625.00 revenue

📊 CREDIT_CARD Events Summary:
   TOTAL: 105 orders, $4,965.00 revenue
   Platform Fees Collected: $449.85

🎉 TEST SUITE COMPLETE!
   Total PREPAY Events: 3
   Total CREDIT_CARD Events: 7
   Total Orders Processed: 130
   Total Revenue: $5,590.00
```

---

## 🛠️ Troubleshooting

### Issue: "Could not find public function"

**Error:**
```
Server Error
Could not find public function for 'testing/paymentTestHelpers:cleanupTestData'
```

**Solution:**
Deploy Convex functions first:
```bash
npx convex deploy --prod --yes
```

### Issue: Connection Timeout

**Error:**
```
TimeoutError: page.goto: Timeout 30000ms exceeded
```

**Solution:**
1. Ensure development server is running: `npm run dev`
2. Check port mapping: `curl http://localhost:3004`
3. Restart Docker if needed: `docker-compose restart events-app`

### Issue: Database Schema Errors

**Error:**
```
ValidationError: Invalid value for field "paymentModel"
```

**Solution:**
1. Deploy latest Convex schema: `npx convex deploy`
2. Check schema.ts for correct payment model types
3. Verify CONSIGNMENT was removed from union type

### Issue: Fee Calculation Mismatches

**Error:**
```
Fee mismatch: expected $3.64, got $3.63
```

**Note:**
- Tests allow 1 cent tolerance for rounding differences
- This is normal due to JavaScript floating-point arithmetic
- If mismatch is > 1 cent, check fee calculation formulas

---

## 🧹 Cleanup

The test suite automatically cleans up before and after running:

**Manual cleanup:**
```bash
# Via Convex console
npx convex run testing/paymentTestHelpers:cleanupTestData

# This deletes:
# - Test users (test-organizer-* emails)
# - All related events
# - All related orders
# - All related tickets
# - All related payment configs
# - All related credits
```

---

## 📝 Test Data

### Test Organizers Created:
- `test-organizer-prepay@stepperslife.test` (1000 free credits)
- `test-organizer-creditcard@stepperslife.test` (Stripe Connect account)

### Test Events Created:
- 3 PREPAY events (various payment methods)
- 7 CREDIT_CARD events (various scenarios)

### Test Orders Created:
- ~25 PREPAY orders
- ~105 CREDIT_CARD orders
- **Total: ~130 orders across all tests**

---

## 🎯 Next Steps

1. **Deploy Convex Functions**
   ```bash
   npx convex deploy --prod
   ```

2. **Run Test Suite**
   ```bash
   npx playwright test tests/comprehensive-payment-system.spec.ts --reporter=list
   ```

3. **Review Results**
   - Check test output for pass/fail status
   - Verify fee calculations
   - Check database state

4. **Generate Test Report**
   ```bash
   npx playwright test tests/comprehensive-payment-system.spec.ts --reporter=html
   npx playwright show-report
   ```

---

## 📊 Performance Metrics

**Expected Execution Time:**
- Setup: ~2 seconds
- PREPAY Tests (3): ~30 seconds
- CREDIT_CARD Tests (7): ~60 seconds
- Summary: ~1 second
- **Total: ~90 seconds (1.5 minutes)**

**Database Operations:**
- ~140 insertions (users, events, orders, tickets, configs)
- ~140 queries (verification checks)
- ~140 deletions (cleanup)
- **Total: ~420 database operations**

---

## ✅ Success Criteria

The test suite passes if:
1. All 12 tests pass
2. 3 PREPAY events created
3. 7 CREDIT_CARD events created
4. ~130 orders processed successfully
5. All fee calculations match expected values (within 1 cent tolerance)
6. Credits properly tracked and deducted
7. Orders have correct status (PENDING_ACTIVATION or COMPLETED)
8. Tickets generated with QR codes
9. No database integrity errors
10. Cleanup successful

---

## 🤖 Generated with Claude Code

This comprehensive test suite was created to verify all payment system functionality in the SteppersLife platform. It covers both PREPAY and CREDIT_CARD payment models with complete fee verification and transaction flow testing.

**Created:** November 16, 2025
**Status:** ✅ Ready to Run (after Convex deployment)
