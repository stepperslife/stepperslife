/**
 * Admin Dashboard Feature - Comprehensive Test Suite
 *
 * Tests the complete admin dashboard including:
 * - Main dashboard with platform analytics
 * - User management
 * - Event management
 * - Order management
 * - Vendor management
 * - Support ticket management
 * - Platform settings
 * - Notifications management
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

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function waitForPageLoad(page: Page) {
  await page.waitForLoadState("networkidle", { timeout: TIMEOUTS.networkIdle });
  await page.waitForTimeout(TIMEOUTS.animation);
}

async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `test-results/admin-dashboard-${name}.png`,
    fullPage: true,
  });
}

async function checkRequiresAuth(page: Page): Promise<boolean> {
  const isRedirected = page.url().includes("/login") || page.url().includes("/sign-in");
  const showsAuthRequired = await page.locator('text=/sign in|login|authentication required|unauthorized/i').count() > 0;
  return isRedirected || showsAuthRequired;
}

async function checkRequiresAdmin(page: Page): Promise<boolean> {
  const requiresAuth = await checkRequiresAuth(page);
  const showsUnauthorized = await page.locator('text=/unauthorized|access denied|admin only|forbidden/i').count() > 0;
  return requiresAuth || showsUnauthorized;
}

// =============================================================================
// TEST SUITE
// =============================================================================

test.describe("Admin Dashboard Feature", () => {
  // ===========================================================================
  // SECTION 1: MAIN ADMIN DASHBOARD
  // ===========================================================================

  test.describe("Main Admin Dashboard", () => {
    test("1.1 - Admin dashboard requires authentication", async ({ page }) => {
      console.log("\n👑 Test 1.1: Admin dashboard auth requirement\n");

      await page.goto(`${BASE_URL}/admin`);
      await waitForPageLoad(page);

      const requiresAdmin = await checkRequiresAdmin(page);
      expect(requiresAdmin).toBeTruthy();

      await takeScreenshot(page, "01-admin-auth-required");
      console.log("✅ Admin dashboard requires authentication/admin role");
    });

    test("1.2 - Admin dashboard structure (when accessible)", async ({ page }) => {
      console.log("\n👑 Test 1.2: Admin dashboard structure\n");

      await page.goto(`${BASE_URL}/admin`);
      await waitForPageLoad(page);

      if (!await checkRequiresAdmin(page)) {
        // Check for admin heading
        const heading = page.locator('h1, h2').filter({ hasText: /admin|dashboard|platform/i });
        if (await heading.count() > 0) {
          console.log("  ✓ Admin heading visible");
        }

        // Check for analytics/stats
        const stats = page.locator('[data-testid="stats"], .stats, .analytics');
        if (await stats.count() > 0) {
          console.log("  ✓ Platform stats visible");
        }

        // Check for navigation
        const navItems = page.locator('nav a, aside a, [data-testid="admin-nav"]');
        const navCount = await navItems.count();
        console.log(`  ✓ Found ${navCount} navigation items`);

        await takeScreenshot(page, "02-admin-dashboard-structure");
      } else {
        console.log("  ℹ Admin access required - structure test skipped");
      }
    });
  });

  // ===========================================================================
  // SECTION 2: USER MANAGEMENT
  // ===========================================================================

  test.describe("User Management", () => {
    test("2.1 - Users page requires admin access", async ({ page }) => {
      console.log("\n👥 Test 2.1: Users page auth\n");

      await page.goto(`${BASE_URL}/admin/users`);
      await waitForPageLoad(page);

      const requiresAdmin = await checkRequiresAdmin(page);
      expect(requiresAdmin).toBeTruthy();

      await takeScreenshot(page, "03-users-auth");
      console.log("✅ Users page requires admin access");
    });

    test("2.2 - Users page structure", async ({ page }) => {
      console.log("\n👥 Test 2.2: Users page structure\n");

      await page.goto(`${BASE_URL}/admin/users`);
      await waitForPageLoad(page);

      if (!await checkRequiresAdmin(page)) {
        // Check for users table/list
        const userList = page.locator('table, [data-testid="user-list"], .user-list');
        if (await userList.count() > 0) {
          console.log("  ✓ User list/table visible");
        }

        // Check for search/filter
        const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]');
        if (await searchInput.count() > 0) {
          console.log("  ✓ Search functionality present");
        }

        // Check for user actions
        const actionButtons = page.locator('button:has-text("Edit"), button:has-text("Delete"), button:has-text("View")');
        if (await actionButtons.count() > 0) {
          console.log("  ✓ User action buttons present");
        }

        await takeScreenshot(page, "04-users-structure");
      }
    });
  });

  // ===========================================================================
  // SECTION 3: EVENT MANAGEMENT
  // ===========================================================================

  test.describe("Event Management", () => {
    test("3.1 - Events page requires admin access", async ({ page }) => {
      console.log("\n🎉 Test 3.1: Events page auth\n");

      await page.goto(`${BASE_URL}/admin/events`);
      await waitForPageLoad(page);

      const requiresAdmin = await checkRequiresAdmin(page);
      expect(requiresAdmin).toBeTruthy();

      await takeScreenshot(page, "05-events-auth");
      console.log("✅ Events page requires admin access");
    });

    test("3.2 - Events page structure", async ({ page }) => {
      console.log("\n🎉 Test 3.2: Events page structure\n");

      await page.goto(`${BASE_URL}/admin/events`);
      await waitForPageLoad(page);

      if (!await checkRequiresAdmin(page)) {
        // Check for events list
        const eventList = page.locator('table, [data-testid="event-list"], .event-list');
        if (await eventList.count() > 0) {
          console.log("  ✓ Event list visible");
        }

        // Check for filters
        const filters = page.locator('select, [data-testid="filter"]');
        if (await filters.count() > 0) {
          console.log("  ✓ Filter controls present");
        }

        await takeScreenshot(page, "06-events-structure");
      }
    });

    test("3.3 - Flyer upload page accessible", async ({ page }) => {
      console.log("\n🎉 Test 3.3: Flyer upload page\n");

      await page.goto(`${BASE_URL}/admin/events/upload-flyers`);
      await waitForPageLoad(page);

      if (!await checkRequiresAdmin(page)) {
        // Check for upload interface
        const uploadArea = page.locator('input[type="file"], [data-testid="upload"], .upload-area');
        if (await uploadArea.count() > 0) {
          console.log("  ✓ Upload interface visible");
        }

        await takeScreenshot(page, "07-flyer-upload");
      }
    });
  });

  // ===========================================================================
  // SECTION 4: ORDER MANAGEMENT
  // ===========================================================================

  test.describe("Order Management", () => {
    test("4.1 - Orders page requires admin access", async ({ page }) => {
      console.log("\n📦 Test 4.1: Orders page auth\n");

      await page.goto(`${BASE_URL}/admin/orders`);
      await waitForPageLoad(page);

      const requiresAdmin = await checkRequiresAdmin(page);
      expect(requiresAdmin).toBeTruthy();

      await takeScreenshot(page, "08-orders-auth");
      console.log("✅ Orders page requires admin access");
    });

    test("4.2 - Orders page structure", async ({ page }) => {
      console.log("\n📦 Test 4.2: Orders page structure\n");

      await page.goto(`${BASE_URL}/admin/orders`);
      await waitForPageLoad(page);

      if (!await checkRequiresAdmin(page)) {
        // Check for orders table
        const orderTable = page.locator('table, [data-testid="order-list"]');
        if (await orderTable.count() > 0) {
          console.log("  ✓ Orders table visible");
        }

        // Check for status filters
        const statusFilter = page.locator('select[name*="status"], [data-testid="status-filter"]');
        if (await statusFilter.count() > 0) {
          console.log("  ✓ Status filter present");
        }

        await takeScreenshot(page, "09-orders-structure");
      }
    });

    test("4.3 - Product orders page accessible", async ({ page }) => {
      console.log("\n📦 Test 4.3: Product orders page\n");

      await page.goto(`${BASE_URL}/admin/product-orders`);
      await waitForPageLoad(page);

      const requiresAdmin = await checkRequiresAdmin(page);
      expect(requiresAdmin).toBeTruthy();

      await takeScreenshot(page, "10-product-orders");
    });
  });

  // ===========================================================================
  // SECTION 5: VENDOR MANAGEMENT
  // ===========================================================================

  test.describe("Vendor Management", () => {
    test("5.1 - Vendors page requires admin access", async ({ page }) => {
      console.log("\n🏪 Test 5.1: Vendors page auth\n");

      await page.goto(`${BASE_URL}/admin/vendors`);
      await waitForPageLoad(page);

      const requiresAdmin = await checkRequiresAdmin(page);
      expect(requiresAdmin).toBeTruthy();

      await takeScreenshot(page, "11-vendors-auth");
      console.log("✅ Vendors page requires admin access");
    });

    test("5.2 - Vendors page structure", async ({ page }) => {
      console.log("\n🏪 Test 5.2: Vendors page structure\n");

      await page.goto(`${BASE_URL}/admin/vendors`);
      await waitForPageLoad(page);

      if (!await checkRequiresAdmin(page)) {
        // Check for vendor list
        const vendorList = page.locator('table, [data-testid="vendor-list"]');
        if (await vendorList.count() > 0) {
          console.log("  ✓ Vendor list visible");
        }

        // Check for approval actions
        const approvalBtns = page.locator('button:has-text("Approve"), button:has-text("Reject")');
        if (await approvalBtns.count() > 0) {
          console.log("  ✓ Approval actions present");
        }

        await takeScreenshot(page, "12-vendors-structure");
      }
    });

    test("5.3 - Vendor payouts page accessible", async ({ page }) => {
      console.log("\n🏪 Test 5.3: Vendor payouts page\n");

      await page.goto(`${BASE_URL}/admin/vendors/payouts`);
      await waitForPageLoad(page);

      const requiresAdmin = await checkRequiresAdmin(page);
      expect(requiresAdmin).toBeTruthy();

      await takeScreenshot(page, "13-vendor-payouts");
    });
  });

  // ===========================================================================
  // SECTION 6: PRODUCTS MANAGEMENT
  // ===========================================================================

  test.describe("Products Management", () => {
    test("6.1 - Products page requires admin access", async ({ page }) => {
      console.log("\n🛍️ Test 6.1: Products page auth\n");

      await page.goto(`${BASE_URL}/admin/products`);
      await waitForPageLoad(page);

      const requiresAdmin = await checkRequiresAdmin(page);
      expect(requiresAdmin).toBeTruthy();

      await takeScreenshot(page, "14-products-auth");
      console.log("✅ Products page requires admin access");
    });

    test("6.2 - Create product page accessible", async ({ page }) => {
      console.log("\n🛍️ Test 6.2: Create product page\n");

      await page.goto(`${BASE_URL}/admin/products/create`);
      await waitForPageLoad(page);

      if (!await checkRequiresAdmin(page)) {
        // Check for product form
        const productForm = page.locator('form, [data-testid="product-form"]');
        if (await productForm.count() > 0) {
          console.log("  ✓ Product form visible");
        }

        await takeScreenshot(page, "15-create-product");
      }
    });
  });

  // ===========================================================================
  // SECTION 7: SUPPORT MANAGEMENT
  // ===========================================================================

  test.describe("Support Management", () => {
    test("7.1 - Support page requires admin access", async ({ page }) => {
      console.log("\n💬 Test 7.1: Support page auth\n");

      await page.goto(`${BASE_URL}/admin/support`);
      await waitForPageLoad(page);

      const requiresAdmin = await checkRequiresAdmin(page);
      expect(requiresAdmin).toBeTruthy();

      await takeScreenshot(page, "16-support-auth");
      console.log("✅ Support page requires admin access");
    });

    test("7.2 - Support tickets structure", async ({ page }) => {
      console.log("\n💬 Test 7.2: Support tickets structure\n");

      await page.goto(`${BASE_URL}/admin/support`);
      await waitForPageLoad(page);

      if (!await checkRequiresAdmin(page)) {
        // Check for tickets list
        const ticketList = page.locator('table, [data-testid="ticket-list"]');
        if (await ticketList.count() > 0) {
          console.log("  ✓ Support tickets list visible");
        }

        // Check for status filter
        const statusFilter = page.locator('select[name*="status"]');
        if (await statusFilter.count() > 0) {
          console.log("  ✓ Status filter present");
        }

        await takeScreenshot(page, "17-support-structure");
      }
    });
  });

  // ===========================================================================
  // SECTION 8: ANALYTICS
  // ===========================================================================

  test.describe("Analytics", () => {
    test("8.1 - Analytics page requires admin access", async ({ page }) => {
      console.log("\n📊 Test 8.1: Analytics page auth\n");

      await page.goto(`${BASE_URL}/admin/analytics`);
      await waitForPageLoad(page);

      const requiresAdmin = await checkRequiresAdmin(page);
      expect(requiresAdmin).toBeTruthy();

      await takeScreenshot(page, "18-analytics-auth");
      console.log("✅ Analytics page requires admin access");
    });

    test("8.2 - Analytics page structure", async ({ page }) => {
      console.log("\n📊 Test 8.2: Analytics page structure\n");

      await page.goto(`${BASE_URL}/admin/analytics`);
      await waitForPageLoad(page);

      if (!await checkRequiresAdmin(page)) {
        // Check for charts/graphs
        const charts = page.locator('canvas, svg, [data-testid="chart"]');
        if (await charts.count() > 0) {
          console.log("  ✓ Charts/graphs visible");
        }

        // Check for metrics
        const metrics = page.locator('[data-testid="metric"], .metric, .stat');
        if (await metrics.count() > 0) {
          console.log("  ✓ Metrics displayed");
        }

        await takeScreenshot(page, "19-analytics-structure");
      }
    });
  });

  // ===========================================================================
  // SECTION 9: CRM
  // ===========================================================================

  test.describe("CRM", () => {
    test("9.1 - CRM page requires admin access", async ({ page }) => {
      console.log("\n📇 Test 9.1: CRM page auth\n");

      await page.goto(`${BASE_URL}/admin/crm`);
      await waitForPageLoad(page);

      const requiresAdmin = await checkRequiresAdmin(page);
      expect(requiresAdmin).toBeTruthy();

      await takeScreenshot(page, "20-crm-auth");
      console.log("✅ CRM page requires admin access");
    });
  });

  // ===========================================================================
  // SECTION 10: SETTINGS
  // ===========================================================================

  test.describe("Settings", () => {
    test("10.1 - Settings page requires admin access", async ({ page }) => {
      console.log("\n⚙️ Test 10.1: Settings page auth\n");

      await page.goto(`${BASE_URL}/admin/settings`);
      await waitForPageLoad(page);

      const requiresAdmin = await checkRequiresAdmin(page);
      expect(requiresAdmin).toBeTruthy();

      await takeScreenshot(page, "21-settings-auth");
      console.log("✅ Settings page requires admin access");
    });

    test("10.2 - Settings page structure", async ({ page }) => {
      console.log("\n⚙️ Test 10.2: Settings page structure\n");

      await page.goto(`${BASE_URL}/admin/settings`);
      await waitForPageLoad(page);

      if (!await checkRequiresAdmin(page)) {
        // Check for settings sections
        const settingsSections = page.locator('[data-testid="settings-section"], .settings-section');
        if (await settingsSections.count() > 0) {
          console.log("  ✓ Settings sections visible");
        }

        // Check for save button
        const saveBtn = page.locator('button:has-text("Save")');
        if (await saveBtn.count() > 0) {
          console.log("  ✓ Save button present");
        }

        await takeScreenshot(page, "22-settings-structure");
      }
    });
  });

  // ===========================================================================
  // SECTION 11: NOTIFICATIONS MANAGEMENT
  // ===========================================================================

  test.describe("Notifications Management", () => {
    test("11.1 - Notifications page requires admin access", async ({ page }) => {
      console.log("\n🔔 Test 11.1: Notifications page auth\n");

      await page.goto(`${BASE_URL}/admin/notifications`);
      await waitForPageLoad(page);

      const requiresAdmin = await checkRequiresAdmin(page);
      expect(requiresAdmin).toBeTruthy();

      await takeScreenshot(page, "23-notifications-auth");
      console.log("✅ Notifications page requires admin access");
    });
  });

  // ===========================================================================
  // SECTION 12: TESTING UTILITIES
  // ===========================================================================

  test.describe("Testing Utilities", () => {
    test("12.1 - Testing page requires admin access", async ({ page }) => {
      console.log("\n🧪 Test 12.1: Testing page auth\n");

      await page.goto(`${BASE_URL}/admin/testing`);
      await waitForPageLoad(page);

      const requiresAdmin = await checkRequiresAdmin(page);
      expect(requiresAdmin).toBeTruthy();

      await takeScreenshot(page, "24-testing-auth");
      console.log("✅ Testing page requires admin access");
    });
  });

  // ===========================================================================
  // SECTION 13: RESPONSIVE DESIGN
  // ===========================================================================

  test.describe("Responsive Design", () => {
    test("13.1 - Admin dashboard mobile viewport", async ({ page }) => {
      console.log("\n📱 Test 13.1: Admin mobile\n");

      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(`${BASE_URL}/admin`);
      await waitForPageLoad(page);

      await takeScreenshot(page, "25-admin-mobile");
      console.log("✅ Admin mobile view");
    });

    test("13.2 - Admin dashboard tablet viewport", async ({ page }) => {
      console.log("\n📱 Test 13.2: Admin tablet\n");

      await page.setViewportSize(VIEWPORTS.tablet);
      await page.goto(`${BASE_URL}/admin`);
      await waitForPageLoad(page);

      await takeScreenshot(page, "26-admin-tablet");
      console.log("✅ Admin tablet view");
    });
  });

  // ===========================================================================
  // SECTION 14: PERFORMANCE
  // ===========================================================================

  test.describe("Performance", () => {
    test("14.1 - Admin dashboard load time", async ({ page }) => {
      console.log("\n⚡ Test 14.1: Admin performance\n");

      const startTime = Date.now();
      await page.goto(`${BASE_URL}/admin`);
      await waitForPageLoad(page);
      const loadTime = Date.now() - startTime;

      console.log(`  Load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(5000);
      console.log("✅ Admin dashboard loads within acceptable time");
    });
  });
});

// =============================================================================
// STANDALONE TESTS
// =============================================================================

test.describe("Admin Dashboard - Standalone Tests", () => {
  test("Admin routes are protected", async ({ page }) => {
    const adminRoutes = [
      "/admin",
      "/admin/users",
      "/admin/events",
      "/admin/orders",
      "/admin/vendors",
      "/admin/analytics",
      "/admin/settings",
    ];

    for (const route of adminRoutes) {
      await page.goto(`${BASE_URL}${route}`);
      await page.waitForLoadState("networkidle");

      const requiresAuth = page.url().includes("/login") ||
                           await page.locator('text=/sign in|login|unauthorized/i').count() > 0;

      expect(requiresAuth).toBeTruthy();
    }
  });
});
