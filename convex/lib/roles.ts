/**
 * Centralized Role Constants
 *
 * This file defines all user and staff roles used throughout the application.
 * Using constants prevents typos and makes role management more maintainable.
 *
 * @module roles
 */

/**
 * Platform administrator emails
 *
 * To add new admins, add their email to this array.
 * In the future, this could be moved to a database table for dynamic management.
 */
export const ADMIN_EMAILS = [
  "bobbygwatkins@gmail.com",
  "admin-test@stepperslife.com", // Temporary for testing
  "platformadmin@stepperslife.com", // Platform admin for testing
] as const;

/** Primary admin email for system operations */
export const PRIMARY_ADMIN_EMAIL = "bobbygwatkins@gmail.com";

/**
 * Check if an email is an admin email
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase() as any);
}

/**
 * Main user roles for the platform
 */
export const USER_ROLES = {
  /** Platform administrator with full access */
  ADMIN: "admin",
  /** Event creator and manager */
  ORGANIZER: "organizer",
  /** Restaurant owner - can create and manage restaurants */
  RESTAURATEUR: "restaurateur",
  /** Regular customer/ticket buyer */
  USER: "user",
} as const;

/**
 * Staff roles for event-specific staff members
 *
 * HIERARCHY:
 * - TEAM_MEMBERS: Business partners who work directly with organizers
 *   - Can get up to 100% commission (they're partners, not employees)
 *   - Can assign ASSOCIATES as sub-sellers WITHOUT organizer permission
 *   - Can manage their own sub-seller network
 *
 * - ASSOCIATES: Sub-sellers assigned by TEAM_MEMBERS
 *   - Receive ticket allocations from their parent TEAM_MEMBER
 *   - Earn commission split determined by the TEAM_MEMBER who assigned them
 *   - Cannot assign their own sub-sellers (unless explicitly enabled)
 *
 * - STAFF: Door staff for ticket scanning
 *   - Primarily scan tickets at event entrance
 *   - Can sell tickets if organizer permits
 *   - Cannot assign sub-sellers
 */
export const STAFF_ROLES = {
  /** Door staff - Can scan tickets, can sell only if organizer permits */
  STAFF: "STAFF",
  /** Business partners - Can get up to 100% commission, can assign Associates as sub-sellers */
  TEAM_MEMBERS: "TEAM_MEMBERS",
  /** Sub-sellers assigned by Team Members - earn commission from ticket sales */
  ASSOCIATES: "ASSOCIATES",
} as const;

/**
 * Staff roles for restaurant-specific staff members
 *
 * HIERARCHY:
 * - OWNER: The restaurant owner (linked via ownerId, has full control)
 *   - Full access to all restaurant features
 *   - Can delete restaurant, manage billing, process refunds
 *
 * - RESTAURANT_MANAGER: Operations manager
 *   - Can manage menu, hours, orders, analytics, and staff
 *   - Cannot access billing, delete restaurant, or transfer ownership
 *   - Cannot process refunds
 *
 * - RESTAURANT_STAFF: Order fulfillment staff
 *   - Can view and update order status only
 *   - Cannot modify menu, hours, settings, or view analytics
 */
export const RESTAURANT_STAFF_ROLES = {
  /** Operations manager - menu, orders, hours, analytics, staff management */
  RESTAURANT_MANAGER: "RESTAURANT_MANAGER",
  /** Order fulfillment - view orders and update status only */
  RESTAURANT_STAFF: "RESTAURANT_STAFF",
} as const;

/**
 * Hierarchy configuration
 */
export const HIERARCHY_CONFIG = {
  /** Maximum depth of sub-seller hierarchy to prevent performance issues */
  MAX_DEPTH: 5,
  /** Initial hierarchy level for organizer-assigned staff */
  ROOT_LEVEL: 1,
} as const;

/**
 * Commission types
 */
export const COMMISSION_TYPES = {
  /** Commission calculated as percentage of ticket price */
  PERCENTAGE: "PERCENTAGE",
  /** Fixed dollar amount commission per ticket */
  FIXED: "FIXED",
} as const;

/**
 * Transfer status types
 */
export const TRANSFER_STATUS = {
  /** Transfer request pending recipient action */
  PENDING: "PENDING",
  /** Transfer accepted and completed */
  ACCEPTED: "ACCEPTED",
  /** Transfer rejected by recipient */
  REJECTED: "REJECTED",
  /** Transfer cancelled by sender */
  CANCELLED: "CANCELLED",
  /** Transfer expired due to time limit */
  AUTO_EXPIRED: "AUTO_EXPIRED",
} as const;

/**
 * Transfer expiration configuration
 */
export const TRANSFER_CONFIG = {
  /** Transfer expiration time in milliseconds (48 hours) */
  EXPIRATION_MS: 48 * 60 * 60 * 1000,
  /** Reminder time before expiration (24 hours) */
  REMINDER_MS: 24 * 60 * 60 * 1000,
} as const;

// TypeScript types derived from constants

/** User role type */
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/** Staff role type */
export type StaffRole = (typeof STAFF_ROLES)[keyof typeof STAFF_ROLES];

/** Restaurant staff role type */
export type RestaurantStaffRole = (typeof RESTAURANT_STAFF_ROLES)[keyof typeof RESTAURANT_STAFF_ROLES];

/** Commission type */
export type CommissionType = (typeof COMMISSION_TYPES)[keyof typeof COMMISSION_TYPES];

/** Transfer status type */
export type TransferStatus = (typeof TRANSFER_STATUS)[keyof typeof TRANSFER_STATUS];

/**
 * Type guard to check if a value is a valid user role
 */
export function isUserRole(value: unknown): value is UserRole {
  return Object.values(USER_ROLES).includes(value as UserRole);
}

/**
 * Type guard to check if a value is a valid staff role
 */
export function isStaffRole(value: unknown): value is StaffRole {
  return Object.values(STAFF_ROLES).includes(value as StaffRole);
}

/**
 * Type guard to check if a value is a valid restaurant staff role
 */
export function isRestaurantStaffRole(value: unknown): value is RestaurantStaffRole {
  return Object.values(RESTAURANT_STAFF_ROLES).includes(value as RestaurantStaffRole);
}

/**
 * Type guard to check if a value is a valid transfer status
 */
export function isTransferStatus(value: unknown): value is TransferStatus {
  return Object.values(TRANSFER_STATUS).includes(value as TransferStatus);
}

/**
 * Get human-readable role name
 */
export function getRoleName(role: UserRole | StaffRole | RestaurantStaffRole): string {
  const roleNames: Record<UserRole | StaffRole | RestaurantStaffRole, string> = {
    [USER_ROLES.ADMIN]: "Administrator",
    [USER_ROLES.ORGANIZER]: "Event Organizer",
    [USER_ROLES.RESTAURATEUR]: "Restaurateur",
    [USER_ROLES.USER]: "User",
    [STAFF_ROLES.STAFF]: "Door Staff",
    [STAFF_ROLES.TEAM_MEMBERS]: "Team Member",
    [STAFF_ROLES.ASSOCIATES]: "Associate",
    [RESTAURANT_STAFF_ROLES.RESTAURANT_MANAGER]: "Restaurant Manager",
    [RESTAURANT_STAFF_ROLES.RESTAURANT_STAFF]: "Restaurant Staff",
  };
  return roleNames[role] || role;
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole | StaffRole | RestaurantStaffRole): string {
  const descriptions: Record<UserRole | StaffRole | RestaurantStaffRole, string> = {
    [USER_ROLES.ADMIN]: "Full platform access with ability to manage all events and users",
    [USER_ROLES.ORGANIZER]: "Create and manage events, ticket tiers, and staff members",
    [USER_ROLES.RESTAURATEUR]: "Create and manage restaurants, menus, orders, and restaurant staff",
    [USER_ROLES.USER]: "Browse events and purchase tickets",
    [STAFF_ROLES.STAFF]:
      "Scan and validate tickets at event entrance, can sell if organizer permits",
    [STAFF_ROLES.TEAM_MEMBERS]:
      "Business partner - can earn up to 100% commission, can assign Associates as sub-sellers without organizer permission",
    [STAFF_ROLES.ASSOCIATES]:
      "Sub-seller assigned by a Team Member - receives ticket allocation and earns commission from sales",
    [RESTAURANT_STAFF_ROLES.RESTAURANT_MANAGER]:
      "Restaurant operations manager - can manage menu, hours, orders, analytics, and staff",
    [RESTAURANT_STAFF_ROLES.RESTAURANT_STAFF]:
      "Restaurant order fulfillment - can view orders and update order status",
  };
  return descriptions[role] || "Unknown role";
}
