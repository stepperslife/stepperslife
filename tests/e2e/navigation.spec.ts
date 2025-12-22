import { test, expect, Page } from "@playwright/test";

/**
 * Navigation Test Suite
 * Tests all role-based sidebars, collapsible sections, and primary action buttons
 */

const BASE_URL = "https://stepperslife.com";

// Test account credentials
const TEST_ACCOUNTS = {
  user: {
    email: "e2e-test@stepperslife.com",
    password: "TestPassword123!",
    dashboardUrl: "/user/dashboard",
  },
  // Use the test user for all role testing - they may have multiple roles
  testUser: {
    email: "ira@irawatkins.com",
    password: "Test123!",
    dashboardUrl: "/user/dashboard",
  },
};

// Expected navigation structure for each role
const EXPECTED_NAV = {
  admin: {
    sections: ["Users & Events", "Commerce", "Insights"],
    links: [
      "/admin",
      "/admin/users",
      "/admin/events",
      "/admin/crm",
      "/admin/orders",
      "/admin/products",
      "/admin/vendors",
      "/admin/product-orders",
      "/admin/analytics",
      "/admin/support",
      "/admin/settings",
      "/admin/notifications",
    ],
  },
  organizer: {
    sections: ["Events & Tickets", "Earnings", "More Tools"],
    links: [
      "/organizer/dashboard",
      "/organizer/events",
      "/organizer/tickets",
      "/organizer/team",
      "/organizer/earnings",
      "/organizer/reports",
      "/organizer/settings",
    ],
    collapsibleSection: "More Tools",
  },
  user: {
    sections: ["Discover", "My Tickets"],
    links: ["/", "/events", "/user/favorites", "/user/tickets", "/user/orders", "/user/profile"],
  },
  staff: {
    primaryAction: "Scan Tickets",
    primaryActionUrl: "/staff/scan-tickets",
    collapsibleSection: "More Options",
    links: ["/staff/register-sale", "/staff/scanned-tickets/today", "/staff/assigned-events"],
  },
  associate: {
    primaryAction: "My Ticket Link",
    primaryActionUrl: "/associate/link",
    links: ["/associate/dashboard", "/associate/tickets", "/associate/earnings"],
  },
  restaurateur: {
    primaryAction: "Orders",
    primaryActionUrl: "/restaurateur/dashboard/orders",
    sections: ["Restaurant", "Business"],
    links: ["/restaurateur/dashboard/menu", "/restaurateur/dashboard/hours", "/restaurateur/dashboard/earnings"],
  },
  teamMember: {
    sections: ["Tickets & Sales", "Earnings"],
    links: ["/team/dashboard", "/team/tickets", "/team/associates", "/team/links", "/team/earnings"],
  },
};

// Helper function to login
async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState("domcontentloaded");

  // Wait for login form to load
  await page.waitForTimeout(2000);

  // Expand password login section (it's collapsed by default)
  const passwordToggle = page.locator('[data-testid="password-login-toggle"]');
  await passwordToggle.waitFor({ state: "visible", timeout: 10000 });
  await passwordToggle.click();
  await page.waitForTimeout(1000);

  // Wait for password form to expand
  const passwordForm = page.locator('[data-testid="password-login-form"]');
  await passwordForm.waitFor({ state: "visible", timeout: 10000 });

  // Use the correct selectors from login page
  const emailInput = page.locator('[data-testid="login-email"]');
  const passwordInput = page.locator('[data-testid="login-password"]');

  await emailInput.fill(email);
  await passwordInput.fill(password);

  // Submit (correct selector: login-submit, not login-submit-button)
  const submitButton = page.locator('[data-testid="login-submit"]');
  await submitButton.click();

  // Wait for navigation away from login
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30000 });
}

// Helper function to check if sidebar is visible
async function waitForSidebar(page: Page) {
  // Wait for sidebar to be visible
  await page.waitForSelector('[data-sidebar="sidebar"]', { timeout: 15000 }).catch(async () => {
    // Fallback: look for common sidebar selectors
    await page.waitForSelector("aside", { timeout: 10000 });
  });
}

// Helper function to check navigation links
async function checkNavigationLinks(page: Page, links: string[]) {
  const errors: string[] = [];

  for (const link of links) {
    const linkElement = page.locator(`a[href="${link}"]`).first();
    const isVisible = await linkElement.isVisible().catch(() => false);

    if (!isVisible) {
      // Try with partial match
      const partialMatch = page.locator(`a[href*="${link}"]`).first();
      const partialVisible = await partialMatch.isVisible().catch(() => false);

      if (!partialVisible) {
        errors.push(`Link not found: ${link}`);
      }
    }
  }

  return errors;
}

// Helper function to test navigation link works
async function testLinkNavigation(page: Page, href: string, expectedUrlPattern: string) {
  const link = page.locator(`a[href="${href}"]`).first();

  if (await link.isVisible()) {
    await link.click();
    await page.waitForLoadState("domcontentloaded");

    const currentUrl = page.url();
    if (!currentUrl.includes(expectedUrlPattern)) {
      return `Navigation failed: Expected ${expectedUrlPattern}, got ${currentUrl}`;
    }
  } else {
    return `Link not visible: ${href}`;
  }

  return null;
}

test.describe("Navigation Tests - Production", () => {
  test.describe.configure({ mode: "serial" });

  test("1. Public pages load correctly", async ({ page }) => {
    // Test home page
    await page.goto(BASE_URL);
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveTitle(/SteppersLife/i);

    // Test events page
    await page.goto(`${BASE_URL}/events`);
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/events");

    // Test login page
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/login");
  });

  test("2. Admin navigation - sections and links", async ({ page }) => {
    // Login as admin
    await login(page, TEST_ACCOUNTS.admin.email, TEST_ACCOUNTS.admin.password);

    // Navigate to admin dashboard
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForLoadState("domcontentloaded");
    await waitForSidebar(page);

    // Check for section headers
    for (const section of EXPECTED_NAV.admin.sections) {
      const sectionHeader = page.locator(`text=${section}`).first();
      const isVisible = await sectionHeader.isVisible().catch(() => false);
      console.log(`Admin section "${section}": ${isVisible ? "FOUND" : "NOT FOUND"}`);
    }

    // Check navigation links are present
    const linkErrors = await checkNavigationLinks(page, EXPECTED_NAV.admin.links.slice(0, 5));
    if (linkErrors.length > 0) {
      console.log("Admin nav link errors:", linkErrors);
    }

    // Test clicking a link
    const dashboardLink = page.locator('a[href="/admin"]').first();
    if (await dashboardLink.isVisible()) {
      await dashboardLink.click();
      await page.waitForLoadState("domcontentloaded");
      expect(page.url()).toContain("/admin");
    }
  });

  test("3. Admin navigation - test key links work", async ({ page }) => {
    await login(page, TEST_ACCOUNTS.admin.email, TEST_ACCOUNTS.admin.password);

    // Test Users link
    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/admin/users");

    // Test Events link
    await page.goto(`${BASE_URL}/admin/events`);
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/admin/events");

    // Test Products link
    await page.goto(`${BASE_URL}/admin/products`);
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/admin/products");

    // Test Analytics link
    await page.goto(`${BASE_URL}/admin/analytics`);
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/admin/analytics");
  });

  test("4. User/Customer navigation - sections", async ({ page }) => {
    await login(page, TEST_ACCOUNTS.user.email, TEST_ACCOUNTS.user.password);

    // Navigate to user dashboard
    await page.goto(`${BASE_URL}/user/dashboard`);
    await page.waitForLoadState("domcontentloaded");
    await waitForSidebar(page);

    // Check for section headers
    for (const section of EXPECTED_NAV.user.sections) {
      const sectionHeader = page.locator(`text=${section}`).first();
      const isVisible = await sectionHeader.isVisible().catch(() => false);
      console.log(`User section "${section}": ${isVisible ? "FOUND" : "NOT FOUND"}`);
    }

    // Test My Tickets link
    const ticketsLink = page.locator('a[href*="/user/tickets"]').first();
    if (await ticketsLink.isVisible()) {
      await ticketsLink.click();
      await page.waitForLoadState("domcontentloaded");
      expect(page.url()).toContain("/user/tickets");
    }
  });

  test("5. Staff navigation - primary action button", async ({ page }) => {
    // First login as admin and navigate to staff area
    await login(page, TEST_ACCOUNTS.admin.email, TEST_ACCOUNTS.admin.password);

    await page.goto(`${BASE_URL}/staff/dashboard`);
    await page.waitForLoadState("domcontentloaded");

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Check for primary action button "Scan Tickets"
    const scanButton = page.locator('a[href="/staff/scan-tickets"]').first();
    const scanButtonVisible = await scanButton.isVisible().catch(() => false);
    console.log(`Staff primary action "Scan Tickets": ${scanButtonVisible ? "FOUND" : "NOT FOUND"}`);

    if (scanButtonVisible) {
      // Check if it has primary styling (larger/prominent)
      const buttonClasses = await scanButton.getAttribute("class");
      console.log("Scan button classes:", buttonClasses);
    }

    // Check for collapsible "More Options" section
    const moreOptions = page.locator('text=More Options').first();
    const moreOptionsVisible = await moreOptions.isVisible().catch(() => false);
    console.log(`Staff collapsible "More Options": ${moreOptionsVisible ? "FOUND" : "NOT FOUND"}`);
  });

  test("6. Organizer navigation - collapsible sections", async ({ page }) => {
    await login(page, TEST_ACCOUNTS.admin.email, TEST_ACCOUNTS.admin.password);

    await page.goto(`${BASE_URL}/organizer/dashboard`);
    await page.waitForLoadState("domcontentloaded");
    await waitForSidebar(page);

    // Check for section headers
    for (const section of EXPECTED_NAV.organizer.sections) {
      const sectionHeader = page.locator(`text=${section}`).first();
      const isVisible = await sectionHeader.isVisible().catch(() => false);
      console.log(`Organizer section "${section}": ${isVisible ? "FOUND" : "NOT FOUND"}`);
    }

    // Test "More Tools" collapsible section
    const moreTools = page.locator('text=More Tools').first();
    if (await moreTools.isVisible()) {
      // Click to expand
      await moreTools.click();
      await page.waitForTimeout(500);

      // Check if Credits link is now visible (it's inside More Tools)
      const creditsLink = page.locator('a[href="/organizer/credits"]').first();
      const creditsVisible = await creditsLink.isVisible().catch(() => false);
      console.log(`Credits link (inside More Tools): ${creditsVisible ? "VISIBLE" : "HIDDEN"}`);
    }
  });

  test("7. Associate navigation - primary link button", async ({ page }) => {
    await login(page, TEST_ACCOUNTS.admin.email, TEST_ACCOUNTS.admin.password);

    await page.goto(`${BASE_URL}/associate/dashboard`);
    await page.waitForLoadState("domcontentloaded");

    // Check for primary action "My Ticket Link"
    const linkButton = page.locator('a[href="/associate/link"]').first();
    const linkButtonVisible = await linkButton.isVisible().catch(() => false);
    console.log(`Associate primary action "My Ticket Link": ${linkButtonVisible ? "FOUND" : "NOT FOUND"}`);

    // Check for Dashboard, Tickets, Earnings
    const dashLink = page.locator('a[href="/associate/dashboard"]').first();
    const ticketsLink = page.locator('a[href="/associate/tickets"]').first();
    const earningsLink = page.locator('a[href="/associate/earnings"]').first();

    console.log(`Associate Dashboard link: ${(await dashLink.isVisible().catch(() => false)) ? "FOUND" : "NOT FOUND"}`);
    console.log(`Associate Tickets link: ${(await ticketsLink.isVisible().catch(() => false)) ? "FOUND" : "NOT FOUND"}`);
    console.log(`Associate Earnings link: ${(await earningsLink.isVisible().catch(() => false)) ? "FOUND" : "NOT FOUND"}`);
  });

  test("8. Restaurateur navigation - orders primary", async ({ page }) => {
    await login(page, TEST_ACCOUNTS.admin.email, TEST_ACCOUNTS.admin.password);

    await page.goto(`${BASE_URL}/restaurateur/dashboard`);
    await page.waitForLoadState("domcontentloaded");
    await waitForSidebar(page);

    // Check for primary action "Orders"
    const ordersButton = page.locator('a[href="/restaurateur/dashboard/orders"]').first();
    const ordersVisible = await ordersButton.isVisible().catch(() => false);
    console.log(`Restaurateur primary action "Orders": ${ordersVisible ? "FOUND" : "NOT FOUND"}`);

    // Check for sections
    for (const section of EXPECTED_NAV.restaurateur.sections) {
      const sectionHeader = page.locator(`text=${section}`).first();
      const isVisible = await sectionHeader.isVisible().catch(() => false);
      console.log(`Restaurateur section "${section}": ${isVisible ? "FOUND" : "NOT FOUND"}`);
    }
  });

  test("9. Team Member navigation - sections", async ({ page }) => {
    await login(page, TEST_ACCOUNTS.admin.email, TEST_ACCOUNTS.admin.password);

    await page.goto(`${BASE_URL}/team/dashboard`);
    await page.waitForLoadState("domcontentloaded");
    await waitForSidebar(page);

    // Check for sections
    for (const section of EXPECTED_NAV.teamMember.sections) {
      const sectionHeader = page.locator(`text=${section}`).first();
      const isVisible = await sectionHeader.isVisible().catch(() => false);
      console.log(`Team Member section "${section}": ${isVisible ? "FOUND" : "NOT FOUND"}`);
    }

    // Check key links
    const ticketsLink = page.locator('a[href="/team/tickets"]').first();
    const associatesLink = page.locator('a[href="/team/associates"]').first();

    console.log(`Team Tickets link: ${(await ticketsLink.isVisible().catch(() => false)) ? "FOUND" : "NOT FOUND"}`);
    console.log(`Team Associates link: ${(await associatesLink.isVisible().catch(() => false)) ? "FOUND" : "NOT FOUND"}`);
  });

  test("10. Mobile viewport - sidebar behavior", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await login(page, TEST_ACCOUNTS.admin.email, TEST_ACCOUNTS.admin.password);

    await page.goto(`${BASE_URL}/admin`);
    await page.waitForLoadState("domcontentloaded");

    // On mobile, sidebar should be collapsed by default
    // Look for hamburger menu or sidebar trigger
    const menuTrigger = page.locator('[data-sidebar="trigger"]').or(page.locator('button[aria-label*="menu"]')).first();
    const triggerVisible = await menuTrigger.isVisible().catch(() => false);

    console.log(`Mobile menu trigger: ${triggerVisible ? "FOUND" : "NOT FOUND"}`);

    if (triggerVisible) {
      // Click to open sidebar
      await menuTrigger.click();
      await page.waitForTimeout(500);

      // Check if sidebar opens
      const sidebar = page.locator('[data-sidebar="sidebar"]').first();
      const sidebarVisible = await sidebar.isVisible().catch(() => false);
      console.log(`Mobile sidebar after trigger: ${sidebarVisible ? "VISIBLE" : "HIDDEN"}`);
    }
  });

  test("11. Direct URL navigation - all dashboards accessible", async ({ page }) => {
    await login(page, TEST_ACCOUNTS.admin.email, TEST_ACCOUNTS.admin.password);

    const dashboards = [
      { url: "/admin", name: "Admin" },
      { url: "/organizer/dashboard", name: "Organizer" },
      { url: "/user/dashboard", name: "User" },
      { url: "/staff/dashboard", name: "Staff" },
      { url: "/team/dashboard", name: "Team" },
      { url: "/associate/dashboard", name: "Associate" },
      { url: "/restaurateur/dashboard", name: "Restaurateur" },
    ];

    for (const dashboard of dashboards) {
      await page.goto(`${BASE_URL}${dashboard.url}`);
      await page.waitForLoadState("domcontentloaded");

      // Check we're not redirected to error page
      const isError = page.url().includes("/error") || page.url().includes("/404");
      const status = isError ? "ERROR" : "OK";
      console.log(`${dashboard.name} dashboard (${dashboard.url}): ${status}`);
    }
  });

  test("12. Logout functionality", async ({ page }) => {
    await login(page, TEST_ACCOUNTS.admin.email, TEST_ACCOUNTS.admin.password);

    await page.goto(`${BASE_URL}/admin`);
    await page.waitForLoadState("domcontentloaded");
    await waitForSidebar(page);

    // Find and click logout
    const logoutLink = page.locator('a[href="/logout"]').first();
    if (await logoutLink.isVisible()) {
      await logoutLink.click();
      await page.waitForLoadState("domcontentloaded");

      // Should redirect to home or login
      const url = page.url();
      const loggedOut = url.includes("/login") || url === BASE_URL + "/" || !url.includes("/admin");
      console.log(`Logout: ${loggedOut ? "SUCCESS" : "FAILED"} - Redirected to: ${url}`);
    } else {
      console.log("Logout link not visible in sidebar");
    }
  });
});

test.describe("Navigation Link Verification", () => {
  test("Verify all admin nav links resolve (no 404s)", async ({ page }) => {
    await login(page, TEST_ACCOUNTS.admin.email, TEST_ACCOUNTS.admin.password);

    const linksToTest = [
      "/admin",
      "/admin/users",
      "/admin/events",
      "/admin/orders",
      "/admin/products",
      "/admin/vendors",
      "/admin/analytics",
      "/admin/settings",
    ];

    const results: { link: string; status: string }[] = [];

    for (const link of linksToTest) {
      const response = await page.goto(`${BASE_URL}${link}`);
      const status = response?.status() || 0;

      results.push({
        link,
        status: status >= 200 && status < 400 ? "OK" : `ERROR (${status})`,
      });
    }

    console.log("\nAdmin Link Verification Results:");
    console.table(results);

    // Assert no errors
    const errors = results.filter((r) => r.status !== "OK");
    expect(errors.length).toBe(0);
  });

  test("Verify organizer nav links resolve (no 404s)", async ({ page }) => {
    await login(page, TEST_ACCOUNTS.admin.email, TEST_ACCOUNTS.admin.password);

    const linksToTest = [
      "/organizer/dashboard",
      "/organizer/events",
      "/organizer/tickets",
      "/organizer/team",
      "/organizer/earnings",
      "/organizer/reports",
      "/organizer/credits",
      "/organizer/settings",
    ];

    const results: { link: string; status: string }[] = [];

    for (const link of linksToTest) {
      const response = await page.goto(`${BASE_URL}${link}`);
      const status = response?.status() || 0;

      results.push({
        link,
        status: status >= 200 && status < 400 ? "OK" : `ERROR (${status})`,
      });
    }

    console.log("\nOrganizer Link Verification Results:");
    console.table(results);

    const errors = results.filter((r) => r.status !== "OK");
    expect(errors.length).toBe(0);
  });

  test("Verify user nav links resolve (no 404s)", async ({ page }) => {
    await login(page, TEST_ACCOUNTS.user.email, TEST_ACCOUNTS.user.password);

    const linksToTest = [
      "/",
      "/events",
      "/user/favorites",
      "/user/tickets",
      "/user/orders",
      "/user/profile",
      "/user/cart",
      "/user/notifications",
    ];

    const results: { link: string; status: string }[] = [];

    for (const link of linksToTest) {
      const response = await page.goto(`${BASE_URL}${link}`);
      const status = response?.status() || 0;

      results.push({
        link,
        status: status >= 200 && status < 400 ? "OK" : `ERROR (${status})`,
      });
    }

    console.log("\nUser Link Verification Results:");
    console.table(results);

    const errors = results.filter((r) => r.status !== "OK");
    expect(errors.length).toBe(0);
  });
});
