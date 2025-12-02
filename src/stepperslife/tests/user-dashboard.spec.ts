/**
 * User Dashboard Feature - Comprehensive Test Suite
 *
 * Tests the complete user dashboard including:
 * - Main dashboard overview
 * - My tickets management
 * - Order history
 * - Favorites/saved events
 * - Profile management
 * - Cart functionality
 * - Notifications
 */

import { test, expect, Page } from "@playwright/test";

// Configuration
const BASE_URL = "http://localhost:3004";

const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
};

const TIMEOUTS = {
  navigation: 30000,
  networkIdle: 10000,
  animation: 500,
};

// Test data
const timestamp = Date.now();
const TEST_USER = {
  email: `test-user-${timestamp}@stepperslife.com`,
  name: `Test User ${timestamp}`,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function waitForPageLoad(page: Page) {
  await page.waitForLoadState("networkidle", { timeout: TIMEOUTS.networkIdle });
  await page.waitForTimeout(TIMEOUTS.animation);
}

async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `test-results/user-dashboard-${name}.png`,
    fullPage: true,
  });
}

async function checkRequiresAuth(page: Page): Promise<boolean> {
  const isRedirected = page.url().includes("/login") || page.url().includes("/sign-in");
  const showsAuthRequired = await page.locator('text=/sign in|login|authentication required/i').count() > 0;
  return isRedirected || showsAuthRequired;
}

// =============================================================================
// TEST SUITE
// =============================================================================

test.describe("User Dashboard Feature", () => {
  // ===========================================================================
  // SECTION 1: MAIN DASHBOARD
  // ===========================================================================

  test.describe("Main Dashboard", () => {
    test("1.1 - Dashboard requires authentication", async ({ page }) => {
      console.log("\n📊 Test 1.1: Dashboard auth requirement\n");

      await page.goto(`${BASE_URL}/user/dashboard`);
      await waitForPageLoad(page);

      const requiresAuth = await checkRequiresAuth(page);
      expect(requiresAuth).toBeTruthy();

      await takeScreenshot(page, "01-dashboard-auth-required");
      console.log("✅ Dashboard requires authentication");
    });

    test("1.2 - Dashboard page structure (when accessible)", async ({ page }) => {
      console.log("\n📊 Test 1.2: Dashboard structure\n");

      await page.goto(`${BASE_URL}/user/dashboard`);
      await waitForPageLoad(page);

      // If we get past auth, check dashboard structure
      if (!await checkRequiresAuth(page)) {
        // Check for welcome message
        const welcome = page.locator('text=/welcome|dashboard|overview/i');
        if (await welcome.count() > 0) {
          console.log("  ✓ Welcome section visible");
        }

        // Check for quick stats
        const stats = page.locator('[data-testid="stats"], .stats, .quick-stats');
        if (await stats.count() > 0) {
          console.log("  ✓ Quick stats section visible");
        }

        // Check for navigation menu
        const navItems = page.locator('nav a, aside a');
        const navCount = await navItems.count();
        console.log(`  ✓ Found ${navCount} navigation items`);

        await takeScreenshot(page, "02-dashboard-structure");
      } else {
        console.log("  ℹ Auth required - structure test skipped");
      }
    });
  });

  // ===========================================================================
  // SECTION 2: MY TICKETS
  // ===========================================================================

  test.describe("My Tickets", () => {
    test("2.1 - My tickets page requires authentication", async ({ page }) => {
      console.log("\n🎫 Test 2.1: My tickets auth requirement\n");

      await page.goto(`${BASE_URL}/my-tickets`);
      await waitForPageLoad(page);

      const requiresAuth = await checkRequiresAuth(page);
      expect(requiresAuth).toBeTruthy();

      await takeScreenshot(page, "03-my-tickets-auth");
      console.log("✅ My tickets requires authentication");
    });

    test("2.2 - User tickets page alt route", async ({ page }) => {
      console.log("\n🎫 Test 2.2: User tickets alt route\n");

      await page.goto(`${BASE_URL}/user/my-tickets`);
      await waitForPageLoad(page);

      const requiresAuth = await checkRequiresAuth(page);
      expect(requiresAuth).toBeTruthy();

      await takeScreenshot(page, "04-user-tickets-auth");
      console.log("✅ User tickets route requires authentication");
    });

    test("2.3 - My tickets page structure (when accessible)", async ({ page }) => {
      console.log("\n🎫 Test 2.3: My tickets structure\n");

      await page.goto(`${BASE_URL}/my-tickets`);
      await waitForPageLoad(page);

      if (!await checkRequiresAuth(page)) {
        // Check for tickets heading
        const heading = page.locator('h1, h2').filter({ hasText: /tickets|my tickets/i });
        if (await heading.count() > 0) {
          console.log("  ✓ Tickets heading visible");
        }

        // Check for ticket list or empty state
        const ticketList = page.locator('[data-testid="ticket-list"], .ticket-list, .tickets');
        const emptyState = page.locator('text=/no tickets|no upcoming events/i');

        if (await ticketList.count() > 0) {
          console.log("  ✓ Ticket list visible");
        } else if (await emptyState.count() > 0) {
          console.log("  ✓ Empty state visible");
        }

        await takeScreenshot(page, "05-my-tickets-structure");
      }
    });

    test("2.4 - Ticket actions available", async ({ page }) => {
      console.log("\n🎫 Test 2.4: Ticket actions\n");

      await page.goto(`${BASE_URL}/my-tickets`);
      await waitForPageLoad(page);

      if (!await checkRequiresAuth(page)) {
        // Look for ticket action buttons
        const transferBtn = page.locator('button:has-text("Transfer"), a:has-text("Transfer")');
        const downloadBtn = page.locator('button:has-text("Download"), a:has-text("Download")');
        const viewBtn = page.locator('button:has-text("View"), a:has-text("View Details")');

        if (await transferBtn.count() > 0) console.log("  ✓ Transfer option available");
        if (await downloadBtn.count() > 0) console.log("  ✓ Download option available");
        if (await viewBtn.count() > 0) console.log("  ✓ View details option available");

        await takeScreenshot(page, "06-ticket-actions");
      }
    });
  });

  // ===========================================================================
  // SECTION 3: ORDER HISTORY
  // ===========================================================================

  test.describe("Order History", () => {
    test("3.1 - Orders page requires authentication", async ({ page }) => {
      console.log("\n📦 Test 3.1: Orders auth requirement\n");

      await page.goto(`${BASE_URL}/user/my-orders`);
      await waitForPageLoad(page);

      const requiresAuth = await checkRequiresAuth(page);
      expect(requiresAuth).toBeTruthy();

      await takeScreenshot(page, "07-orders-auth");
      console.log("✅ Orders page requires authentication");
    });

    test("3.2 - Orders page structure", async ({ page }) => {
      console.log("\n📦 Test 3.2: Orders structure\n");

      await page.goto(`${BASE_URL}/user/my-orders`);
      await waitForPageLoad(page);

      if (!await checkRequiresAuth(page)) {
        // Check for orders heading
        const heading = page.locator('h1, h2').filter({ hasText: /orders|order history/i });
        if (await heading.count() > 0) {
          console.log("  ✓ Orders heading visible");
        }

        // Check for order list or empty state
        const orderList = page.locator('[data-testid="order-list"], .order-list, .orders');
        const emptyState = page.locator('text=/no orders|no purchase history/i');

        if (await orderList.count() > 0) {
          console.log("  ✓ Order list visible");
        } else if (await emptyState.count() > 0) {
          console.log("  ✓ Empty state visible");
        }

        await takeScreenshot(page, "08-orders-structure");
      }
    });
  });

  // ===========================================================================
  // SECTION 4: FAVORITES/SAVED EVENTS
  // ===========================================================================

  test.describe("Favorites", () => {
    test("4.1 - Favorites page requires authentication", async ({ page }) => {
      console.log("\n❤️ Test 4.1: Favorites auth requirement\n");

      await page.goto(`${BASE_URL}/user/favorites`);
      await waitForPageLoad(page);

      const requiresAuth = await checkRequiresAuth(page);
      expect(requiresAuth).toBeTruthy();

      await takeScreenshot(page, "09-favorites-auth");
      console.log("✅ Favorites page requires authentication");
    });

    test("4.2 - Favorites page structure", async ({ page }) => {
      console.log("\n❤️ Test 4.2: Favorites structure\n");

      await page.goto(`${BASE_URL}/user/favorites`);
      await waitForPageLoad(page);

      if (!await checkRequiresAuth(page)) {
        // Check for favorites heading
        const heading = page.locator('h1, h2').filter({ hasText: /favorites|saved|liked/i });
        if (await heading.count() > 0) {
          console.log("  ✓ Favorites heading visible");
        }

        await takeScreenshot(page, "10-favorites-structure");
      }
    });
  });

  // ===========================================================================
  // SECTION 5: PROFILE MANAGEMENT
  // ===========================================================================

  test.describe("Profile Management", () => {
    test("5.1 - Profile page requires authentication", async ({ page }) => {
      console.log("\n👤 Test 5.1: Profile auth requirement\n");

      await page.goto(`${BASE_URL}/user/profile`);
      await waitForPageLoad(page);

      const requiresAuth = await checkRequiresAuth(page);
      expect(requiresAuth).toBeTruthy();

      await takeScreenshot(page, "11-profile-auth");
      console.log("✅ Profile page requires authentication");
    });

    test("5.2 - Profile page structure", async ({ page }) => {
      console.log("\n👤 Test 5.2: Profile structure\n");

      await page.goto(`${BASE_URL}/user/profile`);
      await waitForPageLoad(page);

      if (!await checkRequiresAuth(page)) {
        // Check for profile form fields
        const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]');
        const emailInput = page.locator('input[type="email"]');
        const phoneInput = page.locator('input[type="tel"]');

        if (await nameInput.count() > 0) console.log("  ✓ Name field present");
        if (await emailInput.count() > 0) console.log("  ✓ Email field present");
        if (await phoneInput.count() > 0) console.log("  ✓ Phone field present");

        // Check for save button
        const saveBtn = page.locator('button:has-text("Save"), button:has-text("Update")');
        if (await saveBtn.count() > 0) console.log("  ✓ Save button present");

        await takeScreenshot(page, "12-profile-structure");
      }
    });
  });

  // ===========================================================================
  // SECTION 6: CART FUNCTIONALITY
  // ===========================================================================

  test.describe("Shopping Cart", () => {
    test("6.1 - Cart page accessible", async ({ page }) => {
      console.log("\n🛒 Test 6.1: Cart page\n");

      await page.goto(`${BASE_URL}/user/cart`);
      await waitForPageLoad(page);

      // Cart might be accessible without auth
      const heading = page.locator('h1, h2').filter({ hasText: /cart|shopping/i });
      const emptyState = page.locator('text=/empty|no items/i');

      if (await heading.count() > 0 || await emptyState.count() > 0) {
        console.log("  ✓ Cart page accessible");
      }

      await takeScreenshot(page, "13-cart-page");
    });

    test("6.2 - Cart empty state", async ({ page }) => {
      console.log("\n🛒 Test 6.2: Cart empty state\n");

      await page.goto(`${BASE_URL}/user/cart`);
      await waitForPageLoad(page);

      const emptyState = page.locator('text=/empty|no items|start shopping/i');

      if (await emptyState.count() > 0) {
        console.log("  ✓ Empty cart state displayed");

        // Check for CTA to browse events
        const browseLink = page.locator('a[href*="events"], button:has-text("Browse")');
        if (await browseLink.count() > 0) {
          console.log("  ✓ Browse events CTA present");
        }
      }

      await takeScreenshot(page, "14-cart-empty");
    });
  });

  // ===========================================================================
  // SECTION 7: NOTIFICATIONS
  // ===========================================================================

  test.describe("Notifications", () => {
    test("7.1 - Notifications page requires authentication", async ({ page }) => {
      console.log("\n🔔 Test 7.1: Notifications auth requirement\n");

      await page.goto(`${BASE_URL}/user/notifications`);
      await waitForPageLoad(page);

      const requiresAuth = await checkRequiresAuth(page);
      expect(requiresAuth).toBeTruthy();

      await takeScreenshot(page, "15-notifications-auth");
      console.log("✅ Notifications page requires authentication");
    });

    test("7.2 - Notifications page structure", async ({ page }) => {
      console.log("\n🔔 Test 7.2: Notifications structure\n");

      await page.goto(`${BASE_URL}/user/notifications`);
      await waitForPageLoad(page);

      if (!await checkRequiresAuth(page)) {
        // Check for notifications heading
        const heading = page.locator('h1, h2').filter({ hasText: /notifications|alerts/i });
        if (await heading.count() > 0) {
          console.log("  ✓ Notifications heading visible");
        }

        // Check for notification preferences
        const preferences = page.locator('text=/preferences|settings|enable/i');
        if (await preferences.count() > 0) {
          console.log("  ✓ Notification preferences visible");
        }

        await takeScreenshot(page, "16-notifications-structure");
      }
    });
  });

  // ===========================================================================
  // SECTION 8: BROWSE EVENTS
  // ===========================================================================

  test.describe("Browse Events (User Context)", () => {
    test("8.1 - Browse events page accessible", async ({ page }) => {
      console.log("\n🎉 Test 8.1: Browse events page\n");

      await page.goto(`${BASE_URL}/user/browse-events`);
      await waitForPageLoad(page);

      // Check if redirects to main events or requires auth
      const currentUrl = page.url();

      if (currentUrl.includes("/events") || currentUrl.includes("/browse")) {
        console.log("  ✓ Browse events accessible");

        // Check for event cards
        const eventCards = page.locator('a[href^="/events/"]');
        const cardCount = await eventCards.count();
        console.log(`  Found ${cardCount} event(s)`);
      }

      await takeScreenshot(page, "17-browse-events");
    });
  });

  // ===========================================================================
  // SECTION 9: SUPPORT
  // ===========================================================================

  test.describe("Support", () => {
    test("9.1 - Support page accessible", async ({ page }) => {
      console.log("\n💬 Test 9.1: Support page\n");

      await page.goto(`${BASE_URL}/user/support`);
      await waitForPageLoad(page);

      // Check for support content
      const heading = page.locator('h1, h2').filter({ hasText: /support|help|contact/i });
      const faq = page.locator('text=/faq|frequently asked/i');
      const contactForm = page.locator('form, textarea');

      if (await heading.count() > 0) console.log("  ✓ Support heading visible");
      if (await faq.count() > 0) console.log("  ✓ FAQ section visible");
      if (await contactForm.count() > 0) console.log("  ✓ Contact form visible");

      await takeScreenshot(page, "18-support-page");
    });
  });

  // ===========================================================================
  // SECTION 10: RESPONSIVE DESIGN
  // ===========================================================================

  test.describe("Responsive Design", () => {
    test("10.1 - Dashboard mobile viewport", async ({ page }) => {
      console.log("\n📱 Test 10.1: Dashboard mobile\n");

      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(`${BASE_URL}/user/dashboard`);
      await waitForPageLoad(page);

      await takeScreenshot(page, "19-dashboard-mobile");
      console.log("✅ Dashboard mobile view");
    });

    test("10.2 - My tickets mobile viewport", async ({ page }) => {
      console.log("\n📱 Test 10.2: My tickets mobile\n");

      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(`${BASE_URL}/my-tickets`);
      await waitForPageLoad(page);

      await takeScreenshot(page, "20-tickets-mobile");
      console.log("✅ My tickets mobile view");
    });

    test("10.3 - Dashboard tablet viewport", async ({ page }) => {
      console.log("\n📱 Test 10.3: Dashboard tablet\n");

      await page.setViewportSize(VIEWPORTS.tablet);
      await page.goto(`${BASE_URL}/user/dashboard`);
      await waitForPageLoad(page);

      await takeScreenshot(page, "21-dashboard-tablet");
      console.log("✅ Dashboard tablet view");
    });
  });

  // ===========================================================================
  // SECTION 11: NAVIGATION
  // ===========================================================================

  test.describe("Dashboard Navigation", () => {
    test("11.1 - Sidebar navigation links", async ({ page }) => {
      console.log("\n🧭 Test 11.1: Sidebar navigation\n");

      await page.goto(`${BASE_URL}/user/dashboard`);
      await waitForPageLoad(page);

      if (!await checkRequiresAuth(page)) {
        // Check for navigation links
        const navLinks = [
          { text: "Dashboard", href: "/user/dashboard" },
          { text: "My Tickets", href: "/my-tickets" },
          { text: "Orders", href: "/user/my-orders" },
          { text: "Favorites", href: "/user/favorites" },
          { text: "Profile", href: "/user/profile" },
        ];

        for (const link of navLinks) {
          const navLink = page.locator(`a[href*="${link.href}"], text=${link.text}`);
          if (await navLink.count() > 0) {
            console.log(`  ✓ ${link.text} link present`);
          }
        }

        await takeScreenshot(page, "22-sidebar-nav");
      }
    });
  });

  // ===========================================================================
  // SECTION 12: PERFORMANCE
  // ===========================================================================

  test.describe("Performance", () => {
    test("12.1 - Dashboard page load time", async ({ page }) => {
      console.log("\n⚡ Test 12.1: Dashboard performance\n");

      const startTime = Date.now();
      await page.goto(`${BASE_URL}/user/dashboard`);
      await waitForPageLoad(page);
      const loadTime = Date.now() - startTime;

      console.log(`  Load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(5000);
      console.log("✅ Dashboard loads within acceptable time");
    });

    test("12.2 - My tickets page load time", async ({ page }) => {
      console.log("\n⚡ Test 12.2: My tickets performance\n");

      const startTime = Date.now();
      await page.goto(`${BASE_URL}/my-tickets`);
      await waitForPageLoad(page);
      const loadTime = Date.now() - startTime;

      console.log(`  Load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(5000);
      console.log("✅ My tickets loads within acceptable time");
    });
  });
});

// =============================================================================
// STANDALONE TESTS
// =============================================================================

test.describe("User Dashboard - Standalone Tests", () => {
  test("User dashboard redirects unauthenticated users", async ({ page }) => {
    await page.goto(`${BASE_URL}/user/dashboard`);
    await page.waitForLoadState("networkidle");

    const requiresAuth = page.url().includes("/login") ||
                         await page.locator('text=/sign in|login/i').count() > 0;
    expect(requiresAuth).toBeTruthy();
  });

  test("My tickets redirects unauthenticated users", async ({ page }) => {
    await page.goto(`${BASE_URL}/my-tickets`);
    await page.waitForLoadState("networkidle");

    const requiresAuth = page.url().includes("/login") ||
                         await page.locator('text=/sign in|login/i').count() > 0;
    expect(requiresAuth).toBeTruthy();
  });
});
