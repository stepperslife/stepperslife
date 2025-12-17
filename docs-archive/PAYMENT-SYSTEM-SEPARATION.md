# Payment System Architecture - Complete Separation

## 🎯 Overview

SteppersLife Events platform has **THREE COMPLETELY SEPARATE payment systems** that must NEVER be mixed or cross-contaminated:

1. **Square/Cash App SDK + PayPal** → Organizer pays platform
2. **Stripe + PayPal** → Customer pays organizer
3. **Cash (USD)** → Default at-door payment

---

## 📍 System 1: Organizer → Platform (Credit Purchases)

### Purpose
Organizers purchase ticket **credits/capacity** FROM SteppersLife.com platform

### Location
- **API Routes**: `/app/api/organizer/` and `/app/api/credits/`
- **Components**: `/components/organizer/payments/`

### Payment Processors
- ✅ **Square** - Credit card payments to platform
- ✅ **Cash App (via Square SDK)** - Cash App payments to platform
- ✅ **PayPal** - PayPal payments to platform

### Key Files
```
/app/api/credits/purchase-with-square/route.ts
/app/api/credits/purchase-with-paypal/route.ts
/components/organizer/OrganizerPrepayment.tsx
```

### Data Flow
```
Organizer → Square/Cash App/PayPal → SteppersLife Platform
└─ Result: Organizer receives ticket credits
```

---

## 📍 System 2: Customer → Organizer (Ticket Sales)

### Purpose
Customers purchase **tickets** FROM event organizers

### Location
- **API Routes**: `/app/api/stripe/`, `/app/api/paypal/`, `/app/api/checkout/`
- **Components**: `/components/checkout/`

### Payment Processors
- ✅ **Stripe** - Credit/debit card + Cash App (via Stripe integration)
- ✅ **PayPal** - PayPal with split payment support
- ✅ **Cash** - Physical USD (see System 3)

### Key Files
```
/components/checkout/StripeCheckout.tsx
/components/checkout/PayPalPayment.tsx
/app/api/stripe/create-payment-intent/route.ts
/app/api/paypal/create-order/route.ts
```

### Data Flow (Split Payment)
```
Customer → Stripe/PayPal → Split:
├─ Platform Fee → SteppersLife
└─ Net Revenue → Organizer
```

### Important Notes
- **Cash App via Stripe** - Different from Cash App via Square SDK
- **Split Payments** - Platform fees automatically deducted
- **Stripe Connect** - Organizer must connect Stripe account for CREDIT_CARD model

---

## 📍 System 3: Cash (USD) - DEFAULT Payment

### Purpose
Physical cash payments validated by organizer/staff

### Location
- **API Routes**: None (no processor)
- **Convex Functions**: `/convex/orders/cashPayments.ts`
- **Components**: `/components/checkout/` (cash option)

### How It Works
1. Customer selects "Pay Cash In-Person" at checkout
2. Order created with status `PENDING_CASH_PAYMENT` (30-minute hold)
3. Organizer/staff receives notification
4. Customer pays physical USD cash to staff at door/in-person
5. Staff validates payment by entering their code
6. Order status → `COMPLETED`, tickets activated
7. Customer can enter event (QR code scanned)

### Key Files
```
/convex/orders/cashPayments.ts
/convex/orders/cashPaymentsCron.ts (auto-expire after 30 min)
```

### Default Behavior
- ✅ Available when organizer **hasn't connected** Stripe/PayPal
- ✅ No payment processor needed
- ✅ No platform fees on cash orders
- ✅ Staff approval required
- ✅ Phone number required, email optional

---

## 🚫 CRITICAL: What Was Fixed

### Issues Removed
1. ❌ **Deleted**: `/app/api/checkout/process-square-payment/route.ts`
   - Was processing CUSTOMER payments with Square (WRONG)
   - Square is organizer-only

2. ❌ **Deleted**: `/components/checkout/SquareCardPayment.tsx`
   - Was customer-facing Square component (WRONG)

3. ❌ **Deleted**: `/components/checkout/CashAppPayment.tsx`
   - Was using Square SDK for customers (WRONG)
   - Cash App via Square is organizer-only

### Schema Updates
4. ✅ **Updated**: `/convex/schema.ts`
   - Removed `CASHAPP` from `customerPaymentMethods` array
   - Removed `SQUARE` from `orders.paymentMethod` union
   - Added clear documentation separating organizer vs customer payments

### Type Definitions
5. ✅ **Updated**: `/lib/types/payment.ts`
   - Created `OrganizerPaymentProvider = 'SQUARE' | 'CASHAPP' | 'PAYPAL'`
   - Created `CustomerPaymentProvider = 'STRIPE' | 'PAYPAL' | 'CASH'`
   - Deprecated old `PaymentProviderType` that mixed both

### Payment Availability
6. ✅ **Updated**: `/lib/checkout/payment-availability.ts`
   - Removed `SQUARE` from `MerchantProcessor` type
   - Removed `cashapp` from `PaymentMethod` type
   - Updated priority: `card > paypal > cash`

---

## 📋 Payment Models

### PREPAY Model
**How Organizer Pays Platform:**
- Square, Cash App (Square SDK), or PayPal
- Buys ticket credits upfront (e.g., 500 tickets × $0.28 = $140)

**How Customers Pay Organizer:**
- Cash (USD), Stripe, or PayPal
- Organizer already paid for capacity, customers pay for tickets
- Processing fees only (2.9%), no platform fees

### CREDIT_CARD Model
**How Organizer Pays Platform:**
- Nothing upfront - pay as tickets sell

**How Customers Pay Organizer:**
- Stripe or PayPal ONLY (split payment)
- Platform fees + processing fees deducted automatically
- Organizer receives net revenue instantly

---

## 🔐 Security & Validation

### Server-Side Validation
All payment config mutations must validate:
- Square/Cash App SDK NEVER in customer payment methods
- PREPAY model: verify organizer paid for capacity
- CREDIT_CARD model: verify Stripe/PayPal Connect setup

### Type Safety
```typescript
// ✅ CORRECT - Separate types
type OrganizerPaymentProvider = 'SQUARE' | 'CASHAPP' | 'PAYPAL';
type CustomerPaymentProvider = 'STRIPE' | 'PAYPAL' | 'CASH';

// ❌ WRONG - Mixed type (deprecated)
type PaymentProviderType = 'SQUARE' | 'PAYPAL' | 'STRIPE' | 'CASHAPP';
```

---

## 📊 Payment Flow Diagrams

### Organizer Credit Purchase (PREPAY Model)
```
┌─────────────┐
│  Organizer  │
└──────┬──────┘
       │ Buys 500 tickets ($140)
       │
       ▼
┌────────────────────────────┐
│  Square / Cash App / PayPal │
└──────────┬─────────────────┘
           │ Payment to platform
           ▼
┌─────────────────────┐
│ SteppersLife.com    │
│ Credits: +500       │
└─────────────────────┘
```

### Customer Ticket Purchase (Tickets Already Allocated)
```
┌──────────┐
│ Customer │
└────┬─────┘
     │ Buys 2 tickets
     │
     ▼
┌─────────────────────┐
│ Stripe / PayPal / Cash│
└──────┬──────────────┘
       │ (If Stripe/PayPal: split payment)
       │
       ├─→ Platform Fee (3.7% + $1.79) → SteppersLife
       │
       └─→ Net Revenue → Organizer
```

### Cash Payment Flow
```
┌──────────┐
│ Customer │
└────┬─────┘
     │ 1. Selects "Cash In-Person"
     ▼
┌────────────────────┐
│ Order Created      │
│ Status: PENDING    │
│ Hold: 30 minutes   │
└────┬───────────────┘
     │ 2. Staff notification
     ▼
┌──────────────┐
│ Organizer/   │
│ Staff        │
└────┬─────────┘
     │ 3. Customer pays physical $ cash
     │ 4. Staff enters code to validate
     ▼
┌────────────────────┐
│ Order Status:      │
│ COMPLETED          │
│ Tickets Activated  │
└────────────────────┘
```

---

## ✅ Testing Checklist

### Organizer Credit Purchase
- [ ] Can purchase credits via Square
- [ ] Can purchase credits via Cash App (Square SDK)
- [ ] Can purchase credits via PayPal
- [ ] Credits added to organizer account
- [ ] Transaction recorded correctly

### Customer Ticket Purchase
- [ ] Can pay via Stripe (card)
- [ ] Can pay via PayPal
- [ ] Can select "Cash In-Person"
- [ ] Split payment works (fees deducted)
- [ ] NO Square option visible to customers
- [ ] NO Cash App (Square SDK) option visible

### Cash Payments
- [ ] Order created with PENDING status
- [ ] 30-minute hold timer works
- [ ] Staff receives notification
- [ ] Staff can validate payment
- [ ] Tickets activate after validation
- [ ] Order expires if not validated

---

## 🚨 Common Mistakes to Avoid

### ❌ DON'T
- Use Square for customer ticket purchases
- Mix organizer prepayment with customer checkout
- Allow Cash App (Square SDK) in customer checkout
- Process customer payments through platform Square account

### ✅ DO
- Keep organizer payments in `/app/api/organizer/` and `/app/api/credits/`
- Keep customer payments in `/app/api/stripe/`, `/app/api/paypal/`, `/components/checkout/`
- Use Cash (USD) as default when no Stripe/PayPal connected
- Validate payment system separation in all mutations

---

## 📞 Support

**Payment Routing Issues?**
1. Check which system the payment belongs to (organizer or customer)
2. Verify correct API route is being called
3. Check type definitions match the payment system
4. Ensure schema validation is enforcing separation

**Questions?**
- Organizer prepayment: Check `/app/api/credits/` routes
- Customer checkout: Check `/components/checkout/` components
- Cash payments: Check `/convex/orders/cashPayments.ts`

---

**Last Updated:** 2025-01-17
**Status:** ✅ Payment systems fully separated
**Version:** 2.0
