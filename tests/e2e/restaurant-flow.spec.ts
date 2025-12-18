/**
 * Restaurant Flow - Production E2E Test Suite
 *
 * Tests the complete restaurant ordering system against production:
 * - Customer browsing and ordering flow
 * - Order confirmation and tracking
 * - Dashboard accessibility
 *
 * Uses the existing "Steppers Soul Kitchen" restaurant in production.
 */

import { test, expect, Page } from "@playwright/test";

// Configuration
const BASE_URL = process.env.BASE_URL || "https://stepperslife.com";

// Production restaurant data
const RESTAURANT = {
  slug: "dk-soul-food",
  name: "DK Soul Food",
  address: "Chicago, IL",
  city: "Chicago",
};

// Test customer data
const TEST_CUSTOMER = {
  name: "E2E Test Customer",
  email: `e2e-test-${Date.now()}@stepperslife.com`,
  phone: "(312) 555-0199",
};

// Tax rate
const TAX_RATE = 0.0875;

// Generated test data
let testOrderNumber: string | null = null;

/**
 * Waits for page to be fully loaded
 * Note: Using domcontentloaded + timeout instead of networkidle
 * because Convex WebSocket keeps the network active
 */
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(2000); // Buffer for Convex data and hydration
}

/**
 * Takes a screenshot with a descriptive name
 */
async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `test-results/restaurant-e2e-${name}.png`,
    fullPage: true,
  });
}

// =============================================================================
// TEST SUITE
// =============================================================================

test.describe("Restaurant E2E Flow - Production", () => {
  test.describe.configure({ mode: "serial" });

  // ===========================================================================
  // CUSTOMER FLOW TESTS
  // ===========================================================================

  test.describe("Customer Order Flow", () => {
    test("1.1 - Restaurant listing page loads", async ({ page }) => {
      console.log("\n📍 Test 1.1: Restaurant listing page\n");

      await page.goto(`${BASE_URL}/restaurants`);
      await waitForPageLoad(page);

      // Verify page title/heading
      await expect(page.locator("h1")).toBeVisible();

      // Verify our test restaurant is visible
      const restaurantCard = page.locator(`a[href="/restaurants/${RESTAURANT.slug}"]`);
      await expect(restaurantCard).toBeVisible({ timeout: 15000 });

      // Verify restaurant name is displayed
      await expect(page.locator(`text=${RESTAURANT.name}`).first()).toBeVisible();

      await takeScreenshot(page, "01-restaurant-listing");
      console.log("✅ Restaurant listing page loads correctly");
    });

    test("1.2 - Restaurant detail page loads with menu", async ({ page }) => {
      console.log("\n📍 Test 1.2: Restaurant detail page\n");

      await page.goto(`${BASE_URL}/restaurants/${RESTAURANT.slug}`);
      await waitForPageLoad(page);

      // Verify restaurant name
      await expect(page.locator("h1")).toContainText(RESTAURANT.name);

      // Verify address is displayed
      await expect(page.locator(`text=${RESTAURANT.address}`)).toBeVisible();

      // Verify menu section exists
      await expect(page.locator("h2").filter({ hasText: "Menu" })).toBeVisible();

      // Verify menu items are displayed (we know there are 8 items)
      const menuItems = page.locator("text=$").filter({ hasNotText: "Tax" });
      const itemCount = await menuItems.count();
      expect(itemCount).toBeGreaterThanOrEqual(5);
      console.log(`   Found ${itemCount} menu items`);

      // Verify specific known menu items (use .first() since text appears in heading and description)
      await expect(page.locator("text=Fried Chicken").first()).toBeVisible();
      await expect(page.locator("text=Mac & Cheese").first()).toBeVisible();

      await takeScreenshot(page, "02-restaurant-detail");
      console.log("✅ Restaurant detail page loads with menu");
    });

    test("1.3 - Can add items to cart", async ({ page }) => {
      console.log("\n📍 Test 1.3: Add items to cart\n");

      await page.goto(`${BASE_URL}/restaurants/${RESTAURANT.slug}`);
      await waitForPageLoad(page);

      // Find and click "Add" button (Plus icon)
      const addButtons = page.locator("button").filter({ has: page.locator("svg.lucide-plus") });
      const buttonCount = await addButtons.count();
      console.log(`   Found ${buttonCount} add buttons`);

      // Add first item
      await addButtons.first().click();
      await page.waitForTimeout(500);

      // Verify cart shows 1 item
      await expect(page.locator("text=View Cart (1)")).toBeVisible({ timeout: 5000 });
      console.log("   Added first item to cart");

      // Add second item
      if (buttonCount >= 2) {
        await addButtons.nth(1).click();
        await page.waitForTimeout(500);
        await expect(page.locator("text=View Cart (2)")).toBeVisible();
        console.log("   Added second item to cart");
      }

      // Add third item
      if (buttonCount >= 3) {
        await addButtons.nth(2).click();
        await page.waitForTimeout(500);
        await expect(page.locator("text=View Cart (3)")).toBeVisible();
        console.log("   Added third item to cart");
      }

      await takeScreenshot(page, "03-items-in-cart");
      console.log("✅ Items successfully added to cart");
    });

    test("1.4 - Cart sidebar displays correctly", async ({ page }) => {
      console.log("\n📍 Test 1.4: Cart sidebar\n");

      await page.goto(`${BASE_URL}/restaurants/${RESTAURANT.slug}`);
      await waitForPageLoad(page);

      // Add items to cart
      const addButtons = page.locator("button").filter({ has: page.locator("svg.lucide-plus") });
      await addButtons.first().click();
      await addButtons.nth(1).click();

      // Wait for cart to update
      await expect(page.locator("text=View Cart (2)")).toBeVisible({ timeout: 5000 });

      // Open cart sidebar
      await page.click("text=View Cart");
      await page.waitForTimeout(1000);

      // Verify cart sidebar opened
      await expect(page.locator("h2").filter({ hasText: "Your Order" })).toBeVisible();

      // Verify items in cart (checking the cart sidebar specifically)
      const cartSidebar = page.locator('[class*="fixed"]').filter({ hasText: "Your Order" });
      await expect(cartSidebar).toBeVisible();

      // Verify total is displayed
      await expect(page.locator("text=Total").first()).toBeVisible();

      // Verify checkout button
      await expect(page.locator("text=Proceed to Checkout")).toBeVisible();

      await takeScreenshot(page, "04-cart-sidebar");
      console.log("✅ Cart sidebar displays correctly");
    });

    test("1.5 - Checkout page loads with order details", async ({ page }) => {
      console.log("\n📍 Test 1.5: Checkout page\n");

      await page.goto(`${BASE_URL}/restaurants/${RESTAURANT.slug}`);
      await waitForPageLoad(page);

      // Add items to cart
      const addButtons = page.locator("button").filter({ has: page.locator("svg.lucide-plus") });
      await addButtons.first().click();
      await addButtons.nth(1).click();

      // Wait for cart
      await expect(page.locator("text=View Cart")).toBeVisible({ timeout: 5000 });

      // Go to checkout
      await page.click("text=View Cart");
      await page.waitForTimeout(500);
      await page.click("text=Proceed to Checkout");
      await waitForPageLoad(page);

      // Verify checkout page
      expect(page.url()).toContain("/checkout");
      await expect(page.locator("h1").filter({ hasText: "Checkout" })).toBeVisible();

      // Verify form fields (exact placeholders from checkout page)
      await expect(page.locator('input[placeholder="John Doe"]')).toBeVisible();
      await expect(page.locator('input[placeholder="john@example.com"]')).toBeVisible();
      await expect(page.locator('input[placeholder="(555) 123-4567"]')).toBeVisible();

      // Verify order summary
      await expect(page.locator("h2").filter({ hasText: "Order Summary" })).toBeVisible();

      // Verify tax calculation
      await expect(page.locator("text=Tax")).toBeVisible();

      // Verify payment method
      await expect(page.locator("text=Pay at Pickup")).toBeVisible();

      await takeScreenshot(page, "05-checkout-page");
      console.log("✅ Checkout page loads correctly");
    });

    test("1.6 - Can complete checkout and get order confirmation", async ({ page }) => {
      console.log("\n📍 Test 1.6: Complete checkout\n");

      await page.goto(`${BASE_URL}/restaurants/${RESTAURANT.slug}`);
      await waitForPageLoad(page);

      // Add items to cart
      const addButtons = page.locator("button").filter({ has: page.locator("svg.lucide-plus") });
      await addButtons.first().click();
      await addButtons.nth(1).click();

      // Wait for cart
      await expect(page.locator("text=View Cart")).toBeVisible({ timeout: 5000 });

      // Go to checkout
      await page.click("text=View Cart");
      await page.waitForTimeout(500);
      await page.click("text=Proceed to Checkout");
      await waitForPageLoad(page);

      // Fill out form (exact placeholders)
      await page.fill('input[placeholder="John Doe"]', TEST_CUSTOMER.name);
      await page.fill('input[placeholder="john@example.com"]', TEST_CUSTOMER.email);
      await page.fill('input[placeholder="(555) 123-4567"]', TEST_CUSTOMER.phone);

      // Add special instructions if textarea exists
      const textarea = page.locator("textarea");
      if (await textarea.isVisible()) {
        await textarea.fill("E2E Test Order - Please ignore");
      }

      await takeScreenshot(page, "06-checkout-filled");

      // Submit order
      const submitButton = page.locator("button[type='submit']");
      await submitButton.click();

      // Wait for confirmation page
      await page.waitForURL(/\/order-confirmation/, { timeout: 30000 });
      await waitForPageLoad(page);

      // Verify confirmation page
      await expect(page.locator("text=Order").first()).toBeVisible();

      // Extract order number
      const orderNumberElement = page.locator(".font-mono").first();
      if (await orderNumberElement.isVisible()) {
        testOrderNumber = await orderNumberElement.textContent();
        console.log(`   Order number: ${testOrderNumber}`);
      }

      // Verify restaurant name on confirmation (use first() since name appears in multiple places)
      await expect(page.locator(`text=${RESTAURANT.name}`).first()).toBeVisible();

      // Verify pickup location (use first() for same reason)
      await expect(page.locator(`text=${RESTAURANT.address}`).first()).toBeVisible();

      await takeScreenshot(page, "07-order-confirmation");
      console.log("✅ Order placed successfully");
    });
  });

  // ===========================================================================
  // DASHBOARD ACCESSIBILITY TESTS
  // ===========================================================================

  test.describe("Dashboard Accessibility", () => {
    test("2.1 - Restaurateur dashboard requires authentication", async ({ page }) => {
      console.log("\n📍 Test 2.1: Restaurateur dashboard auth\n");

      await page.goto(`${BASE_URL}/restaurateur/dashboard`);
      await waitForPageLoad(page);

      // Should show sign-in prompt or redirect to login
      const hasSignInButton = await page.locator("button:has-text('Sign In')").first().isVisible();
      const hasSignInHeading = await page.locator("text=Sign in to your account").first().isVisible();
      const hasLogin = page.url().includes("/login") || page.url().includes("/sign-in") || page.url().includes("/signin");

      expect(hasSignInButton || hasSignInHeading || hasLogin).toBeTruthy();

      await takeScreenshot(page, "08-dashboard-auth-required");
      console.log("✅ Dashboard requires authentication");
    });

    test("2.2 - Restaurateur orders page requires authentication", async ({ page }) => {
      console.log("\n📍 Test 2.2: Orders page auth\n");

      await page.goto(`${BASE_URL}/restaurateur/dashboard/orders`);
      await waitForPageLoad(page);

      // Should show sign-in prompt or redirect
      const hasSignInButton = await page.locator("button:has-text('Sign In')").first().isVisible();
      const hasSignInHeading = await page.locator("text=Sign in to your account").first().isVisible();
      const hasLogin = page.url().includes("/login") || page.url().includes("/sign-in") || page.url().includes("/signin");

      expect(hasSignInButton || hasSignInHeading || hasLogin).toBeTruthy();

      await takeScreenshot(page, "09-orders-auth-required");
      console.log("✅ Orders page requires authentication");
    });

    test("2.3 - Admin restaurants page requires authentication", async ({ page }) => {
      console.log("\n📍 Test 2.3: Admin restaurants auth\n");

      await page.goto(`${BASE_URL}/admin/restaurants`);
      await waitForPageLoad(page);

      // Should show sign-in prompt or redirect
      const hasSignInButton = await page.locator("button:has-text('Sign In')").first().isVisible();
      const hasSignInHeading = await page.locator("text=Sign in to your account").first().isVisible();
      const hasLogin = page.url().includes("/login") || page.url().includes("/sign-in") || page.url().includes("/signin");
      const hasUnauthorized = await page.locator("text=Unauthorized").first().isVisible();

      expect(hasSignInButton || hasSignInHeading || hasLogin || hasUnauthorized).toBeTruthy();

      await takeScreenshot(page, "10-admin-auth-required");
      console.log("✅ Admin page requires authentication");
    });

    test("2.4 - Customer can view order history page", async ({ page }) => {
      console.log("\n📍 Test 2.4: Order history page\n");

      await page.goto(`${BASE_URL}/restaurants/my-orders`);
      await waitForPageLoad(page);

      // Page should load (may require sign-in or show sign-in prompt)
      const pageLoaded =
        await page.locator("h1").isVisible() ||
        await page.locator("text=Sign In").isVisible() ||
        await page.locator("text=My Orders").isVisible();

      expect(pageLoaded).toBeTruthy();

      await takeScreenshot(page, "11-my-orders-page");
      console.log("✅ Order history page accessible");
    });
  });

  // ===========================================================================
  // ERROR HANDLING TESTS
  // ===========================================================================

  test.describe("Error Handling", () => {
    test("3.1 - Non-existent restaurant shows error", async ({ page }) => {
      console.log("\n📍 Test 3.1: Non-existent restaurant\n");

      await page.goto(`${BASE_URL}/restaurants/this-restaurant-does-not-exist-xyz123`);
      await waitForPageLoad(page);

      // Should show "not found" message or similar
      const hasNotFound =
        await page.locator("text=not found").isVisible() ||
        await page.locator("text=Not Found").isVisible() ||
        await page.locator("text=doesn't exist").isVisible() ||
        await page.locator("text=404").isVisible();

      expect(hasNotFound).toBeTruthy();

      await takeScreenshot(page, "12-restaurant-not-found");
      console.log("✅ Non-existent restaurant shows error");
    });

    test("3.2 - Empty cart shows message on checkout", async ({ page }) => {
      console.log("\n📍 Test 3.2: Empty cart checkout\n");

      // Go directly to checkout without adding items
      await page.goto(`${BASE_URL}/restaurants/${RESTAURANT.slug}/checkout`);
      await waitForPageLoad(page);

      // Should show empty cart message
      const hasEmptyMessage =
        await page.locator("text=cart is empty").isVisible() ||
        await page.locator("text=no items").isVisible() ||
        await page.locator("text=Return to").isVisible();

      expect(hasEmptyMessage).toBeTruthy();

      await takeScreenshot(page, "13-empty-cart-checkout");
      console.log("✅ Empty cart shows appropriate message");
    });
  });

  // ===========================================================================
  // UI/UX TESTS
  // ===========================================================================

  test.describe("UI/UX Verification", () => {
    test("4.1 - Restaurant page displays cuisine types", async ({ page }) => {
      console.log("\n📍 Test 4.1: Cuisine types display\n");

      await page.goto(`${BASE_URL}/restaurants/${RESTAURANT.slug}`);
      await waitForPageLoad(page);

      // Verify cuisine tags are visible (use first() since text appears in multiple places)
      const hasSoulFood = await page.locator("text=Soul Food").first().isVisible();
      const hasSouthern = await page.locator("text=Southern").first().isVisible();

      expect(hasSoulFood || hasSouthern).toBeTruthy();

      await takeScreenshot(page, "14-cuisine-types");
      console.log("✅ Cuisine types displayed");
    });

    test("4.2 - Menu categories are displayed", async ({ page }) => {
      console.log("\n📍 Test 4.2: Menu categories\n");

      await page.goto(`${BASE_URL}/restaurants/${RESTAURANT.slug}`);
      await waitForPageLoad(page);

      // Verify known categories
      const categories = ["Main Dishes", "Sides", "Beverages", "Desserts"];
      let foundCategories = 0;

      for (const category of categories) {
        if (await page.locator(`text=${category}`).isVisible()) {
          foundCategories++;
          console.log(`   Found category: ${category}`);
        }
      }

      expect(foundCategories).toBeGreaterThanOrEqual(2);

      await takeScreenshot(page, "15-menu-categories");
      console.log(`✅ Found ${foundCategories} menu categories`);
    });

    test("4.3 - Prices are displayed correctly", async ({ page }) => {
      console.log("\n📍 Test 4.3: Price display\n");

      await page.goto(`${BASE_URL}/restaurants/${RESTAURANT.slug}`);
      await waitForPageLoad(page);

      // Verify prices are formatted correctly (e.g., $14.99)
      const priceRegex = /\$\d+\.\d{2}/;
      const pageContent = await page.content();
      const hasFormattedPrices = priceRegex.test(pageContent);

      expect(hasFormattedPrices).toBeTruthy();

      // Verify specific known prices
      const hasFriedChickenPrice = await page.locator("text=$14.99").isVisible();
      const hasMacCheesePrice = await page.locator("text=$5.99").isVisible();

      console.log(`   Fried Chicken ($14.99): ${hasFriedChickenPrice}`);
      console.log(`   Mac & Cheese ($5.99): ${hasMacCheesePrice}`);

      expect(hasFriedChickenPrice || hasMacCheesePrice).toBeTruthy();

      await takeScreenshot(page, "16-prices-displayed");
      console.log("✅ Prices displayed correctly");
    });

    test("4.4 - Phone number is displayed", async ({ page }) => {
      console.log("\n📍 Test 4.4: Phone number display\n");

      await page.goto(`${BASE_URL}/restaurants/${RESTAURANT.slug}`);
      await waitForPageLoad(page);

      // Verify phone number format
      const phoneRegex = /\(\d{3}\)\s*\d{3}-?\d{4}/;
      const pageContent = await page.content();
      const hasPhoneNumber = phoneRegex.test(pageContent);

      expect(hasPhoneNumber).toBeTruthy();

      await takeScreenshot(page, "17-phone-displayed");
      console.log("✅ Phone number displayed");
    });
  });

  // ===========================================================================
  // PERFORMANCE TESTS
  // ===========================================================================

  test.describe("Performance", () => {
    test("5.1 - Restaurant listing loads within 10 seconds", async ({ page }) => {
      console.log("\n📍 Test 5.1: Listing page performance\n");

      const startTime = Date.now();
      await page.goto(`${BASE_URL}/restaurants`);
      await waitForPageLoad(page);
      const loadTime = Date.now() - startTime;

      console.log(`   Load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000);

      console.log("✅ Listing page loads within acceptable time");
    });

    test("5.2 - Restaurant detail loads within 10 seconds", async ({ page }) => {
      console.log("\n📍 Test 5.2: Detail page performance\n");

      const startTime = Date.now();
      await page.goto(`${BASE_URL}/restaurants/${RESTAURANT.slug}`);
      await waitForPageLoad(page);
      const loadTime = Date.now() - startTime;

      console.log(`   Load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000);

      console.log("✅ Detail page loads within acceptable time");
    });

    test("5.3 - Cart interaction is responsive", async ({ page }) => {
      console.log("\n📍 Test 5.3: Cart interaction performance\n");

      await page.goto(`${BASE_URL}/restaurants/${RESTAURANT.slug}`);
      await waitForPageLoad(page);

      const addButtons = page.locator("button").filter({ has: page.locator("svg.lucide-plus") });

      const startTime = Date.now();
      await addButtons.first().click();
      await expect(page.locator("text=View Cart (1)")).toBeVisible();
      const interactionTime = Date.now() - startTime;

      console.log(`   Interaction time: ${interactionTime}ms`);
      expect(interactionTime).toBeLessThan(3000);

      console.log("✅ Cart interaction is responsive");
    });
  });
});

// =============================================================================
// STANDALONE QUICK TESTS
// =============================================================================

test.describe("Quick Sanity Checks", () => {
  test("Restaurant listing page returns 200", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/restaurants`);
    expect(response?.status()).toBe(200);
  });

  test("Restaurant detail page returns 200", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/restaurants/${RESTAURANT.slug}`);
    expect(response?.status()).toBe(200);
  });

  test("Checkout page is accessible", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/restaurants/${RESTAURANT.slug}/checkout`);
    expect(response?.status()).toBe(200);
  });
});
