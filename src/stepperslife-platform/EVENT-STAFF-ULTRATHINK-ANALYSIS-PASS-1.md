# Event Staff Permission System - ULTRATHINK ANALYSIS PASS #1
## Deep Architecture Analysis

**Date**: 2025-11-20
**Analysis Type**: Permission Architecture & Database Schema
**Pass**: 1 of 2

---

## 🎯 **Critical Discovery: Event-Specific vs Platform-Wide Roles**

### **Two-Tier Permission System Identified**

The SteppersLife platform uses **TWO distinct permission layers**:

#### **Layer 1: Platform-Wide Roles** (`UserRole` enum)
Located in: `/lib/db/schema.prisma:51-56`

```prisma
enum UserRole {
  ADMIN           // Platform administrator
  USER            // Regular user
  EVENT_ORGANIZER // Can create events
  VENDOR          // Can create stores
}
```

**Purpose**: Controls access to global platform features
- **ADMIN**: Full system access
- **EVENT_ORGANIZER**: Can create and manage their own events globally
- **VENDOR**: Can create and manage stores globally
- **USER**: Consumer-only access (browse, purchase, attend)

---

#### **Layer 2: Event-Specific Roles** (`StaffRole` enum)
Located in: `/lib/db/schema.prisma:290-295`

```prisma
enum StaffRole {
  ORGANIZER
  STAFF
  TEAM_MEMBER
  ASSOCIATE
}
```

**Purpose**: Controls access to **individual event management**
**Scope**: Per-event basis (not platform-wide)

---

## 📊 **EventStaff Model - Complete Schema Analysis**

Located in: `/lib/db/schema.prisma:260-288`

```prisma
model EventStaff {
  id              String   @id @default(cuid())
  eventId         String
  userId          String

  event           Event    @relation(fields: [eventId], references: [id])
  user            User     @relation(fields: [userId], references: [id])

  role            StaffRole
  permissions     Json?    // Custom permissions

  // Scanning permissions
  canScan         Boolean  @default(false)

  // Commission
  commissionPercent Decimal? @db.Decimal(5, 2)
  commissionEarned  Decimal  @default(0) @db.Decimal(10, 2)

  // Status
  isActive        Boolean  @default(true)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([eventId, userId])
  @@index([userId])
  @@index([eventId])
  @@map("event_staff")
}
```

### **Key Schema Insights**:

1. **Many-to-Many Relationship**: EventStaff is a **junction table** between `Event` and `User`
   - One event can have multiple staff members
   - One user can be staff for multiple events
   - Unique constraint: `@@unique([eventId, userId])` - prevents duplicate assignments

2. **Flexible Permission System**:
   - `role`: StaffRole enum (ORGANIZER, STAFF, TEAM_MEMBER, ASSOCIATE)
   - `permissions`: JSON field for custom granular permissions
   - `canScan`: Boolean flag specifically for ticket scanning capability

3. **Commission System Built-In**:
   - Staff can earn commission on ticket sales
   - `commissionPercent`: Percentage (max 99.99%)
   - `commissionEarned`: Running total of earnings
   - Supports affiliate/referral-style event promotion

4. **Status Control**:
   - `isActive`: Can temporarily deactivate staff without deleting

---

## 🔍 **Relationship Architecture Analysis**

### **User → EventStaff → Event Flow**

```
┌─────────────┐
│    User     │  (Platform Role: USER, ORGANIZER, VENDOR, or ADMIN)
└──────┬──────┘
       │
       │ Can be assigned as
       │ event staff
       ▼
┌─────────────┐
│ EventStaff  │  (Event Role: ORGANIZER, STAFF, TEAM_MEMBER, or ASSOCIATE)
│             │  - Specific to ONE event
│             │  - Has commissions
│             │  - Has scan permissions
└──────┬──────┘
       │
       │ Belongs to
       ▼
┌─────────────┐
│    Event    │  (Created by an EVENT_ORGANIZER)
└─────────────┘
```

### **Permission Inheritance Rules**:

**Platform Role → Event Staff Assignment**:
- ✅ **USER** + EventStaff → Can be STAFF/TEAM_MEMBER/ASSOCIATE on events
- ✅ **EVENT_ORGANIZER** + EventStaff → Can be ORGANIZER role on their own events
- ✅ **EVENT_ORGANIZER** + EventStaff → Can be STAFF on OTHER organizers' events
- ✅ **VENDOR** + EventStaff → Can be any staff role (they can help with events too)
- ✅ **ADMIN** + EventStaff → Can be any role (for testing/support)

---

## 🎭 **Staff Role Hierarchy - Detailed Analysis**

### **ORGANIZER** (Highest Event-Level Permission)
```prisma
role: ORGANIZER
```

**Typical Use Case**: Event creator or co-organizer
**Expected Permissions**:
- Full event management (edit details, pricing, settings)
- Manage other staff members
- View all analytics and sales data
- Process refunds and cancellations
- Access financial reports
- Export attendee lists
- Scan tickets

**Database Query Pattern**:
```typescript
const organizers = await prisma.eventStaff.findMany({
  where: {
    eventId: 'event-id',
    role: 'ORGANIZER',
    isActive: true
  }
})
```

---

### **STAFF** (Operational Team Members)
```prisma
role: STAFF
```

**Typical Use Case**: Paid staff, core team members
**Expected Permissions**:
- Scan tickets at event entrance
- View attendee check-in status
- Limited sales reporting (own commissions)
- Cannot edit event details
- Cannot manage other staff
- May have commission earning enabled

**Commission Example**:
```typescript
{
  role: 'STAFF',
  canScan: true,
  commissionPercent: 5.00,  // 5% commission on sales
  commissionEarned: 125.50
}
```

---

### **TEAM_MEMBER** (Volunteer/Support Team)
```prisma
role: TEAM_MEMBER
```

**Typical Use Case**: Volunteers, unpaid helpers
**Expected Permissions**:
- Scan tickets (if enabled)
- Check-in attendees
- View basic event info
- NO financial access
- NO sales data
- NO commission tracking

**Use Case Scenarios**:
- Event day volunteers
- Door greeters/ushers
- Parking attendants
- Setup/cleanup crew

---

### **ASSOCIATE** (Limited Partners/Affiliates)
```prisma
role: ASSOCIATE
```

**Typical Use Case**: Affiliate marketers, promotional partners
**Expected Permissions**:
- Unique referral tracking code
- Commission on referred sales
- View own referral stats
- NO ticket scanning
- NO event management
- NO direct attendee access

**Commission-Focused Configuration**:
```typescript
{
  role: 'ASSOCIATE',
  canScan: false,  // NO scanning access
  commissionPercent: 10.00,  // Higher commission for affiliates
  commissionEarned: 450.00,
  permissions: {
    canViewReferralStats: true,
    canGenerateLinks: true,
    canAccessEventDetails: false
  }
}
```

---

## 🔐 **Permission Matrix - Expected Capabilities**

| Capability | ORGANIZER | STAFF | TEAM_MEMBER | ASSOCIATE |
|-----------|-----------|-------|-------------|-----------|
| **Event Management** |
| Edit event details | ✅ | ❌ | ❌ | ❌ |
| Edit ticket types | ✅ | ❌ | ❌ | ❌ |
| Manage staff | ✅ | ❌ | ❌ | ❌ |
| Cancel/refund | ✅ | ❌ | ❌ | ❌ |
| **Ticket Operations** |
| Scan tickets | ✅ | ✅ (if enabled) | ✅ (if enabled) | ❌ |
| View attendees | ✅ | ✅ | Limited | ❌ |
| Manual check-in | ✅ | ✅ | ✅ | ❌ |
| **Financial** |
| View all sales | ✅ | ❌ | ❌ | ❌ |
| View own commissions | ✅ | ✅ | ❌ | ✅ |
| Earn commissions | Optional | ✅ | ❌ | ✅ |
| Withdraw earnings | N/A | Via platform | N/A | Via platform |
| **Reporting** |
| Full analytics | ✅ | ❌ | ❌ | ❌ |
| Export data | ✅ | ❌ | ❌ | ❌ |
| Own referrals | ✅ | ✅ | ❌ | ✅ |

---

## 💡 **Custom Permissions JSON Structure**

The `permissions` JSON field allows fine-grained control:

### **Example Permission Structures**:

#### **Power STAFF** (High Trust)
```json
{
  "canViewFinancials": true,
  "canProcessRefunds": false,
  "canEditCapacity": false,
  "canSendMessages": true,
  "scanLimit": null,
  "dashboardAccess": "full"
}
```

#### **Limited TEAM_MEMBER** (Event Day Only)
```json
{
  "canViewFinancials": false,
  "canProcessRefunds": false,
  "canSendMessages": false,
  "scanLimit": 100,
  "dashboardAccess": "readonly",
  "activeOnlyDuringEvent": true
}
```

#### **ASSOCIATE** (Affiliate Marketer)
```json
{
  "referralCode": "SARAH2025",
  "canViewReferralStats": true,
  "canGeneratePromoCodes": true,
  "canAccessBackstage": false,
  "commissionTier": "gold",
  "payoutThreshold": 50.00
}
```

---

## 🔗 **Database Relationships - Deep Dive**

### **EventStaff Foreign Keys**:

1. **`eventId` → `Event.id`**
   - Cascade behavior: If event deleted, all staff assignments deleted
   - Index for fast lookup: `@@index([eventId])`

2. **`userId` → `User.id`**
   - User must exist to be assigned as staff
   - Index for fast lookup: `@@index([userId])`

### **User Relations**:
Located in `/lib/db/schema.prisma:38`

```prisma
model User {
  // ... other fields
  eventStaff        EventStaff[]        // Events module
}
```

A single USER can have **multiple** EventStaff records:
```typescript
// User ID: user-123 can be staff on multiple events:
EventStaff: [
  { eventId: 'event-a', role: 'STAFF', canScan: true },
  { eventId: 'event-b', role: 'ORGANIZER', canScan: true },
  { eventId: 'event-c', role: 'ASSOCIATE', canScan: false }
]
```

### **Event Relations**:
Located in `/lib/db/schema.prisma:162`

```prisma
model Event {
  // ... other fields
  staff           EventStaff[]
}
```

A single EVENT can have **multiple** staff members:
```typescript
// Event ID: summer-fest-2025
EventStaff: [
  { userId: 'user-1', role: 'ORGANIZER', canScan: true },  // Primary organizer
  { userId: 'user-2', role: 'ORGANIZER', canScan: true },  // Co-organizer
  { userId: 'user-3', role: 'STAFF', canScan: true },      // Box office manager
  { userId: 'user-4', role: 'STAFF', canScan: true },      // Security lead
  { userId: 'user-5', role: 'TEAM_MEMBER', canScan: true }, // Door volunteer 1
  { userId: 'user-6', role: 'TEAM_MEMBER', canScan: true }, // Door volunteer 2
  { userId: 'user-7', role: 'ASSOCIATE', canScan: false }   // Social media affiliate
]
```

---

## 🧪 **Testing Implications**

### **What Needs to be Tested**:

1. **Staff Assignment**:
   - Can organizers add staff to their events?
   - Can staff be assigned to multiple events?
   - Does unique constraint prevent duplicate assignments?

2. **Permission Enforcement**:
   - Do STAFF members only see assigned events?
   - Can TEAM_MEMBERS access financial data? (should be NO)
   - Can ASSOCIATES scan tickets? (should be NO)

3. **Commission Tracking**:
   - Are commissions calculated correctly?
   - Can staff view their earnings?
   - Referral code attribution working?

4. **Scanning Permissions**:
   - Does `canScan: false` actually prevent scanning?
   - Can inactive staff still scan? (should be NO)
   - Scan limits enforced?

5. **Dashboard Access**:
   - Do staff see correct event dashboard?
   - Are financial sections hidden for TEAM_MEMBER?
   - Is staff management hidden from STAFF role?

---

## 🎯 **Key Insights for Pass #2**

### **Questions to Answer in Next Analysis**:

1. **UI/UX**: How does the organizer dashboard show staff management?
2. **Permissions API**: Where are staff permissions checked in code?
3. **Ticket Scanning**: How does the scan validation work?
4. **Commission Payout**: How do staff withdraw earnings?
5. **Referral Tracking**: How are sales attributed to ASSOCIATES?

### **Code Locations to Investigate**:

- **Staff Management UI**: `app/(modules)/organizer/*/`
- **Ticket Scanning**: Search for `canScan` references
- **Commission Logic**: Search for `commissionPercent` and `commissionEarned`
- **Permission Checks**: Search for `EventStaff` and `StaffRole`

---

## 📝 **Summary - Pass #1 Findings**

### **EventStaff System is**:
- ✅ **Event-Scoped** (not platform-wide)
- ✅ **Many-to-Many** relationship (User ↔ Event)
- ✅ **Role-Based** with 4 distinct roles
- ✅ **Commission-Enabled** for monetization
- ✅ **Highly Flexible** via JSON permissions
- ✅ **Scan-Permission Aware** for ticket validation

### **Critical Architecture Points**:
1. A regular USER can be event staff (doesn't need EVENT_ORGANIZER role)
2. Staff roles are per-event, not global
3. Commission system built into the core model
4. Custom permissions allow fine-grained control
5. Unique constraint prevents duplicate staff assignments per event

---

**Next**: ULTRATHINK ANALYSIS PASS #2 - Access Patterns & Workflow Testing
