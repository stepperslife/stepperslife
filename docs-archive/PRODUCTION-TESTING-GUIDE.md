# Production Testing Guide
## Real Event Creation & 1,000 FREE Tickets Verification

---

## 🎯 OBJECTIVE
Test the complete event creation workflow as a real customer would experience it, including:
- Image upload with automatic optimization
- 1,000 FREE tickets allocation
- Email confirmation with QR codes
- Event display on public pages

---

## 📋 PRE-TESTING CHECKLIST

### 1. Clear Existing Test Events (OPTIONAL - Preserves Users)

**Using Convex Dashboard:**
```javascript
// Navigate to: https://dashboard.convex.dev
// Select your deployment
// Go to Functions tab
// Run this mutation:

await ctx.runMutation(api.admin.resetData.resetAllDataExceptProducts, {})

// This will:
// ✅ Delete ALL events
// ✅ Delete ALL tickets, orders, allocations
// ✅ Reset credit balances to 1,000
// ❌ PRESERVES user accounts
// ❌ PRESERVES products
```

**Alternative: Delete Events via UI**
1. Log in as organizer at http://localhost:3004
2. Go to /organizer/events
3. Delete each event manually

### 2. Verify Environment Variables

Check `.env.local` contains:
```bash
RESEND_API_KEY=re_xxxxx  # Required for emails
CONVEX_DEPLOYMENT=https://dazzling-mockingbird-241.convex.cloud
```

### 3. Test Images Prepared

Location: `/Users/irawatkins/Desktop/images for testing`

Select 2-3 high-quality event images:
- **Recommended sizes:** 1-5MB (will be optimized to ~2MB)
- **Formats:** JPG, PNG, GIF
- **Subject matter:** Event/party themed images

---

## 🧪 TEST SCENARIO 1: New Organizer First Event

### Step 1: Create Organizer Account (if needed)
1. Navigate to http://localhost:3004
2. Sign up as new organizer
3. Complete profile

### Step 2: View Pricing Page
1. Navigate to http://localhost:3004/pricing
2. **VERIFY:**
   - ✅ Prominent green banner: "🎉 NEW ORGANIZER SPECIAL! 🎉"
   - ✅ Text: "Get 1,000 FREE Tickets for Your First Event!"
   - ✅ Shows: "Valid for TICKETED, FREE, and SAVE-THE-DATE events"
   - ✅ Blue "How It Works" section below banner
   - ✅ Text: "No payment required until you're ready to publish!"

### Step 3: Create First Event (TICKETED_EVENT)
1. Click "Create Your Event" or go to http://localhost:3004/organizer/events/create
2. **VERIFY credit allocation before starting:**
   ```javascript
   // In Convex Dashboard, query:
   await ctx.db.query("organizerCredits")
     .withIndex("by_organizer", q => q.eq("organizerId", "YOUR_USER_ID"))
     .first()

   // Should show creditsRemaining: 1000
   ```

### Step 4: Fill Event Details

**Basic Information:**
- Event Name: "Summer Step Fest 2025"
- Event Type: TICKETED_EVENT
- Description: "The hottest stepping event of the summer! Join us for an unforgettable night."
- Categories: Select "Set", "Weekend Event"

**Date & Time:**
- Start Date: [Choose future date]
- End Date: [Same day or next day]
- Timezone: Auto-detected from location

**Location:**
- Venue Name: "Grand Ballroom"
- Address: "123 Main Street"
- City: "Chicago"
- State: "IL"
- ZIP: "60601"
- Country: "USA"

**Additional Details:**
- Event Capacity: 500
- **Event Image:**
  - Click upload area
  - Select image from `/Users/irawatkins/Desktop/images for testing`
  - **WATCH FOR:**
    - ✅ "Optimizing image..." message appears
    - ✅ Progress bar shows 0-100%
    - ✅ Console shows: "Original image size: X.XXmb"
    - ✅ Console shows: "Compressed image size: X.XXmb"
    - ✅ Compressed size should be ≤ 2MB
  - **VERIFY:**
    - ✅ Image preview displays
    - ✅ Required asterisk (*) shown
    - ✅ Text: "(auto-optimized)"

### Step 5: Submit Event
1. Click "Create Event"
2. **VERIFY:**
   - ✅ Redirected to /organizer/events
   - ✅ New event appears in list
   - ✅ Event image displays correctly

### Step 6: Verify Credit Usage
```javascript
// In Convex Dashboard, check credits:
await ctx.db.query("organizerCredits")
  .withIndex("by_organizer", q => q.eq("organizerId", "YOUR_USER_ID"))
  .first()

// Should show:
// creditsTotal: 1000
// creditsRemaining: 1000 (not used until tickets allocated)
// firstEventId: "YOUR_EVENT_ID"
```

### Step 7: Create Ticket Tiers
1. Click event in organizer dashboard
2. Click "Tickets" button (blinking if no tiers)
3. Create ticket tiers:
   - Early Bird: $30, 100 tickets
   - Regular: $40, 200 tickets
   - VIP: $50, 100 tickets

4. **VERIFY credit deduction:**
   ```javascript
   // Credits used = total ticket quantity
   // 100 + 200 + 100 = 400 tickets
   // creditsRemaining should be: 1000 - 400 = 600
   ```

---

## 🧪 TEST SCENARIO 2: Customer Purchase & Email

### Step 1: View Event as Customer
1. Log out from organizer account
2. Navigate to http://localhost:3004/events
3. Click on "Summer Step Fest 2025"
4. **VERIFY:**
   - ✅ Event image displays (optimized version)
   - ✅ All event details correct
   - ✅ Ticket tiers shown with prices

### Step 2: Purchase Ticket
1. Select ticket tier (e.g., "Regular - $40")
2. Select quantity (e.g., 2 tickets)
3. **VERIFY checkout page:**
   - ✅ Event image displays at top
   - ✅ Event name, date, location shown
   - ✅ Quantity selector on right column
   - ✅ "Your Information" form on right column
   - ✅ Discount code field on right column

4. Fill buyer information:
   - Full Name: "John Doe"
   - Email: "your-email@example.com" (use YOUR real email!)
   - Confirm Email

5. Complete payment:
   - Use test card: 4242 4242 4242 4242
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

### Step 3: Verify Email Receipt

**Check your email inbox for:**
- ✅ Subject: "Your Tickets for Summer Step Fest 2025 - [Date]"
- ✅ From: "SteppersLife Events <events@stepperslife.com>"
- ✅ Email contains:
  - ✅ Event image at top
  - ✅ Event name, date, time, location
  - ✅ "Get Directions" button (Google Maps link)
  - ✅ QR code for EACH ticket (separate QR codes)
  - ✅ Ticket holder name under each QR code
  - ✅ Unique ticket code (alphanumeric)
  - ✅ Order summary with order number
  - ✅ Total paid amount
  - ✅ Important information section
  - ✅ Support email link

**Email Troubleshooting:**
If no email received:
1. Check spam folder
2. Verify RESEND_API_KEY in .env.local
3. Check Convex logs for errors
4. Check browser console for API errors
5. Manually trigger email:
   ```javascript
   // In browser console on success page:
   fetch("/api/send-ticket-confirmation", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({
       email: "your-email@example.com",
       orderDetails: { /* order data */ },
       tickets: [ /* ticket data */ ],
       event: { /* event data */ }
     })
   })
   ```

---

## 🧪 TEST SCENARIO 3: Second Event (No Free Tickets)

### Step 1: Create Second Event
1. Log back in as organizer
2. Create another event (any type)
3. **VERIFY:**
   - ✅ NO additional credits granted
   - ✅ Credits from first event can still be used IF:
     - First event not yet ended
     - Credits not fully consumed

### Step 2: Create Tickets for Second Event
1. Try to create 700 ticket tiers (more than remaining 600 credits)
2. **EXPECTED BEHAVIOR:**
   - System should warn about insufficient credits
   - Must purchase additional tickets at $0.30 each
   - OR wait until first event ends to get separate allocation

---

## 📊 VERIFICATION CHECKLIST

### Image Optimization
- [ ] Upload shows progress bar
- [ ] Console logs show before/after sizes
- [ ] Compressed size ≤ 2MB
- [ ] Image quality still looks professional
- [ ] Image displays correctly on all pages

### Credit System
- [ ] 1,000 credits granted on first event
- [ ] Credits linked to first event (firstEventId set)
- [ ] Credits deducted when tickets allocated
- [ ] No additional credits for second event
- [ ] Credits expire when first event ends/cancels

### Pricing Page
- [ ] FREE tickets banner prominent and eye-catching
- [ ] Shows correct amount (1,000 tickets)
- [ ] Lists all event types (TICKETED, FREE, SAVE-THE-DATE)
- [ ] Payment flexibility note clear and visible
- [ ] Additional offers still displayed

### Email System
- [ ] Email arrives within 30 seconds of purchase
- [ ] QR codes display correctly
- [ ] Each ticket has unique QR code
- [ ] Event image included in email
- [ ] All links work (Google Maps, etc.)
- [ ] HTML renders correctly in Gmail, Outlook, etc.

### Customer Experience
- [ ] Event creation smooth and intuitive
- [ ] Image upload fast (compressed)
- [ ] Checkout process clear
- [ ] Payment successful
- [ ] Confirmation page shows immediately
- [ ] Email arrives promptly

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue: No email received
**Solutions:**
1. Check RESEND_API_KEY is set correctly
2. Verify email doesn't have typos
3. Check spam folder
4. Check Resend dashboard for delivery status
5. Ensure domain is verified in Resend

### Issue: Image won't upload
**Solutions:**
1. Check file size < 10MB
2. Verify file type is image/*
3. Check browser console for errors
4. Try different image format
5. Clear browser cache

### Issue: Credits not allocated
**Solutions:**
1. Verify this is truly first event for user
2. Check organizerCredits table in Convex
3. Ensure firstEventFreeUsed is false
4. Check event creation logs

### Issue: Image quality poor after compression
**Solutions:**
1. Use higher quality source image
2. Adjust compression quality in ImageUpload.tsx (line 61)
3. Increase maxSizeMB if needed (currently 2MB)

---

## 📸 EXPECTED RESULTS

### Console Output
```
Original image size: 4.23MB
Compressed image size: 1.87MB
Email sent successfully: { id: 're_...', ... }
```

### Database State After Test
```javascript
// organizerCredits
{
  organizerId: "xxx",
  creditsTotal: 1000,
  creditsUsed: 400,
  creditsRemaining: 600,
  firstEventId: "event_id",
  firstEventFreeUsed: true
}

// events (1 event)
{
  name: "Summer Step Fest 2025",
  images: ["storage_id"],
  capacity: 500,
  status: "PUBLISHED"
}

// ticketTiers (3 tiers)
{
  eventId: "event_id",
  name: "Early Bird",
  price: 3000, // $30.00 in cents
  quantity: 100,
  sold: 2
}

// tickets (2 tickets)
{
  eventId: "event_id",
  attendeeName: "John Doe",
  attendeeEmail: "your-email@example.com",
  ticketCode: "ABC123XYZ",
  status: "ACTIVE"
}
```

---

## ✅ SUCCESS CRITERIA

All of the following must be true:
- [x] Event created with optimized image
- [x] 1,000 FREE tickets allocated automatically
- [x] Credits linked to first event
- [x] Image loads fast on all pages
- [x] Customer receives email with QR codes
- [x] QR codes unique per ticket
- [x] Second event doesn't get free tickets
- [x] Pricing page shows promotion clearly
- [x] All images < 2MB after compression

---

## 🚀 NEXT STEPS AFTER TESTING

1. **Production Deployment:**
   - Deploy to production
   - Update Resend domain settings
   - Configure production RESEND_API_KEY
   - Test email delivery in production

2. **Marketing:**
   - Announce 1,000 FREE tickets promotion
   - Update social media with pricing page screenshot
   - Create onboarding email campaign

3. **Monitoring:**
   - Track credit allocation metrics
   - Monitor image compression performance
   - Monitor email delivery rates
   - Track first-event completion rates

4. **Documentation:**
   - Update user onboarding guide
   - Create video tutorial for event creation
   - Document credit system for support team

---

## 📞 SUPPORT

If you encounter issues during testing:
1. Check browser console for errors
2. Check Convex logs in dashboard
3. Review this guide's troubleshooting section
4. Document the issue with screenshots
5. Check git history for recent changes

---

**Generated:** 2025-01-17
**Version:** 1.0
**Status:** Ready for Production Testing
