# Role-Based Navigation System - Complete Documentation

## Overview

This document provides comprehensive documentation for the role-based navigation system implemented in the SteppersLife Events platform. The system provides a unified, type-safe navigation experience across all 6 user roles with middleware protection, multi-role support, and post-login redirects.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [User Roles](#user-roles)
3. [File Structure](#file-structure)
4. [Core Components](#core-components)
5. [Navigation Configuration](#navigation-configuration)
6. [Permissions System](#permissions-system)
7. [Middleware Protection](#middleware-protection)
8. [Authentication & Redirects](#authentication--redirects)
9. [Multi-Role Switcher](#multi-role-switcher)
10. [Usage Examples](#usage-examples)
11. [Adding New Features](#adding-new-features)
12. [Troubleshooting](#troubleshooting)

---

## System Architecture

The navigation system is built on several key principles:

- **Config-Driven**: All navigation menus defined in `lib/navigation/config.ts`
- **Type-Safe**: Full TypeScript coverage with strict types
- **Permission-Based**: Fine-grained access control with utility functions
- **Component-Based**: Reusable Shadcn/UI components throughout
- **Middleware-Protected**: Edge middleware prevents unauthorized access
- **Multi-Role Aware**: Users can have multiple roles and switch between them

### Technology Stack

- **Next.js 16** with App Router and Turbopack
- **TypeScript** for type safety
- **Shadcn/UI** for component library
- **Radix UI** for accessible primitives
- **Tailwind CSS** for styling
- **Convex** for backend/database
- **Lucide React** for icons

---

## User Roles

The platform supports 6 distinct user roles:

### 1. Admin (`admin`)
- Full platform access
- Manage all users, events, settings
- View all analytics and financial data
- Dashboard: `/admin`

### 2. Event Organizer (`organizer`)
- Create and manage events
- Purchase tickets for resale
- Manage team members and associates
- View event-specific analytics
- Dashboard: `/organizer/dashboard`

### 3. User/Customer (`user`)
- Browse and purchase event tickets
- View purchased tickets
- Manage profile and preferences
- Default dashboard for all authenticated users
- Dashboard: `/user/dashboard`

### 4. Event Staff (`STAFF`)
- Check-in attendees
- Scan tickets at events
- View basic event information
- Dashboard: `/staff/dashboard`

### 5. Team Member (`TEAM_MEMBERS`)
- Sell tickets from inventory
- Manage associates
- Track sales and earnings
- Dashboard: `/team/dashboard`

### 6. Associate (`ASSOCIATES`)
- Sell individual tickets
- Earn commission
- Track personal sales
- Dashboard: `/associate/dashboard`

### Role Hierarchy

```
admin (highest access)
  ↓
organizer
  ↓
TEAM_MEMBERS
  ↓
ASSOCIATES
  ↓
STAFF
  ↓
user (base access)
```

**Note**: Users can have multiple roles simultaneously (e.g., a user who is also a TEAM_MEMBER).

---

## File Structure

```
src/events-stepperslife/
├── middleware.ts                       # Edge middleware for route protection
├── app/
│   ├── admin/
│   │   ├── layout.tsx                 # Admin dashboard layout
│   │   └── ...                        # Admin pages
│   ├── organizer/
│   │   ├── layout.tsx                 # Organizer dashboard layout
│   │   └── ...                        # Organizer pages
│   ├── user/
│   │   ├── layout.tsx                 # User dashboard layout
│   │   └── dashboard/page.tsx         # User dashboard
│   ├── staff/
│   │   ├── layout.tsx                 # Staff dashboard layout
│   │   └── dashboard/page.tsx         # Staff dashboard
│   ├── team/
│   │   ├── layout.tsx                 # Team Member dashboard layout
│   │   └── dashboard/page.tsx         # Team dashboard
│   └── associate/
│       ├── layout.tsx                 # Associate dashboard layout
│       └── dashboard/page.tsx         # Associate dashboard
├── components/
│   ├── navigation/
│   │   ├── NavItem.tsx                # Individual navigation item component
│   │   ├── RoleBasedSidebar.tsx       # Main sidebar component
│   │   ├── RoleSwitcher.tsx           # Multi-role switcher dropdown
│   │   └── index.ts                   # Barrel export
│   └── ui/
│       ├── sidebar.tsx                # Shadcn/UI sidebar primitives
│       ├── avatar.tsx                 # User avatar component
│       ├── dropdown-menu.tsx          # Dropdown menu component
│       └── ...                        # Other UI components
└── lib/
    ├── navigation/
    │   ├── types.ts                   # TypeScript type definitions
    │   ├── config.ts                  # Navigation menu configurations
    │   ├── utils.ts                   # Navigation utility functions
    │   ├── permissions.ts             # Permission checking functions
    │   └── index.ts                   # Barrel export
    └── auth/
        ├── redirects.ts               # Post-login redirect logic
        └── index.ts                   # Barrel export
```

---

## Core Components

### RoleBasedSidebar

The main navigation sidebar component that displays role-specific navigation.

**Location**: `components/navigation/RoleBasedSidebar.tsx`

**Props**:
```typescript
interface RoleBasedSidebarProps {
  user: NavUser;              // Current user object
  activeRole?: AllRoles;      // Which role's navigation to show
  onRoleSwitch?: (role: AllRoles) => void;  // Optional role switch callback
}
```

**Features**:
- Collapsible sidebar with icon-only mode
- User avatar and profile display
- Role-based navigation sections
- Nested submenu support
- Active state highlighting
- Notification badges
- Footer items (logout, settings, etc.)
- Integrated role switcher

**Usage Example**:
```typescript
import { RoleBasedSidebar } from "@/components/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<NavUser | null>(null);

  return (
    <SidebarProvider defaultOpen={true}>
      <RoleBasedSidebar user={user} activeRole="organizer" />
      <SidebarInset>
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

### NavItem

Individual navigation item component with support for icons, badges, and submenus.

**Location**: `components/navigation/NavItem.tsx`

**Props**:
```typescript
interface NavItemProps {
  item: NavItem;              // Navigation item configuration
  isCollapsed: boolean;       // Whether sidebar is collapsed
  isActive: boolean;          // Whether this item is active
  hasActiveSubmenu?: boolean; // Whether submenu has active item
}
```

**Features**:
- Icon support (Lucide React)
- Badge/notification counts
- Submenu expansion
- Active state styling
- Keyboard navigation
- Tooltip in collapsed mode

### RoleSwitcher

Dropdown menu for users with multiple roles to switch between dashboards.

**Location**: `components/navigation/RoleSwitcher.tsx`

**Props**:
```typescript
interface RoleSwitcherProps {
  user: NavUser;              // Current user object
  activeRole: AllRoles;       // Currently active role
  className?: string;         // Optional CSS class
}
```

**Features**:
- Only shown when user has 2+ accessible roles
- Dropdown with role descriptions
- Client-side navigation to role dashboards
- Active role indicator
- Keyboard accessible

---

## Navigation Configuration

All navigation menus are defined in `lib/navigation/config.ts`.

### Structure

```typescript
export const navigationConfig: Record<AllRoles, RoleNavigation> = {
  admin: {
    dashboardTitle: "Admin Panel",
    roleDescription: "Platform Administrator",
    sections: [
      {
        title: "OVERVIEW",
        items: [
          {
            label: "Dashboard",
            href: "/admin",
            icon: LayoutDashboard,
          },
          // ... more items
        ],
      },
      // ... more sections
    ],
    footerItems: [
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
      {
        label: "Logout",
        href: "/api/auth/logout",
        icon: LogOut,
      },
    ],
  },
  // ... configurations for other roles
};
```

### Navigation Item Options

```typescript
interface NavItem {
  label: string;              // Display text
  href: string;               // Link destination
  icon: LucideIcon;          // Lucide React icon
  badge?: number | string;   // Optional badge (notifications, counts)
  submenu?: NavItem[];       // Optional nested items
}
```

### Adding a New Navigation Item

1. Open `lib/navigation/config.ts`
2. Find the appropriate role configuration
3. Add to the relevant section:

```typescript
{
  label: "New Feature",
  href: "/role/new-feature",
  icon: Star,  // Import from lucide-react
  badge: 5,    // Optional
}
```

4. TypeScript will ensure type safety

---

## Permissions System

The permissions system provides fine-grained access control.

**Location**: `lib/navigation/permissions.ts`

### Core Permission Functions

#### Role Access
```typescript
canAccessAdmin(user: NavUser | null): boolean
canAccessOrganizer(user: NavUser | null): boolean
canAccessStaff(user: NavUser | null): boolean
canAccessTeamMember(user: NavUser | null): boolean
canAccessAssociate(user: NavUser | null): boolean
canAccessUserDashboard(user: NavUser | null): boolean
```

#### Feature Permissions
```typescript
canCreateEvents(user: NavUser | null): boolean
canManageTeamMembers(user: NavUser | null): boolean
canManageAssociates(user: NavUser | null): boolean
canScanTickets(user: NavUser | null): boolean
canViewFinancials(user: NavUser | null): boolean
canViewAnalytics(user: NavUser | null): boolean
canAccessPlatformSettings(user: NavUser | null): boolean
canManagePaymentMethods(user: NavUser | null): boolean
```

#### Route-Based Permissions
```typescript
isProtectedRoute(path: string): boolean
getRequiredRoleForRoute(path: string): AllRoles | null
canAccessRoute(user: NavUser | null, path: string): boolean
getUnauthorizedRedirect(user: NavUser | null, attemptedPath: string): string
```

#### User Roles
```typescript
canAccessRoleDashboard(user: NavUser | null, role: AllRoles): boolean
getAccessibleRoles(user: NavUser | null): AllRoles[]
```

### Usage Examples

```typescript
import { canCreateEvents, canAccessAdmin } from "@/lib/navigation/permissions";

// Check if user can create events
if (canCreateEvents(user)) {
  // Show create event button
}

// Check admin access
if (canAccessAdmin(user)) {
  // Show admin-only features
}

// Get all accessible dashboards
const roles = getAccessibleRoles(user);
// Returns: ["organizer", "TEAM_MEMBERS", "user"]
```

---

## Middleware Protection

Edge middleware protects all role-specific routes from unauthorized access.

**Location**: `middleware.ts`

### How It Works

1. **Route Matching**: Middleware runs on all routes except static files
2. **Auth Check**: Fetches user session from `/api/auth/me`
3. **Role Verification**: Checks if user has required role for route
4. **Redirect**: Sends to login or default dashboard if unauthorized

### Protected Routes

- `/admin/*` → Requires `admin` role
- `/organizer/*` → Requires `organizer` or `admin` role
- `/staff/*` → Requires `STAFF` staffRole
- `/team/*` → Requires `TEAM_MEMBERS` staffRole
- `/associate/*` → Requires `ASSOCIATES` staffRole
- `/user/*` → Requires any authenticated user

### Configuration

```typescript
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

### Adding New Protected Routes

Edit the `getRequiredRole` function in `middleware.ts`:

```typescript
function getRequiredRole(pathname: string): keyof typeof PROTECTED_ROUTES | null {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/organizer")) return "organizer";
  if (pathname.startsWith("/new-role")) return "NEW_ROLE";  // Add this
  // ... existing checks
  return null;
}
```

---

## Authentication & Redirects

Post-login redirect logic ensures users land on the appropriate dashboard.

**Location**: `lib/auth/redirects.ts`

### Key Functions

#### Get Default Dashboard
```typescript
getDefaultDashboardPath(userRoleInfo: UserRoleInfo): string
```

Returns the default dashboard for a user based on role priority:
1. Admin → `/admin`
2. Organizer → `/organizer/dashboard`
3. Team Member → `/team/dashboard`
4. Associate → `/associate/dashboard`
5. Staff → `/staff/dashboard`
6. User → `/user/dashboard` (fallback)

#### Post-Login Redirect
```typescript
getPostLoginRedirect(
  userRoleInfo: UserRoleInfo,
  intendedDestination?: string | null
): string
```

Handles redirect after login:
- If user was trying to access a specific page, redirects there
- Otherwise, redirects to default dashboard
- Validates redirect paths to prevent open redirect vulnerabilities

#### Build Login URL
```typescript
buildLoginUrl(currentPath: string): string
```

Creates login URL with redirect parameter:
```typescript
buildLoginUrl("/organizer/events/create")
// Returns: "/login?redirect=%2Forganizer%2Fevents%2Fcreate"
```

### Security Features

- **Open Redirect Prevention**: Validates all redirect URLs
- **Path Sanitization**: Blocks external URLs and protocol-relative paths
- **Login/Register Protection**: Prevents redirecting back to auth pages

---

## Multi-Role Switcher

The role switcher allows users with multiple roles to navigate between different dashboards.

### Features

- **Auto-Hide**: Only appears when user has 2+ accessible roles
- **Visual Feedback**: Shows active role with checkmark
- **Keyboard Navigation**: Fully accessible via keyboard
- **Role Descriptions**: Helpful context for each role
- **Client-Side Navigation**: Fast switching with Next.js router

### Integration

The RoleSwitcher is automatically integrated into RoleBasedSidebar:

```typescript
// In RoleBasedSidebar.tsx
{!isCollapsed && (
  <div className="px-4 pb-3">
    <RoleSwitcher user={user} activeRole={currentRole} />
  </div>
)}
```

### Role Display Configuration

Edit role labels in `components/navigation/RoleSwitcher.tsx`:

```typescript
const ROLE_CONFIG: Record<AllRoles, {...}> = {
  TEAM_MEMBERS: {
    label: "Team Member",
    description: "Manage ticket inventory",
    dashboardPath: "/team/dashboard",
  },
  // ... other roles
};
```

---

## Usage Examples

### Creating a New Dashboard Layout

```typescript
// app/new-role/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { RoleBasedSidebar } from "@/components/navigation";
import { AppHeader } from "@/components/sidebar/app-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { NavUser } from "@/lib/navigation/types";
import { generateUserInitials } from "@/lib/navigation/utils";

export default function NewRoleLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<NavUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          const apiUser = data.user;

          const navUser: NavUser = {
            id: apiUser._id,
            email: apiUser.email,
            name: apiUser.name,
            role: apiUser.role || "user",
            avatar: apiUser.avatar,
            initials: generateUserInitials(apiUser.name, apiUser.email),
            staffRoles: ["NEW_ROLE"],  // Set appropriate staff role
          };

          setUser(navUser);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to continue</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <RoleBasedSidebar user={user} activeRole="NEW_ROLE" />
        <SidebarInset className="flex-1">
          <AppHeader />
          <main className="flex-1 overflow-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
```

### Checking Permissions in Components

```typescript
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { canCreateEvents } from "@/lib/navigation/permissions";
import { Button } from "@/components/ui/button";

export function EventActions() {
  const currentUser = useQuery(api.users.queries.getCurrentUser);

  // Check if user can create events
  if (!canCreateEvents(currentUser)) {
    return null;  // Don't show create button
  }

  return (
    <Button onClick={() => window.location.href = "/organizer/events/create"}>
      Create Event
    </Button>
  );
}
```

### Server-Side Permission Checks

```typescript
// app/api/events/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { canCreateEvents } from "@/lib/navigation/permissions";

export async function POST(request: NextRequest) {
  // Get user from session
  const user = await getUserFromSession(request);

  // Check permission
  if (!canCreateEvents(user)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 }
    );
  }

  // Create event logic...
}
```

---

## Adding New Features

### Adding a New Role

1. **Update Types** (`lib/navigation/types.ts`):
```typescript
export type AllRoles = "admin" | "organizer" | "user" | "STAFF" | "TEAM_MEMBERS" | "ASSOCIATES" | "NEW_ROLE";
```

2. **Add Navigation Config** (`lib/navigation/config.ts`):
```typescript
export const navigationConfig: Record<AllRoles, RoleNavigation> = {
  // ... existing roles
  NEW_ROLE: {
    dashboardTitle: "New Role Dashboard",
    roleDescription: "Description of new role",
    sections: [
      {
        title: "MAIN",
        items: [
          {
            label: "Dashboard",
            href: "/new-role/dashboard",
            icon: LayoutDashboard,
          },
        ],
      },
    ],
    footerItems: [
      {
        label: "Logout",
        href: "/api/auth/logout",
        icon: LogOut,
      },
    ],
  },
};
```

3. **Add Permissions** (`lib/navigation/permissions.ts`):
```typescript
export function canAccessNewRole(user: NavUser | null): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  return user.staffRoles?.includes("NEW_ROLE") || false;
}
```

4. **Update Middleware** (`middleware.ts`):
```typescript
const PROTECTED_ROUTES = {
  // ... existing routes
  new_role: /^\/new-role/,
} as const;
```

5. **Create Dashboard**:
   - Create `/app/new-role/layout.tsx` (see example above)
   - Create `/app/new-role/dashboard/page.tsx`

6. **Add Role Switcher Config** (`components/navigation/RoleSwitcher.tsx`):
```typescript
const ROLE_CONFIG: Record<AllRoles, {...}> = {
  // ... existing roles
  NEW_ROLE: {
    label: "New Role",
    description: "Role description",
    dashboardPath: "/new-role/dashboard",
  },
};
```

### Adding Navigation Items to Existing Role

1. Open `lib/navigation/config.ts`
2. Find the role configuration
3. Add to appropriate section:

```typescript
organizer: {
  // ... existing config
  sections: [
    {
      title: "EVENTS",
      items: [
        // ... existing items
        {
          label: "New Feature",
          href: "/organizer/new-feature",
          icon: Star,
          badge: 10,  // Optional
        },
      ],
    },
  ],
},
```

4. Create the page at `/app/organizer/new-feature/page.tsx`

### Adding Submenu Items

```typescript
{
  label: "Reports",
  href: "/organizer/reports",
  icon: FileText,
  submenu: [
    {
      label: "Sales Report",
      href: "/organizer/reports/sales",
      icon: TrendingUp,
    },
    {
      label: "Attendance Report",
      href: "/organizer/reports/attendance",
      icon: Users,
    },
  ],
}
```

---

## Troubleshooting

### Common Issues

#### 1. "Module not found: Can't resolve '@/components/ui/avatar'"

**Solution**: Install missing Radix UI dependency:
```bash
npm install @radix-ui/react-avatar
```

#### 2. Middleware Redirecting Incorrectly

**Check**:
1. User role is set correctly in NavUser object
2. staffRoles array includes required role
3. Route pattern matches in middleware PROTECTED_ROUTES
4. /api/auth/me endpoint returns correct user data

**Debug**:
```typescript
// Add console.log to middleware.ts
console.log("User role:", user.role);
console.log("Staff roles:", user.staffRoles);
console.log("Required role:", requiredRole);
console.log("Has access:", hasRequiredRole(user.role, user.staffRoles, requiredRole));
```

#### 3. Navigation Not Showing

**Check**:
1. User object is correctly set in layout
2. activeRole prop matches actual role
3. Navigation config exists for role in config.ts
4. RoleBasedSidebar is wrapped in SidebarProvider

#### 4. Role Switcher Not Appearing

**Reason**: User only has access to one role

**Verify**: Check that user.staffRoles has multiple roles:
```typescript
console.log("Accessible roles:", getAccessibleRoles(user));
// Should return array with 2+ roles
```

#### 5. Permissions Not Working

**Check**:
1. Import from correct path: `@/lib/navigation/permissions`
2. Pass correct user object (not undefined/null)
3. Permission function name matches feature (e.g., `canCreateEvents` not `canCreate`)

**Test**:
```typescript
import { canCreateEvents } from "@/lib/navigation/permissions";

console.log("User:", user);
console.log("Can create:", canCreateEvents(user));
```

### Development Tips

1. **Use TypeScript**: Let the compiler catch errors early
2. **Check Browser Console**: Look for errors in dev tools
3. **Verify API Responses**: Check `/api/auth/me` returns correct data
4. **Test Permissions**: Use permission functions before displaying UI
5. **Clear Cache**: Run `rm -rf .next` if seeing stale data

### Performance Optimization

1. **Minimize User Fetches**: Fetch once in layout, pass down via props
2. **Use Suspense**: Wrap async components in Suspense boundaries
3. **Lazy Load**: Use dynamic imports for heavy dashboard components
4. **Optimize Images**: Use Next/Image for user avatars
5. **Cache Navigation**: Navigation config is static, no need to recompute

---

## Summary

The role-based navigation system provides:

✅ **6 Role Dashboards**: Admin, Organizer, User, Staff, Team Member, Associate
✅ **Unified Components**: RoleBasedSidebar with consistent UX
✅ **Type Safety**: Full TypeScript coverage
✅ **Middleware Protection**: Edge middleware prevents unauthorized access
✅ **Multi-Role Support**: Users can have and switch between multiple roles
✅ **Permission System**: Fine-grained access control
✅ **Post-Login Redirects**: Smart routing based on user roles
✅ **Extensible**: Easy to add new roles, features, and navigation items
✅ **Accessible**: Keyboard navigation and ARIA support
✅ **Mobile-Ready**: Responsive sidebar with collapse mode

### Next Steps

- Implement route-based middleware protection testing
- Add unit tests for permission functions
- Create Storybook stories for navigation components
- Add analytics tracking for navigation usage
- Implement search functionality in sidebar
- Add keyboard shortcuts for common actions

---

**Documentation Version**: 1.0.0
**Last Updated**: November 17, 2025
**Author**: Claude Code - Anthropic's AI Assistant
