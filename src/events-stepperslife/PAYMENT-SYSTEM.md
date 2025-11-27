# SteppersLife Payment System

## Overview

SteppersLife uses a **two-part payment system** that separates how organizers pay the platform from how customers pay organizers.

## 🎯 Key Principles

### 1. Anyone Can Create Events WITHOUT Payment Setup
- ✅ No payment processor required
- ✅ No upfront payment required
- ✅ Can create "Save the Date" events
- ✅ Can plan events and set up payment later
- ✅ First event gets 1000 FREE tickets

### 2. Payment Setup is OPTIONAL
- Events can exist in DRAFT without payment
- Organizers choose when to enable ticketing
- Can start with CASH-only (no processor needed)
- Can add online payments later

### 3. First Event is FREE
- Every organizer gets 1000 FREE tickets
- Perfect for testing the platform
- No credit card required
- Can use CASH payment method
- QR code check-in included

---

## Part 1: How Organizers Pay SteppersLife

### PREPAY Model (Pre-Purchase Ticket Credits)

Organizers pre-purchase "ticket credits" from SteppersLife at **$0.30 per ticket**.

**Payment Methods Accepted:**
- **Square**
- **CashApp**
- **PayPal**

**Free First Event:**
- Every organizer gets **1,000 FREE ticket credits** for their first event
- No payment processor setup required
- Credits are linked to the first event and expire if unused

**How It Works:**
1. Organizer purchases credits via Square, CashApp, or PayPal
2. Credits stored in `organizerCredits` table
3. When creating an event, organizer allocates credits to that event
4. As tickets sell, credits are deducted
5. Organizer keeps 100% of ticket revenue (no percentage fees)

---

## Part 2: How Customers Pay Organizers

Organizers choose which payment methods to accept from customers when purchasing tickets.

### Available Customer Payment Methods:

#### 1. **CASH (At Door)**
- Customers reserve tickets online for free
- Pay cash when they arrive at the event
- No online payment processing
- Perfect for first-time organizers using free 1,000 tickets
- Uses QR code system for check-in

**Requirements:**
- None (available to all organizers)

#### 2. **STRIPE (Online Credit Card)**
- Customers pay with credit/debit card online
- Automatic payment processing
- Stripe fees: 2.9% + $0.30 per transaction

**Requirements:**
- Organizer must connect Stripe account in Settings

#### 3. **PAYPAL (Online)**
- Customers pay with PayPal account
- PayPal fees apply

**Requirements:**
- Organizer must connect PayPal account in Settings

#### 4. **CASHAPP (Online via Stripe)**
- Customers pay with CashApp
- Processed through Stripe integration

**Requirements:**
- Organizer must connect PayPal account in Settings
- (CashApp integration routes through PayPal)

---

## Payment Models

### Model 1: PREPAY

**Summary:** Organizer pre-purchases ticket credits, chooses how customers pay

**Organizer Pays SteppersLife:**
- $0.30 per ticket (via Square, CashApp, or PayPal)
- First 1,000 tickets FREE

**Customers Can Pay Via:**
- Cash at door (free reservation online)
- Stripe (online credit card)
- PayPal (online)
- CashApp (online)
- **Organizer can enable multiple payment methods**

**Platform Fees:**
- None (organizer keeps 100% of ticket revenue)
- Only Stripe/PayPal processing fees apply if using online payments

**Best For:**
- First-time organizers (using free 1,000 tickets)
- Events with predictable attendance
- Organizers who want to avoid percentage-based fees
- Cash-only events

**Example:**
```
Event: 500 tickets @ $25 each

Organizer Cost to SteppersLife:
- 500 tickets × $0.30 = $150 (or FREE if first event)

Revenue:
- 500 tickets × $25 = $12,500

Customer Payment Options Selected: CASH + STRIPE
- Customers can reserve free (pay cash at door)
- OR pay $25 online via Stripe

If all tickets sold online via Stripe:
- Stripe fees: ~$725 (2.9% + $0.30)
- Organizer nets: $11,775

If all tickets sold for cash at door:
- No processing fees
- Organizer nets: $12,500
```

---

### Model 2: CREDIT_CARD (Split Payment with Automatic Fees)

**Summary:** No upfront cost, SteppersLife takes percentage of each sale

**Organizer Pays SteppersLife:**
- Nothing upfront
- 3.7% + $1.79 per ticket (deducted automatically from each sale)

**Customers Can Pay Via:**
- **STRIPE ONLY** (online credit card)
- Automatic split payment

**Platform Fees:**
- Platform: 3.7% + $1.79 per ticket
- Stripe: 2.9% + $0.30 per transaction
- Total fees deducted automatically

**Best For:**
- Larger events with uncertain attendance
- Organizers who want zero upfront cost
- Professional/recurring events

**Example:**
```
Event: 500 tickets @ $25 each

Organizer Cost to SteppersLife:
- $0 upfront

Revenue:
- 500 tickets × $25 = $12,500

Per-Ticket Breakdown ($25 ticket):
- Platform fee: $25 × 0.037 + $1.79 = $2.72
- Stripe fee: $25 × 0.029 + $0.30 = $1.03
- Total fees: $3.75
- Organizer receives: $21.25

Total for 500 tickets:
- Platform fees: $1,360
- Stripe fees: $515
- Total fees: $1,875
- Organizer nets: $10,625
```

**Charity Discount (50% off):**
- Platform fee: 1.85% + $0.90 per ticket

---

## Database Schema

### `eventPaymentConfig` Table

```typescript
{
  // Payment model selection
  paymentModel: "PREPAY" | "CREDIT_CARD"

  // HOW ORGANIZER PAYS STEPPERSLIFE (PREPAY only)
  organizerPaymentMethod?: "SQUARE" | "CASHAPP" | "PAYPAL"

  // HOW CUSTOMERS PAY ORGANIZER
  customerPaymentMethods: Array<"CASH" | "STRIPE" | "PAYPAL" | "CASHAPP">

  // Payment processor connections
  stripeConnectAccountId?: string  // For Stripe payments
  paypalMerchantId?: string        // For PayPal/CashApp payments

  // PREPAY specific
  ticketsAllocated?: number  // Number of credits allocated

  // CREDIT_CARD fees
  platformFeePercent: number    // 3.7% or discounted
  platformFeeFixed: number      // $1.79 in cents
  processingFeePercent: number  // 2.9%
  charityDiscount: boolean
}
```

---

## Key Differences: PREPAY vs CREDIT_CARD

| Feature | PREPAY | CREDIT_CARD |
|---------|--------|-------------|
| **Upfront Cost** | $0.30/ticket (or FREE first 1,000) | $0 |
| **Platform Fee** | None | 3.7% + $1.79/ticket |
| **Customer Payment Options** | Cash, Stripe, PayPal, CashApp (organizer chooses) | Stripe only |
| **Payment Processor Required** | No (for cash-only)<br>Yes (for online) | Yes (Stripe Connect required) |
| **Free First Event** | ✅ Yes (1,000 tickets) | ❌ No |
| **Best For** | First-timers, cash events, predictable attendance | Large events, zero upfront, professional |
| **Organizer Keeps** | 100% of revenue (minus processing fees) | Revenue minus 3.7% + $1.79 + processing |

---

## First Event Free Tickets

### How It Works:

1. **Automatic Allocation:** When an organizer creates their first event, they automatically receive 1,000 FREE ticket credits

2. **Usage Tracking:**
   - Credits stored in `organizerCredits.firstEventFreeUsed: false`
   - When first event allocates tickets: `firstEventFreeUsed: true`
   - Linked via `organizerCredits.firstEventId`

3. **Expiration:**
   - Unused credits expire when event ends or is cancelled
   - Cannot be transferred to other events
   - After first event, organizer must purchase credits

4. **No Payment Processor Needed:**
   - Can use CASH payment method with free tickets
   - No Stripe/PayPal setup required for first event
   - Customers reserve tickets online, pay at door

---

## Event Creation Flow

### Step 1: Create Event (NO PAYMENT REQUIRED)
```typescript
// ANYONE can create an event without payment setup
- Name, description, date, location
- NO payment processor required
- NO payment model required
- Event created in DRAFT status
- paymentModelSelected: false
- Can stay in DRAFT indefinitely
```

**Important:** Payment setup is OPTIONAL. Organizers can:
- Create event and save the date
- Plan event without ticketing
- Set up payment later when ready
- Use 1000 FREE tickets with CASH-only (no processor)

### Step 2: Select Payment Model (OPTIONAL)
```typescript
// When organizer is ready to sell tickets

Option 1: PREPAY (Use free 1000 tickets or pre-purchased credits)
  - Select customer payment methods:
    ✅ CASH only (no processor needed)
    ✅ CASH + Stripe (requires Stripe Connect)
    ✅ CASH + PayPal (requires PayPal Partner)
    ✅ Multiple methods allowed
  - First event gets 1000 FREE tickets
  - No processor needed for cash-only

Option 2: CREDIT_CARD (Split payment, no upfront cost)
  - Choose processor: Stripe OR PayPal
  - MUST have processor connected
  - Stripe: Requires Stripe Connect
  - PayPal: Requires PayPal Partner account
  - Only selected processor's payment method
```

### Step 3: Tickets Go Live (OPTIONAL)
```typescript
// Only if organizer completes payment setup
- paymentModelSelected: true
- ticketsVisible: true
- Tickets available for purchase

// If no payment setup:
- paymentModelSelected: false
- ticketsVisible: false
- Event is "Save the Date" or planning mode
```

---

## Cash-at-Door Flow

### For PREPAY Model with CASH Payment Method:

**Online Reservation:**
1. Customer browses event on SteppersLife
2. Selects tickets (no payment required)
3. Receives confirmation with QR code
4. Status: `PENDING_ACTIVATION`

**At Event:**
1. Customer arrives and shows QR code
2. Staff scans QR code
3. Options:
   - **Instant Approval:** Staff collects cash, activates ticket immediately
   - **Activation Code:** Staff gives 4-digit code, customer activates via web

**Check-in:**
1. Activated ticket has new QR code
2. Staff scans for entry
3. Status changes to: `SCANNED`

---

## Stripe Connect Integration

### For Online Payments (PREPAY or CREDIT_CARD):

**Setup Process:**
1. Organizer goes to Settings → Payment Settings
2. Clicks "Connect Stripe Account"
3. Redirected to Stripe onboarding
4. Completes Stripe Express account setup
5. Returns to SteppersLife
6. Account verified and marked complete

**Account Status:**
- `stripeConnectedAccountId`: Stripe account ID
- `stripeAccountSetupComplete`: true/false
- `acceptsStripePayments`: enabled/disabled

**For PREPAY:**
- Stripe Connect optional (unless using Stripe payment method)
- Can start with cash-only

**For CREDIT_CARD:**
- Stripe Connect REQUIRED
- Cannot create CREDIT_CARD event without Stripe

---

## Payment Methods Validation

### During Payment Config Setup:

```typescript
// PREPAY validation
if (customerPaymentMethods.includes("STRIPE")) {
  // Check: user.stripeConnectedAccountId exists
}

if (customerPaymentMethods.includes("PAYPAL") ||
    customerPaymentMethods.includes("CASHAPP")) {
  // Check: user.paypalMerchantId exists
}

if (customerPaymentMethods.includes("CASH")) {
  // No validation needed
}

// CREDIT_CARD validation
if (paymentModel === "CREDIT_CARD") {
  // Require: user.stripeAccountSetupComplete === true
}
```

---

## API Endpoints

### Payment Intent Creation

**Endpoint:** `/api/stripe/create-payment-intent`

**For PREPAY Events:**
```typescript
POST {
  eventId: "event_123",
  amount: 2500, // $25.00 in cents
  // No platform fee
  // Only Stripe processing fees
}
```

**For CREDIT_CARD Events:**
```typescript
POST {
  eventId: "event_123",
  amount: 2500, // $25.00 in cents
  platformFee: 272, // 3.7% + $1.79
  // Split payment to organizer's Stripe Connect account
}
```

### Webhooks

**Endpoint:** `/api/webhooks/stripe`

**Events Handled:**
- `checkout.session.completed` → Mark order paid
- `payment_intent.succeeded` → Mark order paid
- `payment_intent.payment_failed` → Mark order failed
- `account.updated` → Update Stripe account status
- `charge.refunded` → Mark order refunded

---

## Migration Notes

### Updating Existing Events:

Existing events may not have `customerPaymentMethods` array. Default behavior:

```typescript
// For existing PREPAY events
customerPaymentMethods = ["CASH"] // Assume cash-only

// For existing CREDIT_CARD events
customerPaymentMethods = ["STRIPE"] // Already Stripe
```

### Legacy Payment Models:

- `PRE_PURCHASE` → Migrated to `PREPAY`
- `PAY_AS_SELL` → Migrated to `CREDIT_CARD`

---

## Summary

**Two-Part Payment System:**
1. **Organizer → SteppersLife:** Square, CashApp, or PayPal (PREPAY only)
2. **Customer → Organizer:** Cash, Stripe, PayPal, or CashApp (organizer chooses)

**Two Payment Models:**
1. **PREPAY:** $0.30/ticket, multiple customer payment methods, 100% revenue
2. **CREDIT_CARD:** $0 upfront, 3.7% + $1.79/ticket, Stripe only, auto-split

**Free First Event:**
- 1,000 FREE tickets for first event
- No payment processor needed (can use cash-only)
- Encourages new organizers to start without barriers
