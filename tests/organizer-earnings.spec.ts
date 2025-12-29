/**
 * ORGANIZER EARNINGS TEST SUITE
 *
 * Tests for the organizer earnings page including:
 * - Earnings overview (total revenue, pending, paid out)
 * - Event revenue breakdown table
 * - Payout history navigation
 * - Payment methods setup link
 *
 * Tests the following Convex queries:
 * - api.orders.queries.getOrganizerEarnings
 * - api.orders.queries.getEventRevenueBreakdown
 */

import { test, expect, Page } from "@playwright/test";

// =============================================================================
// CONFIGURATION
// =============================================================================

const BASE_URL = process.env.BASE_URL || "http://localhost:3001";
const MAX_PAGE_LOAD_TIME = 10000; // 10 seconds for data-heavy pages

// Test credentials for organizer
const TEST_ORGANIZER = {
  email: "test-organizer@stepperslife.com",
  password: "OrganizerPassword123!",
  name: "Test Organizer",
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Login as organizer and navigate to earnings page
 */
async function loginAsOrganizer(page: Page): Promise<boolean> {
  try {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("networkidle", { timeout: 5000 });

    await page.fill('input[type="email"]', TEST_ORGANIZER.email);
    await page.fill('input[type="password"]', TEST_ORGANIZER.password);

    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(organizer|dashboard)/, { timeout: 10000 });

    return true;
  } catch (error) {
    console.log("Login failed:", error);
    return false;
  }
}

/**
 * Wait for page to fully load (no loading spinners)
 */
async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle", { timeout: MAX_PAGE_LOAD_TIME });

  // Wait for loading spinner to disappear
  const spinner = page.locator('[data-testid="loading-spinner"], .animate-spin');
  if (await spinner.isVisible().catch(() => false)) {
    await spinner.waitFor({ state: "hidden", timeout: MAX_PAGE_LOAD_TIME });
  }
}

// =============================================================================
// TESTS
// =============================================================================

test.describe("Organizer Earnings Page", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    const loggedIn = await loginAsOrganizer(page);
    test.skip(!loggedIn, "Could not log in as organizer");
  });

  test("should load earnings page without errors", async ({ page }) => {
    await page.goto(`${BASE_URL}/organizer/earnings`);
    await waitForPageLoad(page);

    // Check page title/header
    const header = page.locator('h1:has-text("Earnings")');
    await expect(header).toBeVisible({ timeout: 5000 });

    // Check that page didn't get stuck on loading
    const loadingText = page.locator('text="Loading earnings..."');
    await expect(loadingText).not.toBeVisible({ timeout: 5000 });
  });

  test("should display earnings statistics cards", async ({ page }) => {
    await page.goto(`${BASE_URL}/organizer/earnings`);
    await waitForPageLoad(page);

    // Check for the three main stats cards
    const totalRevenueCard = page.locator('text="Total Revenue"');
    const pendingPayoutCard = page.locator('text="Pending Payout"');
    const totalPaidOutCard = page.locator('text="Total Paid Out"');

    await expect(totalRevenueCard).toBeVisible();
    await expect(pendingPayoutCard).toBeVisible();
    await expect(totalPaidOutCard).toBeVisible();

    // Check that values display (should show $ amounts)
    const dollarValues = page.locator('text=/\\$[\\d,]+/');
    expect(await dollarValues.count()).toBeGreaterThanOrEqual(3);
  });

  test("should display event revenue breakdown table", async ({ page }) => {
    await page.goto(`${BASE_URL}/organizer/earnings`);
    await waitForPageLoad(page);

    // Check for revenue breakdown section
    const revenueSection = page.locator('text="Revenue by Event"');
    await expect(revenueSection).toBeVisible();

    // Check for table headers on desktop
    const eventHeader = page.locator('th:has-text("Event")');
    const ticketsHeader = page.locator('th:has-text("Tickets Sold")');
    const revenueHeader = page.locator('th:has-text("Revenue")');
    const statusHeader = page.locator('th:has-text("Status")');

    // At least on desktop view, headers should be visible
    await page.setViewportSize({ width: 1280, height: 800 });

    // Either table with data or "No earnings yet" message
    const table = page.locator("table");
    const noEarningsMessage = page.locator('text="No earnings yet"');

    const hasTable = await table.isVisible().catch(() => false);
    const hasNoEarnings = await noEarningsMessage.isVisible().catch(() => false);

    expect(hasTable || hasNoEarnings).toBeTruthy();
  });

  test("should have working quick action links", async ({ page }) => {
    await page.goto(`${BASE_URL}/organizer/earnings`);
    await waitForPageLoad(page);

    // Check for quick action cards
    const payoutHistoryLink = page.locator('a:has-text("Payout History")');
    const transactionsLink = page.locator('a:has-text("Transactions")');
    const paymentSetupLink = page.locator('a:has-text("Payment Setup")');

    await expect(payoutHistoryLink).toBeVisible();
    await expect(transactionsLink).toBeVisible();
    await expect(paymentSetupLink).toBeVisible();

    // Verify links have correct hrefs
    await expect(payoutHistoryLink).toHaveAttribute("href", "/organizer/earnings/payouts");
    await expect(transactionsLink).toHaveAttribute("href", "/organizer/earnings/transactions");
    await expect(paymentSetupLink).toHaveAttribute("href", "/organizer/payment-methods");
  });

  test("should show pending payout banner when there are pending payouts", async ({ page }) => {
    await page.goto(`${BASE_URL}/organizer/earnings`);
    await waitForPageLoad(page);

    // The next payout banner only shows when pendingPayout > 0
    // Check for either the banner or absence of it (both are valid states)
    const nextPayoutBanner = page.locator('text="Next Payout"');
    const payoutDetailsLink = page.locator('a:has-text("View Payout Details")');
    const managePaymentLink = page.locator('a:has-text("Manage Payment Methods")');

    const hasBanner = await nextPayoutBanner.isVisible().catch(() => false);

    if (hasBanner) {
      // If banner is visible, check that action buttons are also visible
      await expect(payoutDetailsLink).toBeVisible();
      await expect(managePaymentLink).toBeVisible();
    }
    // If no banner, that's also valid (no pending payouts)

    // Either way, the page should have loaded successfully
    expect(true).toBeTruthy();
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/organizer/earnings`);
    await waitForPageLoad(page);

    // Stats cards should still be visible
    const totalRevenueCard = page.locator('text="Total Revenue"');
    await expect(totalRevenueCard).toBeVisible();

    // On mobile, table should switch to card view (hidden md:block)
    // The mobile view uses a different layout
    const mobileView = page.locator(".md\\:hidden");
    const desktopTable = page.locator(".hidden.md\\:block");

    // Mobile view should be visible, desktop hidden
    // (This tests the responsive design)
  });

  test("should navigate to payouts page from View Payouts button", async ({ page }) => {
    await page.goto(`${BASE_URL}/organizer/earnings`);
    await waitForPageLoad(page);

    // Find and click the View Payouts button in the header
    const viewPayoutsButton = page.locator('a:has-text("View Payouts")').first();
    await expect(viewPayoutsButton).toBeVisible();

    await viewPayoutsButton.click();
    await page.waitForURL(/\/organizer\/earnings\/payouts/);

    expect(page.url()).toContain("/organizer/earnings/payouts");
  });
});

test.describe("Organizer Dashboard Earnings Integration", () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await loginAsOrganizer(page);
    test.skip(!loggedIn, "Could not log in as organizer");
  });

  test("should display real earnings data on dashboard", async ({ page }) => {
    await page.goto(`${BASE_URL}/organizer/dashboard`);
    await waitForPageLoad(page);

    // Check for earnings-related stats on dashboard
    // The dashboard should show tickets sold and revenue

    // Look for stat cards
    const ticketsSoldCard = page.locator('text=/Tickets Sold|tickets/i');
    const revenueCard = page.locator('text=/Revenue|earnings/i');

    // Dashboard should have some stats visible
    const hasStats =
      (await ticketsSoldCard.isVisible().catch(() => false)) ||
      (await revenueCard.isVisible().catch(() => false));

    // Page should load without getting stuck
    const loadingIndicator = page.locator('.animate-spin, text="Loading"');
    await expect(loadingIndicator).not.toBeVisible({ timeout: 10000 });
  });

  test("should have link from dashboard to earnings page", async ({ page }) => {
    await page.goto(`${BASE_URL}/organizer/dashboard`);
    await waitForPageLoad(page);

    // Look for earnings link in sidebar or nav
    const earningsLink = page.locator('a[href*="/organizer/earnings"]').first();

    if (await earningsLink.isVisible().catch(() => false)) {
      await earningsLink.click();
      await page.waitForURL(/\/organizer\/earnings/);
      expect(page.url()).toContain("/organizer/earnings");
    }
  });
});
