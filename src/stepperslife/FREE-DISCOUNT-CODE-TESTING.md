# ✅ FREE Discount Code - Testing Guide

**Created:** November 17, 2025
**Status:** ACTIVE & READY FOR TESTING

---

## 🎯 Quick Summary

A **FREE** discount code has been created for testing the complete checkout flow without actual payment processing.

### Discount Details:
- **Code:** `FREE`
- **Discount:** 100% off (completely free)
- **Event:** TEST EVENT - Checkout Flow Testing
- **Event ID:** `k171gzza0aqc4m6thq4qxyg3cn7vjgac`
- **Limitations:** None (unlimited uses, no expiration, no minimum)

---

## 🧪 How to Test

### Step 1: Navigate to Test Event
Open in browser:
```
http://localhost:3004/events/k171gzza0aqc4m6thq4qxyg3cn7vjgac
```

### Step 2: Select Tickets
- Choose any ticket tier (Early Bird $20, General $30, or VIP $75)
- Select quantity (e.g., 2 General Admission tickets = $60 total)
- Click **"Buy Tickets"**

### Step 3: Enter Discount Code at Checkout
1. On the checkout page, find the **"Discount Code"** field
2. Enter: `FREE`
3. Click **"Apply"**
4. Watch the total price drop to **$0.00**!

### Step 4: Complete Free Order
1. Fill in customer information
2. Enter email to receive tickets
3. **No payment method required** (since total is $0)
4. Click **"Complete Order"** or **"Complete Free Order"**
5. Receive confirmation email with QR codes!

---

## ✅ What Gets Tested

With the FREE code, you can test the **complete flow** without payment:

### ✅ Tested Components:
- [x] Discount code validation
- [x] Price calculation (100% reduction)
- [x] Order creation
- [x] Ticket generation
- [x] QR code generation
- [x] Email delivery
- [x] Inventory management
- [x] Confirmation page

### 🚫 NOT Tested:
- Payment gateway integration (Stripe/Square/PayPal)
- Payment webhook processing
- Credit card validation
- Payment failure handling

---

## 📊 Validation Example

**Test Query:**
```bash
npx convex run discounts/queries:validateDiscountCode '{
  "eventId": "k171gzza0aqc4m6thq4qxyg3cn7vjgac",
  "code": "FREE",
  "userEmail": "test@example.com",
  "orderTotalCents": 5000
}'
```

**Response:**
```json
{
  "valid": true,
  "discountCode": {
    "_id": "jd7cqdx9abx3fhj9pt254wtyb97vmqgc",
    "code": "FREE",
    "discountType": "PERCENTAGE",
    "discountValue": 100,
    "discountAmountCents": 5000
  }
}
```

**Translation:**
- Original order: $50.00
- Discount: 100% ($50.00)
- **Final total: $0.00** ✅

---

## 🎫 Expected Results

### After Completing Order with FREE Code:

1. **Order Confirmation Page**
   - Shows $0.00 total
   - Shows discount applied
   - Displays order number
   - Shows ticket details

2. **Email Received**
   - Subject: "Your Tickets for TEST EVENT..."
   - Contains QR codes for each ticket
   - Shows event details and location
   - Order summary shows $0.00 total

3. **Database Updates**
   - Order created with status: "completed"
   - Tickets generated with unique codes
   - Inventory decremented correctly
   - Discount usage tracked

---

## 🔧 Creating More FREE Codes

### For a Specific Event:
```bash
npx convex run testing/createFreeDiscountCode:createFreeDiscountCode '{
  "eventId": "YOUR_EVENT_ID_HERE"
}'
```

### For All Test Events:
```bash
npx convex run testing/createFreeDiscountCode:createFreeCodeForAllTestEvents
```

---

## 🎯 Testing Scenarios

### Scenario 1: Single Ticket Free Order
- **Select:** 1x Early Bird ($20)
- **Apply:** Code `FREE`
- **Result:** Total $0.00, 1 ticket generated

### Scenario 2: Multiple Tickets Free Order
- **Select:** 3x General Admission ($90 total)
- **Apply:** Code `FREE`
- **Result:** Total $0.00, 3 tickets generated

### Scenario 3: VIP Tickets Free Order
- **Select:** 2x VIP ($150 total)
- **Apply:** Code `FREE`
- **Result:** Total $0.00, 2 tickets with VIP tier info

### Scenario 4: Mixed Tier Free Order
- **Select:** 1x Early Bird + 2x General + 1x VIP ($140 total)
- **Apply:** Code `FREE`
- **Result:** Total $0.00, 4 tickets (mixed tiers)

---

## 📧 Email Testing

**IMPORTANT:** Make sure `RESEND_API_KEY` is configured in `.env.local`

Current status:
```env
RESEND_API_KEY=re_RJid1ide_12brJc6fbguPRU5WJzMDB6gQ
```

### What to Check in Email:
- ✅ All QR codes display correctly
- ✅ Each QR code is unique
- ✅ Event details accurate
- ✅ Order shows $0.00 total
- ✅ Discount code "FREE" mentioned
- ✅ Google Maps link works

---

## 🚀 Next Steps

### After Testing FREE Code:

1. **Test with Real Stripe Cards**
   - Remove discount code
   - Use test card: `4242 4242 4242 4242`
   - Verify payment processing

2. **Test Partial Discounts**
   - Create 50% off code
   - Create $10 off code
   - Test with various order totals

3. **Test Discount Restrictions**
   - Max uses limit
   - Max uses per user
   - Expiration dates
   - Minimum purchase amounts
   - Tier-specific codes

---

## 📝 Code Details

**Discount Code ID:** `jd7cqdx9abx3fhj9pt254wtyb97vmqgc`

**Properties:**
- `code`: "FREE"
- `discountType`: "PERCENTAGE"
- `discountValue`: 100 (100%)
- `isActive`: true
- `maxUses`: undefined (unlimited)
- `maxUsesPerUser`: undefined (unlimited)
- `validFrom`: undefined (valid now)
- `validUntil`: undefined (never expires)
- `minPurchaseAmount`: undefined (no minimum)
- `applicableToTierIds`: undefined (all tiers)

---

## ✅ Status: READY FOR TESTING

The FREE discount code is live and ready to use for testing the complete ticket checkout and email delivery flow!

**Test URL:** http://localhost:3004/events/k171gzza0aqc4m6thq4qxyg3cn7vjgac

**Discount Code:** `FREE`

**Total Cost:** $0.00 (100% off)

---

**Document Version:** 1.0
**Last Updated:** November 17, 2025
**Created By:** Claude Code AI
