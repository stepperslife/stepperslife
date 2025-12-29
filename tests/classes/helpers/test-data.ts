/**
 * Test Data Constants for Classes E2E Tests
 */

// Re-export account constants for convenience
export {
  STUDENT_ACCOUNT,
  INSTRUCTOR_ACCOUNT,
  ADMIN_ACCOUNT,
  STUDENT_ACCOUNT_2,
  INSTRUCTOR_ACCOUNT_2,
  type TestAccount,
} from "./test-accounts";

// Test Class Data
export const TEST_CLASS_DATA = {
  namePrefix: "E2E Test Class",
  description:
    "This is an E2E test class for automated testing of the stepping workshop. Learn the fundamentals of Chicago Stepping in this beginner-friendly session.",
  venueName: "E2E Test Dance Studio",
  address: "123 Test Dance Lane",
  city: "Chicago",
  state: "IL",
  zipCode: "60601",
  country: "USA",
};

// Class Categories (matching the app's categories)
export const CLASS_CATEGORIES = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Workshop",
  "Private Lesson",
  "Group Class",
  "Chicago Stepping",
  "Detroit Ballroom",
  "Line Dance",
  "Hand Dance",
] as const;

export type ClassCategory = (typeof CLASS_CATEGORIES)[number];

// Ticket/Enrollment Tiers for Classes
export const CLASS_TICKET_TIERS = {
  singleSession: {
    name: "Single Session",
    price: 25.0,
    priceInCents: 2500,
    quantity: 20,
  },
  packageDeal: {
    name: "4-Class Package",
    price: 80.0,
    priceInCents: 8000,
    quantity: 10,
  },
  dropIn: {
    name: "Drop-In",
    price: 15.0,
    priceInCents: 1500,
    quantity: 30,
  },
  free: {
    name: "Free Trial",
    price: 0,
    priceInCents: 0,
    quantity: 5,
  },
};

// Stripe Test Cards
export const STRIPE_TEST_CARDS = {
  success: {
    number: "4242424242424242",
    expiry: "12/30",
    cvc: "123",
    zip: "60601",
  },
  declined: {
    number: "4000000000000002",
    expiry: "12/30",
    cvc: "123",
    zip: "60601",
  },
  requiresAuth: {
    number: "4000002760003184",
    expiry: "12/30",
    cvc: "123",
    zip: "60601",
  },
  insufficientFunds: {
    number: "4000000000009995",
    expiry: "12/30",
    cvc: "123",
    zip: "60601",
  },
  expiredCard: {
    number: "4000000000000069",
    expiry: "12/30",
    cvc: "123",
    zip: "60601",
  },
};

// PayPal Sandbox Credentials
export const PAYPAL_SANDBOX = {
  email: "sb-buyer@personal.example.com",
  password: "testpassword",
};

// Class-specific URLs
export const CLASS_URLS = {
  listing: "/classes",
  detail: (id: string) => `/classes/${id}`,
  checkout: (id: string) => `/classes/${id}/checkout`,
  create: "/organizer/classes/create",
  edit: (id: string) => `/organizer/classes/${id}/edit`,
  instructorDashboard: "/organizer/classes",
  myEnrollments: "/user/my-tickets",
  login: "/login",
  register: "/register",
};

// Timeouts for different operations
export const TIMEOUTS = {
  short: 5000,
  medium: 10000,
  long: 30000,
  payment: 60000,
  convexQuery: 15000,
  pageLoad: 20000,
};

// Generate unique class name with timestamp
export function generateUniqueClassName(prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 7);
  return `${prefix || "E2E Test Class"} ${timestamp}-${random}`;
}

// Generate unique test email
export function generateTestEmail(prefix?: string): string {
  return `${prefix || "e2e"}-${Date.now()}@test.stepperslife.com`;
}

// Generate unique test name
export function generateTestName(): string {
  return `Test User ${Date.now()}`;
}

// Get a future date (for class scheduling)
export function getFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
}

// Get a past date (for testing past class filtering)
export function getPastDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 16);
}

// Format price for display (cents to dollars)
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// Calculate expected total with platform fee
export function calculateExpectedTotal(
  priceInCents: number,
  quantity: number,
  platformFeePercent: number = 5
): {
  subtotal: number;
  platformFee: number;
  total: number;
} {
  const subtotal = priceInCents * quantity;
  const platformFee = Math.round((subtotal * platformFeePercent) / 100);
  const total = subtotal + platformFee;
  return { subtotal, platformFee, total };
}

// Test class form data type
export interface ClassFormData {
  name: string;
  description: string;
  categories: ClassCategory[];
  startDate: string;
  endDate?: string;
  venueName?: string;
  address?: string;
  city: string;
  state: string;
  zipCode?: string;
  country?: string;
  imagePath?: string;
}

// Student info for enrollment
export interface StudentInfo {
  name: string;
  email: string;
  phone?: string;
}

// Enrollment confirmation data
export interface EnrollmentConfirmation {
  orderId: string;
  className: string;
  tierName: string;
  quantity: number;
  total: string;
}

// Enrollment stats for instructor dashboard
export interface EnrollmentStats {
  totalEnrolled: number;
  totalRevenue: number;
  recentEnrollments: number;
}

// Enrollee info
export interface Enrollee {
  name: string;
  email: string;
  tierName: string;
  enrolledAt: string;
  status: "confirmed" | "pending" | "cancelled";
}
