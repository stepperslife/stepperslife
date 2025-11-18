import {
  LayoutDashboard,
  Users,
  Calendar,
  Ticket,
  DollarSign,
  Package,
  Settings,
  BarChart3,
  Bell,
  MessageSquare,
  LogOut,
  Home,
  Heart,
  ShoppingCart,
  User,
  QrCode,
  CheckSquare,
  AlertTriangle,
  TrendingUp,
  Link as LinkIcon,
  UserPlus,
  FileText,
  CreditCard,
  Shield,
  Upload,
  Database,
  Mail,
  Percent,
  Wallet,
  Share2,
} from "lucide-react";
import { RoleNavigation } from "./types";

/**
 * Complete navigation configuration for all 6 user roles
 * Based on the stepperslife_dashboard_navigation_menus.md specification
 */

// ============================================================================
// ADMIN NAVIGATION
// ============================================================================
export const adminNavigation: RoleNavigation = {
  role: "admin",
  dashboardTitle: "SteppersLife Admin",
  roleDescription: "Platform Administrator",
  sections: [
    {
      items: [
        {
          label: "Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
          description: "Overview of platform metrics and recent activity",
        },
        {
          label: "Users Management",
          href: "/admin/users",
          icon: Users,
          description: "Manage all user types and permissions",
          submenu: [
            { label: "All Users", href: "/admin/users" },
            { label: "Organizers", href: "/admin/users?role=organizer" },
            { label: "Team Members", href: "/admin/users?role=team" },
            { label: "Associates", href: "/admin/users?role=associate" },
            { label: "Staff", href: "/admin/users?role=staff" },
          ],
        },
        {
          label: "Events Management",
          href: "/admin/events",
          icon: Calendar,
          description: "Approve, monitor, and manage all events",
          submenu: [
            { label: "All Events", href: "/admin/events" },
            { label: "Pending Approval", href: "/admin/events?status=pending" },
            { label: "Active Events", href: "/admin/events?status=active" },
            { label: "Past Events", href: "/admin/events?status=past" },
          ],
        },
        {
          label: "Tickets",
          href: "/admin/tickets",
          icon: Ticket,
          description: "View all ticket sales, scans, and refunds",
          submenu: [
            { label: "All Tickets", href: "/admin/tickets" },
            { label: "Scanned Tickets", href: "/admin/tickets/scanned" },
            { label: "Refunds", href: "/admin/tickets/refunds" },
          ],
        },
        {
          label: "Financial",
          href: "/admin/financial",
          icon: DollarSign,
          description: "Platform revenue, payouts, transaction monitoring",
          submenu: [
            { label: "Revenue Overview", href: "/admin/financial/revenue" },
            { label: "Payouts", href: "/admin/financial/payouts" },
            { label: "Transactions", href: "/admin/financial/transactions" },
            { label: "Reports", href: "/admin/financial/reports" },
          ],
        },
        {
          label: "Pre-Paid Plans",
          href: "/admin/prepaid",
          icon: Package,
          description: "Manage pre-paid ticket inventory system",
          submenu: [
            { label: "Plan Management", href: "/admin/prepaid/plans" },
            { label: "Ticket Inventory", href: "/admin/prepaid/inventory" },
            { label: "Purchase History", href: "/admin/prepaid/history" },
          ],
        },
        {
          label: "Settings",
          href: "/admin/settings",
          icon: Settings,
          description: "Configure platform-wide settings",
          submenu: [
            { label: "Platform Settings", href: "/admin/settings/platform" },
            { label: "Payment Gateways", href: "/admin/settings/payments" },
            { label: "Email Templates", href: "/admin/settings/emails" },
            { label: "System Config", href: "/admin/settings/system" },
          ],
        },
        {
          label: "Analytics",
          href: "/admin/analytics",
          icon: BarChart3,
          description: "Deep dive into platform performance",
        },
        {
          label: "Notifications",
          href: "/admin/notifications",
          icon: Bell,
          badge: "5",
          description: "System alerts and admin notices",
        },
        {
          label: "Support",
          href: "/admin/support",
          icon: MessageSquare,
          description: "Manage support tickets and inquiries",
        },
      ],
    },
  ],
  footerItems: [
    {
      label: "Logout",
      href: "/logout",
      icon: LogOut,
    },
  ],
};

// ============================================================================
// ORGANIZER NAVIGATION
// ============================================================================
export const organizerNavigation: RoleNavigation = {
  role: "organizer",
  dashboardTitle: "SteppersLife",
  roleDescription: "Events Organizer",
  sections: [
    {
      items: [
        {
          label: "Dashboard",
          href: "/organizer/dashboard",
          icon: LayoutDashboard,
          description: "Quick view of events, sales, earnings",
        },
        {
          label: "My Events",
          href: "/organizer/events",
          icon: Calendar,
          description: "Create and manage all events",
          submenu: [
            { label: "Create Event", href: "/organizer/events/create" },
            { label: "Active Events", href: "/organizer/events?status=active" },
            { label: "Past Events", href: "/organizer/events?status=past" },
            { label: "Drafts", href: "/organizer/events?status=draft" },
          ],
        },
        {
          label: "Tickets",
          href: "/organizer/tickets",
          icon: Ticket,
          description: "Purchase pre-paid tickets, view inventory",
          submenu: [
            { label: "Purchase Tickets", href: "/organizer/tickets/purchase" },
            { label: "My Ticket Inventory", href: "/organizer/tickets/inventory" },
            { label: "Sales Overview", href: "/organizer/tickets/sales" },
          ],
        },
        {
          label: "Team Management",
          href: "/organizer/team",
          icon: Users,
          description: "Add team members, distribute tickets",
          submenu: [
            { label: "Team Members", href: "/organizer/team/members" },
            { label: "Add Team Member", href: "/organizer/team/add" },
            { label: "Ticket Distribution", href: "/organizer/team/distribution" },
          ],
        },
        {
          label: "Earnings",
          href: "/organizer/earnings",
          icon: DollarSign,
          description: "View revenue, request payouts",
          submenu: [
            { label: "Total Earnings", href: "/organizer/earnings" },
            { label: "Payout History", href: "/organizer/earnings/payouts" },
            { label: "Transaction History", href: "/organizer/earnings/transactions" },
          ],
        },
        {
          label: "Reports",
          href: "/organizer/reports",
          icon: BarChart3,
          description: "Detailed analytics for events and sales",
          submenu: [
            { label: "Sales Reports", href: "/organizer/reports/sales" },
            { label: "Attendee Reports", href: "/organizer/reports/attendees" },
            { label: "Financial Reports", href: "/organizer/reports/financial" },
          ],
        },
        {
          label: "Payment Methods",
          href: "/organizer/payment-methods",
          icon: CreditCard,
          description: "Configure payout preferences",
        },
        {
          label: "Settings",
          href: "/organizer/settings",
          icon: Settings,
          description: "Update profile and business information",
          submenu: [
            { label: "Profile", href: "/organizer/settings/profile" },
            { label: "Business Info", href: "/organizer/settings/business" },
            { label: "Preferences", href: "/organizer/settings/preferences" },
          ],
        },
        {
          label: "Notifications",
          href: "/organizer/notifications",
          icon: Bell,
          description: "Event updates and sales alerts",
        },
        {
          label: "Support",
          href: "/organizer/support",
          icon: MessageSquare,
          description: "Get help from platform",
        },
      ],
    },
  ],
  footerItems: [
    {
      label: "Logout",
      href: "/logout",
      icon: LogOut,
    },
  ],
};

// ============================================================================
// USER/CUSTOMER NAVIGATION
// ============================================================================
export const userNavigation: RoleNavigation = {
  role: "user",
  dashboardTitle: "SteppersLife",
  roleDescription: "Customer",
  sections: [
    {
      items: [
        {
          label: "Home",
          href: "/",
          icon: Home,
          description: "Return to main page",
        },
        {
          label: "Browse Events",
          href: "/events",
          icon: Calendar,
          description: "Discover all events",
        },
        {
          label: "My Tickets",
          href: "/user/tickets",
          icon: Ticket,
          description: "View purchased tickets with QR codes",
          submenu: [
            { label: "Upcoming Events", href: "/user/tickets?filter=upcoming" },
            { label: "Past Events", href: "/user/tickets?filter=past" },
            { label: "Ticket History", href: "/user/tickets/history" },
          ],
        },
        {
          label: "Favorites",
          href: "/user/favorites",
          icon: Heart,
          description: "Saved events for later",
        },
        {
          label: "Cart",
          href: "/user/cart",
          icon: ShoppingCart,
          badge: "3",
          description: "Current items before checkout",
        },
        {
          label: "My Orders",
          href: "/user/orders",
          icon: FileText,
          description: "Complete order history",
        },
        {
          label: "Profile",
          href: "/user/profile",
          icon: User,
          description: "Update personal information",
          submenu: [
            { label: "Personal Info", href: "/user/profile" },
            { label: "Saved Addresses", href: "/user/profile/addresses" },
            { label: "Payment Methods", href: "/user/profile/payments" },
          ],
        },
        {
          label: "Notifications",
          href: "/user/notifications",
          icon: Bell,
          description: "Event reminders and updates",
        },
        {
          label: "Support",
          href: "/user/support",
          icon: MessageSquare,
          description: "Contact customer service",
        },
      ],
    },
  ],
  footerItems: [
    {
      label: "Logout",
      href: "/logout",
      icon: LogOut,
    },
  ],
};

// ============================================================================
// STAFF (Door Staff) NAVIGATION
// ============================================================================
export const staffNavigation: RoleNavigation = {
  role: "STAFF",
  dashboardTitle: "SteppersLife Staff",
  roleDescription: "Event Staff",
  sections: [
    {
      items: [
        {
          label: "Dashboard",
          href: "/staff/dashboard",
          icon: LayoutDashboard,
          description: "Today's event overview and scan metrics",
        },
        {
          label: "Scan Tickets",
          href: "/staff/scan",
          icon: QrCode,
          description: "QR code scanner interface",
          highlight: true,
        },
        {
          label: "Scanned Tickets",
          href: "/staff/scanned",
          icon: CheckSquare,
          description: "View all scanned tickets in real-time",
          submenu: [
            { label: "Today's Scans", href: "/staff/scanned?filter=today" },
            { label: "By Event", href: "/staff/scanned/by-event" },
            { label: "Search Ticket", href: "/staff/scanned/search" },
          ],
        },
        {
          label: "My Assigned Events",
          href: "/staff/events",
          icon: Calendar,
          description: "Events staff is scheduled for",
          submenu: [
            { label: "Today", href: "/staff/events?filter=today" },
            { label: "Upcoming", href: "/staff/events?filter=upcoming" },
            { label: "Past Events", href: "/staff/events?filter=past" },
          ],
        },
        {
          label: "Scan Statistics",
          href: "/staff/statistics",
          icon: BarChart3,
          description: "Entry analytics and reporting",
          submenu: [
            { label: "Entry Rate", href: "/staff/statistics/entry-rate" },
            { label: "Total Scans", href: "/staff/statistics/total" },
            { label: "Event Status", href: "/staff/statistics/status" },
          ],
        },
        {
          label: "Issues",
          href: "/staff/issues",
          icon: AlertTriangle,
          description: "Report and view ticket validation issues",
          badge: "2",
          submenu: [
            { label: "Invalid Tickets", href: "/staff/issues/invalid" },
            { label: "Duplicate Scans", href: "/staff/issues/duplicates" },
            { label: "Report Issue", href: "/staff/issues/report" },
          ],
        },
        {
          label: "Profile",
          href: "/staff/profile",
          icon: User,
          description: "Update personal information",
        },
        {
          label: "Notifications",
          href: "/staff/notifications",
          icon: Bell,
          description: "Event assignments and alerts",
        },
      ],
    },
  ],
  footerItems: [
    {
      label: "Logout",
      href: "/logout",
      icon: LogOut,
    },
  ],
};

// ============================================================================
// TEAM MEMBER NAVIGATION
// ============================================================================
export const teamMemberNavigation: RoleNavigation = {
  role: "TEAM_MEMBERS",
  dashboardTitle: "SteppersLife",
  roleDescription: "Team Member",
  sections: [
    {
      items: [
        {
          label: "Dashboard",
          href: "/team/dashboard",
          icon: LayoutDashboard,
          description: "Overview of tickets, sales, and earnings",
        },
        {
          label: "My Events",
          href: "/team/events",
          icon: Calendar,
          description: "Events assigned by organizer",
          submenu: [
            { label: "Active Events", href: "/team/events?status=active" },
            { label: "Past Events", href: "/team/events?status=past" },
            { label: "Event Details", href: "/team/events/details" },
          ],
        },
        {
          label: "My Tickets",
          href: "/team/tickets",
          icon: Ticket,
          description: "Ticket inventory and distribution status",
          submenu: [
            { label: "Available Tickets", href: "/team/tickets?status=available" },
            { label: "Assigned to Associates", href: "/team/tickets?status=assigned" },
            { label: "Sold Tickets", href: "/team/tickets?status=sold" },
          ],
        },
        {
          label: "My Associates",
          href: "/team/associates",
          icon: Users,
          description: "Add and manage associates under you",
          submenu: [
            { label: "Add Associate", href: "/team/associates/add" },
            { label: "Manage Associates", href: "/team/associates" },
            { label: "Distribute Tickets", href: "/team/associates/distribute" },
          ],
        },
        {
          label: "Earnings",
          href: "/team/earnings",
          icon: DollarSign,
          description: "Track your 100% commission earnings",
          submenu: [
            { label: "Total Earnings", href: "/team/earnings" },
            { label: "By Event", href: "/team/earnings/by-event" },
            { label: "Payout History", href: "/team/earnings/payouts" },
            { label: "Pending Payouts", href: "/team/earnings/pending" },
          ],
        },
        {
          label: "Sales Performance",
          href: "/team/performance",
          icon: TrendingUp,
          description: "Compare sales with team",
          submenu: [
            { label: "My Sales", href: "/team/performance/my-sales" },
            { label: "Associates Sales", href: "/team/performance/associates" },
            { label: "Leaderboard", href: "/team/performance/leaderboard" },
          ],
        },
        {
          label: "My Ticket Links",
          href: "/team/links",
          icon: LinkIcon,
          description: "Unique links to sell tickets",
          submenu: [
            { label: "Generate Link", href: "/team/links/generate" },
            { label: "Link Performance", href: "/team/links/performance" },
          ],
        },
        {
          label: "Profile",
          href: "/team/profile",
          icon: User,
          description: "Update personal information",
        },
        {
          label: "Notifications",
          href: "/team/notifications",
          icon: Bell,
          description: "Ticket assignments and sales alerts",
        },
        {
          label: "Support",
          href: "/team/support",
          icon: MessageSquare,
          description: "Get help from organizer or platform",
        },
      ],
    },
  ],
  footerItems: [
    {
      label: "Logout",
      href: "/logout",
      icon: LogOut,
    },
  ],
};

// ============================================================================
// ASSOCIATE NAVIGATION
// ============================================================================
export const associateNavigation: RoleNavigation = {
  role: "ASSOCIATES",
  dashboardTitle: "SteppersLife",
  roleDescription: "Sales Associate",
  sections: [
    {
      items: [
        {
          label: "Dashboard",
          href: "/associate/dashboard",
          icon: LayoutDashboard,
          description: "Quick view of tickets, sales, earnings",
        },
        {
          label: "My Events",
          href: "/associate/events",
          icon: Calendar,
          description: "Events you're selling tickets for",
          submenu: [
            { label: "Active Events", href: "/associate/events?status=active" },
            { label: "Past Events", href: "/associate/events?status=past" },
            { label: "Event Details", href: "/associate/events/details" },
          ],
        },
        {
          label: "My Tickets",
          href: "/associate/tickets",
          icon: Ticket,
          description: "Your ticket inventory and availability",
          submenu: [
            { label: "Available Tickets", href: "/associate/tickets?status=available" },
            { label: "Sold Tickets", href: "/associate/tickets?status=sold" },
            { label: "Ticket Inventory", href: "/associate/tickets/inventory" },
          ],
        },
        {
          label: "Earnings",
          href: "/associate/earnings",
          icon: DollarSign,
          description: "Commission-based earnings tracking",
          submenu: [
            { label: "Total Earnings", href: "/associate/earnings" },
            { label: "By Event", href: "/associate/earnings/by-event" },
            { label: "Commission Rate", href: "/associate/earnings/rate" },
            { label: "Payout History", href: "/associate/earnings/payouts" },
          ],
        },
        {
          label: "Sales Performance",
          href: "/associate/performance",
          icon: TrendingUp,
          description: "Your sales analytics",
          submenu: [
            { label: "Tickets Sold", href: "/associate/performance/tickets" },
            { label: "Sales by Date", href: "/associate/performance/by-date" },
            { label: "Performance Stats", href: "/associate/performance/stats" },
          ],
        },
        {
          label: "My Ticket Link",
          href: "/associate/link",
          icon: LinkIcon,
          description: "Unique link to sell tickets",
          submenu: [
            { label: "Copy Link", href: "/associate/link/copy" },
            { label: "Share Link", href: "/associate/link/share" },
            { label: "Link Stats", href: "/associate/link/stats" },
          ],
        },
        {
          label: "My Team Member",
          href: "/associate/team-member",
          icon: UserPlus,
          description: "Your assigned team member contact",
          submenu: [
            { label: "Contact Info", href: "/associate/team-member/contact" },
          ],
        },
        {
          label: "Profile",
          href: "/associate/profile",
          icon: User,
          description: "Update personal information",
        },
        {
          label: "Notifications",
          href: "/associate/notifications",
          icon: Bell,
          description: "Ticket assignments and sales alerts",
        },
        {
          label: "Support",
          href: "/associate/support",
          icon: MessageSquare,
          description: "Contact your team member or platform",
        },
      ],
    },
  ],
  footerItems: [
    {
      label: "Logout",
      href: "/logout",
      icon: LogOut,
    },
  ],
};

// ============================================================================
// NAVIGATION CONFIG REGISTRY
// ============================================================================

/**
 * Get navigation configuration for a specific role
 */
export function getNavigationForRole(role: string): RoleNavigation | null {
  switch (role) {
    case "admin":
      return adminNavigation;
    case "organizer":
      return organizerNavigation;
    case "user":
      return userNavigation;
    case "STAFF":
      return staffNavigation;
    case "TEAM_MEMBERS":
      return teamMemberNavigation;
    case "ASSOCIATES":
      return associateNavigation;
    default:
      return null;
  }
}

/**
 * Get all navigation configurations (for reference/documentation)
 */
export const allNavigationConfigs = {
  admin: adminNavigation,
  organizer: organizerNavigation,
  user: userNavigation,
  staff: staffNavigation,
  team_member: teamMemberNavigation,
  associate: associateNavigation,
};
