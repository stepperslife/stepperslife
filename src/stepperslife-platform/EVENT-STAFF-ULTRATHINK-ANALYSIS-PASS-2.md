# Event Staff Permission System - ULTRATHINK ANALYSIS PASS #2
## Implementation Status & Testing Workflows

**Date**: 2025-11-20
**Analysis Type**: Code Implementation & Access Patterns
**Pass**: 2 of 2

---

## 🔍 **Implementation Discovery**

### **Current Status**: ⚠️ **STAFF MANAGEMENT NOT YET IMPLEMENTED**

Search Results:
- ✅ Database schema defined (`EventStaff` model exists)
- ❌ No UI for staff management found
- ❌ No staff permission checking code found
- ❌ No staff assignment API endpoints found

**Existing Organizer Pages**:
- `/app/(modules)/organizer/dashboard/page.tsx` - Organizer dashboard
- `/app/(modules)/organizer/events/create/page.tsx` - Create event page

**Missing Features** (To Be Built):
1. Staff management UI
2. Staff invitation system
3. Permission checking middleware
4. Commission tracking dashboard
5. Ticket scanning with staff validation

---

## 🎯 **Testing Strategy - What We CAN Test Now**

Even without full UI implementation, we can test:

### **Phase 1: Database-Level Testing** ✅
1. Create event staff records directly via Prisma
2. Verify unique constraints
3. Test many-to-many relationships
4. Validate commission calculations

### **Phase 2: Permission Logic Testing** (After Implementation)
1. Test staff can only access assigned events
2. Verify role-based feature access
3. Test scanning permissions
4. Validate financial data visibility

### **Phase 3: Integration Testing** (After Implementation)
1. Test full staff invitation workflow
2. Test commission payout process
3. Test ticket scanning with different roles
4. Test staff dashboard access

---

## 👥 **Test User Structure - 9 Staff Members**

### **Naming Convention**:
Format: `{role}{number}@stepperslife.com`
Password (all): `TestPass123!`

### **3 STAFF Members**:
```typescript
const staffUsers = [
  {
    email: 'staff1@stepperslife.com',
    name: 'Marcus Johnson (STAFF)',
    role: 'USER',  // Platform role
    eventRole: 'STAFF',  // Event-specific role
    canScan: true,
    commissionPercent: 5.00
  },
  {
    email: 'staff2@stepperslife.com',
    name: 'Lisa Martinez (STAFF)',
    role: 'USER',
    eventRole: 'STAFF',
    canScan: true,
    commissionPercent: 7.50
  },
  {
    email: 'staff3@stepperslife.com',
    name: 'James Williams (STAFF)',
    role: 'USER',
    eventRole: 'STAFF',
    canScan: true,
    commissionPercent: 5.00
  }
]
```

**Expected Behavior**:
- ✅ Can log into platform
- ✅ See "Staff Dashboard" link for assigned events
- ✅ View event check-in interface
- ✅ Scan tickets (QR code validation)
- ✅ View own commission earnings
- ❌ Cannot edit event details
- ❌ Cannot see full financial reports
- ❌ Cannot manage other staff

---

### **3 TEAM_MEMBER Users**:
```typescript
const teamMembers = [
  {
    email: 'team1@stepperslife.com',
    name: 'Sarah Anderson (TEAM)',
    role: 'USER',
    eventRole: 'TEAM_MEMBER',
    canScan: true,
    commissionPercent: null  // No commission
  },
  {
    email: 'team2@stepperslife.com',
    name: 'David Chen (TEAM)',
    role: 'USER',
    eventRole: 'TEAM_MEMBER',
    canScan: true,
    commissionPercent: null
  },
  {
    email: 'team3@stepperslife.com',
    name: 'Emily Rodriguez (TEAM)',
    role: 'USER',
    eventRole: 'TEAM_MEMBER',
    canScan: false,  // This one can't scan
    commissionPercent: null
  }
]
```

**Expected Behavior**:
- ✅ Can log into platform
- ✅ See basic event info for assigned events
- ✅ Can scan tickets (team1, team2 only)
- ✅ Manual check-in capability
- ❌ NO commission tracking
- ❌ NO financial data access
- ❌ NO sales reports
- ❌ Cannot edit anything

---

### **3 ASSOCIATE Users** (Affiliates):
```typescript
const associates = [
  {
    email: 'associate1@stepperslife.com',
    name: 'Kevin Brown (ASSOCIATE)',
    role: 'USER',
    eventRole: 'ASSOCIATE',
    canScan: false,
    commissionPercent: 15.00,  // Higher affiliate commission
    referralCode: 'KEVIN2025'
  },
  {
    email: 'associate2@stepperslife.com',
    name: 'Michelle Taylor (ASSOCIATE)',
    role: 'USER',
    eventRole: 'ASSOCIATE',
    canScan: false,
    commissionPercent: 12.00,
    referralCode: 'MICHELLE25'
  },
  {
    email: 'associate3@stepperslife.com',
    name: 'Robert Garcia (ASSOCIATE)',
    role: 'USER',
    eventRole: 'ASSOCIATE',
    canScan: false,
    commissionPercent: 10.00,
    referralCode: 'ROBERT2025'
  }
]
```

**Expected Behavior**:
- ✅ Can log into platform
- ✅ View referral dashboard
- ✅ See referral link with unique code
- ✅ Track own sales/commissions
- ✅ Generate promotional materials
- ❌ NO ticket scanning
- ❌ NO event management
- ❌ NO attendee data access
- ❌ Cannot see other associates' data

---

## 🧪 **Comprehensive Test Scenarios**

### **Scenario 1: Basic Staff Assignment**

**Setup**:
1. Create event as `organizer@stepperslife.com`
2. Assign `staff1@stepperslife.com` as STAFF

**Test Steps**:
1. Login as `staff1@stepperslife.com`
2. Navigate to dashboard
3. Verify can see assigned event
4. Verify role badge shows "STAFF"
5. Attempt to access event settings
6. Attempt to add more staff

**Expected Results**:
- ✅ Event visible in "My Events" or "Staff Dashboard"
- ✅ Role badge: "Event Staff"
- ❌ Event settings button: Hidden or disabled
- ❌ Add staff button: Not visible
- ✅ "Scan Tickets" button: Visible

---

### **Scenario 2: Commission Tracking**

**Setup**:
1. Assign `staff2@stepperslife.com` with 7.5% commission
2. Create test ticket purchase attributed to staff2

**Test Steps**:
1. Login as `staff2@stepperslife.com`
2. Navigate to earnings/commission dashboard
3. Verify commission calculation:
   - Ticket price: $50.00
   - Commission: 7.5%
   - Expected earnings: $3.75

**Expected Results**:
```json
{
  "staffMember": "staff2@stepperslife.com",
  "eventId": "summer-fest-2025",
  "commissionPercent": 7.50,
  "salesGenerated": 150.00,
  "commissionEarned": 11.25,
  "ticketsSold": 3
}
```

---

### **Scenario 3: Scanning Permissions**

**Test Matrix**:

| User | Role | canScan | Expected Result |
|------|------|---------|----------------|
| staff1@stepperslife.com | STAFF | ✅ true | Can scan |
| team1@stepperslife.com | TEAM_MEMBER | ✅ true | Can scan |
| team3@stepperslife.com | TEAM_MEMBER | ❌ false | **BLOCKED** |
| associate1@stepperslife.com | ASSOCIATE | ❌ false | **BLOCKED** |

**Test Steps** (for each user):
1. Login as user
2. Navigate to event check-in page
3. Attempt to scan QR code
4. Verify success or error message

**Expected Behaviors**:
- **Authorized Scanners**: QR scanner appears, ticket validates
- **Unauthorized**: "Access Denied - You don't have scanning permissions"

---

### **Scenario 4: Multi-Event Staff Assignment**

**Setup**:
```typescript
// staff1 assigned to multiple events:
EventStaff: [
  { userId: 'staff1', eventId: 'event-a', role: 'STAFF', canScan: true },
  { userId: 'staff1', eventId: 'event-b', role: 'TEAM_MEMBER', canScan: true },
  { userId: 'staff1', eventId: 'event-c', role: 'ASSOCIATE', canScan: false }
]
```

**Test Steps**:
1. Login as `staff1@stepperslife.com`
2. View staff dashboard
3. Verify all 3 events listed
4. Navigate to Event A
5. Verify "STAFF" capabilities
6. Navigate to Event C
7. Verify "ASSOCIATE" limited access

**Expected Results**:
- Dashboard shows all 3 events with different role badges
- Permissions change per event
- Commission tracking separate for each event

---

### **Scenario 5: Inactive Staff Member**

**Setup**:
```sql
UPDATE event_staff
SET isActive = false
WHERE userId = 'staff1' AND eventId = 'event-a'
```

**Test Steps**:
1. Login as `staff1@stepperslife.com`
2. Navigate to dashboard
3. Verify Event A no longer visible
4. Attempt direct URL access to Event A staff page
5. Verify access denied

**Expected Results**:
- Event A removed from dashboard
- Direct access blocked: "Your access has been revoked"
- Other events (where isActive = true) still accessible

---

### **Scenario 6: Affiliate Referral Tracking**

**Setup**:
1. `associate1@stepperslife.com` has referral code: `KEVIN2025`
2. Generate affiliate link: `https://events.stepperslife.com/summer-fest?ref=KEVIN2025`

**Test Steps**:
1. Login as `associate1@stepperslife.com`
2. View affiliate dashboard
3. Copy referral link
4. Simulate ticket purchase using referral link
5. Check commission attribution

**Expected Database Result**:
```typescript
EventOrder: {
  id: 'order-123',
  eventId: 'summer-fest',
  soldByStaffId: 'associate1-user-id',
  referralCode: 'KEVIN2025',
  totalCents: 5000  // $50.00
}

EventStaff (associate1):
{
  commissionPercent: 15.00,
  commissionEarned: 7.50  // $50.00 * 15% = $7.50
}
```

---

## 🔐 **Security Test Cases**

### **Test 1: Unauthorized Event Access**
```typescript
// staff1 is assigned to Event A only
// Attempt to access Event B

GET /organizer/events/event-b/staff
```

**Expected**: `403 Forbidden` or redirect to dashboard

---

### **Test 2: Role Escalation Attempt**
```typescript
// team1 (TEAM_MEMBER) tries to access STAFF-only endpoint

POST /api/events/event-a/settings
```

**Expected**: `403 Forbidden - Insufficient permissions`

---

### **Test 3: Duplicate Staff Assignment**
```typescript
// Attempt to assign same user twice to same event

EventStaff.create({
  eventId: 'event-a',
  userId: 'staff1',
  role: 'STAFF'
})  // First assignment - should succeed

EventStaff.create({
  eventId: 'event-a',
  userId: 'staff1',
  role: 'TEAM_MEMBER'
})  // Second assignment - should FAIL
```

**Expected**: `Unique constraint violation` error

---

## 📊 **Commission Calculation Test Matrix**

| Staff Member | Role | Commission % | Ticket Price | Quantity | Expected Earnings |
|--------------|------|--------------|--------------|----------|-------------------|
| staff1 | STAFF | 5.00% | $50.00 | 10 | $25.00 |
| staff2 | STAFF | 7.50% | $75.00 | 5 | $28.13 |
| staff3 | STAFF | 5.00% | $100.00 | 3 | $15.00 |
| team1 | TEAM_MEMBER | 0% | $50.00 | 10 | $0.00 |
| associate1 | ASSOCIATE | 15.00% | $45.00 | 20 | $135.00 |
| associate2 | ASSOCIATE | 12.00% | $60.00 | 15 | $108.00 |

---

## 🎯 **Expected Dashboard Views**

### **STAFF Dashboard**:
```
╔═══════════════════════════════════════════════╗
║  Staff Dashboard - Marcus Johnson (STAFF)     ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  My Assigned Events (3)                       ║
║  ┌─────────────────────────────────────────┐  ║
║  │ Summer Steppers Festival 2025           │  ║
║  │ Role: STAFF | Can Scan: Yes             │  ║
║  │ Commission: 5.00%                        │  ║
║  │ Earned: $45.50                           │  ║
║  │ [View Event] [Scan Tickets]              │  ║
║  └─────────────────────────────────────────┘  ║
║                                               ║
║  Total Earnings Across All Events:            ║
║  $127.25                                      ║
║                                               ║
║  [Request Payout]                             ║
╚═══════════════════════════════════════════════╝
```

### **TEAM_MEMBER Dashboard**:
```
╔═══════════════════════════════════════════════╗
║  Event Team - Sarah Anderson                  ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  My Events (2)                                ║
║  ┌─────────────────────────────────────────┐  ║
║  │ Summer Steppers Festival 2025           │  ║
║  │ Role: Team Member | Can Scan: Yes       │  ║
║  │ [View Event] [Scan Tickets]              │  ║
║  └─────────────────────────────────────────┘  ║
║                                               ║
║  Note: Team members do not earn commission    ║
╚═══════════════════════════════════════════════╝
```

### **ASSOCIATE Dashboard**:
```
╔═══════════════════════════════════════════════╗
║  Affiliate Dashboard - Kevin Brown            ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  My Referral Code: KEVIN2025                  ║
║                                               ║
║  Your Affiliate Link:                         ║
║  https://events.stepperslife.com/...?ref=...  ║
║  [Copy Link] [Generate QR Code]               ║
║                                               ║
║  Sales Stats:                                 ║
║  ┌─────────────────────────────────────────┐  ║
║  │ Clicks: 245                              │  ║
║  │ Conversions: 18                          │  ║
║  │ Conversion Rate: 7.3%                    │  ║
║  │ Total Sales: $810.00                     │  ║
║  │ Commission Rate: 15%                     │  ║
║  │ Total Earned: $121.50                    │  ║
║  └─────────────────────────────────────────┘  ║
║                                               ║
║  [Request Payout] [Download Report]           ║
╚═══════════════════════════════════════════════╝
```

---

## 🚀 **Implementation Roadmap**

### **Phase 1: Core Staff Management** (Database Complete ✅)
- [x] EventStaff model defined
- [ ] Staff invitation API
- [ ] Staff assignment UI (organizer dashboard)
- [ ] Staff list/management page

### **Phase 2: Permission System**
- [ ] Middleware: Check staff role for event access
- [ ] Helper: `isStaffMember(userId, eventId)`
- [ ] Helper: `hasPermission(userId, eventId, permission)`
- [ ] Role-based UI component visibility

### **Phase 3: Staff Features**
- [ ] Staff dashboard
- [ ] Ticket scanning interface
- [ ] Check-in interface
- [ ] Attendee search

### **Phase 4: Commission System**
- [ ] Referral code generation
- [ ] Sales attribution
- [ ] Commission calculation
- [ ] Earnings dashboard
- [ ] Payout request system

### **Phase 5: Affiliate System** (ASSOCIATES)
- [ ] Affiliate link generator
- [ ] Click tracking
- [ ] Conversion analytics
- [ ] QR code generator for affiliates

---

## 📝 **Test Execution Plan**

### **Step 1: Create 9 Test Users** ✅ NEXT
```bash
npm run test:create-staff-users
```

### **Step 2: Assign Users to Events**
```typescript
// Assign to "Summer Steppers Festival 2025"
- staff1, staff2, staff3 → STAFF
- team1, team2, team3 → TEAM_MEMBER
- associate1, associate2, associate3 → ASSOCIATE
```

### **Step 3: Run Automated Tests**
```bash
npx tsx tests/event-staff-permissions-test.ts
```

### **Step 4: Manual UI Testing**
- Login as each role
- Verify dashboard appearance
- Test scanning capabilities
- Verify permission enforcement

---

## 🎯 **Success Criteria**

### **Database Tests**:
- ✅ All 9 users created successfully
- ✅ All EventStaff records created
- ✅ Unique constraints enforced
- ✅ Indexes working

### **Permission Tests**:
- ✅ STAFF can scan tickets
- ✅ TEAM_MEMBER with canScan=false CANNOT scan
- ✅ ASSOCIATES cannot scan
- ✅ Only assigned events visible

### **Commission Tests**:
- ✅ STAFF earns correct commission %
- ✅ TEAM_MEMBER earns $0
- ✅ ASSOCIATES earn highest commission
- ✅ Referral attribution works

---

**Analysis Complete**: Ready for test user creation and automated testing! ✅
