# 🧪 Test Execution Instructions - FREE Checkout Flow

**Date:** November 17, 2025
**Test Type:** End-to-End Ticket Purchase with Email Verification
**Status:** READY TO EXECUTE

---

## 📋 Test Accounts

### Organizer Account
- **Email:** thestepperslife@gmail.com
- **Role:** Event Organizer
- **Purpose:** Owns the test event and can view orders/stats in admin/organizer dashboard

### Customer Account
- **Email:** appvillagellc@gmail.com
- **Role:** Ticket Buyer
- **Purpose:** Will receive ticket confirmation email with QR codes

---

## 🎯 Test Scenario: FREE Discount Code Checkout

### Objective
Verify complete ticket purchase flow with:
1. Customer selects tickets
2. Applies 100% discount code (FREE)
3. Order completes without payment
4. Email with QR codes sent to customer
5. Organizer can view order in dashboard
6. Admin can view order stats

---

## 📝 Step-by-Step Test Execution

### STEP 1: Navigate to Test Event
```
URL: http://localhost:3004/events/k171gzza0aqc4m6thq4qzyg3cn7vjgac
```

**What you'll see:**
- Event name: "TEST EVENT - Checkout Flow Testing"
- Three ticket tiers:
  - Early Bird: $20.00
  - General Admission: $30.00
  - VIP: $75.00

---

### STEP 2: Select Tickets

**Actions:**
1. Choose ticket tier: **General Admission** ($30.00)
2. Select quantity: **2 tickets**
3. Click **"Buy Tickets"** button

**Expected subtotal:** $60.00

---

### STEP 3: Enter Customer Information

**Actions:**
1. **Name:** Test Customer (or any name)
2. **Email:** `appvillagellc@gmail.com` ← **CRITICAL: Use this email**
3. Click **"Continue"** or proceed to discount code section

---

### STEP 4: Apply FREE Discount Code

**Actions:**
1. Find the **"Discount Code"** field
2. Enter: `FREE`
3. Click **"Apply"**

**Expected Result:**
- ✅ Discount code validates
- ✅ Subtotal: $60.00
- ✅ Discount: -$60.00 (100%)
- ✅ **Total: $0.00**
- ✅ Platform fees: $0.00
- ✅ Processing fees: $0.00

---

### STEP 5: Complete Free Checkout

**Actions:**
1. Click **"Proceed to Checkout"** or **"Complete Order"**

**Expected Result:**
- ✅ **NO payment UI shown** (Stripe/Square/PayPal skipped)
- ✅ Order completes **instantly**
- ✅ Success page displays
- ✅ Order confirmation number shown
- ✅ Message: "Order completed successfully!"

**IMPORTANT:** If you see a payment screen, something went wrong. The system should skip payment entirely for $0.00 orders.

---

### STEP 6: Verify Email Delivery

**Actions:**
1. Check inbox for: `appvillagellc@gmail.com`
2. Look for email from: **SteppersLife Events <events@stepperslife.com>**
3. Subject: **"Your Tickets for TEST EVENT - Checkout Flow Testing"**

**Email Should Contain:**
- ✅ **2 QR codes** (one for each ticket)
- ✅ Each QR code is unique
- ✅ Order summary showing **$0.00 total**
- ✅ Discount code "FREE" mentioned
- ✅ Event details (date, time, location)
- ✅ Google Maps link to venue
- ✅ Order number

**Check Spam/Junk:** If not in inbox, check spam folder.

---

### STEP 7: Verify Organizer Dashboard

**Actions:**
1. Navigate to organizer dashboard:
   ```
   http://localhost:3004/organizer/dashboard
   ```

2. **Login required:** Use Google OAuth with `thestepperslife@gmail.com`

**Expected to See:**
- ✅ Event: "TEST EVENT - Checkout Flow Testing"
- ✅ Total tickets sold: 2
- ✅ Recent order from appvillagellc@gmail.com
- ✅ Order total: $0.00
- ✅ Payment method: FREE
- ✅ Order status: COMPLETED

---

### STEP 8: Verify Admin Dashboard (Optional)

**Actions:**
1. Navigate to admin dashboard:
   ```
   http://localhost:3004/admin/dashboard
   ```

2. **Login required:** Admin access needed

**Expected to See:**
- ✅ All events statistics
- ✅ Order from appvillagellc@gmail.com visible
- ✅ Event analytics showing 2 tickets sold
- ✅ Revenue: $0.00 (due to 100% discount)

---

## ✅ Success Criteria

Mark test as **PASSED** if:
- [x] Customer can select tickets
- [x] Discount code "FREE" applies successfully
- [x] Total becomes $0.00
- [x] Payment screen is **skipped**
- [x] Order completes instantly
- [x] Email sent to **appvillagellc@gmail.com**
- [x] Email contains **2 unique QR codes**
- [x] Organizer dashboard shows the order
- [x] Order status is "COMPLETED"

---

## 🚨 Troubleshooting

### Issue: Payment screen appears even with $0.00 total
**Fix:**
- Server may need restart
- Check console for JavaScript errors
- Verify discount code was applied (total should show $0.00)

### Issue: Email not received
**Check:**
1. Spam/junk folder in appvillagellc@gmail.com
2. Server logs for email sending errors:
   ```bash
   # Check server output for Resend API errors
   ```
3. Verify `.env.local` has correct `RESEND_API_KEY`
4. Check Resend dashboard: https://resend.com/emails

### Issue: Organizer dashboard shows login error
**Fix:**
- Ensure Google OAuth is configured
- Check that thestepperslife@gmail.com is registered as organizer
- Clear browser cookies and retry

---

## 📊 Test Data Summary

| Field | Value |
|-------|-------|
| **Event ID** | k171gzza0aqc4m6thq4qzyg3cn7vjgac |
| **Event Name** | TEST EVENT - Checkout Flow Testing |
| **Discount Code** | FREE |
| **Discount Type** | 100% off |
| **Organizer Email** | thestepperslife@gmail.com |
| **Customer Email** | appvillagellc@gmail.com |
| **Ticket Tier** | General Admission |
| **Quantity** | 2 tickets |
| **Original Price** | $60.00 |
| **Discount Amount** | -$60.00 |
| **Final Total** | $0.00 |

---

## 🔐 Login Credentials Reference

### For Organizer Dashboard Access
```
URL: http://localhost:3004/organizer/dashboard
Method: Google OAuth Sign-In
Email: thestepperslife@gmail.com
```

### For Customer Email Verification
```
Check Email: appvillagellc@gmail.com
Expected From: events@stepperslife.com
Expected Subject: "Your Tickets for TEST EVENT..."
```

### For Admin Dashboard Access (if available)
```
URL: http://localhost:3004/admin/dashboard
Method: Admin authentication required
```

---

## 🎬 Quick Test Execution Checklist

```
□ 1. Open: http://localhost:3004/events/k171gzza0aqc4m6thq4qzyg3cn7vjgac
□ 2. Select: General Admission, Quantity: 2
□ 3. Click: "Buy Tickets"
□ 4. Enter Name: Test Customer
□ 5. Enter Email: appvillagellc@gmail.com
□ 6. Enter Discount Code: FREE
□ 7. Click: "Apply"
□ 8. Verify: Total shows $0.00
□ 9. Click: "Proceed to Checkout"
□ 10. Verify: No payment screen appears
□ 11. Verify: Success page displays
□ 12. Check: appvillagellc@gmail.com inbox for email
□ 13. Verify: Email has 2 unique QR codes
□ 14. Login to organizer dashboard as thestepperslife@gmail.com
□ 15. Verify: Order appears in organizer dashboard
```

---

## 📧 Expected Email Preview

**Subject:** Your Tickets for TEST EVENT - Checkout Flow Testing

**Body:**
```
Dear Test Customer,

Thank you for your order! Your tickets are attached below.

Order Summary:
- Event: TEST EVENT - Checkout Flow Testing
- Date: [Event Date]
- Location: [Event Location]
- Tickets: 2x General Admission
- Subtotal: $60.00
- Discount (FREE): -$60.00
- Total Paid: $0.00

[QR CODE 1]
Ticket #1 - General Admission

[QR CODE 2]
Ticket #2 - General Admission

🎟️ Show these QR codes at the event entrance for check-in.

Event Details:
📍 Location: [Address]
📅 Date & Time: [Event Date/Time]
🗺️ View on Google Maps: [Link]

See you at the event!

SteppersLife Events Team
```

---

## 🎯 Next Steps After Successful Test

1. ✅ Verify FREE checkout flow works
2. Test with partial discount codes (50% off, $10 off)
3. Test with real Stripe test cards for paid orders
4. Execute full comprehensive test plan with:
   - Team member accounts
   - Associate accounts
   - Multiple events
   - Different payment methods

---

**Test Status:** ✅ READY TO EXECUTE

**Last Updated:** November 17, 2025
**Created By:** Claude Code AI
