# SteppersLife Ticketing System - Comprehensive Test Plan

## Test Overview
This test plan validates the complete ticket lifecycle from organizer registration through ticket scanning, including the pre-paid ticket system, multi-tier distribution (Organizer → Team Members → Associates → Users), and payment processing.

---

## Test Roles & Definitions

### Role Hierarchy
1. **ORGANIZER** - Creates events, purchases tickets on pre-paid plan, distributes to team
2. **TEAM MEMBERS** - Receives tickets from organizer, earns 100% profit on distributed tickets, can assign to associates
3. **ASSOCIATES** - Receives tickets from team members, earns fixed dollar amount per ticket sold
4. **USER** - End customer who purchases tickets
5. **STAFF** - Scans tickets at event entry

---

## Pre-Test Setup Requirements

### Admin Panel Configuration
- [ ] Pre-paid plan tier configured in system
- [ ] First event $1,000 credit system enabled
- [ ] Stripe Dev/Test mode enabled
- [ ] Square Dev/Sandbox mode enabled
- [ ] Cash App Dev/Sandbox mode enabled
- [ ] QR code ticket generation enabled
- [ ] Ticket scanning system operational

### Test Payment Methods Setup
- [ ] Stripe test cards configured
- [ ] Square sandbox account active
- [ ] Cash App sandbox account active
- [ ] Payment webhooks configured for all processors

---

## Test Scenario: Complete Ticket Lifecycle

### Phase 1: Organizer Registration & First Event (With $1,000 Credit)

#### Step 1.1: Organizer Registration
**Test ID:** ORG-001

**Prerequisites:** None

**Actions:**
1. Navigate to stepperslife.com/register (or organizer registration page)
2. Complete registration form with test data:
   - Business Name: "Test Events LLC"
   - Organizer Name: "John Organizer"
   - Email: organizer.test@stepperslife.test
   - Phone: (555) 123-4567
   - Password: TestPass123!
3. Verify email confirmation
4. Complete organizer profile setup

**Expected Results:**
- [ ] Registration successful
- [ ] Email confirmation received
- [ ] Organizer dashboard accessible
- [ ] Pre-paid plan option visible in dashboard

---

#### Step 1.2: Select Pre-Paid Plan
**Test ID:** ORG-002

**Prerequisites:** ORG-001 complete

**Actions:**
1. Log in to organizer dashboard
2. Navigate to "Plans" or "Pricing" section
3. Select "Pre-Paid Ticket Plan"
4. Review plan details and terms

**Expected Results:**
- [ ] Pre-paid plan details displayed
- [ ] Ticket purchase options visible
- [ ] First event $1,000 credit notification shown

---

#### Step 1.3: Purchase Tickets for Event #1 (First Event - $1,000 Credit Applied)
**Test ID:** ORG-003-EVENT1

**Prerequisites:** ORG-002 complete

**Actions:**
1. Navigate to "Purchase Tickets" section
2. Enter ticket quantity: 500 tickets
3. Review pricing breakdown
4. Apply first event $1,000 credit
5. Complete purchase using Stripe (Dev Mode)
   - Use Stripe test card: 4242 4242 4242 4242
   - CVV: Any 3 digits
   - Expiry: Any future date
6. Confirm purchase

**Expected Results:**
- [ ] $1,000 credit automatically applied
- [ ] Remaining balance charged to Stripe (if any)
- [ ] Purchase confirmation displayed
- [ ] 500 tickets added to organizer account
- [ ] Transaction visible in admin panel
- [ ] Email confirmation sent

**Admin Panel Verification:**
- [ ] Organizer account shows 500 tickets
- [ ] Payment transaction recorded
- [ ] $1,000 credit marked as used
- [ ] Event #1 status: "Active"

---

#### Step 1.4: Create Event #1
**Test ID:** ORG-004-EVENT1

**Prerequisites:** ORG-003-EVENT1 complete

**Actions:**
1. Navigate to "Create Event" section
2. Fill out event details:
   - Event Name: "Summer Step Fest 2025"
   - Date: [Select future date]
   - Time: 8:00 PM - 2:00 AM
   - Venue: "Grand Ballroom, 123 Main St"
   - Description: "Annual summer stepping event with live DJ"
   - Ticket Price: $35.00
   - Available Tickets: 500
3. Upload event image
4. Set ticket allocation: 500 tickets (from pre-purchased)
5. Publish event

**Expected Results:**
- [ ] Event created successfully
- [ ] Event visible on stepperslife.com
- [ ] 500 tickets allocated to event
- [ ] Event appears in organizer dashboard
- [ ] Unique event URL generated

---

### Phase 2: Team Member Distribution (Event #1)

#### Step 2.1: Add Team Members
**Test ID:** TEAM-001

**Prerequisites:** ORG-004-EVENT1 complete

**Actions:**
1. Navigate to "Team Management" section
2. Add Team Member #1:
   - Name: "Sarah Team Lead"
   - Email: team1.test@stepperslife.test
   - Phone: (555) 234-5678
   - Role: Team Member
3. Add Team Member #2:
   - Name: "Mike Promoter"
   - Email: team2.test@stepperslife.test
   - Phone: (555) 345-6789
   - Role: Team Member
4. Add Team Member #3:
   - Name: "Lisa Sales"
   - Email: team3.test@stepperslife.test
   - Phone: (555) 456-7890
   - Role: Team Member
5. Send invitations

**Expected Results:**
- [ ] All team members added successfully
- [ ] Invitation emails sent to each team member
- [ ] Team members visible in organizer dashboard
- [ ] Team members can register/log in

---

#### Step 2.2: Distribute Tickets to Team Members (Random Allocation)
**Test ID:** TEAM-002

**Prerequisites:** TEAM-001 complete

**Distribution Plan:**
- Team Member #1 (Sarah): 175 tickets (100% profit)
- Team Member #2 (Mike): 150 tickets (100% profit)
- Team Member #3 (Lisa): 125 tickets (100% profit)
- **Organizer Retains:** 50 tickets

**Actions:**
1. From organizer dashboard, navigate to Event #1
2. Click "Distribute Tickets to Team"
3. Assign tickets:
   - Sarah Team Lead: 175 tickets, 100% commission
   - Mike Promoter: 150 tickets, 100% commission
   - Lisa Sales: 125 tickets, 100% commission
4. Confirm distribution

**Expected Results:**
- [ ] Tickets successfully distributed
- [ ] Each team member receives notification
- [ ] Team member dashboards show allocated tickets
- [ ] Organizer dashboard shows remaining 50 tickets
- [ ] Commission structure (100%) recorded per team member

**Admin Panel Verification:**
- [ ] Event #1 ticket allocation breakdown visible
- [ ] Team member ticket counts accurate
- [ ] Commission rates recorded correctly

---

### Phase 3: Associate Distribution (Event #1)

#### Step 3.1: Team Members Add Associates
**Test ID:** ASSOC-001

**Prerequisites:** TEAM-002 complete

**Actions by Each Team Member:**

**Team Member #1 (Sarah) - Adds 2 Associates:**
1. Log in as team1.test@stepperslife.test
2. Navigate to "My Associates"
3. Add Associate #1:
   - Name: "Tom Associate A"
   - Email: assoc1.test@stepperslife.test
   - Commission: $5.00 per ticket sold
4. Add Associate #2:
   - Name: "Jane Associate B"
   - Email: assoc2.test@stepperslife.test
   - Commission: $7.50 per ticket sold

**Team Member #2 (Mike) - Adds 2 Associates:**
1. Log in as team2.test@stepperslife.test
2. Add Associate #3:
   - Name: "Carlos Associate C"
   - Email: assoc3.test@stepperslife.test
   - Commission: $6.00 per ticket sold
3. Add Associate #4:
   - Name: "Nina Associate D"
   - Email: assoc4.test@stepperslife.test
   - Commission: $8.00 per ticket sold

**Team Member #3 (Lisa) - Adds 1 Associate:**
1. Log in as team3.test@stepperslife.test
2. Add Associate #5:
   - Name: "David Associate E"
   - Email: assoc5.test@stepperslife.test
   - Commission: $5.50 per ticket sold

**Expected Results:**
- [ ] All 5 associates added successfully
- [ ] Associates receive invitation emails
- [ ] Associates can register/log in
- [ ] Commission rates recorded per associate

---

#### Step 3.2: Distribute Tickets to Associates (Random Allocation)
**Test ID:** ASSOC-002

**Prerequisites:** ASSOC-001 complete

**Distribution Plan:**

**From Team Member #1 (Sarah - 175 tickets):**
- Associate #1 (Tom): 60 tickets @ $5.00/ticket commission
- Associate #2 (Jane): 50 tickets @ $7.50/ticket commission
- **Sarah Retains:** 65 tickets

**From Team Member #2 (Mike - 150 tickets):**
- Associate #3 (Carlos): 45 tickets @ $6.00/ticket commission
- Associate #4 (Nina): 55 tickets @ $8.00/ticket commission
- **Mike Retains:** 50 tickets

**From Team Member #3 (Lisa - 125 tickets):**
- Associate #5 (David): 70 tickets @ $5.50/ticket commission
- **Lisa Retains:** 55 tickets

**Actions:**
1. Each team member logs into their dashboard
2. Navigate to Event #1 ticket allocation
3. Assign tickets to their associates per plan above
4. Confirm distributions

**Expected Results:**
- [ ] All ticket distributions successful
- [ ] Associates receive notifications
- [ ] Associate dashboards show allocated tickets
- [ ] Team members retain specified ticket quantities
- [ ] Commission structures recorded

**Ticket Allocation Summary (Event #1 - 500 tickets):**
- Organizer (John): 50 tickets
- Team Member #1 (Sarah): 65 tickets
- Team Member #2 (Mike): 50 tickets
- Team Member #3 (Lisa): 55 tickets
- Associate #1 (Tom): 60 tickets
- Associate #2 (Jane): 50 tickets
- Associate #3 (Carlos): 45 tickets
- Associate #4 (Nina): 55 tickets
- Associate #5 (David): 70 tickets
- **TOTAL: 500 tickets**

---

### Phase 4: Customer Ticket Purchases (Event #1)

#### Step 4.1: Test Purchases Using Stripe (Dev Mode)
**Test ID:** USER-001-STRIPE

**Prerequisites:** ASSOC-002 complete

**Test Scenarios:**

**Purchase #1 - From Organizer Link:**
1. Navigate to Event #1 public page
2. Click organizer's unique ticket link
3. Select quantity: 5 tickets
4. Proceed to checkout
5. Enter customer details:
   - Name: "Customer Test 1"
   - Email: customer1.test@stepperslife.test
   - Phone: (555) 111-1111
6. Payment method: Stripe
7. Use Stripe test card: 4242 4242 4242 4242
8. Complete purchase

**Expected Results:**
- [ ] Purchase successful
- [ ] Confirmation email sent
- [ ] 5 tickets w/ QR codes generated
- [ ] Payment recorded in admin panel
- [ ] Organizer account credited (5 × $35 = $175)
- [ ] Organizer ticket count: 45 remaining

**Purchase #2 - From Team Member #2 (Mike) Link:**
1. Navigate to Mike's unique ticket link
2. Select quantity: 8 tickets
3. Customer: "Customer Test 2" / customer2.test@stepperslife.test
4. Payment: Stripe test card
5. Complete purchase

**Expected Results:**
- [ ] Purchase successful
- [ ] 8 tickets generated with QR codes
- [ ] Mike credited 100% profit (8 × $35 = $280)
- [ ] Mike's ticket count: 42 remaining

**Purchase #3 - From Associate #4 (Nina) Link:**
1. Navigate to Nina's unique ticket link
2. Select quantity: 12 tickets
3. Customer: "Customer Test 3" / customer3.test@stepperslife.test
4. Payment: Stripe test card
5. Complete purchase

**Expected Results:**
- [ ] Purchase successful
- [ ] 12 tickets generated
- [ ] Mike (Team Member #2) credited: 12 × ($35 - $8) = $324
- [ ] Nina (Associate) credited: 12 × $8 = $96
- [ ] Nina's ticket count: 43 remaining

**Admin Panel Verification:**
- [ ] All 3 transactions visible
- [ ] Payment amounts correct
- [ ] Commission splits calculated correctly
- [ ] Ticket assignments tracked to correct sellers

---

#### Step 4.2: Additional Test Purchases (Complete Event #1 Sales)
**Test ID:** USER-002-MIXED

**Goal:** Continue purchasing until Event #1 is sold out (500 tickets)

**Actions:** Simulate multiple customer purchases across all ticket holders using various quantities:
- Purchase from remaining organizer tickets
- Purchase from all team members
- Purchase from all associates
- Use mix of Stripe test cards for variety

**Track:**
- Total tickets sold: _____ / 500
- Total revenue: $_____
- Organizer earnings: $_____
- Each team member earnings
- Each associate earnings

**Expected Results:**
- [ ] All 500 tickets sold
- [ ] Event shows "SOLD OUT"
- [ ] All earnings distributed correctly
- [ ] All customers receive tickets with QR codes

---

### Phase 5: Event #2 Setup & Ticket Purchase (No Credit - Organizer Pays)

#### Step 5.1: Purchase Tickets for Event #2 Using Square
**Test ID:** ORG-003-EVENT2

**Prerequisites:** EVENT #1 complete

**Actions:**
1. Log in as organizer
2. Navigate to "Purchase Tickets"
3. Quantity: 500 tickets
4. Review pricing (NO $1,000 credit this time)
5. Payment method: Square (Sandbox Mode)
6. Use Square test card:
   - Card: 4111 1111 1111 1111
   - CVV: 111
   - Expiry: 12/28
   - ZIP: 12345
7. Complete purchase

**Expected Results:**
- [ ] Full payment processed via Square
- [ ] NO credit applied (second event)
- [ ] 500 tickets added to organizer account
- [ ] Transaction in admin panel shows Square payment
- [ ] Confirmation email sent

---

#### Step 5.2: Create Event #2
**Test ID:** ORG-004-EVENT2

**Prerequisites:** ORG-003-EVENT2 complete

**Actions:**
1. Create new event:
   - Event Name: "Fall Step Championship 2025"
   - Date: [Select future date]
   - Time: 7:00 PM - 1:00 AM
   - Venue: "Convention Center Hall B"
   - Ticket Price: $40.00
   - Available Tickets: 500
2. Allocate 500 pre-purchased tickets
3. Publish event

**Expected Results:**
- [ ] Event #2 created successfully
- [ ] Event live on website
- [ ] 500 tickets allocated

---

#### Step 5.3: Distribute Tickets for Event #2 (New Random Allocation)
**Test ID:** TEAM-003-EVENT2 & ASSOC-003-EVENT2

**New Distribution Plan (Use Different Numbers):**

**To Team Members:**
- Team Member #1 (Sarah): 200 tickets (100% profit)
- Team Member #2 (Mike): 180 tickets (100% profit)
- Team Member #3 (Lisa): 80 tickets (100% profit)
- Organizer retains: 40 tickets

**To Associates (from Team Members):**
- From Sarah: Give 80 tickets total to Associates #1 & #2 (different split than Event #1)
- From Mike: Give 90 tickets total to Associates #3 & #4 (different split)
- From Lisa: Give 40 tickets to Associate #5

**Actions:**
1. Distribute tickets from organizer to team members
2. Team members distribute to their associates
3. Set new commission rates (randomize between $4-$10 per ticket)

**Expected Results:**
- [ ] All distributions successful
- [ ] New commission rates recorded
- [ ] All parties notified

---

#### Step 5.4: Test Customer Purchases for Event #2
**Test ID:** USER-003-EVENT2

**Actions:**
- Simulate 20-30 purchases across different sellers
- Use Stripe test cards (mix of successful and declined scenarios)
- Test various quantities (1, 2, 5, 10, 15 tickets per order)

**Test Declined Card:**
- Card: 4000 0000 0000 0002 (Stripe test card - will decline)
- Verify error handling

**Expected Results:**
- [ ] Successful purchases process correctly
- [ ] Declined transactions show appropriate error
- [ ] Partial sales tracked correctly
- [ ] Commission calculations accurate

---

### Phase 6: Event #3 Setup & Ticket Purchase (Cash App Payment)

#### Step 6.1: Purchase Tickets for Event #3 Using Cash App
**Test ID:** ORG-003-EVENT3

**Prerequisites:** EVENT #2 in progress or complete

**Actions:**
1. Navigate to "Purchase Tickets"
2. Quantity: 500 tickets
3. Payment method: Cash App (Sandbox/Dev Mode)
4. Complete Cash App sandbox payment flow
5. Confirm purchase

**Expected Results:**
- [ ] Cash App payment successful (sandbox)
- [ ] 500 tickets added to organizer account
- [ ] Transaction recorded with Cash App payment method
- [ ] Confirmation email sent

---

#### Step 6.2: Create Event #3
**Test ID:** ORG-004-EVENT3

**Actions:**
1. Create new event:
   - Event Name: "Winter Gala Step Night 2026"
   - Date: [Select future date]
   - Ticket Price: $45.00
   - Available Tickets: 500
2. Allocate tickets and publish

**Expected Results:**
- [ ] Event #3 created and live

---

#### Step 6.3: Distribute & Sell Event #3 Tickets
**Test ID:** TEAM-004-EVENT3 & USER-004-EVENT3

**Actions:**
1. Create NEW random distribution plan
2. Distribute to team members and associates
3. Simulate customer purchases using mix of payment methods
4. Track all transactions

**Expected Results:**
- [ ] Distribution successful
- [ ] Customer purchases work across all payment methods
- [ ] All commission calculations accurate

---

### Phase 7: Ticket Scanning & Event Check-In

#### Step 7.1: Staff Account Setup
**Test ID:** STAFF-001

**Actions:**
1. Create staff accounts for each event:
   - Staff #1: staff1.test@stepperslife.test (Event #1)
   - Staff #2: staff2.test@stepperslife.test (Event #2)
   - Staff #3: staff3.test@stepperslife.test (Event #3)
2. Grant ticket scanning permissions
3. Assign to respective events

**Expected Results:**
- [ ] Staff accounts created
- [ ] Scanning app/interface accessible
- [ ] Assigned to correct events

---

#### Step 7.2: Test Ticket Scanning (All Events)
**Test ID:** STAFF-002

**Test Scenarios:**

**Valid Ticket Scan:**
1. Staff logs into scanning interface
2. Select event to scan for
3. Scan valid QR code from customer ticket
4. Verify entry

**Expected Results:**
- [ ] Ticket validates successfully
- [ ] Customer name displays
- [ ] Ticket marked as "scanned" in system
- [ ] Entry logged with timestamp

**Duplicate Scan Test:**
1. Attempt to scan same ticket again

**Expected Results:**
- [ ] System rejects duplicate scan
- [ ] Warning message displayed
- [ ] Original scan time shown

**Invalid Ticket Test:**
1. Scan ticket for wrong event
2. Scan expired/cancelled ticket
3. Scan fake QR code

**Expected Results:**
- [ ] All invalid scans rejected
- [ ] Appropriate error messages shown
- [ ] Security alerts logged (if applicable)

**Staff Dashboard Verification:**
- [ ] Real-time scan count visible
- [ ] Scanned vs. unscanned ticket ratio
- [ ] Customer check-in list accurate

---

## Phase 8: Financial Reconciliation & Reporting

### Step 8.1: Admin Panel Financial Review
**Test ID:** ADMIN-001

**Actions:**
1. Log into admin panel
2. Navigate to financial reports
3. Review for each event:
   - Total ticket sales
   - Gross revenue
   - Organizer earnings
   - Team member earnings breakdown
   - Associate earnings breakdown
   - Payment processor fees
   - Platform fees (if applicable)
   - Net payouts

**Expected Results:**
- [ ] All financial data accurate
- [ ] Commission calculations correct
- [ ] Payment processor transactions match
- [ ] No discrepancies in earnings

---

### Step 8.2: Payout Verification
**Test ID:** ADMIN-002

**Actions:**
1. Verify pending payouts for:
   - Organizer (3 events)
   - All team members (3 events)
   - All associates (3 events)
2. Check payout schedules
3. Verify payout methods configured

**Expected Results:**
- [ ] All earnings calculated correctly
- [ ] Payout schedules accurate
- [ ] Payout methods valid

---

## Test Summary Checklist

### Event #1 Summary
- [ ] Organizer registration complete
- [ ] Pre-paid plan selected
- [ ] $1,000 credit applied correctly
- [ ] 500 tickets purchased (Stripe)
- [ ] Event created and published
- [ ] 3 team members added
- [ ] Tickets distributed to team (100% commission)
- [ ] 5 associates added with varied commissions
- [ ] Tickets distributed to associates
- [ ] Customer purchases tested (Stripe)
- [ ] All 500 tickets sold
- [ ] Tickets scanned successfully
- [ ] Financial reconciliation complete

### Event #2 Summary
- [ ] 500 tickets purchased (Square - NO credit)
- [ ] Full payment processed
- [ ] Event created and published
- [ ] New ticket distribution completed
- [ ] Customer purchases tested
- [ ] Tickets scanned successfully
- [ ] Financial reconciliation complete

### Event #3 Summary
- [ ] 500 tickets purchased (Cash App)
- [ ] Event created and published
- [ ] Ticket distribution completed
- [ ] Customer purchases tested
- [ ] Tickets scanned successfully
- [ ] Financial reconciliation complete

---

## Payment Processing Test Matrix

| Payment Method | Test Card/Account | Event | Expected Result |
|---------------|-------------------|-------|-----------------|
| Stripe | 4242 4242 4242 4242 | 1 | Success |
| Stripe | 4000 0000 0000 0002 | 2 | Decline |
| Square | 4111 1111 1111 1111 | 2 | Success |
| Cash App | Sandbox Account | 3 | Success |

---

## Commission Calculation Verification

### Example Calculation (Event #1):

**Ticket sold by Associate #4 (Nina):**
- Ticket Price: $35.00
- Nina's Commission: $8.00
- Team Member (Mike) Earnings: $35.00 - $8.00 = $27.00
- Mike earns $27 (his 100% commission minus associate commission)
- Nina earns $8.00

**Verification Formula:**
```
IF Ticket Sold by Associate:
  Associate Earnings = Number of Tickets × Associate Commission Rate
  Team Member Earnings = Number of Tickets × (Ticket Price - Associate Commission Rate)
  
IF Ticket Sold by Team Member (no associate):
  Team Member Earnings = Number of Tickets × Ticket Price × 100%
  
IF Ticket Sold by Organizer:
  Organizer Earnings = Number of Tickets × Ticket Price
```

---

## Edge Cases & Error Handling Tests

### Test Scenarios:
1. **Ticket Over-allocation Test**
   - [ ] Attempt to distribute more tickets than available
   - [ ] Expected: Error message, transaction blocked

2. **Duplicate Email Test**
   - [ ] Try to add team member/associate with existing email
   - [ ] Expected: Error message or merge prompt

3. **Expired Event Test**
   - [ ] Attempt to sell tickets after event date
   - [ ] Expected: Sales blocked, appropriate message

4. **Payment Failure Recovery**
   - [ ] Simulate payment timeout/failure mid-transaction
   - [ ] Expected: Transaction rollback, tickets remain available

5. **Concurrent Purchase Test**
   - [ ] Multiple users buying last available tickets simultaneously
   - [ ] Expected: Proper inventory management, no overselling

---

## Test Data Collection

### For Each Event Track:
- Total tickets allocated: _____
- Total tickets sold: _____
- Total revenue: $_____
- Organizer earnings: $_____
- Team Member #1 earnings: $_____
- Team Member #2 earnings: $_____
- Team Member #3 earnings: $_____
- Associate #1 earnings: $_____
- Associate #2 earnings: $_____
- Associate #3 earnings: $_____
- Associate #4 earnings: $_____
- Associate #5 earnings: $_____
- Payment processor fees: $_____
- Total scanned tickets: _____
- No-shows: _____

---

## Post-Test Validation

### Admin Panel Checks:
- [ ] All user accounts created successfully
- [ ] All events visible and properly configured
- [ ] All transactions recorded accurately
- [ ] All ticket assignments tracked correctly
- [ ] All commission calculations verified
- [ ] All payment methods processed correctly
- [ ] All QR codes generated and scannable
- [ ] All email notifications sent
- [ ] Financial reports accurate
- [ ] No system errors or bugs encountered

### Database Integrity Checks:
- [ ] No orphaned tickets
- [ ] No duplicate transactions
- [ ] No negative balances
- [ ] All foreign key relationships intact
- [ ] Audit trail complete for all actions

---

## Test Execution Sign-Off

**Tester Name:** _____________________
**Test Start Date:** _____________________
**Test End Date:** _____________________

**Overall Test Result:** ☐ PASS  ☐ FAIL  ☐ PARTIAL

**Critical Issues Found:** _____________________

**Notes:** 
_____________________
_____________________
_____________________

---

## Appendix: Test User Credentials

### Organizer:
- Email: organizer.test@stepperslife.test
- Password: TestPass123!

### Team Members:
- team1.test@stepperslife.test (Sarah)
- team2.test@stepperslife.test (Mike)
- team3.test@stepperslife.test (Lisa)
- Password: TeamPass123!

### Associates:
- assoc1.test@stepperslife.test (Tom)
- assoc2.test@stepperslife.test (Jane)
- assoc3.test@stepperslife.test (Carlos)
- assoc4.test@stepperslife.test (Nina)
- assoc5.test@stepperslife.test (David)
- Password: AssocPass123!

### Customers:
- customer1.test@stepperslife.test
- customer2.test@stepperslife.test
- customer3.test@stepperslife.test
- Password: CustPass123!

### Staff:
- staff1.test@stepperslife.test
- staff2.test@stepperslife.test
- staff3.test@stepperslife.test
- Password: StaffPass123!

---

**END OF TEST PLAN**
