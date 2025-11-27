/**
 * Test Helper Utilities for Organizer/Staff System Tests
 *
 * Provides reusable functions for:
 * - Organizer account operations
 * - Credit purchases and verification
 * - Event creation and management
 * - Staff assignment and commission setup
 * - Customer purchase simulation
 * - Verification and assertions
 */

import { Page, expect } from "@playwright/test";
import { ConvexHttpClient } from "convex/browser";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://dazzling-mockingbird-241.convex.cloud";
const convex = new ConvexHttpClient(CONVEX_URL);

/**
 * Register a new organizer account
 */
export async function registerOrganizer(
  page: Page,
  data: { name: string; email: string; password: string }
) {
  await page.goto("/register");
  await page.waitForLoadState("networkidle");

  // Fill registration form
  await page.fill('input[name="name"]', data.name);
  await page.fill('input[name="email"]', data.email);
  await page.fill('input[name="password"]', data.password);

  // Submit
  await page.click('button[type="submit"]');

  // Wait for redirect to login or dashboard
  await page.waitForURL(/\/(login|organizer)/);

  // If redirected to login, perform login
  if (page.url().includes("/login")) {
    await page.fill('input[name="email"]', data.email);
    await page.fill('input[name="password"]', data.password);
    await page.click('button[type="submit"]');
    await page.waitForURL("/organizer/dashboard");
  }

  return {
    name: data.name,
    email: data.email,
  };
}

/**
 * Purchase credits via Square (dev mode)
 */
export async function purchaseCreditsSquare(
  page: Page,
  amount: number,
  testCard: { number: string; cvv: string; expiry: string }
) {
  await page.goto("/organizer/credits");
  await page.waitForLoadState("networkidle");

  // Click purchase credits
  await page.click('text="Purchase Credits"');

  // Select amount
  await page.fill('input[name="amount"]', amount.toString());

  // Select Square as payment method
  await page.click('text="Square"');

  // Fill Square test card details
  await page.fill('input[placeholder*="Card number"]', testCard.number);
  await page.fill('input[placeholder*="CVV"]', testCard.cvv);
  await page.fill('input[placeholder*="Expiry"]', testCard.expiry);

  // Submit payment
  await page.click('button:has-text("Complete Purchase")');

  // Wait for success
  await page.waitForSelector('text="Credits purchased successfully"', { timeout: 30000 });

  return { amount };
}

/**
 * Purchase credits via Cash App Pay (dev mode)
 */
export async function purchaseCreditsCashApp(
  page: Page,
  amount: number,
  testTag: string
) {
  await page.goto("/organizer/credits");
  await page.waitForLoadState("networkidle");

  // Click purchase credits
  await page.click('text="Purchase Credits"');

  // Select amount
  await page.fill('input[name="amount"]', amount.toString());

  // Select Cash App Pay as payment method
  await page.click('text="Cash App Pay"');

  // Fill Cash App test tag
  await page.fill('input[placeholder*="Cash tag"]', testTag);

  // Submit payment
  await page.click('button:has-text("Complete Purchase")');

  // Wait for success
  await page.waitForSelector('text="Credits purchased successfully"', { timeout: 30000 });

  return { amount };
}

/**
 * Get organizer's current credit balance from UI
 */
export async function getCreditBalance(page: Page): Promise<number> {
  await page.goto("/organizer/credits");
  await page.waitForLoadState("networkidle");

  const balanceText = await page.textContent('[data-testid="credit-balance"]');
  const match = balanceText?.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Create a ticketed event
 */
export async function createEvent(
  page: Page,
  eventData: {
    name: string;
    description: string;
    ticketCount: number;
    ticketPrice: number;
    paymentModel: "PREPAY" | "CREDIT_CARD";
    creditsAllocated?: number;
    location: { city: string; state: string; country: string };
    startDate: Date;
    endDate: Date;
    categories: string[];
  }
) {
  await page.goto("/organizer/events/create");
  await page.waitForLoadState("networkidle");

  // Fill basic event info
  await page.fill('input[name="name"]', eventData.name);
  await page.fill('textarea[name="description"]', eventData.description);

  // Set event type
  await page.click('text="Ticketed Event"');

  // Set location
  await page.fill('input[name="city"]', eventData.location.city);
  await page.fill('input[name="state"]', eventData.location.state);

  // Set dates
  await page.fill('input[name="startDate"]', eventData.startDate.toISOString().split("T")[0]);
  await page.fill('input[name="endDate"]', eventData.endDate.toISOString().split("T")[0]);

  // Add categories
  for (const category of eventData.categories) {
    await page.fill('input[name="category"]', category);
    await page.press('input[name="category"]', "Enter");
  }

  // Submit event creation
  await page.click('button:has-text("Create Event")');

  // Wait for redirect to event page
  await page.waitForURL(/\/organizer\/events\/\w+/);

  // Get event ID from URL
  const eventId = page.url().match(/\/events\/(\w+)/)?.[1];

  // Configure tickets and payment
  await page.click('text="Configure Tickets"');

  // Add ticket tier
  await page.fill('input[name="tierName"]', "General Admission");
  await page.fill('input[name="quantity"]', eventData.ticketCount.toString());
  await page.fill('input[name="price"]', (eventData.ticketPrice / 100).toString());

  await page.click('button:has-text("Add Tier")');

  // Configure payment model
  await page.click('text="Configure Payment"');
  await page.click(`text="${eventData.paymentModel}"`);

  if (eventData.paymentModel === "PREPAY" && eventData.creditsAllocated) {
    await page.fill('input[name="creditsToAllocate"]', eventData.creditsAllocated.toString());
  }

  await page.click('button:has-text("Save Payment Configuration")');

  return { eventId, ...eventData };
}

/**
 * Add a Team Member to an event
 */
export async function addTeamMember(
  page: Page,
  eventId: string,
  staffData: {
    name: string;
    email: string;
    ticketAllocation: number;
    commissionValue: number;
    canAssignSubSellers?: boolean;
  }
) {
  await page.goto(`/organizer/events/${eventId}/staff`);
  await page.waitForLoadState("networkidle");

  // Click add staff
  await page.click('button:has-text("Add Staff")');

  // Fill staff details
  await page.fill('input[name="name"]', staffData.name);
  await page.fill('input[name="email"]', staffData.email);

  // Select role
  await page.selectOption('select[name="role"]', "TEAM_MEMBERS");

  // Set ticket allocation
  await page.fill('input[name="ticketAllocation"]', staffData.ticketAllocation.toString());

  // Set commission
  await page.selectOption('select[name="commissionType"]', "PERCENTAGE");
  await page.fill('input[name="commissionValue"]', staffData.commissionValue.toString());

  // Permissions
  await page.check('input[name="canSellTickets"]');
  if (staffData.canAssignSubSellers) {
    await page.check('input[name="canAssignSubSellers"]');
  }
  await page.check('input[name="acceptCashInPerson"]');

  // Submit
  await page.click('button:has-text("Add Staff Member")');

  // Wait for confirmation
  await page.waitForSelector('text="Staff member added successfully"');

  return { ...staffData };
}

/**
 * Add an Associate (sub-seller) to a Team Member
 */
export async function addAssociate(
  page: Page,
  eventId: string,
  parentStaffEmail: string,
  associateData: {
    name: string;
    email: string;
    ticketAllocation: number;
    commissionValue: number; // in cents
  }
) {
  await page.goto(`/organizer/events/${eventId}/staff`);
  await page.waitForLoadState("networkidle");

  // Find parent staff member row
  await page.click(`text="${parentStaffEmail}"`);

  // Click add sub-seller
  await page.click('button:has-text("Add Sub-Seller")');

  // Fill associate details
  await page.fill('input[name="name"]', associateData.name);
  await page.fill('input[name="email"]', associateData.email);

  // Set ticket allocation
  await page.fill('input[name="ticketAllocation"]', associateData.ticketAllocation.toString());

  // Set fixed commission
  await page.selectOption('select[name="commissionType"]', "FIXED");
  await page.fill('input[name="commissionValue"]', (associateData.commissionValue / 100).toString());

  // Submit
  await page.click('button:has-text("Add Associate")');

  // Wait for confirmation
  await page.waitForSelector('text="Associate added successfully"');

  return { ...associateData };
}

/**
 * Simulate customer ticket purchase via Stripe
 */
export async function purchaseTicketsAsCustomer(
  page: Page,
  eventId: string,
  quantity: number,
  testCard: { number: string; exp_month: number; exp_year: number; cvc: string }
) {
  // Logout if logged in as organizer
  await page.goto("/api/auth/logout", { waitUntil: "networkidle" });

  // Go to event page
  await page.goto(`/events/${eventId}`);
  await page.waitForLoadState("networkidle");

  // Select quantity
  await page.fill('input[name="quantity"]', quantity.toString());

  // Add to cart / checkout
  await page.click('button:has-text("Buy Tickets")');

  // Fill customer info
  await page.fill('input[name="email"]', `customer-${Date.now()}@example.com`);
  await page.fill('input[name="name"]', "Test Customer");

  // Select Stripe payment
  await page.click('text="Credit Card"');

  // Fill Stripe test card
  await page.fill('input[placeholder*="Card number"]', testCard.number);
  await page.fill('input[placeholder*="MM"]', testCard.exp_month.toString().padStart(2, "0"));
  await page.fill('input[placeholder*="YY"]', testCard.exp_year.toString().slice(-2));
  await page.fill('input[placeholder*="CVC"]', testCard.cvc);

  // Submit payment
  await page.click('button:has-text("Complete Purchase")');

  // Wait for success
  await page.waitForSelector('text="Purchase successful"', { timeout: 60000 });

  return { quantity, paymentMethod: "STRIPE" };
}

/**
 * Verify organizer credit balance
 */
export async function verifyCreditBalance(
  page: Page,
  expected: number
) {
  const actual = await getCreditBalance(page);
  expect(actual).toBe(expected);
}

/**
 * Get staff member commission earned from API
 */
export async function getStaffCommission(staffId: string): Promise<number> {
  // This would call a Convex query to get staff commission
  // For now, return mock data
  return 0; // TODO: Implement Convex query
}

/**
 * Verify settlement dashboard
 */
export async function verifySettlementDashboard(
  page: Page,
  eventId: string,
  expectedSettlements: Array<{
    staffName: string;
    commissionEarned: number;
    cashCollected: number;
    netSettlement: number;
  }>
) {
  await page.goto(`/organizer/events/${eventId}/settlement`);
  await page.waitForLoadState("networkidle");

  for (const expected of expectedSettlements) {
    // Find staff row
    const row = page.locator(`text="${expected.staffName}"`).locator("..");

    // Verify commission
    const commission = await row.locator('[data-testid="commission-earned"]').textContent();
    expect(commission).toContain((expected.commissionEarned / 100).toFixed(2));

    // Verify cash collected
    const cash = await row.locator('[data-testid="cash-collected"]').textContent();
    expect(cash).toContain((expected.cashCollected / 100).toFixed(2));

    // Verify net settlement
    const net = await row.locator('[data-testid="net-settlement"]').textContent();
    expect(net).toContain((expected.netSettlement / 100).toFixed(2));
  }
}

/**
 * Take screenshot with timestamp
 */
export async function takeScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  await page.screenshot({
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Wait for network idle and take screenshot
 */
export async function waitAndScreenshot(page: Page, name: string) {
  await page.waitForLoadState("networkidle");
  await takeScreenshot(page, name);
}
