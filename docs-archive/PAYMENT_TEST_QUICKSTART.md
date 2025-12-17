# Payment System Testing - Quick Start Guide

## 🎯 Objective

Test all payment flows in the SteppersLife platform:
- **10 Events**: 3 PREPAY + 7 CREDIT_CARD (split payment)
- **4 Payment Methods**: Cash, Stripe, PayPal, CashApp
- **~50 Purchases**: Across all events and payment types

## ⚡ Quick Start (5 minutes)

### 1. Setup Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your test credentials
# Required: STRIPE_SECRET_KEY, NEXT_PUBLIC_CONVEX_URL
```

### 2. Start Development Server

```bash
npm run dev
# Server runs on http://localhost:3004
```

### 3. Run Tests

```bash
# Run everything (recommended)
npm run test:payment:all

# Or run phases individually
npm run test:payment:api        # Fast API tests (~30s)
npm run test:payment:e2e        # Full E2E tests (~5-10min)
npm run test:payment:verify     # Stripe verification (~1min)
```

## 📋 Test Scripts Reference

| Command | Description | Duration |
|---------|-------------|----------|
| `npm run test:payment:all` | Run all test phases | ~10-15 min |
| `npm run test:payment:required` | Skip optional phases | ~8-10 min |
| `npm run test:payment:api` | API tests only (no UI) | ~30 sec |
| `npm run test:payment:e2e` | Playwright E2E tests | ~5-10 min |
| `npm run test:payment:verify` | Stripe split payment verification | ~1 min |
| `npm run test:payment:cleanup` | Show test data stats | ~5 sec |
| `npm run test:payment:cleanup:all` | Delete all test data | ~30 sec |

## 🔑 Required Environment Variables

### Minimum Configuration

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://expert-vulture-775.convex.cloud
CONVEX_DEPLOYMENT=expert-vulture-775

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

### Full Configuration (for all payment methods)

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_TEST_CONNECT_ACCOUNT_ID=acct_test_xxxxx

# Square Sandbox
SQUARE_ACCESS_TOKEN=xxxxx
SQUARE_APPLICATION_ID=sandbox-xxxxx
SQUARE_ENVIRONMENT=sandbox

# PayPal Sandbox
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_CLIENT_SECRET=xxxxx
PAYPAL_MODE=sandbox

# Base URL
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3004
```

## 📊 What Gets Tested

### Events Created

| # | Event Name | Model | Payment Methods | Tickets |
|---|------------|-------|-----------------|---------|
| 1 | House Party | PREPAY | Cash | 70 |
| 2 | Dance Festival | PREPAY | Stripe, PayPal, CashApp | 330 |
| 3 | Community Fundraiser | PREPAY | All 4 methods | 200 |
| 4 | Open Mic Night | CREDIT_CARD | Stripe | 100 |
| 5 | Workshop Series | CREDIT_CARD | Stripe | 70 |
| 6 | Concert Series | CREDIT_CARD | Stripe | 260 |
| 7 | High-End Gala | CREDIT_CARD | Stripe | 150 |
| 8 | Multi-Tier Conference | CREDIT_CARD | Stripe | 825 |
| 9 | Table Package Event | CREDIT_CARD | Stripe | 110 |
| 10 | Ultimate Premium | CREDIT_CARD | Stripe | 70 |

**Total Tickets**: ~2,185 across all events

### Fee Calculations Tested

#### PREPAY Model
- ✅ Cash payments (no online fees)
- ✅ Stripe payments (2.9% + $0.30 processing, $0 platform fee)
- ✅ PayPal payments
- ✅ CashApp payments
- ✅ Credit allocation and deduction

#### CREDIT_CARD Model
- ✅ Platform fee: 3.7% + $1.79
- ✅ Processing fee: 2.9% + $0.30
- ✅ Split payment to organizer's Stripe Connect
- ✅ Charity discount (50% off platform fee)
- ✅ Multiple price points ($10, $25, $50, $100, $250, $500)

### Payment Flows Tested

1. **Organizer Setup**
   - ✅ Account creation
   - ✅ First event free credits (1,000)
   - ✅ Credit purchase (Square/PayPal)
   - ✅ Stripe Connect onboarding

2. **Event Creation**
   - ✅ PREPAY event configuration
   - ✅ CREDIT_CARD event configuration
   - ✅ Ticket tier creation
   - ✅ Credit allocation
   - ✅ Event publishing

3. **Client Purchases**
   - ✅ Cash (reserve → staff activation)
   - ✅ Stripe (immediate payment)
   - ✅ PayPal (popup → capture)
   - ✅ CashApp (inline payment)

4. **Verification**
   - ✅ Order creation
   - ✅ Fee calculations
   - ✅ Payment processing
   - ✅ Ticket generation with QR codes
   - ✅ Credit deduction (PREPAY)
   - ✅ Split payment accuracy (CREDIT_CARD)

## 🎬 Test Execution Flow

```
Phase 1: Environment Check
   ↓ Verify all required env vars

Phase 2: API Tests (30s)
   ↓ Test payment logic directly via Convex

Phase 3: E2E Tests (5-10min)
   ├─ Setup organizer (1min)
   ├─ Purchase credits (1min)
   ├─ Create 10 events (2min)
   ├─ Execute ~50 purchases (3min)
   └─ Verify results (2min)

Phase 4: Split Payment Verification (1min)
   ↓ Verify via Stripe API

Phase 5: Cleanup (optional)
   ↓ Show statistics or delete test data
```

## ✅ Success Criteria

After running `npm run test:payment:all`, you should see:

```
===================================================================================
TEST SUMMARY
===================================================================================
✓ PASS - Environment Check (0.5s)
✓ PASS - API Tests (30.2s)
✓ PASS - E2E Tests (487.3s)
✓ PASS - Split Payment Verification (45.1s)
✓ PASS - Test Data Cleanup (2.3s)

Total Phases: 5
Passed: 5
Failed: 0
Total Duration: 565.4s
Success Rate: 100.00%
===================================================================================
```

## 🐛 Troubleshooting

### Tests Fail Immediately

**Issue**: Environment variables missing

```bash
# Check .env.local exists
ls -la .env.local

# Verify variables are loaded
echo $STRIPE_SECRET_KEY
```

### Stripe Payment Fails

**Issue**: Using production keys instead of test keys

```bash
# Test keys should start with:
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Timeout Errors

**Issue**: Development server not running

```bash
# Start server in separate terminal
npm run dev

# Verify it's running
curl http://localhost:3004
```

### Test Data Not Cleaned

**Issue**: Previous test data exists

```bash
# Clean up all test data
npm run test:payment:cleanup:all
```

## 📖 Detailed Documentation

For more detailed information, see:
- **Full Guide**: `tests/PAYMENT_TESTING_GUIDE.md`
- **Payment System**: `PAYMENT-SYSTEM.md` (root docs)

## 🚀 Running in Production

**⚠️ WARNING**: Never run tests against production!

These tests are designed for **development environments only**. They:
- Create test events
- Process test payments
- Generate test tickets
- Modify database state

Always use:
- Stripe **test mode** keys
- PayPal **sandbox** credentials
- Square **sandbox** environment
- Dedicated **test database** (Convex deployment)

## 📞 Support

If tests fail:

1. Check error messages in console output
2. Review Stripe Dashboard for payment details
3. Check Convex logs for backend errors
4. Verify environment variables are correct
5. Ensure development server is running

## 🎉 What You've Tested

After successful completion, you've validated:

- ✅ **2 payment models** working correctly
- ✅ **4 payment methods** processing successfully
- ✅ **10 events** created and configured
- ✅ **~50 client purchases** completed
- ✅ **Fee calculations** accurate across all price points
- ✅ **Split payments** distributed correctly
- ✅ **Tickets generated** with valid QR codes
- ✅ **Edge cases** handled properly

**Your payment system is production-ready!** 🎊
