/**
 * E2E Test Data Constants
 * Shared test data used across all E2E tests
 */

// Test User Credentials
export const TEST_USER = {
  email: "e2e-test@stepperslife.com",
  password: "TestPassword123!",
  name: "E2E Test User",
};

// Test Organizer Credentials
export const TEST_ORGANIZER = {
  email: "e2e-organizer@stepperslife.com",
  password: "TestPassword123!",
  name: "E2E Test Organizer",
};

// Test Event Details
export const TEST_EVENT = {
  namePrefix: "E2E Test Event",
  fullName: "E2E Test Event - General",
  description: "This is an E2E test event for automated testing.",
  venue: "E2E Test Venue",
  address: "123 Test Street",
  city: "Atlanta",
  state: "GA",
  zipCode: "30301",
};

// Ticket Tiers
export const TICKET_TIERS = {
  generalAdmission: {
    name: "General Admission",
    price: 25.0,
    priceInCents: 2500,
  },
  vip: {
    name: "VIP",
    price: 75.0,
    priceInCents: 7500,
  },
  free: {
    name: "Free Entry",
    price: 0,
    priceInCents: 0,
  },
};

// Stripe Test Cards
export const STRIPE_TEST_CARDS = {
  success: {
    number: "4242424242424242",
    expiry: "12/30",
    cvc: "123",
    zip: "30301",
  },
  declined: {
    number: "4000000000000002",
    expiry: "12/30",
    cvc: "123",
    zip: "30301",
  },
  requiresAuth: {
    number: "4000002760003184",
    expiry: "12/30",
    cvc: "123",
    zip: "30301",
  },
  insufficientFunds: {
    number: "4000000000009995",
    expiry: "12/30",
    cvc: "123",
    zip: "30301",
  },
};

// PayPal Sandbox Credentials
export const PAYPAL_SANDBOX = {
  email: "sb-buyer@personal.example.com",
  password: "testpassword",
};

// Test URLs
export const URLS = {
  home: "/",
  login: "/login",
  register: "/register",
  events: "/events",
  myTickets: "/user/my-tickets",
  dashboard: "/dashboard",
};

// Timeouts
export const TIMEOUTS = {
  short: 5000,
  medium: 10000,
  long: 30000,
  payment: 60000,
};

// Generate unique test email
export function generateTestEmail(): string {
  return `e2e-${Date.now()}@test.com`;
}

// Generate unique test name
export function generateTestName(): string {
  return `Test User ${Date.now()}`;
}
