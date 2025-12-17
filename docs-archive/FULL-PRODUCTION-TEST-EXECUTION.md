# FULL PRODUCTION TEST EXECUTION PLAN
## Complete End-to-End System Verification

**Objective:** Find every hole, break, problem, or anything that could prevent complete event lifecycle from creation to completion.

**Date:** 2025-01-17
**Tester:** Production Readiness
**Environment:** Local Development (http://localhost:3004)
**Production Domain:** https://events.stepperslife.com

---

## 🎯 TEST SCOPE

### Complete Event Lifecycle:
1. ✅ Organizer registration
2. ✅ Credit allocation (1,000 FREE tickets)
3. ✅ Event creation with image optimization
4. ✅ Payment configuration (Stripe/Square/Cash App)
5. ✅ Ticket tier creation and allocation
6. ✅ Event publishing
7. ✅ Public event display
8. ✅ Customer registration
9. ✅ Ticket purchase (multiple scenarios)
10. ✅ Email delivery with QR codes
11. ✅ Ticket management
12. ✅ Staff/Team member workflows
13. ✅ Ticket scanning and check-in
14. ✅ Revenue tracking and reports
15. ✅ Event completion

---

## 📋 PRE-TEST SETUP

### 1. Environment Verification

**Check all environment variables:**
```bash
# In .env.local
CONVEX_DEPLOYMENT=https://dazzling-mockingbird-241.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://dazzling-mockingbird-241.convex.cloud
RESEND_API_KEY=re_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
NEXTAUTH_SECRET=xxxxx
NEXTAUTH_URL=http://localhost:3004
```

**Verify services are running:**
```bash
# Terminal 1: Start Next.js
cd /Users/irawatkins/stepperslife-v2-docker/src/events-stepperslife
npm run dev

# Terminal 2: Start Convex (if needed)
npx convex dev

# Verify: http://localhost:3004 loads
```

### 2. Database Reset (Preserve Users)

**Using Convex Dashboard:**
1. Go to https://dashboard.convex.dev
2. Select "dazzling-mockingbird-241" deployment
3. Navigate to Functions tab
4. Run:
```javascript
await ctx.runMutation(internal.admin.resetData.resetAllDataExceptProducts, {})
```

**Expected output:**
```javascript
{
  success: true,
  deletedCounts: {
    events: X,
    tickets: X,
    orders: X,
    organizerCreditsReset: X
  }
}
```

### 3. Test Assets Preparation

**Images:** `/Users/irawatkins/Desktop/images for testing`
- Select 3 high-quality event images (1-5MB each)
- Name them: event1.jpg, event2.jpg, event3.jpg

**Test Accounts:**
- Organizer Email: `organizer-test@stepperslife.com`
- Customer Email: `customer-test@stepperslife.com` (YOUR real email for verification)
- Staff Email: `staff-test@stepperslife.com`

**Test Payment Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

---

## 🧪 TEST EXECUTION

### TEST 1: Organizer Registration & Credit Allocation

#### 1.1 Create Organizer Account
**URL:** http://localhost:3004
**Action:** Click "Sign Up" or "Become an Organizer"

**Steps:**
1. Fill registration form:
   - Email: `organizer-test@stepperslife.com`
   - Password: `TestPass123!`
   - Name: "Test Organizer"
   - Phone: "312-555-0100"
2. Submit registration
3. Verify email (if enabled)
4. Complete profile

**Expected Results:**
- ✅ Registration successful
- ✅ Redirected to organizer dashboard
- ✅ Welcome message displayed

**Check in Convex Dashboard:**
```javascript
// Verify user created
const user = await ctx.db.query("users")
  .filter(q => q.eq(q.field("email"), "organizer-test@stepperslife.com"))
  .first();

console.log(user);
// Should have: role: "organizer", canCreateTicketedEvents: true
```

#### 1.2 Verify Initial State (Before First Event)
**Action:** Check credit balance

**In Convex Dashboard:**
```javascript
const credits = await ctx.db.query("organizerCredits")
  .withIndex("by_organizer", q => q.eq("organizerId", user._id))
  .first();

console.log(credits);
```

**Expected:**
- ❌ Credits record does NOT exist yet
- ✅ Credits will be created upon first event creation

**ISSUE CHECK:**
- [ ] Can user access organizer dashboard?
- [ ] Are all menu items visible?
- [ ] Can user navigate to "Create Event"?

---

### TEST 2: View Pricing Page

**URL:** http://localhost:3004/pricing

**Visual Verification:**
- [ ] ✅ GREEN gradient banner: "🎉 NEW ORGANIZER SPECIAL! 🎉"
- [ ] ✅ Text: "Get 1,000 FREE Tickets for Your First Event!"
- [ ] ✅ Event types listed: TICKETED, FREE, SAVE-THE-DATE
- [ ] ✅ Expiration note: "Credits expire when first event ends"
- [ ] ✅ BLUE "How It Works" section
- [ ] ✅ 3-step process clearly displayed
- [ ] ✅ "No payment required until ready to publish" text
- [ ] ✅ Payment model comparison (PREPAY vs CREDIT_CARD)
- [ ] ✅ Fee calculator functional
- [ ] ✅ All links work

**ISSUE CHECK:**
- [ ] Banner colors correct (green gradient)?
- [ ] Text readable and professional?
- [ ] Mobile responsive?
- [ ] CTA buttons functional?

---

### TEST 3: Event Creation - TICKETED EVENT

**URL:** http://localhost:3004/organizer/events/create

#### 3.1 Step 1: Basic Information

**Fill form:**
- Event Name: `Chicago Summer Step Fest 2025`
- Event Type: TICKETED_EVENT ✅
- Description:
```
Join us for the hottest stepping event of the summer!

Features:
- Live DJ spinning classic steppers tracks
- Complimentary appetizers
- Cash bar available
- Professional photographers
- Prizes and giveaways

Don't miss this unforgettable night of stepping!
```
- Categories: Select "Set", "Weekend Event"

**Click:** Next Step

**ISSUE CHECK:**
- [ ] All fields accept input?
- [ ] Event type selection works?
- [ ] Character limits appropriate?
- [ ] Validation messages clear?

#### 3.2 Step 2: Date & Time

**Fill form:**
- Start Date & Time: `2025-07-15 20:00` (Future date, 8:00 PM)
- End Date & Time: `2025-07-16 02:00` (Next day, 2:00 AM)
- Timezone: Auto-detected (verify shows correct city/state)

**Click:** Next Step

**ISSUE CHECK:**
- [ ] Datetime picker works?
- [ ] Timezone auto-detection accurate?
- [ ] Can select past dates (should prevent)?
- [ ] End date after start date validation?

#### 3.3 Step 3: Location

**Fill form:**
- Venue Name: `The Grand Ballroom at Navy Pier`
- Street Address: `600 E Grand Ave`
- City: `Chicago`
- State: `IL`
- ZIP Code: `60611`
- Country: `USA`

**Verify:**
- ✅ Timezone auto-updated to "Central Time"
- ✅ Timezone display shows city/state

**Click:** Next Step

**ISSUE CHECK:**
- [ ] Address autocomplete works (if enabled)?
- [ ] Timezone updates when city/state entered?
- [ ] All fields accept input?

#### 3.4 Step 4: Additional Details & Image Upload

**Fill form:**
- Event Capacity: `500`

**Image Upload (CRITICAL TEST):**
1. Click upload area
2. Select image from `/Users/irawatkins/Desktop/images for testing/event1.jpg`
3. **WATCH FOR:**
   - ⏱️ "Optimizing image..." message appears
   - 📊 Progress bar shows 0% → 100%
   - 📝 Console log: `Original image size: X.XXmb`
   - 📝 Console log: `Compressed image size: X.XXmb`
   - ✅ Compressed size ≤ 2MB
   - 🖼️ Image preview displays
   - ⚡ Upload completes quickly

**Open Browser Console (F12):**
```
Expected logs:
Original image size: 4.23MB
Compressed image size: 1.87MB
```

**Click:** Create Event

**ISSUE CHECK:**
- [ ] Capacity field validates number?
- [ ] Image upload shows progress?
- [ ] Compression actually works?
- [ ] Console shows size reduction?
- [ ] Preview displays correctly?
- [ ] Required asterisk (*) shows for image?
- [ ] Can submit without image (should prevent)?

---

### TEST 4: Verify Credit Allocation

**After event creation, check Convex Dashboard:**

```javascript
// Get the event
const events = await ctx.db.query("events")
  .filter(q => q.eq(q.field("name"), "Chicago Summer Step Fest 2025"))
  .first();

console.log("Event:", events);

// Get credits
const user = await ctx.db.query("users")
  .filter(q => q.eq(q.field("email"), "organizer-test@stepperslife.com"))
  .first();

const credits = await ctx.db.query("organizerCredits")
  .withIndex("by_organizer", q => q.eq("organizerId", user._id))
  .first();

console.log("Credits:", credits);
```

**Expected Credits Object:**
```javascript
{
  organizerId: "user_id",
  creditsTotal: 1000,
  creditsUsed: 0,
  creditsRemaining: 1000,
  firstEventFreeUsed: false,  // Will become true after ticket allocation
  firstEventId: "event_id",   // Linked to first event
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**ISSUE CHECK:**
- [ ] ✅ Credits = 1,000?
- [ ] ✅ firstEventId = event ID?
- [ ] ✅ creditsUsed = 0?
- [ ] ✅ creditsRemaining = 1,000?

**CRITICAL:** If credits NOT allocated:
- 🚨 MAJOR ISSUE - Free tickets promotion broken
- Check: convex/events/mutations.ts lines 98-126
- Check: Event creation logs for errors

---

### TEST 5: Configure Payment Processor

**URL:** http://localhost:3004/organizer/events/[eventId]

**Action:** Click event, look for payment configuration

**Steps:**
1. Navigate to event details
2. Find "Payment Configuration" or similar section
3. Select payment model: **CREDIT_CARD** (Stripe)
4. Enter Stripe Connect details (or use test mode)
5. Save configuration

**Expected:**
- ✅ Payment configuration saves
- ✅ Event shows "Payment Configured" status

**In Convex Dashboard:**
```javascript
const paymentConfig = await ctx.db.query("eventPaymentConfig")
  .withIndex("by_event", q => q.eq("eventId", "event_id"))
  .first();

console.log("Payment Config:", paymentConfig);
```

**ISSUE CHECK:**
- [ ] Payment configuration page accessible?
- [ ] Stripe configuration saves?
- [ ] Test mode works without real Stripe account?
- [ ] Validation messages clear?

---

### TEST 6: Create Ticket Tiers

**URL:** http://localhost:3004/organizer/events/[eventId]/tickets

**Action:** Click "Tickets" button (should be blinking if no tiers)

#### 6.1 Create Tier 1: Early Bird
**Fill form:**
- Tier Name: `Early Bird`
- Description: `Save $10 with early bird pricing - limited quantity!`
- Price: `$35.00`
- Quantity: `100`
- Available From: `[Now]`
- Available Until: `2025-06-15` (1 month before event)

**Click:** Save / Create Tier

#### 6.2 Create Tier 2: General Admission
**Fill form:**
- Tier Name: `General Admission`
- Description: `Standard ticket - best value`
- Price: `$45.00`
- Quantity: `300`
- Available From: `2025-06-15`
- Available Until: `2025-07-15` (day of event)

**Click:** Save / Create Tier

#### 6.3 Create Tier 3: VIP
**Fill form:**
- Tier Name: `VIP Experience`
- Description: `Includes reserved seating, premium appetizers, and VIP parking`
- Price: `$75.00`
- Quantity: `100`
- Available From: `[Now]`
- Available Until: `2025-07-15`

**Click:** Save / Create Tier

**Total Tickets:** 100 + 300 + 100 = 500 (matches capacity)

#### 6.4 Verify Credit Deduction

**In Convex Dashboard:**
```javascript
const credits = await ctx.db.query("organizerCredits")
  .withIndex("by_organizer", q => q.eq("organizerId", user._id))
  .first();

console.log("Credits after allocation:", credits);
```

**Expected:**
```javascript
{
  creditsTotal: 1000,
  creditsUsed: 500,           // 500 tickets allocated
  creditsRemaining: 500,      // 500 tickets still available
  firstEventFreeUsed: true,   // NOW true (tickets allocated)
  firstEventId: "event_id"
}
```

**ISSUE CHECK:**
- [ ] ✅ All 3 tiers created?
- [ ] ✅ Credits deducted correctly (500 used)?
- [ ] ✅ creditsRemaining = 500?
- [ ] ✅ firstEventFreeUsed = true?
- [ ] Can create more tickets than credits (should warn)?
- [ ] Price validation works (no negative prices)?
- [ ] Quantity validation works (no negative)?

**CRITICAL ISSUE CHECK:**
If credits NOT deducted:
- 🚨 MAJOR ISSUE - Credit allocation system broken
- Check: convex/events/allocations.ts
- Check: Ticket creation logs

---

### TEST 7: Publish Event

**URL:** http://localhost:3004/organizer/events/[eventId]

**Action:** Find "Publish Event" button

**Pre-publish checklist (system should verify):**
- [ ] ✅ Event has image
- [ ] ✅ Event has tickets
- [ ] ✅ Payment configured
- [ ] ✅ All required fields complete

**Click:** Publish Event

**Expected:**
- ✅ Event status changes to "PUBLISHED"
- ✅ Success message displayed
- ✅ Event now visible on public pages

**ISSUE CHECK:**
- [ ] Publish button accessible?
- [ ] Validation prevents publishing incomplete events?
- [ ] Status updates immediately?
- [ ] Redirects to appropriate page?

---

### TEST 8: Verify Public Event Display

#### 8.1 Events List Page
**URL:** http://localhost:3004/events

**Verify:**
- [ ] ✅ Event appears in list
- [ ] ✅ Event image displays (optimized, compressed)
- [ ] ✅ Event name, date, location correct
- [ ] ✅ "Buy Tickets" or "View Event" button visible

**ISSUE CHECK:**
- [ ] Image loads quickly?
- [ ] Image quality good despite compression?
- [ ] Date/time displays correctly?
- [ ] Filtering/sorting works?

#### 8.2 Event Detail Page
**URL:** http://localhost:3004/events/[eventId]

**Verify:**
- [ ] ✅ Large event image at top (hero image)
- [ ] ✅ Event name as H1
- [ ] ✅ Date/time prominent
- [ ] ✅ Location with Google Maps link
- [ ] ✅ Full description displays
- [ ] ✅ Categories shown
- [ ] ✅ Ticket tiers listed with prices
- [ ] ✅ "Select Tickets" or "Buy Now" buttons
- [ ] ✅ Tier availability status (Early Bird, etc.)

**ISSUE CHECK:**
- [ ] All content renders?
- [ ] Images load quickly?
- [ ] Maps link works?
- [ ] Responsive on mobile?
- [ ] Share buttons work (if present)?

---

### TEST 9: Customer Ticket Purchase - SUCCESS SCENARIO

#### 9.1 Start Checkout
**URL:** http://localhost:3004/events/[eventId]

**As customer (log out from organizer account):**
1. Click "Buy Tickets" or similar
2. Select tier: **Early Bird**
3. Select quantity: **2 tickets**
4. Click "Continue to Checkout"

**Expected:**
- ✅ Redirected to checkout page
- ✅ Event details shown (image, name, date)
- ✅ Selected tier and quantity displayed

#### 9.2 Checkout Page Verification
**URL:** http://localhost:3004/events/[eventId]/checkout

**Verify Layout (Two-Column):**

**LEFT COLUMN:**
- [ ] ✅ Event image at top (compressed, optimized)
- [ ] ✅ Event name below image
- [ ] ✅ Date/time displayed
- [ ] ✅ Location displayed
- [ ] ✅ Selected tier name and price
- [ ] ✅ Subtotal calculation

**RIGHT COLUMN (in order):**
- [ ] ✅ Quantity selector (above discount code)
- [ ] ✅ "Your Information" card
  - Full Name field
  - Email field
  - Confirm Email field
- [ ] ✅ "Discount Code" card
  - Code input field
  - Apply button
- [ ] ✅ "Order Summary" card
  - Subtotal
  - Processing fee
  - Total

**CRITICAL CHECKS:**
- [ ] Quantity on right side (NOT left)?
- [ ] Quantity ABOVE discount code?
- [ ] Image at top of left column?
- [ ] All fields functional?

#### 9.3 Fill Customer Information
**Fill form:**
- Full Name: `John Customer`
- Email: `YOUR-REAL-EMAIL@gmail.com` (USE YOUR REAL EMAIL!)
- Confirm Email: `YOUR-REAL-EMAIL@gmail.com`

**Test discount code (if applicable):**
- Try code: `FREE` (should apply 100% discount if configured)
- Try code: `INVALID` (should show error)

#### 9.4 Payment (Stripe)
**Action:** Click "Proceed to Payment" or "Pay Now"

**Enter test card:**
- Card Number: `4242 4242 4242 4242`
- Expiry: `12/25` (any future date)
- CVC: `123`
- ZIP: `60611`

**Click:** Pay / Complete Purchase

**Watch for:**
- ⏱️ Processing indicator
- ✅ Success message
- 🎉 Confetti or celebration animation (if present)
- 📧 "Check your email" message

**Expected Redirect:**
- URL: `/events/[eventId]/checkout?success=true` or `/payment-success`
- Message: "Payment successful! Check your email for tickets."

**ISSUE CHECK:**
- [ ] Payment form loads?
- [ ] Stripe elements render?
- [ ] Payment processes within 5 seconds?
- [ ] Success page displays?
- [ ] Error handling for declined cards?

---

### TEST 10: Email Verification (CRITICAL)

**Check your email inbox within 60 seconds**

#### 10.1 Email Receipt Verification
**Expected email:**
- From: `SteppersLife Events <events@stepperslife.com>`
- Subject: `Your Tickets for Chicago Summer Step Fest 2025 - Tuesday, July 15, 2025`

**Email Content Checklist:**
- [ ] ✅ Header: Purple gradient with "Ticket Confirmation"
- [ ] ✅ Event image displays (compressed version)
- [ ] ✅ Event name: "Chicago Summer Step Fest 2025"
- [ ] ✅ Date: "Tuesday, July 15, 2025"
- [ ] ✅ Time: "8:00 PM"
- [ ] ✅ Location: "The Grand Ballroom at Navy Pier"
- [ ] ✅ Full address displayed
- [ ] ✅ "Get Directions" button (Google Maps link)
- [ ] ✅ Maps link works when clicked

**QR Codes Section:**
- [ ] ✅ Shows "Your Tickets (2)"
- [ ] ✅ TWO separate QR codes (one per ticket)
- [ ] ✅ Each QR code is different (unique)
- [ ] ✅ Each QR code has white background and padding
- [ ] ✅ Ticket #1 shows "John Customer"
- [ ] ✅ Ticket #2 shows "John Customer"
- [ ] ✅ Unique ticket codes displayed (e.g., "ABCD1234EFGH")
- [ ] ✅ QR codes are scannable (test with phone camera)

**Order Summary:**
- [ ] ✅ Order Number displays (truncated ID)
- [ ] ✅ Payment Method: "Stripe" or "Credit Card"
- [ ] ✅ Total Paid: "$70.00" (2 x $35.00)
- [ ] ✅ Calculation correct

**Important Information Box:**
- [ ] ✅ Yellow/gold background
- [ ] ✅ Lists 5 important points:
  1. Save this email or screenshot QR codes
  2. Show QR code at event check-in
  3. Each ticket can only be scanned once
  4. Arrive early to avoid lines
  5. Contact support if issues

**Footer:**
- [ ] ✅ Support email: support@stepperslife.com
- [ ] ✅ Copyright year: 2025
- [ ] ✅ Link to events.stepperslife.com

#### 10.2 QR Code Testing
**Test each QR code:**
1. Open phone camera app
2. Point at QR code on screen
3. Should read ticket code

**Expected QR code data:**
```
ABC123XYZ456  (ticket code format)
```

**CRITICAL ISSUE CHECK:**
If NO email received:
- 🚨 MAJOR ISSUE - Email system broken
- Check 1: RESEND_API_KEY in .env.local
- Check 2: Browser console for API errors
- Check 3: Convex logs for email function errors
- Check 4: Resend dashboard (https://resend.com/emails)
- Check 5: Spam folder

If DUPLICATE QR codes:
- 🚨 MAJOR ISSUE - QR generation broken
- Each ticket MUST have unique code

---

### TEST 11: Verify Database State

**In Convex Dashboard, verify records created:**

```javascript
// 1. Order created
const orders = await ctx.db.query("orders")
  .filter(q => q.eq(q.field("buyerEmail"), "YOUR-EMAIL@gmail.com"))
  .collect();

console.log("Orders:", orders);
// Expected: 1 order, status: "COMPLETED", totalAmount: 7000 (cents)

// 2. Tickets created
const tickets = await ctx.db.query("tickets")
  .filter(q => q.eq(q.field("orderId"), orders[0]._id))
  .collect();

console.log("Tickets:", tickets);
// Expected: 2 tickets, each with unique ticketCode

// 3. Ticket tier sold count updated
const tiers = await ctx.db.query("ticketTiers")
  .withIndex("by_event", q => q.eq("eventId", "event_id"))
  .collect();

console.log("Tiers:", tiers);
// Expected: Early Bird tier has sold: 2

// 4. Credits NOT affected (tickets already allocated)
const credits = await ctx.db.query("organizerCredits")
  .withIndex("by_organizer", q => q.eq("organizerId", user_id))
  .first();

console.log("Credits:", credits);
// Expected: Still creditsUsed: 500, creditsRemaining: 500
```

**ISSUE CHECK:**
- [ ] ✅ Order exists with correct amount?
- [ ] ✅ 2 tickets created?
- [ ] ✅ Each ticket has unique code?
- [ ] ✅ Ticket tier sold count = 2?
- [ ] ✅ Credits unchanged (already allocated)?

---

### TEST 12: Customer "My Tickets" Page

**URL:** http://localhost:3004/my-tickets

**As customer (using email from purchase):**
1. Log in with email: `YOUR-EMAIL@gmail.com`
2. Navigate to "My Tickets" or similar

**Verify:**
- [ ] ✅ Event displayed with image
- [ ] ✅ Shows "2 tickets"
- [ ] ✅ Event date/time/location correct
- [ ] ✅ "View Tickets" or "Download" button
- [ ] ✅ Clicking shows QR codes
- [ ] ✅ Download/print functionality works

**ISSUE CHECK:**
- [ ] Page accessible?
- [ ] Tickets display correctly?
- [ ] QR codes match email?
- [ ] Can download/print tickets?

---

### TEST 13: Organizer Dashboard & Reports

**URL:** http://localhost:3004/organizer/events/[eventId]

**Log in as organizer**

**Verify:**
- [ ] ✅ Event displays with PUBLISHED status
- [ ] ✅ Ticket sales summary shows:
  - Early Bird: 2 sold / 100 available
  - General Admission: 0 sold / 300 available
  - VIP: 0 sold / 100 available
- [ ] ✅ Total revenue: $70.00
- [ ] ✅ Revenue after fees calculated
- [ ] ✅ "View Orders" or "Manage Tickets" button
- [ ] ✅ Recent orders list shows customer purchase

**ISSUE CHECK:**
- [ ] Sales count accurate?
- [ ] Revenue calculation correct?
- [ ] Fees displayed accurately?
- [ ] Charts/graphs display (if present)?

---

### TEST 14: Staff/Team Member Workflow

#### 14.1 Add Staff Member
**URL:** http://localhost:3004/organizer/events/[eventId]/staff

**Action:** Add team member

**Fill form:**
- Name: `Test Staff Member`
- Email: `staff-test@stepperslife.com`
- Role: STAFF or TEAM_MEMBER
- Commission: 10% or $5 per ticket
- Auto-assign: ✅ Yes

**Click:** Add Staff / Send Invite

**Expected:**
- ✅ Staff member added
- ✅ Unique referral code generated
- ✅ Invite email sent (if configured)

**ISSUE CHECK:**
- [ ] Staff creation works?
- [ ] Referral code generated?
- [ ] Commission settings save?
- [ ] Can edit staff after creation?

#### 14.2 Test Referral Link
**Get staff referral link:**
Format: `http://localhost:3004/events/[eventId]?ref=STAFF123`

**In incognito/private browser:**
1. Visit referral link
2. Purchase ticket (same flow as TEST 9)
3. Use different email: `customer2-test@gmail.com`

**Verify in database:**
```javascript
const order = await ctx.db.query("orders")
  .filter(q => q.eq(q.field("buyerEmail"), "customer2-test@gmail.com"))
  .first();

console.log("Order referral:", order.referralCode);
// Should match staff referral code
```

**ISSUE CHECK:**
- [ ] Referral tracking works?
- [ ] Commission calculated correctly?
- [ ] Staff can view their sales?

---

### TEST 15: Ticket Scanning & Check-In

**URL:** http://localhost:3004/organizer/events/[eventId]/scanning
or: http://localhost:3004/staff/scanning

#### 15.1 Scanner Access
**Log in as organizer or staff**

**Verify:**
- [ ] ✅ Scanner page loads
- [ ] ✅ Camera permission requested
- [ ] ✅ Can grant camera access
- [ ] ✅ Camera feed displays

**ISSUE CHECK:**
- [ ] Camera permissions handled?
- [ ] Works on mobile?
- [ ] Manual entry option available?

#### 15.2 Scan Valid Ticket
**Action:** Use phone/webcam to scan QR code from email

**Expected:**
- ✅ QR code scanned successfully
- ✅ Ticket details display:
  - Attendee name: "John Customer"
  - Ticket tier: "Early Bird"
  - Event name
- ✅ "Valid Ticket" message
- ✅ Green success indicator
- ✅ "Check In" button appears

**Click:** Check In

**Expected:**
- ✅ Ticket status → "SCANNED"
- ✅ Scanned timestamp recorded
- ✅ "Checked in successfully" message
- ✅ Ready to scan next ticket

**ISSUE CHECK:**
- [ ] QR scanner works reliably?
- [ ] Ticket validation correct?
- [ ] Check-in updates database?
- [ ] Prevents double scanning?

#### 15.3 Scan Same Ticket Again (Should Fail)
**Action:** Scan same QR code again

**Expected:**
- ❌ "Already scanned" error
- 🚫 Red error indicator
- 📅 Shows previous scan time
- 👤 Shows who scanned it

**ISSUE CHECK:**
- [ ] Double-scan prevention works?
- [ ] Error message clear?
- [ ] Shows scan history?

#### 15.4 Manual Entry
**Action:** Click "Manual Entry" or enter ticket code

**Enter:** Ticket code from second ticket (from email)

**Expected:**
- ✅ Finds ticket
- ✅ Shows ticket details
- ✅ Can check in manually

**ISSUE CHECK:**
- [ ] Manual entry works?
- [ ] Code validation correct?
- [ ] Handles typos gracefully?

---

### TEST 16: Payment Scenarios

#### 16.1 Declined Card
**Start new purchase (3rd tier: General Admission)**

**Use declined card:**
- Card: `4000 0000 0000 0002`
- Other details: Any valid

**Expected:**
- ❌ "Payment declined" error
- 🔄 "Try again" option
- 💳 Can enter different card
- 🚫 NO order created
- 🚫 NO tickets created
- 📧 NO email sent

**ISSUE CHECK:**
- [ ] Error handling graceful?
- [ ] User can retry?
- [ ] No partial orders created?

#### 16.2 Free Ticket (100% Discount)
**If discount codes configured:**

**Start new purchase:**
1. Select any tier
2. Apply discount code: `FREE` (if exists)
3. Total should be $0.00

**Expected:**
- ✅ No payment form displayed
- ✅ "Complete Registration" button instead
- ✅ Order created with $0.00
- ✅ Tickets generated
- ✅ Email sent with QR codes

**ISSUE CHECK:**
- [ ] Free tickets work?
- [ ] Email still sent?
- [ ] QR codes still generated?

---

### TEST 17: Event Capacity & Sell-Out

#### 17.1 Sell Remaining Early Bird Tickets
**Scenario:** Early Bird has 100 total, 2 sold = 98 remaining

**Action:** Purchase 98 more Early Bird tickets
(May need multiple purchases due to order limits)

**Expected after 100th ticket sold:**
- ✅ Early Bird tier shows "SOLD OUT"
- 🚫 Cannot select Early Bird anymore
- ✅ Other tiers still available
- ✅ Event still shows as available

**ISSUE CHECK:**
- [ ] Tier sell-out logic works?
- [ ] Prevents overselling?
- [ ] UI updates immediately?

#### 17.2 Event Full Capacity
**Scenario:** Sell all 500 tickets across all tiers

**Expected when capacity reached:**
- ✅ Event shows "SOLD OUT"
- 🚫 All tiers unavailable
- 🚫 "Buy Tickets" button disabled or hidden
- ℹ️ "This event is sold out" message

**ISSUE CHECK:**
- [ ] Capacity tracking accurate?
- [ ] Prevents overselling?
- [ ] Clear messaging to customers?

---

### TEST 18: Second Event (No Free Tickets)

#### 18.1 Create Second Event
**As same organizer**

**Create new event:**
- Name: `Fall Step Championship 2025`
- Type: TICKETED_EVENT
- [Complete all steps like TEST 3]

#### 18.2 Try to Create Tickets Exceeding Credits
**Remaining credits:** 500 (from first event)

**Try to create:**
- Tier 1: 400 tickets
- Tier 2: 300 tickets
- **Total:** 700 tickets (exceeds 500 available)

**Expected:**
- ⚠️ Warning: "Insufficient credits"
- 💰 "You need 200 more tickets"
- 💳 "Purchase credits: 200 × $0.30 = $60.00"
- 🚫 Cannot publish until resolved

**ISSUE CHECK:**
- [ ] Credit limit enforced?
- [ ] Clear error messaging?
- [ ] Shows exact shortage?
- [ ] Provides purchase option?

#### 18.3 Purchase Additional Credits
**Action:** Click "Purchase Credits" or similar

**Options (PREPAY model):**
- [ ] Square payment
- [ ] Cash App payment
- [ ] PayPal payment

**Purchase:** 500 tickets package ($140)

**Expected:**
- ✅ Credits added: 500
- ✅ New total: 500 (old) + 500 (new) = 1,000 available
- ✅ Can now create 700 tickets
- ✅ Transaction recorded

**ISSUE CHECK:**
- [ ] Credit purchase works?
- [ ] Balance updates immediately?
- [ ] Payment processors integrated?
- [ ] Receipt/confirmation provided?

---

### TEST 19: Event Management

#### 19.1 Edit Published Event
**Action:** Edit event details after publishing

**Try to change:**
- Event name ✅ Should allow
- Description ✅ Should allow
- Date/time ❌ Should prevent (tickets sold)
- Location ✅ Should allow (with warning)
- Add tickets ✅ Should allow
- Reduce capacity ❌ Should prevent (tickets sold)

**ISSUE CHECK:**
- [ ] Edit restrictions enforced?
- [ ] Warnings displayed appropriately?
- [ ] Changes save correctly?
- [ ] Customers notified of changes?

#### 19.2 Cancel Event
**Action:** Try to cancel event with sold tickets

**Expected:**
- ⚠️ "This event has 2 tickets sold"
- 💰 "Refunds will be processed"
- ❓ "Are you sure?" confirmation
- 📧 Email notifications to customers

**ISSUE CHECK:**
- [ ] Cancel prevention if sold tickets?
- [ ] Refund process triggered?
- [ ] Customer notifications sent?
- [ ] Status updates correctly?

---

### TEST 20: Search & Discovery

#### 20.1 Event Search
**URL:** http://localhost:3004/events

**Test search:**
- Search: "Chicago" → Should find "Chicago Summer Step Fest"
- Search: "Fall" → Should find "Fall Step Championship"
- Search: "Invalid" → Should show "No events found"

**ISSUE CHECK:**
- [ ] Search functional?
- [ ] Results accurate?
- [ ] Empty state handled?

#### 20.2 Category Filtering
**Action:** Filter by category "Set"

**Expected:**
- ✅ Shows events tagged "Set"
- 🚫 Hides events without "Set" tag

**ISSUE CHECK:**
- [ ] Filtering works?
- [ ] Multiple filters combine correctly?
- [ ] Clear filters option?

#### 20.3 Date Filtering
**Action:** Filter "Upcoming Events"

**Expected:**
- ✅ Shows only future events
- 🚫 Hides past events

**ISSUE CHECK:**
- [ ] Date logic correct?
- [ ] Timezone handling correct?
- [ ] Past event archive accessible?

---

## 🐛 ISSUES LOG

### Critical Issues (Blocks Production)
| # | Issue | Component | Severity | Status |
|---|-------|-----------|----------|--------|
| 1 | | | | |
| 2 | | | | |

### Major Issues (Impacts UX)
| # | Issue | Component | Severity | Status |
|---|-------|-----------|----------|--------|
| 1 | | | | |
| 2 | | | | |

### Minor Issues (Polish)
| # | Issue | Component | Severity | Status |
|---|-------|-----------|----------|--------|
| 1 | | | | |
| 2 | | | | |

### Gaps/Missing Features
| # | Gap | Impact | Priority |
|---|-----|--------|----------|
| 1 | | | |
| 2 | | | |

---

## ✅ SUCCESS CRITERIA

Event lifecycle is PRODUCTION READY if:

**Event Creation:**
- [ ] Organizer can register and access dashboard
- [ ] 1,000 FREE tickets allocated automatically on first event
- [ ] Image upload compresses to ≤2MB reliably
- [ ] All event types can be created (TICKETED, FREE, SAVE-THE-DATE)
- [ ] Event publishes successfully

**Ticketing:**
- [ ] Credits deducted correctly when tickets allocated
- [ ] Multiple ticket tiers can be created
- [ ] Prices and quantities validate properly
- [ ] Tier availability dates work correctly
- [ ] Sold count increments accurately

**Customer Purchase:**
- [ ] Checkout page displays correctly (two-column layout)
- [ ] Quantity selector on right, above discount code
- [ ] Event image displays (compressed version)
- [ ] Payment processes successfully (Stripe)
- [ ] Declined cards handled gracefully
- [ ] Free tickets work (100% discount)

**Email Delivery:**
- [ ] Email arrives within 60 seconds
- [ ] Email contains event image
- [ ] QR codes generated (unique per ticket)
- [ ] QR codes are scannable
- [ ] Order summary accurate
- [ ] All links functional

**Ticket Management:**
- [ ] Customer can view tickets in "My Tickets"
- [ ] QR codes match email
- [ ] Can download/print tickets

**Scanning & Check-In:**
- [ ] Scanner accessible to organizer/staff
- [ ] QR codes scan successfully
- [ ] Check-in updates database
- [ ] Double-scan prevention works
- [ ] Manual entry functional

**Organizer Dashboard:**
- [ ] Sales count accurate in real-time
- [ ] Revenue calculations correct
- [ ] Reports accessible
- [ ] Can manage staff/team members
- [ ] Referral tracking works

**Credit System:**
- [ ] First event gets 1,000 FREE tickets
- [ ] Second event doesn't get free tickets
- [ ] Can purchase additional credits
- [ ] Credit balance accurate
- [ ] Insufficient credits prevents publishing

**Edge Cases:**
- [ ] Tier sell-out prevents overselling
- [ ] Event capacity enforced
- [ ] Date/time restrictions when tickets sold
- [ ] Refunds process on cancellation
- [ ] Search and filtering functional

---

## 📊 FINAL REPORT TEMPLATE

```
PRODUCTION TEST EXECUTION REPORT
Date: [DATE]
Tester: [NAME]
Duration: [HOURS]

OVERALL STATUS: [ ] PASS  [ ] CONDITIONAL PASS  [ ] FAIL

TESTS EXECUTED: X/20
TESTS PASSED: X/20
TESTS FAILED: X/20

CRITICAL ISSUES: X
MAJOR ISSUES: X
MINOR ISSUES: X
GAPS IDENTIFIED: X

RECOMMENDATION:
[ ] READY FOR PRODUCTION
[ ] READY WITH MINOR FIXES
[ ] NOT READY - REQUIRES WORK

NEXT STEPS:
1.
2.
3.

ATTACHMENTS:
- Screenshots of issues
- Error logs
- Email samples
- QR code test results
```

---

**Note:** This is a comprehensive test plan. Execute systematically, document every issue, and verify fixes before deployment.
