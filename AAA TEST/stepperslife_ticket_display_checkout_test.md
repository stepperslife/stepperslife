# SteppersLife - Ticket Display & Checkout Flow Test

## Test Overview
This test validates that tickets properly display on event pages and that the complete checkout process works from event page → ticket selection → checkout → confirmation.

**Focus Areas:**
1. Tickets displaying on public event pages
2. Ticket selection interface functionality
3. Add to cart / checkout flow
4. Payment processing completion
5. Confirmation and ticket delivery

---

## Pre-Test Setup

### Prerequisites:
- [ ] At least one event created with tickets allocated
- [ ] Event is published and set to "Active" status
- [ ] Tickets are in stock and available for purchase
- [ ] Stripe dev mode enabled
- [ ] Test email account accessible

---

## Test Phase 1: Ticket Display Verification

### Test 1.1: Event Page Access
**Test ID:** DISPLAY-001

**Objective:** Verify event page loads and is publicly accessible

**Steps:**
1. Navigate to stepperslife.com/events (or main events listing page)
2. Verify test event appears in listing
3. Click on test event to open event detail page
4. Verify event detail page loads completely

**Expected Results:**
- [ ] Events listing page loads without errors
- [ ] Test event card visible with:
  - [ ] Event name
  - [ ] Event image
  - [ ] Event date/time
  - [ ] Event location
  - [ ] "Get Tickets" or "Buy Tickets" button
- [ ] Event detail page loads without errors
- [ ] Page displays completely (no missing elements)

**If Tickets NOT Showing - Check:**
- [ ] Is event status set to "Published" or "Active"?
- [ ] Are tickets allocated to this event in admin panel?
- [ ] Is event date in the future (not expired)?
- [ ] Is ticket inventory > 0?

---

### Test 1.2: Ticket Information Display
**Test ID:** DISPLAY-002

**Objective:** Verify ticket information displays correctly on event page

**Steps:**
1. On event detail page, scroll to ticket section
2. Review all ticket information displayed

**Expected Results:**
Ticket section should show:
- [ ] "Tickets" heading or section clearly visible
- [ ] Ticket price displayed (e.g., "$35.00")
- [ ] Number of tickets available (e.g., "500 tickets remaining" or "Available")
- [ ] Ticket type/tier name (if applicable)
- [ ] Quantity selector (dropdown or input field)
- [ ] "Add to Cart" or "Buy Now" button
- [ ] Button is enabled (not grayed out)

**Visual Check:**
- [ ] Ticket section is prominent and easy to find
- [ ] Price is clearly displayed in large, readable font
- [ ] No layout issues or overlapping elements
- [ ] All text is readable (proper contrast)

**If Tickets NOT Visible:**
Screenshot the event page and note:
- Location where tickets should appear: _________________
- Any error messages shown: _________________
- Console errors (F12 developer tools): _________________

---

### Test 1.3: Multiple Ticket Tiers (If Applicable)
**Test ID:** DISPLAY-003

**Objective:** Verify multiple ticket types display correctly

**Steps:**
1. If event has multiple ticket types (General, VIP, Early Bird, etc.)
2. Review each ticket type display

**Expected Results:**
For each ticket type:
- [ ] Ticket name/tier clearly labeled
- [ ] Individual price displayed
- [ ] Availability status shown
- [ ] Separate quantity selectors for each tier
- [ ] Each tier distinguishable from others

**If Multiple Tiers:**
- [ ] Tiers are organized logically (by price or tier level)
- [ ] Sold out tiers show "SOLD OUT" status
- [ ] Available tiers show purchase options

---

## Test Phase 2: Ticket Selection Flow

### Test 2.1: Quantity Selection
**Test ID:** SELECT-001

**Objective:** Verify quantity selector works properly

**Test Actions:**

**Test A: Select Single Ticket**
1. Click quantity selector
2. Select "1" ticket
3. Observe interface response

**Expected Results:**
- [ ] Quantity selector updates to "1"
- [ ] Total price calculates correctly (1 × ticket price)
- [ ] No error messages appear

**Test B: Select Multiple Tickets**
1. Change quantity to "5"
2. Observe calculation

**Expected Results:**
- [ ] Quantity selector updates to "5"
- [ ] Total price = 5 × ticket price
- [ ] Running total visible on page

**Test C: Select Maximum Quantity**
1. Try to select 10+ tickets (or max allowed)
2. Verify system handles max quantity

**Expected Results:**
- [ ] System accepts quantity up to max limit (e.g., 10 tickets)
- [ ] If over limit, shows error or restricts selection
- [ ] Clear messaging about max ticket limit

**Test D: Invalid Input**
1. Try to enter "0" tickets
2. Try to enter negative number (if input field)
3. Try to enter non-numeric characters

**Expected Results:**
- [ ] System prevents invalid entries
- [ ] "Add to Cart" button remains disabled for invalid quantities
- [ ] Error message displays for invalid input

---

### Test 2.2: Add to Cart Functionality
**Test ID:** SELECT-002

**Objective:** Verify "Add to Cart" or "Buy Now" button works

**Steps:**
1. Select quantity: 2 tickets
2. Click "Add to Cart" or "Buy Now" button
3. Observe what happens

**Expected Results:**

**If "Add to Cart" (Cart-based system):**
- [ ] Success message appears ("Added to cart" confirmation)
- [ ] Cart icon updates with item count (e.g., "2" badge)
- [ ] User remains on event page OR redirected to cart
- [ ] Can continue shopping or proceed to checkout

**If "Buy Now" (Direct checkout):**
- [ ] User immediately redirected to checkout page
- [ ] Selected tickets appear in checkout summary
- [ ] Checkout page loads completely

**Common Issues to Check:**
- [ ] Button is clickable (not disabled)
- [ ] Button shows loading state while processing
- [ ] No JavaScript errors in console
- [ ] Page doesn't freeze or become unresponsive

---

### Test 2.3: Cart Review (If Cart System)
**Test ID:** SELECT-003

**Objective:** Verify cart displays selected tickets correctly

**Steps:**
1. Click on cart icon or "View Cart" button
2. Review cart contents

**Expected Results:**
Cart page shows:
- [ ] Event name
- [ ] Ticket quantity selected
- [ ] Individual ticket price
- [ ] Subtotal (quantity × price)
- [ ] Order total
- [ ] Option to update quantity
- [ ] Option to remove items
- [ ] "Proceed to Checkout" button

**Cart Management Tests:**
1. Update quantity in cart (change from 2 to 3)
   - [ ] Cart updates successfully
   - [ ] Total recalculates correctly

2. Remove item from cart
   - [ ] Item removes successfully
   - [ ] Cart shows empty state or updates count

3. Add more tickets from same event
   - [ ] Quantities combine or show separately
   - [ ] Total calculates correctly

---

## Test Phase 3: Checkout Process

### Test 3.1: Checkout Page Access
**Test ID:** CHECKOUT-001

**Objective:** Verify checkout page loads with correct information

**Steps:**
1. From cart (or event page if "Buy Now"), click "Proceed to Checkout"
2. Review checkout page

**Expected Results:**
- [ ] Checkout page loads without errors
- [ ] Order summary visible showing:
  - [ ] Event name
  - [ ] Ticket quantity
  - [ ] Individual ticket price
  - [ ] Order total
- [ ] Customer information form displayed
- [ ] Payment method section visible
- [ ] All form fields render correctly

---

### Test 3.2: Customer Information Entry
**Test ID:** CHECKOUT-002

**Objective:** Verify customer can enter their information

**Steps:**
1. Fill out customer information form:
   - First Name: "John"
   - Last Name: "Customer"
   - Email: testcustomer@stepperslife.test
   - Phone: (555) 123-4567
   - (Additional fields as required)

**Expected Results:**
- [ ] All form fields accept input
- [ ] Email field validates email format
- [ ] Phone field formats correctly
- [ ] Required field indicators visible
- [ ] No typing lag or input issues

**Validation Tests:**
1. Try to proceed without filling required fields
   - [ ] Form shows validation errors
   - [ ] Error messages are clear
   - [ ] Fields are highlighted

2. Enter invalid email format
   - [ ] Email validation triggers
   - [ ] Clear error message shown

---

### Test 3.3: Payment Method Selection
**Test ID:** CHECKOUT-003

**Objective:** Verify payment methods display and are selectable

**Steps:**
1. Review available payment methods in checkout
2. Select Stripe payment option

**Expected Results:**
- [ ] Payment method options clearly displayed
- [ ] Stripe option available and selectable
- [ ] Credit card fields render (Stripe Elements)
- [ ] Fields include:
  - [ ] Card number field
  - [ ] Expiry date field
  - [ ] CVC field
  - [ ] ZIP code field (if required)
- [ ] Lock icon or "Secure payment" indicator visible

---

### Test 3.4: Payment Processing - Successful Purchase
**Test ID:** CHECKOUT-004

**Objective:** Complete a successful test purchase end-to-end

**Test Data:**
- Quantity: 2 tickets
- Customer Email: testcustomer001@stepperslife.test
- Stripe Test Card: 4242 4242 4242 4242
- Expiry: 12/28
- CVC: 123
- ZIP: 12345

**Steps:**
1. Select 2 tickets from event page
2. Proceed to checkout
3. Fill out customer information (as above)
4. Enter Stripe test card details
5. Review order summary one final time
6. Click "Complete Purchase" or "Pay Now" button
7. Wait for processing

**Expected Results:**
- [ ] "Processing" or loading indicator shows
- [ ] No errors during payment submission
- [ ] Page redirects to confirmation/success page
- [ ] Success message displays
- [ ] Order confirmation details shown:
  - [ ] Order/confirmation number
  - [ ] Event details
  - [ ] Ticket quantity
  - [ ] Total paid
  - [ ] "Tickets will be sent to your email" message

**Post-Purchase Verification:**
- [ ] Confirmation email received at testcustomer001@stepperslife.test
- [ ] Email contains:
  - [ ] Order details
  - [ ] Event information
  - [ ] Ticket QR codes (2 tickets)
  - [ ] Each QR code is unique
  - [ ] Event date, time, location
- [ ] Tickets are scannable (QR codes work)

**Admin Panel Check:**
- [ ] Transaction appears in admin panel
- [ ] Payment status: "Completed"
- [ ] Correct amount recorded
- [ ] Ticket count decremented (e.g., 500 → 498)
- [ ] Customer email recorded
- [ ] Tickets assigned to correct event

---

### Test 3.5: Payment Processing - Declined Card
**Test ID:** CHECKOUT-005

**Objective:** Verify system handles declined payments gracefully

**Test Data:**
- Stripe Test Card (DECLINE): 4000 0000 0000 0002
- Expiry: 12/28
- CVC: 123

**Steps:**
1. Select tickets and proceed to checkout
2. Enter customer information
3. Enter declined test card: 4000 0000 0000 0002
4. Complete payment form
5. Click "Complete Purchase"
6. Observe result

**Expected Results:**
- [ ] Payment is declined by processor
- [ ] Clear error message displayed: "Your card was declined"
- [ ] User remains on checkout page
- [ ] Form data is preserved (customer info still filled in)
- [ ] User can correct payment method and retry
- [ ] No tickets deducted from inventory
- [ ] No confirmation email sent

**Admin Panel Check:**
- [ ] Failed transaction logged (optional)
- [ ] No completed order created
- [ ] Ticket inventory unchanged

---

### Test 3.6: Payment Processing - Other Error Scenarios
**Test ID:** CHECKOUT-006

**Objective:** Test various payment error scenarios

**Test Scenarios:**

**A. Insufficient Funds:**
- Card: 4000 0000 0000 9995
- Expected: "Insufficient funds" error, graceful handling

**B. Expired Card:**
- Card: 4242 4242 4242 4242
- Expiry: 01/20 (past date)
- Expected: Validation error before submission

**C. Incorrect CVC:**
- Card: 4000 0000 0000 0127 (CVC check fails)
- Expected: CVC error message

**Expected Results (All Scenarios):**
- [ ] Specific error messages for each issue
- [ ] User can retry with different payment method
- [ ] No partial orders created
- [ ] Checkout process remains stable

---

## Test Phase 4: Edge Cases & Special Scenarios

### Test 4.1: Sold Out Event
**Test ID:** EDGE-001

**Objective:** Verify behavior when event sells out

**Steps:**
1. Create or find event with limited tickets (e.g., 2 tickets remaining)
2. Navigate to event page
3. Try to purchase more tickets than available (select 5 tickets)

**Expected Results:**
- [ ] System prevents over-purchasing
- [ ] Error message: "Only X tickets available"
- [ ] Quantity selector limits to available amount
- [ ] OR checkout fails with clear error

**Sold Out Display:**
1. Purchase all remaining tickets
2. Return to event page
3. Observe display

**Expected Results:**
- [ ] "SOLD OUT" badge or message displayed
- [ ] Ticket purchase button disabled or hidden
- [ ] Clear message: "This event is sold out"
- [ ] Option to join waitlist (if feature exists)

---

### Test 4.2: Mobile Responsiveness
**Test ID:** EDGE-002

**Objective:** Verify ticket purchase works on mobile devices

**Steps:**
1. Open event page on mobile device or use browser dev tools (F12 → Toggle device toolbar)
2. Test complete purchase flow on mobile viewport

**Expected Results:**
- [ ] Event page displays properly on mobile
- [ ] Ticket section visible without scrolling issues
- [ ] Quantity selector usable on touchscreen
- [ ] "Add to Cart" button easily tappable
- [ ] Checkout form fields appropriate size
- [ ] Payment fields render correctly on mobile
- [ ] Can complete full purchase on mobile

---

### Test 4.3: Concurrent Purchase Test
**Test ID:** EDGE-003

**Objective:** Verify inventory management with simultaneous purchases

**Steps:**
1. Open event in two different browsers/incognito windows
2. Simulate two customers trying to buy last 2 tickets at same time
3. Both start checkout process simultaneously
4. Both attempt to complete purchase

**Expected Results:**
- [ ] Only 2 tickets sold total (no overselling)
- [ ] One purchase succeeds, other may fail or show "sold out"
- [ ] Inventory accurately reflects sales
- [ ] No duplicate ticket generation

---

### Test 4.4: Return to Checkout
**Test ID:** EDGE-004

**Objective:** Verify behavior when user leaves checkout and returns

**Steps:**
1. Add tickets to cart
2. Navigate to checkout
3. Fill out partial information
4. Close browser or navigate away
5. Return to site and cart

**Expected Results:**
- [ ] Cart persists (session or cookie-based)
- [ ] Can continue checkout process
- [ ] OR cart expires after timeout (document behavior)
- [ ] No duplicate orders created

---

## Test Phase 5: Cross-Browser Testing

### Test 5.1: Browser Compatibility
**Test ID:** BROWSER-001

**Objective:** Verify checkout works across major browsers

**Test in Each Browser:**
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (Mac/iOS)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

**For Each Browser, Verify:**
- [ ] Event page displays correctly
- [ ] Tickets section visible
- [ ] Add to cart works
- [ ] Checkout page loads
- [ ] Payment form renders (Stripe Elements)
- [ ] Can complete purchase successfully

**Document Any Browser-Specific Issues:**
_______________________________________

---

## Test Phase 6: Performance Testing

### Test 6.1: Page Load Speed
**Test ID:** PERF-001

**Objective:** Verify pages load in reasonable time

**Steps:**
1. Clear browser cache
2. Open event page and measure load time
3. Proceed to checkout and measure load time

**Expected Results:**
- [ ] Event page loads in < 3 seconds
- [ ] Checkout page loads in < 3 seconds
- [ ] No significant delays during process

**Tools to Use:**
- Browser DevTools Network tab
- Lighthouse performance report
- Page Speed Insights

---

### Test 6.2: High Traffic Simulation (Optional)
**Test ID:** PERF-002

**Objective:** Test system under load

**Steps:**
1. Simulate multiple concurrent users accessing event page
2. Simulate multiple concurrent checkout processes

**Expected Results:**
- [ ] System remains responsive
- [ ] No errors under moderate load
- [ ] Payment processing doesn't fail
- [ ] Database handles concurrent transactions

---

## Debugging Checklist

### If Tickets Are NOT Showing on Event Page:

**Check #1: Event Configuration**
- [ ] Event status = "Published" or "Active"
- [ ] Event date is in the future
- [ ] Event has tickets allocated

**Check #2: Ticket Allocation**
- [ ] In admin panel, verify tickets assigned to this event
- [ ] Check ticket inventory > 0
- [ ] Verify tickets aren't all distributed to team members

**Check #3: Frontend Issues**
- [ ] Open browser console (F12)
- [ ] Look for JavaScript errors
- [ ] Check if ticket data is in page source (View Page Source, search for ticket price)
- [ ] Verify API endpoint returning ticket data

**Check #4: Database**
- [ ] Query database for event_id and associated tickets
- [ ] Verify ticket records exist and are active
- [ ] Check for any soft-delete flags on tickets

**Check #5: Permissions**
- [ ] Verify event is publicly viewable (not restricted)
- [ ] Check user role permissions if logged in
- [ ] Ensure no access control blocking ticket display

---

## Common Issues & Solutions

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| Tickets not visible | Event not published | Set event status to "Active" |
| "Add to Cart" disabled | Zero inventory | Verify ticket allocation |
| Checkout fails | Stripe keys incorrect | Check Stripe API keys in config |
| No email confirmation | Email service down | Check email service status/logs |
| QR codes not generating | Missing QR library | Verify QR code generation module |
| Payment processes but no tickets | Webhook not firing | Check Stripe webhook configuration |

---

## Test Data Summary

### Test Events Created:
1. Event Name: "Test Event - Ticket Display Check"
   - Date: _______________
   - Tickets: 100
   - Price: $25.00
   - Status: Published

### Test Purchases Made:
| Test # | Email | Quantity | Card Used | Result | Order # |
|--------|-------|----------|-----------|--------|---------|
| 1 | testcustomer001@stepperslife.test | 2 | 4242... | Success | |
| 2 | testcustomer002@stepperslife.test | 5 | 4242... | Success | |
| 3 | testcustomer003@stepperslife.test | 1 | 0002... | Declined | N/A |

---

## Test Results

**Test Execution Date:** _______________
**Tester Name:** _______________

### Overall Results:
- [ ] PASS - All tickets display correctly and checkout works
- [ ] FAIL - Tickets not displaying (see issues below)
- [ ] PARTIAL - Some issues found (see issues below)

### Critical Issues Found:
1. _______________________________________
2. _______________________________________
3. _______________________________________

### Screenshots Attached:
- [ ] Event page with tickets visible
- [ ] Checkout page
- [ ] Confirmation page
- [ ] Email confirmation with QR codes

### Next Steps:
_______________________________________
_______________________________________

---

## Quick Test Checklist (For Fast Verification)

Use this for rapid testing after fixes:

- [ ] Open event page
- [ ] Confirm tickets section visible
- [ ] Select quantity: 2 tickets
- [ ] Click "Add to Cart" or "Buy Now"
- [ ] Fill out customer info
- [ ] Enter test card: 4242 4242 4242 4242
- [ ] Complete purchase
- [ ] Verify confirmation page
- [ ] Check email for tickets with QR codes

**If all above pass: Ticket display and checkout is WORKING ✓**

---

**END OF TEST PLAN**
