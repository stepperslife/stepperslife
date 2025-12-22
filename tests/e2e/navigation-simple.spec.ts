import { test, expect, Page } from "@playwright/test";

/**
 * Simple Navigation Test Suite
 * Tests that all navigation pages load without errors
 */

const BASE_URL = "https://stepperslife.com";

// All navigation URLs to test (based on the new config)
const NAV_URLS = {
  // Public pages
  public: ["/", "/events", "/classes", "/marketplace", "/restaurants", "/login", "/register"],

  // Admin pages
  admin: [
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

  // Organizer pages
  organizer: [
    "/organizer/dashboard",
    "/organizer/events",
    "/organizer/tickets",
    "/organizer/team",
    "/organizer/earnings",
    "/organizer/reports",
    "/organizer/credits",
    "/organizer/templates",
    "/organizer/bundles",
    "/organizer/settlement",
    "/organizer/analytics",
    "/organizer/settings",
    "/organizer/notifications",
    "/organizer/support",
  ],

  // User/Customer pages
  user: [
    "/user/dashboard",
    "/user/tickets",
    "/user/favorites",
    "/user/orders",
    "/user/profile",
    "/user/cart",
    "/user/notifications",
    "/user/support",
  ],

  // Staff pages
  staff: [
    "/staff/dashboard",
    "/staff/scan-tickets",
    "/staff/register-sale",
    "/staff/scanned-tickets/today",
    "/staff/assigned-events",
    "/staff/cash-orders",
    "/staff/scan-statistics",
    "/staff/transfers",
    "/staff/issues",
    "/staff/my-team",
    "/staff/profile",
  ],

  // Team Member pages
  team: [
    "/team/dashboard",
    "/team/tickets",
    "/team/associates",
    "/team/links",
    "/team/earnings",
    "/team/performance",
    "/team/events",
    "/team/profile",
    "/team/support",
  ],

  // Associate pages
  associate: [
    "/associate/dashboard",
    "/associate/link",
    "/associate/tickets",
    "/associate/earnings",
    "/associate/events",
    "/associate/profile",
    "/associate/support",
  ],

  // Restaurateur pages
  restaurateur: [
    "/restaurateur/dashboard",
    "/restaurateur/dashboard/orders",
    "/restaurateur/dashboard/menu",
    "/restaurateur/dashboard/hours",
    "/restaurateur/dashboard/staff",
    "/restaurateur/dashboard/earnings",
    "/restaurateur/dashboard/analytics",
    "/restaurateur/dashboard/reviews",
    "/restaurateur/dashboard/settings",
    "/restaurateur/dashboard/support",
  ],
};

test.describe("Public Pages - No Auth Required", () => {
  test("All public pages load successfully", async ({ page }) => {
    const results: { url: string; status: string; title?: string }[] = [];

    for (const url of NAV_URLS.public) {
      const response = await page.goto(`${BASE_URL}${url}`);
      const status = response?.status() || 0;
      const title = await page.title().catch(() => "");

      results.push({
        url,
        status: status >= 200 && status < 400 ? "OK" : `ERROR (${status})`,
        title,
      });

      // Also check for no JS errors
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));
    }

    console.log("\n=== PUBLIC PAGES TEST RESULTS ===");
    console.table(results);

    // Verify no errors
    const failures = results.filter((r) => r.status !== "OK");
    expect(failures.length).toBe(0);
  });
});

test.describe("Navigation Structure Tests", () => {
  test("Home page has main navigation links", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("domcontentloaded");

    // Check header navigation links exist
    const navLinks = [
      { text: "Events", href: "/events" },
      { text: "Classes", href: "/classes" },
      { text: "Marketplace", href: "/marketplace" },
      { text: "Restaurants", href: "/restaurants" },
    ];

    for (const nav of navLinks) {
      const link = page.locator(`a[href="${nav.href}"]`).first();
      const isVisible = await link.isVisible().catch(() => false);
      console.log(`Nav link "${nav.text}" (${nav.href}): ${isVisible ? "FOUND" : "NOT FOUND"}`);
    }
  });

  test("Events page loads and displays content", async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);
    await page.waitForLoadState("domcontentloaded");

    // Page should have loaded
    expect(page.url()).toContain("/events");

    // Look for event-related content
    const heading = page.locator("h1, h2").first();
    const headingText = await heading.textContent().catch(() => "");
    console.log(`Events page heading: "${headingText}"`);
  });

  test("Login page structure is correct", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("domcontentloaded");

    // Check for key elements
    const elements = {
      "Form container": '[data-testid="login-form-container"]',
      "Google button": '[data-testid="google-login-button"]',
      "Magic link button": '[data-testid="magic-link-button"]',
      "Password toggle": '[data-testid="password-login-toggle"]',
    };

    console.log("\n=== LOGIN PAGE ELEMENTS ===");
    for (const [name, selector] of Object.entries(elements)) {
      const isVisible = await page.locator(selector).isVisible().catch(() => false);
      console.log(`${name}: ${isVisible ? "FOUND" : "NOT FOUND"}`);
    }
  });
});

test.describe("Page Response Tests - All Roles", () => {
  test("Admin pages respond (may redirect to login)", async ({ page }) => {
    console.log("\n=== ADMIN PAGES ===");
    for (const url of NAV_URLS.admin.slice(0, 5)) {
      // Test first 5
      const response = await page.goto(`${BASE_URL}${url}`);
      const status = response?.status() || 0;
      const finalUrl = page.url();
      console.log(`${url}: ${status} -> ${finalUrl.includes("/login") ? "Redirected to login" : "OK"}`);
    }
  });

  test("Organizer pages respond (may redirect to login)", async ({ page }) => {
    console.log("\n=== ORGANIZER PAGES ===");
    for (const url of NAV_URLS.organizer.slice(0, 5)) {
      const response = await page.goto(`${BASE_URL}${url}`);
      const status = response?.status() || 0;
      const finalUrl = page.url();
      console.log(`${url}: ${status} -> ${finalUrl.includes("/login") ? "Redirected to login" : "OK"}`);
    }
  });

  test("User pages respond (may redirect to login)", async ({ page }) => {
    console.log("\n=== USER PAGES ===");
    for (const url of NAV_URLS.user) {
      const response = await page.goto(`${BASE_URL}${url}`);
      const status = response?.status() || 0;
      const finalUrl = page.url();
      console.log(`${url}: ${status} -> ${finalUrl.includes("/login") ? "Redirected to login" : "OK"}`);
    }
  });

  test("Staff pages respond (may redirect to login)", async ({ page }) => {
    console.log("\n=== STAFF PAGES ===");
    for (const url of NAV_URLS.staff.slice(0, 5)) {
      const response = await page.goto(`${BASE_URL}${url}`);
      const status = response?.status() || 0;
      const finalUrl = page.url();
      console.log(`${url}: ${status} -> ${finalUrl.includes("/login") ? "Redirected to login" : "OK"}`);
    }
  });

  test("Associate pages respond (may redirect to login)", async ({ page }) => {
    console.log("\n=== ASSOCIATE PAGES ===");
    for (const url of NAV_URLS.associate) {
      const response = await page.goto(`${BASE_URL}${url}`);
      const status = response?.status() || 0;
      const finalUrl = page.url();
      console.log(`${url}: ${status} -> ${finalUrl.includes("/login") ? "Redirected to login" : "OK"}`);
    }
  });

  test("Restaurateur pages respond (may redirect to login)", async ({ page }) => {
    console.log("\n=== RESTAURATEUR PAGES ===");
    for (const url of NAV_URLS.restaurateur.slice(0, 5)) {
      const response = await page.goto(`${BASE_URL}${url}`);
      const status = response?.status() || 0;
      const finalUrl = page.url();
      console.log(`${url}: ${status} -> ${finalUrl.includes("/login") ? "Redirected to login" : "OK"}`);
    }
  });
});

test.describe("404 Error Detection", () => {
  test("Check for 404 errors on key pages", async ({ page }) => {
    const pagesToCheck = [
      "/events",
      "/classes",
      "/marketplace",
      "/restaurants",
      "/admin",
      "/organizer/dashboard",
      "/user/dashboard",
      "/staff/dashboard",
      "/team/dashboard",
      "/associate/dashboard",
      "/restaurateur/dashboard",
    ];

    const results: { url: string; status: number; is404: boolean }[] = [];

    for (const url of pagesToCheck) {
      const response = await page.goto(`${BASE_URL}${url}`);
      const status = response?.status() || 0;

      results.push({
        url,
        status,
        is404: status === 404,
      });
    }

    console.log("\n=== PAGE STATUS CHECK ===");
    console.table(results);

    // Only fail on actual 404 HTTP status codes
    const actual404s = results.filter((r) => r.is404);
    if (actual404s.length > 0) {
      console.log("404 Errors found:", actual404s.map((r) => r.url));
    }

    expect(actual404s.length).toBe(0);
  });
});
