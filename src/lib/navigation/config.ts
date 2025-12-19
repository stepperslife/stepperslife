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
  FileText,
  CreditCard,
  Wallet,
  Share2,
  UtensilsCrossed,
  Clock,
  ClipboardList,
  Store,
  Search,
  MoreHorizontal,
  Briefcase,
  PieChart,
} from "lucide-react";
import { RoleNavigation } from "./types";

/**
 * Simplified, mobile-first navigation configuration for all 7 user roles
 * Following UX principles: Progressive Disclosure, Primary Action Focus,
 * Grouping by Context, Collapsible Sections
 */

// ============================================================================
// ADMIN NAVIGATION - Grouped by Domain
// ============================================================================
export const adminNavigation: RoleNavigation = {
  role: "admin",
  dashboardTitle: "Admin",
  roleDescription: "Platform Administrator",
  sections: [
    // Dashboard - always visible
    {
      items: [
        {
          label: "Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
          description: "Overview of platform metrics",
        },
      ],
    },
    // Users & Events Section
    {
      title: "Users & Events",
      icon: Users,
      items: [
        {
          label: "Users",
          href: "/admin/users",
          icon: Users,
          description: "Manage all users",
        },
        {
          label: "Events",
          href: "/admin/events",
          icon: Calendar,
          description: "Manage all events",
        },
        {
          label: "CRM",
          href: "/admin/crm",
          icon: Briefcase,
          description: "Event contacts and CRM",
        },
      ],
    },
    // Commerce Section
    {
      title: "Commerce",
      icon: ShoppingCart,
      items: [
        {
          label: "Orders",
          href: "/admin/orders",
          icon: Ticket,
          description: "Ticket orders",
        },
        {
          label: "Products",
          href: "/admin/products",
          icon: ShoppingCart,
          description: "Marketplace products",
        },
        {
          label: "Vendors",
          href: "/admin/vendors",
          icon: Store,
          description: "Marketplace vendors",
        },
        {
          label: "Product Orders",
          href: "/admin/product-orders",
          icon: Package,
          description: "Product fulfillment",
        },
      ],
    },
    // Insights Section
    {
      title: "Insights",
      icon: PieChart,
      items: [
        {
          label: "Analytics",
          href: "/admin/analytics",
          icon: BarChart3,
          description: "Platform analytics",
        },
        {
          label: "Support Tickets",
          href: "/admin/support",
          icon: MessageSquare,
          description: "Support requests",
        },
      ],
    },
    // Settings at bottom with divider
    {
      showDivider: true,
      items: [
        {
          label: "Settings",
          href: "/admin/settings",
          icon: Settings,
          description: "Platform settings",
        },
        {
          label: "Notifications",
          href: "/admin/notifications",
          icon: Bell,
          badge: "5",
          description: "System alerts",
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
// ORGANIZER NAVIGATION - Sectioned with Collapsible "More Tools"
// ============================================================================
export const organizerNavigation: RoleNavigation = {
  role: "organizer",
  dashboardTitle: "Organizer",
  roleDescription: "Event Organizer",
  sections: [
    // Overview
    {
      items: [
        {
          label: "Dashboard",
          href: "/organizer/dashboard",
          icon: LayoutDashboard,
          description: "Quick overview",
        },
      ],
    },
    // Events & Tickets - Primary section
    {
      title: "Events & Tickets",
      icon: Ticket,
      items: [
        {
          label: "My Events",
          href: "/organizer/events",
          icon: Calendar,
          description: "Create and manage events",
        },
        {
          label: "Tickets",
          href: "/organizer/tickets",
          icon: Ticket,
          description: "Purchase and manage tickets",
        },
        {
          label: "Team",
          href: "/organizer/team",
          icon: Users,
          description: "Manage your team",
        },
      ],
    },
    // Earnings Section
    {
      title: "Earnings",
      icon: DollarSign,
      items: [
        {
          label: "Earnings Overview",
          href: "/organizer/earnings",
          icon: DollarSign,
          description: "View revenue",
        },
        {
          label: "Reports",
          href: "/organizer/reports",
          icon: BarChart3,
          description: "Detailed analytics",
        },
      ],
    },
    // More Tools - Collapsed by default
    {
      title: "More Tools",
      icon: MoreHorizontal,
      collapsible: true,
      defaultCollapsed: true,
      items: [
        {
          label: "Credits",
          href: "/organizer/credits",
          icon: Wallet,
          description: "Manage credits",
        },
        {
          label: "Templates",
          href: "/organizer/templates",
          icon: FileText,
          description: "Event templates",
        },
        {
          label: "Bundles",
          href: "/organizer/bundles",
          icon: Package,
          description: "Ticket bundles",
        },
        {
          label: "Settlement",
          href: "/organizer/settlement",
          icon: CreditCard,
          description: "Financial settlement",
        },
        {
          label: "Analytics",
          href: "/organizer/analytics",
          icon: TrendingUp,
          description: "Advanced analytics",
        },
      ],
    },
    // Footer items with divider
    {
      showDivider: true,
      items: [
        {
          label: "Settings",
          href: "/organizer/settings",
          icon: Settings,
          description: "Your settings",
        },
        {
          label: "Notifications",
          href: "/organizer/notifications",
          icon: Bell,
          description: "Updates and alerts",
        },
        {
          label: "Support",
          href: "/organizer/support",
          icon: MessageSquare,
          description: "Get help",
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
// USER/CUSTOMER NAVIGATION - Clean 3 Sections
// ============================================================================
export const userNavigation: RoleNavigation = {
  role: "user",
  dashboardTitle: "SteppersLife",
  roleDescription: "Customer",
  sections: [
    // Discover Section
    {
      title: "Discover",
      icon: Search,
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
          description: "Discover events",
        },
        {
          label: "Favorites",
          href: "/user/favorites",
          icon: Heart,
          description: "Saved events",
        },
      ],
    },
    // My Tickets Section - Most important for customers
    {
      title: "My Tickets",
      icon: Ticket,
      items: [
        {
          label: "Upcoming Events",
          href: "/user/my-tickets/upcoming",
          icon: Ticket,
          description: "Your upcoming tickets",
        },
        {
          label: "Past Events",
          href: "/user/my-tickets/past",
          icon: CheckSquare,
          description: "Previous events",
        },
        {
          label: "Orders",
          href: "/user/my-orders",
          icon: FileText,
          description: "Order history",
        },
      ],
    },
    // Account items with divider
    {
      showDivider: true,
      items: [
        {
          label: "Profile",
          href: "/user/profile",
          icon: User,
          description: "Your account",
        },
        {
          label: "Cart",
          href: "/user/cart",
          icon: ShoppingCart,
          badge: "3",
          description: "Shopping cart",
        },
        {
          label: "Notifications",
          href: "/user/notifications",
          icon: Bell,
          description: "Updates",
        },
        {
          label: "Support",
          href: "/user/support",
          icon: MessageSquare,
          description: "Get help",
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
// STAFF (Door Staff) NAVIGATION - Scan Tickets Primary
// ============================================================================
export const staffNavigation: RoleNavigation = {
  role: "STAFF",
  dashboardTitle: "Staff",
  roleDescription: "Event Staff",
  sections: [
    // PRIMARY ACTION - Scan Tickets (Giant Button)
    {
      items: [
        {
          label: "Scan Tickets",
          href: "/staff/scan-tickets",
          icon: QrCode,
          description: "Open QR scanner",
          isPrimary: true,
          subtitle: "Tap to open scanner",
        },
      ],
    },
    // Quick Actions - Visible
    {
      items: [
        {
          label: "Register Sale",
          href: "/staff/register-sale",
          icon: DollarSign,
          description: "In-person sales",
        },
        {
          label: "Today's Scans",
          href: "/staff/scanned-tickets/today",
          icon: CheckSquare,
          description: "View today's scans",
        },
        {
          label: "My Events",
          href: "/staff/assigned-events",
          icon: Calendar,
          description: "Assigned events",
        },
      ],
    },
    // More Options - Collapsed
    {
      title: "More Options",
      icon: MoreHorizontal,
      collapsible: true,
      defaultCollapsed: true,
      items: [
        {
          label: "Cash Orders",
          href: "/staff/cash-orders",
          icon: Wallet,
          description: "Cash payments",
        },
        {
          label: "Scan Statistics",
          href: "/staff/scan-statistics",
          icon: BarChart3,
          description: "Entry analytics",
        },
        {
          label: "Transfers",
          href: "/staff/transfers",
          icon: Share2,
          description: "Ticket transfers",
        },
        {
          label: "Issues",
          href: "/staff/issues",
          icon: AlertTriangle,
          description: "Report issues",
        },
        {
          label: "My Team",
          href: "/staff/my-team",
          icon: Users,
          description: "Team hierarchy",
        },
        {
          label: "Profile & Settings",
          href: "/staff/profile",
          icon: Settings,
          description: "Your settings",
        },
        {
          label: "Support",
          href: "/staff/notifications",
          icon: MessageSquare,
          description: "Get help",
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
// TEAM MEMBER NAVIGATION - Focused on Sales
// ============================================================================
export const teamMemberNavigation: RoleNavigation = {
  role: "TEAM_MEMBERS",
  dashboardTitle: "Team Member",
  roleDescription: "Team Member",
  sections: [
    // Dashboard
    {
      items: [
        {
          label: "Dashboard",
          href: "/team/dashboard",
          icon: LayoutDashboard,
          description: "Overview",
        },
      ],
    },
    // Tickets & Sales - Primary section
    {
      title: "Tickets & Sales",
      icon: Ticket,
      items: [
        {
          label: "My Tickets",
          href: "/team-member/my-tickets",
          icon: Ticket,
          description: "Your ticket inventory",
        },
        {
          label: "My Associates",
          href: "/team-member/my-associates",
          icon: Users,
          description: "Manage associates",
        },
        {
          label: "Share Link",
          href: "/team-member/my-ticket-links",
          icon: LinkIcon,
          description: "Your sales link",
        },
      ],
    },
    // Earnings Section
    {
      title: "Earnings",
      icon: DollarSign,
      items: [
        {
          label: "My Earnings",
          href: "/team-member/earnings",
          icon: DollarSign,
          description: "Track earnings",
        },
        {
          label: "Performance",
          href: "/team-member/sales-performance",
          icon: TrendingUp,
          description: "Sales stats",
        },
      ],
    },
    // Footer items with divider
    {
      showDivider: true,
      items: [
        {
          label: "My Events",
          href: "/team-member/my-events",
          icon: Calendar,
          description: "Assigned events",
        },
        {
          label: "Profile",
          href: "/team-member/profile",
          icon: User,
          description: "Your profile",
        },
        {
          label: "Support",
          href: "/team-member/support",
          icon: MessageSquare,
          description: "Get help",
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
// ASSOCIATE NAVIGATION - Super Simple, Link Primary
// ============================================================================
export const associateNavigation: RoleNavigation = {
  role: "ASSOCIATES",
  dashboardTitle: "Associate",
  roleDescription: "Sales Associate",
  sections: [
    // PRIMARY ACTION - My Ticket Link
    {
      items: [
        {
          label: "My Ticket Link",
          href: "/associate/my-ticket-link",
          icon: LinkIcon,
          description: "Share to sell tickets",
          isPrimary: true,
          subtitle: "Tap to copy & share",
        },
      ],
    },
    // Main items
    {
      items: [
        {
          label: "Dashboard",
          href: "/associate/dashboard",
          icon: LayoutDashboard,
          description: "Overview",
        },
        {
          label: "My Tickets",
          href: "/associate/my-tickets",
          icon: Ticket,
          description: "Ticket inventory",
        },
        {
          label: "My Earnings",
          href: "/associate/earnings",
          icon: DollarSign,
          description: "Commission earnings",
        },
      ],
    },
    // Footer items with divider
    {
      showDivider: true,
      items: [
        {
          label: "My Events",
          href: "/associate/my-events",
          icon: Calendar,
          description: "Selling events",
        },
        {
          label: "Profile",
          href: "/associate/profile",
          icon: User,
          description: "Your profile",
        },
        {
          label: "Support",
          href: "/associate/support",
          icon: MessageSquare,
          description: "Get help",
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
// RESTAURATEUR NAVIGATION - Orders Dominant
// ============================================================================
export const restaurateurNavigation: RoleNavigation = {
  role: "restaurateur",
  dashboardTitle: "Restaurant",
  roleDescription: "Restaurant Partner",
  sections: [
    // PRIMARY ACTION - Orders
    {
      items: [
        {
          label: "Orders",
          href: "/restaurateur/dashboard/orders",
          icon: ClipboardList,
          description: "Manage orders",
          isPrimary: true,
          subtitle: "View active orders",
        },
      ],
    },
    // Restaurant Section
    {
      title: "Restaurant",
      icon: UtensilsCrossed,
      items: [
        {
          label: "Menu",
          href: "/restaurateur/dashboard/menu",
          icon: UtensilsCrossed,
          description: "Manage menu",
        },
        {
          label: "Hours",
          href: "/restaurateur/dashboard/hours",
          icon: Clock,
          description: "Operating hours",
        },
        {
          label: "Staff",
          href: "/restaurateur/dashboard/staff",
          icon: Users,
          description: "Manage staff",
        },
      ],
    },
    // Business Section
    {
      title: "Business",
      icon: BarChart3,
      items: [
        {
          label: "Earnings",
          href: "/restaurateur/dashboard/earnings",
          icon: DollarSign,
          description: "Revenue and payouts",
        },
        {
          label: "Analytics",
          href: "/restaurateur/dashboard/analytics",
          icon: BarChart3,
          description: "Performance metrics",
        },
      ],
    },
    // Footer items with divider
    {
      showDivider: true,
      items: [
        {
          label: "Reviews",
          href: "/restaurateur/dashboard/reviews",
          icon: MessageSquare,
          description: "Customer reviews",
        },
        {
          label: "Settings",
          href: "/restaurateur/dashboard/settings",
          icon: Settings,
          description: "Restaurant settings",
        },
        {
          label: "Support",
          href: "/restaurateur/dashboard/support",
          icon: MessageSquare,
          description: "Get help",
        },
      ],
    },
  ],
  footerItems: [
    {
      label: "View Restaurant",
      href: "/restaurants",
      icon: Store,
      external: true,
    },
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
    case "restaurateur":
      return restaurateurNavigation;
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
  restaurateur: restaurateurNavigation,
  user: userNavigation,
  staff: staffNavigation,
  team_member: teamMemberNavigation,
  associate: associateNavigation,
};
