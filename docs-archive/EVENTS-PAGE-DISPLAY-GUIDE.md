# Events Page Display Guide

## How Events Display on `/events` Page

### ✅ Required Conditions for Event to Display

For an event to appear on the public events page (`/events`), **ALL** of these conditions must be met:

#### 1. Event Status Must Be "PUBLISHED"
```typescript
// CRITICAL: Only PUBLISHED events show
event.status === "PUBLISHED"  // Must be exactly this
```

**Other statuses that WON'T display:**
- ❌ `DRAFT` - Event not published yet
- ❌ `CANCELLED` - Event was cancelled
- ❌ `COMPLETED` - Event already happened

**How to Fix:**
```
Navigate to: /organizer/events/[eventId]/edit
Change status to: "PUBLISHED"
Click: "Publish Event" button
```

#### 2. Event Must Be in the Future (by default)
```typescript
// By default, only future events show
event.startDate >= Date.now()  // Current timestamp
// OR
event.endDate >= Date.now()    // If no startDate
```

**To Show Past Events:**
- User must check "Show past events" checkbox on `/events` page

**How to Fix:**
- Ensure `startDate` is set to a future date
- OR enable "Show past events" toggle

#### 3. Required Fields Must Be Present
```typescript
event.name          // REQUIRED - Non-empty string
event.description   // REQUIRED - Non-empty string
event.startDate     // REQUIRED - Number (milliseconds)
event.location      // REQUIRED - Object with city, state
```

**Location Format:**
```typescript
// CORRECT:
location: {
  city: "Chicago",
  state: "IL",
  country: "US"
}

// WRONG (legacy format):
location: "Chicago, IL"  // Will cause search filter to fail
```

### 🔍 Events Page Query Logic

**File:** `/convex/public/queries.ts` → `getPublishedEvents`

```typescript
// Step 1: Filter by status
.withIndex("by_status", (q) => q.eq("status", "PUBLISHED"))

// Step 2: Filter by date (if includePast = false)
if (!includePast) {
  events = events.filter((e) => {
    const eventDate = e.endDate || e.startDate;
    return eventDate && eventDate >= Date.now();
  });
}

// Step 3: Filter by category (if selected)
if (category) {
  events = events.filter((e) => e.categories?.includes(category));
}

// Step 4: Filter by search term
if (searchTerm) {
  events = events.filter((e) => {
    const search = searchTerm.toLowerCase();
    return (
      e.name?.toLowerCase().includes(search) ||
      e.description?.toLowerCase().includes(search) ||
      (typeof e.location === "object" &&
        e.location.city?.toLowerCase().includes(search))
    );
  });
}
```

### 📊 Event Display Fields

**What's Shown on Event Card:**

| Field | Source | Required | Fallback |
|-------|--------|----------|----------|
| Event Name | `event.name` | ✅ Yes | - |
| Image | `event.imageUrl` OR `event.images[0]` | ⚠️ No | Unsplash placeholder |
| Event Type Badge | `event.eventType` | ✅ Yes | "EVENT" |
| Start Date/Time | `event.startDate` | ✅ Yes | - |
| Location | `event.location.city, state` | ✅ Yes | - |
| Categories | `event.categories[]` | ⚠️ No | None shown |
| Organizer | `organizer.name` | ⚠️ No | "Unknown" |
| Description | `event.description` | ✅ Yes | - |
| Tickets Badge | `event.ticketsVisible` | ⚠️ No | Not shown |

**Event Type Badges:**
- 📅 `SAVE_THE_DATE` → "Save The Date"
- 🎟️ `TICKETED_EVENT` → "Ticketed Event"
- 🎫 `FREE_EVENT` → "Free Event"
- 💺 `SEATED_EVENT` → "Seated Event"
- 🎭 `BALLROOM_EVENT` → "Ballroom Event"

### 🐛 Common Issues & Solutions

#### Issue 1: "No events found" but events exist in database

**Possible Causes:**
1. Events have `status !== "PUBLISHED"`
   - **Fix:** Publish the events in organizer dashboard
2. All events are past dates
   - **Fix:** Check "Show past events" or create future events
3. Events missing required fields
   - **Fix:** Ensure name, description, startDate, location are set
4. Location is legacy string format
   - **Fix:** Migrate to object format: `{ city, state, country }`

#### Issue 2: Events display but images are broken

**Possible Causes:**
1. Invalid `imageUrl` (404)
2. Missing storage permissions for `images[0]`
3. No image set at all

**Fix:**
- Set valid `imageUrl` to direct image URL
- OR upload image via organizer dashboard (stores in Convex storage)
- Fallback to Unsplash works but isn't personalized

#### Issue 3: "Tickets Available" badge not showing

**Conditions for badge:**
```typescript
event.ticketsVisible === true  // Must be explicitly true
```

**Fix:**
- Set `ticketsVisible: true` when configuring event payment

#### Issue 4: Events don't show immediately after creation

**Possible Causes:**
1. Event created with `status: "DRAFT"`
2. Caching (unlikely - page uses `dynamic = "force-dynamic"`)

**Fix:**
- Always publish event after creation
- Refresh page to see changes

#### Issue 5: Search/filter returns no results

**Check:**
- Search is case-insensitive but exact substring match
- Category filter is exact match (must be in `event.categories[]`)
- Date filter respects event timezone

### 🔧 Quick Debugging Checklist

When events aren't displaying, check in order:

```bash
# 1. Check if event exists in Convex
# Go to: https://dashboard.convex.dev/
# Navigate to: Data → events table
# Find your event and verify:

✓ status = "PUBLISHED"
✓ startDate > current timestamp (or "Show past events" enabled)
✓ name and description are non-empty
✓ location is object format { city, state, country }

# 2. Check browser console
# Open: DevTools → Console
# Look for errors related to:

✓ Failed to fetch events (network error)
✓ Image loading errors (404)
✓ JavaScript errors in EventCard component

# 3. Check Convex query
# Open: DevTools → Network tab
# Filter: XHR/Fetch
# Look for: getPublishedEvents
# Verify: Response contains your events

# 4. Check filters on /events page

✓ Search box is empty (not filtering out events)
✓ Category dropdown is "All Categories"
✓ "Show past events" is checked (if testing past events)
```

### 🎯 How to Ensure Events Display (For Tests)

When creating events in tests, ensure:

```typescript
// REQUIRED FIELDS
const event = {
  name: "Test Event Name",                // Required
  description: "Test event description",  // Required
  eventType: "TICKETED_EVENT",           // Required
  status: "PUBLISHED",                    // CRITICAL - must publish!

  // Date (must be future)
  startDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
  endDate: Date.now() + (30 * 24 * 60 * 60 * 1000) + (4 * 60 * 60 * 1000), // +4 hours

  // Location (object format)
  location: {
    city: "Chicago",
    state: "IL",
    country: "US",
  },

  // Optional but recommended
  categories: ["Testing", "Music"],
  ticketsVisible: true,
  timezone: "America/Chicago",
  imageUrl: "https://example.com/image.jpg",  // Or use Convex storage
};
```

### 🔄 Manual Verification Steps

**1. Create Test Event via Organizer Dashboard:**
```
1. Login as organizer
2. Navigate to /organizer/events/create
3. Fill all required fields
4. Set startDate to future date
5. Set location as object { city, state, country }
6. Click "Create Event"
7. Click "Publish Event" (CRITICAL!)
8. Navigate to /events
9. Verify event appears in list
```

**2. Verify in Convex Dashboard:**
```
1. Open https://dashboard.convex.dev/
2. Navigate to your deployment
3. Go to Data → events table
4. Find your event
5. Verify status === "PUBLISHED"
6. Verify startDate >= current timestamp
```

**3. Check Browser DevTools:**
```
1. Open /events page
2. Open DevTools (F12)
3. Go to Network tab
4. Filter: Fetch/XHR
5. Look for "getPublishedEvents" request
6. Check response contains your event
```

### 📝 Event Creation Checklist (For Tests)

```bash
# When creating events in automated tests:

✓ Set status: "PUBLISHED" (not DRAFT)
✓ Set startDate: Future timestamp
✓ Set endDate: After startDate
✓ Set name: Non-empty string
✓ Set description: Non-empty string
✓ Set location: Object { city, state, country }
✓ Set eventType: Valid event type
✓ Set categories: Array of strings
✓ Set ticketsVisible: true (for ticketed events)
✓ Set timezone: Valid timezone string
✓ Set imageUrl: Valid image URL (optional)

# After event creation:
✓ Publish event (change status to PUBLISHED)
✓ Wait for Convex sync (~500ms)
✓ Navigate to /events page
✓ Verify event appears in list
```

### 🎨 Events Page Features

**Filters Available:**
- 🔍 **Search** - Search by name, description, or location city
- 📁 **Category** - Filter by single category
- 📅 **Show Past Events** - Toggle to include/exclude past events

**View Modes (on homepage):**
- 🎯 **Masonry** - Pinterest-style grid
- 📊 **Grid** - 3-column grid layout
- 📝 **List** - List view with more details

**Sorting:**
- Primary: By status (PUBLISHED first)
- Secondary: By startDate (earliest first)

### 🚀 Testing Events Display

**Quick Test:**
```bash
# 1. Create test event via Convex dashboard
# Go to: https://dashboard.convex.dev/
# Data → events → Add Document

{
  "name": "Test Display Event",
  "description": "Testing event display on /events page",
  "eventType": "TICKETED_EVENT",
  "status": "PUBLISHED",
  "startDate": 1738368000000,  # Future date (2025-02-01)
  "endDate": 1738382400000,    # 4 hours later
  "location": {
    "city": "Chicago",
    "state": "IL",
    "country": "US"
  },
  "categories": ["Testing"],
  "ticketsVisible": true,
  "timezone": "America/Chicago",
  "organizerId": "<your-organizer-id>",
  "createdAt": 1705507200000,
  "updatedAt": 1705507200000
}

# 2. Navigate to: http://localhost:3004/events
# 3. Verify event appears in list
```

---

**Last Updated:** January 17, 2025
**Status:** ✅ Complete Guide for Events Display Debugging
