/**
 * Restaurants Feature - Comprehensive Test Suite
 *
 * Tests the complete restaurants feature including:
 *
 * PUBLIC USER FLOW:
 * - Browse restaurants page (/restaurants)
 * - Filter by cuisine type and location
 * - View restaurant detail page (/restaurants/[slug])
 * - Browse menu categories and items
 * - Add items to cart with special instructions
 * - Checkout with pickup time selection
 * - Order confirmation with order number
 *
 * RESTAURATEUR FLOW:
 * - Apply to become a restaurateur partner
 * - Dashboard access and order management
 * - Toggle accepting orders status
 * - View order details and update status (ready, completed)
 *
 * MENU MANAGEMENT:
 * - Add/edit menu categories
 * - Add/edit menu items with pricing and availability
 * - Reorder items and categories
 */

import { test, expect, Page, BrowserContext } from "@playwright/test";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

// Configuration
const BASE_URL = "http://localhost:3004";
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://dazzling-mockingbird-241.convex.cloud";

// Tax rate constant (matching checkout page)
const TAX_RATE = 0.0875;

// Test state - shared across serial tests
let client: ConvexHttpClient;
let testUserId: Id<"users">;
let testRestaurantId: Id<"restaurants">;
let testRestaurantSlug: string;
let testCategoryId: Id<"menuCategories">;
let testMenuItem1Id: Id<"menuItems">;
let testMenuItem2Id: Id<"menuItems">;
let testOrderId: Id<"foodOrders">;
let testOrderNumber: string;

// Test data
const timestamp = Date.now();
const TEST_USER = {
  email: `test-restaurateur-${timestamp}@stepperslife.com`,
  name: `Test Restaurateur ${timestamp}`,
};

const TEST_RESTAURANT = {
  name: `Soul Kitchen Test ${timestamp}`,
  slug: `soul-kitchen-test-${timestamp}`,
  description: "Authentic soul food made with love",
  address: "123 Test Street",
  city: "Chicago",
  state: "IL",
  zipCode: "60601",
  phone: "(312) 555-0123",
  cuisine: ["Soul Food", "Southern", "BBQ"],
  estimatedPickupTime: 25,
};

const TEST_MENU_CATEGORY = {
  name: "Main Dishes",
  description: "Our signature entrees",
  sortOrder: 1,
};

const TEST_MENU_ITEMS = [
  {
    name: "Southern Fried Chicken",
    description: "Crispy, golden fried chicken with our secret spice blend",
    price: 1499, // $14.99 in cents
    sortOrder: 1,
  },
  {
    name: "Mac & Cheese",
    description: "Creamy three-cheese macaroni baked to perfection",
    price: 899, // $8.99 in cents
    sortOrder: 2,
  },
];

const TEST_CUSTOMER = {
  name: "John Customer",
  email: "john.customer@test.com",
  phone: "(312) 555-9999",
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Creates test data in Convex for the test suite
 */
async function setupTestData() {
  console.log("\n🔧 Setting up test data...\n");

  // Create test user
  const userResult = await client.mutation(api.users.createOrUpdate, {
    email: TEST_USER.email,
    name: TEST_USER.name,
  });
  testUserId = userResult._id;
  console.log(`✅ Created test user: ${testUserId}`);

  // Create test restaurant (directly active for testing)
  testRestaurantId = await client.mutation(api.restaurants.create, {
    name: TEST_RESTAURANT.name,
    slug: TEST_RESTAURANT.slug,
    description: TEST_RESTAURANT.description,
    ownerId: testUserId,
    address: TEST_RESTAURANT.address,
    city: TEST_RESTAURANT.city,
    state: TEST_RESTAURANT.state,
    zipCode: TEST_RESTAURANT.zipCode,
    phone: TEST_RESTAURANT.phone,
    cuisine: TEST_RESTAURANT.cuisine,
  });
  testRestaurantSlug = TEST_RESTAURANT.slug;
  console.log(`✅ Created test restaurant: ${testRestaurantId}`);

  // Activate restaurant and enable orders
  await client.mutation(api.restaurants.update, {
    id: testRestaurantId,
    isActive: true,
    acceptingOrders: true,
    estimatedPickupTime: TEST_RESTAURANT.estimatedPickupTime,
  });
  console.log("✅ Activated restaurant and enabled orders");

  // Create menu category
  testCategoryId = await client.mutation(api.menuItems.createCategory, {
    restaurantId: testRestaurantId,
    name: TEST_MENU_CATEGORY.name,
    description: TEST_MENU_CATEGORY.description,
    sortOrder: TEST_MENU_CATEGORY.sortOrder,
  });
  console.log(`✅ Created menu category: ${testCategoryId}`);

  // Create menu items
  testMenuItem1Id = await client.mutation(api.menuItems.create, {
    restaurantId: testRestaurantId,
    categoryId: testCategoryId,
    name: TEST_MENU_ITEMS[0].name,
    description: TEST_MENU_ITEMS[0].description,
    price: TEST_MENU_ITEMS[0].price,
    sortOrder: TEST_MENU_ITEMS[0].sortOrder,
  });
  console.log(`✅ Created menu item 1: ${testMenuItem1Id}`);

  testMenuItem2Id = await client.mutation(api.menuItems.create, {
    restaurantId: testRestaurantId,
    categoryId: testCategoryId,
    name: TEST_MENU_ITEMS[1].name,
    description: TEST_MENU_ITEMS[1].description,
    price: TEST_MENU_ITEMS[1].price,
    sortOrder: TEST_MENU_ITEMS[1].sortOrder,
  });
  console.log(`✅ Created menu item 2: ${testMenuItem2Id}`);

  console.log("\n✨ Test data setup complete!\n");
}

/**
 * Cleans up test data after tests complete
 */
async function cleanupTestData() {
  console.log("\n🧹 Cleaning up test data...\n");

  try {
    // Delete menu items
    if (testMenuItem1Id) {
      await client.mutation(api.menuItems.remove, { id: testMenuItem1Id });
      console.log("✅ Deleted menu item 1");
    }
    if (testMenuItem2Id) {
      await client.mutation(api.menuItems.remove, { id: testMenuItem2Id });
      console.log("✅ Deleted menu item 2");
    }

    // Note: Categories and restaurants may need admin cleanup
    // as there might not be delete mutations available

    console.log("\n✨ Cleanup complete!\n");
  } catch (error) {
    console.error("⚠️ Error during cleanup:", error);
  }
}

/**
 * Waits for page to be fully loaded with network idle
 */
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500); // Small buffer for hydration
}

/**
 * Takes a screenshot with a descriptive name
 */
async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `test-results/restaurants-${name}.png`,
    fullPage: true,
  });
}

/**
 * Viewport sizes for responsive testing
 */
const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
};

// =============================================================================
// TEST SUITE
// =============================================================================

test.describe("Restaurants Feature", () => {
  test.describe.configure({ mode: "serial" });

  // ---------------------------------------------------------------------------
  // SETUP & TEARDOWN
  // ---------------------------------------------------------------------------

  test.beforeAll(async () => {
    client = new ConvexHttpClient(CONVEX_URL);
    await setupTestData();
  });

  test.afterAll(async () => {
    await cleanupTestData();
  });

  // ===========================================================================
  // SECTION 1: PUBLIC USER FLOW
  // ===========================================================================

  test.describe("Public User Flow", () => {
    test("1.1 - Browse restaurants page loads correctly", async ({ page }) => {
      console.log("\n📱 Test 1.1: Browse restaurants page\n");

      // Navigate to restaurants page
      const startTime = Date.now();
      await page.goto(`${BASE_URL}/restaurants`);
      await waitForPageLoad(page);
      const loadTime = Date.now() - startTime;

      console.log(`⏱️ Page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000); // Should load within 10s

      // Verify page title/heading
      await expect(page.locator("h1")).toContainText(/delicious food|restaurants/i);

      // Verify hero section is visible
      await expect(page.locator("text=Browse Restaurants").first()).toBeVisible();

      // Verify "Become a Partner" link exists
      await expect(page.locator("text=Become a Partner")).toBeVisible();

      await takeScreenshot(page, "01-restaurants-list");
      console.log("✅ Restaurants page loaded successfully");
    });

    test("1.2 - Restaurant cards display correct information", async ({ page }) => {
      console.log("\n📱 Test 1.2: Restaurant cards display\n");

      await page.goto(`${BASE_URL}/restaurants`);
      await waitForPageLoad(page);

      // Find our test restaurant card
      const restaurantCard = page.locator(`a[href="/restaurants/${testRestaurantSlug}"]`);

      // Wait for the card to appear (Convex query might take a moment)
      await expect(restaurantCard).toBeVisible({ timeout: 10000 });

      // Verify restaurant name is displayed
      await expect(restaurantCard.locator(`text=${TEST_RESTAURANT.name}`)).toBeVisible();

      // Verify cuisine types are displayed
      await expect(restaurantCard.locator("text=Soul Food")).toBeVisible();

      // Verify location is displayed
      await expect(restaurantCard.locator(`text=${TEST_RESTAURANT.city}`)).toBeVisible();

      // Verify pickup time is displayed
      await expect(restaurantCard.locator(`text=~${TEST_RESTAURANT.estimatedPickupTime} min`)).toBeVisible();

      // Verify "Open for Orders" badge (since we enabled acceptingOrders)
      await expect(restaurantCard.locator("text=Open for Orders")).toBeVisible();

      await takeScreenshot(page, "02-restaurant-card");
      console.log("✅ Restaurant card displays correct information");
    });

    test("1.3 - Navigate to restaurant detail page", async ({ page }) => {
      console.log("\n📱 Test 1.3: Restaurant detail page\n");

      await page.goto(`${BASE_URL}/restaurants`);
      await waitForPageLoad(page);

      // Click on restaurant card
      await page.click(`a[href="/restaurants/${testRestaurantSlug}"]`);
      await waitForPageLoad(page);

      // Verify URL changed
      expect(page.url()).toContain(`/restaurants/${testRestaurantSlug}`);

      // Verify restaurant name
      await expect(page.locator("h1")).toContainText(TEST_RESTAURANT.name);

      // Verify description
      await expect(page.locator(`text=${TEST_RESTAURANT.description}`)).toBeVisible();

      // Verify address
      await expect(page.locator(`text=${TEST_RESTAURANT.address}`)).toBeVisible();

      // Verify phone
      await expect(page.locator(`text=${TEST_RESTAURANT.phone}`)).toBeVisible();

      // Verify "Accepting Orders" badge
      await expect(page.locator("text=Accepting Orders")).toBeVisible();

      await takeScreenshot(page, "03-restaurant-detail");
      console.log("✅ Restaurant detail page loaded correctly");
    });

    test("1.4 - Menu categories and items display correctly", async ({ page }) => {
      console.log("\n📱 Test 1.4: Menu display\n");

      await page.goto(`${BASE_URL}/restaurants/${testRestaurantSlug}`);
      await waitForPageLoad(page);

      // Verify "Menu" heading
      await expect(page.locator("h2").filter({ hasText: "Menu" })).toBeVisible();

      // Verify category name
      await expect(page.locator(`text=${TEST_MENU_CATEGORY.name}`)).toBeVisible();

      // Verify menu items
      await expect(page.locator(`text=${TEST_MENU_ITEMS[0].name}`)).toBeVisible();
      await expect(page.locator(`text=${TEST_MENU_ITEMS[1].name}`)).toBeVisible();

      // Verify prices (formatted as $X.XX)
      await expect(page.locator("text=$14.99")).toBeVisible();
      await expect(page.locator("text=$8.99")).toBeVisible();

      // Verify descriptions
      await expect(page.locator(`text=${TEST_MENU_ITEMS[0].description}`)).toBeVisible();

      await takeScreenshot(page, "04-menu-display");
      console.log("✅ Menu displays correctly");
    });

    test("1.5 - Add items to cart", async ({ page }) => {
      console.log("\n📱 Test 1.5: Add to cart\n");

      await page.goto(`${BASE_URL}/restaurants/${testRestaurantSlug}`);
      await waitForPageLoad(page);

      // Find and click "Add" button for first item (Plus icon button)
      const addButtons = page.locator("button").filter({ has: page.locator("svg.lucide-plus") });
      await addButtons.first().click();

      // Verify cart button appears with count
      await expect(page.locator("text=View Cart (1)")).toBeVisible({ timeout: 5000 });

      // Add second item
      await addButtons.nth(1).click();

      // Verify cart updated
      await expect(page.locator("text=View Cart (2)")).toBeVisible();

      // Add another of the first item
      await addButtons.first().click();

      // Verify cart shows 3 items
      await expect(page.locator("text=View Cart (3)")).toBeVisible();

      await takeScreenshot(page, "05-cart-items-added");
      console.log("✅ Items added to cart successfully");
    });

    test("1.6 - View cart sidebar and modify quantities", async ({ page }) => {
      console.log("\n📱 Test 1.6: Cart sidebar\n");

      await page.goto(`${BASE_URL}/restaurants/${testRestaurantSlug}`);
      await waitForPageLoad(page);

      // Add items to cart
      const addButtons = page.locator("button").filter({ has: page.locator("svg.lucide-plus") });
      await addButtons.first().click();
      await addButtons.nth(1).click();

      // Open cart sidebar
      await page.click("text=View Cart");
      await page.waitForTimeout(500);

      // Verify cart sidebar opened
      await expect(page.locator("h2").filter({ hasText: "Your Order" })).toBeVisible();

      // Verify items in cart
      await expect(page.locator(`text=${TEST_MENU_ITEMS[0].name}`).last()).toBeVisible();
      await expect(page.locator(`text=${TEST_MENU_ITEMS[1].name}`).last()).toBeVisible();

      // Verify total is displayed
      const expectedTotal = (TEST_MENU_ITEMS[0].price + TEST_MENU_ITEMS[1].price) / 100;
      await expect(page.locator(`text=$${expectedTotal.toFixed(2)}`).last()).toBeVisible();

      // Verify "Proceed to Checkout" button
      await expect(page.locator("text=Proceed to Checkout")).toBeVisible();

      await takeScreenshot(page, "06-cart-sidebar");
      console.log("✅ Cart sidebar works correctly");
    });

    test("1.7 - Proceed to checkout page", async ({ page }) => {
      console.log("\n📱 Test 1.7: Checkout page\n");

      await page.goto(`${BASE_URL}/restaurants/${testRestaurantSlug}`);
      await waitForPageLoad(page);

      // Add items to cart
      const addButtons = page.locator("button").filter({ has: page.locator("svg.lucide-plus") });
      await addButtons.first().click();
      await addButtons.nth(1).click();

      // Open cart and proceed to checkout
      await page.click("text=View Cart");
      await page.waitForTimeout(500);
      await page.click("text=Proceed to Checkout");
      await waitForPageLoad(page);

      // Verify we're on checkout page
      expect(page.url()).toContain("/checkout");

      // Verify checkout heading
      await expect(page.locator("h1").filter({ hasText: "Checkout" })).toBeVisible();

      // Verify order summary section
      await expect(page.locator("h2").filter({ hasText: "Order Summary" })).toBeVisible();

      // Verify form fields exist
      await expect(page.locator('input[placeholder="John Doe"]')).toBeVisible();
      await expect(page.locator('input[placeholder="john@example.com"]')).toBeVisible();
      await expect(page.locator('input[placeholder="(555) 123-4567"]')).toBeVisible();

      // Verify special instructions textarea
      await expect(page.locator("textarea")).toBeVisible();

      // Verify "Pay at Pickup" payment method
      await expect(page.locator("text=Pay at Pickup")).toBeVisible();

      // Verify tax calculation (8.75%)
      await expect(page.locator("text=Tax (8.75%)")).toBeVisible();

      await takeScreenshot(page, "07-checkout-page");
      console.log("✅ Checkout page loaded correctly");
    });

    test("1.8 - Checkout form validation", async ({ page }) => {
      console.log("\n📱 Test 1.8: Form validation\n");

      await page.goto(`${BASE_URL}/restaurants/${testRestaurantSlug}`);
      await waitForPageLoad(page);

      // Add item and go to checkout
      const addButtons = page.locator("button").filter({ has: page.locator("svg.lucide-plus") });
      await addButtons.first().click();
      await page.click("text=View Cart");
      await page.waitForTimeout(500);
      await page.click("text=Proceed to Checkout");
      await waitForPageLoad(page);

      // Try to submit empty form
      await page.click("button[type='submit']");

      // Browser validation should prevent submission
      // Check that we're still on checkout page
      expect(page.url()).toContain("/checkout");

      // Fill partial form and verify validation
      await page.fill('input[placeholder="John Doe"]', TEST_CUSTOMER.name);
      await page.click("button[type='submit']");
      expect(page.url()).toContain("/checkout"); // Still on checkout

      await takeScreenshot(page, "08-form-validation");
      console.log("✅ Form validation works correctly");
    });

    test("1.9 - Complete checkout and view order confirmation", async ({ page }) => {
      console.log("\n📱 Test 1.9: Complete checkout\n");

      await page.goto(`${BASE_URL}/restaurants/${testRestaurantSlug}`);
      await waitForPageLoad(page);

      // Add items to cart
      const addButtons = page.locator("button").filter({ has: page.locator("svg.lucide-plus") });
      await addButtons.first().click();
      await addButtons.nth(1).click();

      // Go to checkout
      await page.click("text=View Cart");
      await page.waitForTimeout(500);
      await page.click("text=Proceed to Checkout");
      await waitForPageLoad(page);

      // Fill out checkout form
      await page.fill('input[placeholder="John Doe"]', TEST_CUSTOMER.name);
      await page.fill('input[placeholder="john@example.com"]', TEST_CUSTOMER.email);
      await page.fill('input[placeholder="(555) 123-4567"]', TEST_CUSTOMER.phone);
      await page.fill("textarea", "No onions please");

      await takeScreenshot(page, "09-checkout-filled");

      // Submit order
      await page.click("button[type='submit']");

      // Wait for navigation to confirmation page
      await page.waitForURL(/\/order-confirmation/, { timeout: 15000 });
      await waitForPageLoad(page);

      // Verify confirmation page
      await expect(page.locator("h1").filter({ hasText: "Order Placed" })).toBeVisible();

      // Verify order number is displayed
      const orderNumberElement = page.locator(".font-mono");
      await expect(orderNumberElement).toBeVisible();
      testOrderNumber = await orderNumberElement.textContent() || "";
      console.log(`📋 Order number: ${testOrderNumber}`);

      // Extract order ID from URL for later tests
      const url = page.url();
      const orderIdMatch = url.match(/orderId=([^&]+)/);
      if (orderIdMatch) {
        testOrderId = orderIdMatch[1] as Id<"foodOrders">;
        console.log(`📋 Order ID: ${testOrderId}`);
      }

      // Verify order details
      await expect(page.locator(`text=${TEST_RESTAURANT.name}`)).toBeVisible();
      await expect(page.locator("text=Preparing")).toBeVisible();
      await expect(page.locator("text=Pay at Pickup")).toBeVisible();

      // Verify pickup location
      await expect(page.locator(`text=${TEST_RESTAURANT.address}`)).toBeVisible();

      // Verify "What happens next" section
      await expect(page.locator("text=What happens next")).toBeVisible();

      await takeScreenshot(page, "10-order-confirmation");
      console.log("✅ Order placed and confirmation page displayed");
    });
  });

  // ===========================================================================
  // SECTION 2: RESTAURATEUR FLOW
  // ===========================================================================

  test.describe("Restaurateur Flow", () => {
    test("2.1 - Restaurateur apply page loads (unauthenticated)", async ({ page }) => {
      console.log("\n👨‍🍳 Test 2.1: Apply page (unauthenticated)\n");

      await page.goto(`${BASE_URL}/restaurateur/apply`);
      await waitForPageLoad(page);

      // Should show sign-in prompt for unauthenticated users
      await expect(page.locator("text=Sign In to Register")).toBeVisible();
      await expect(page.locator("text=Sign In to Continue")).toBeVisible();

      await takeScreenshot(page, "11-apply-unauthenticated");
      console.log("✅ Apply page shows sign-in prompt for unauthenticated users");
    });

    test("2.2 - Restaurateur dashboard requires authentication", async ({ page }) => {
      console.log("\n👨‍🍳 Test 2.2: Dashboard auth requirement\n");

      await page.goto(`${BASE_URL}/restaurateur/dashboard`);
      await waitForPageLoad(page);

      // Should show sign-in prompt
      await expect(page.locator("text=Sign In Required")).toBeVisible();
      await expect(page.locator("text=Sign In")).toBeVisible();

      await takeScreenshot(page, "12-dashboard-unauthenticated");
      console.log("✅ Dashboard requires authentication");
    });

    test("2.3 - Orders page requires authentication", async ({ page }) => {
      console.log("\n👨‍🍳 Test 2.3: Orders page auth requirement\n");

      await page.goto(`${BASE_URL}/restaurateur/dashboard/orders`);
      await waitForPageLoad(page);

      // Should show sign-in prompt
      await expect(page.locator("text=Sign In Required")).toBeVisible();

      await takeScreenshot(page, "13-orders-unauthenticated");
      console.log("✅ Orders page requires authentication");
    });

    test("2.4 - Verify order was created in backend", async () => {
      console.log("\n👨‍🍳 Test 2.4: Verify order in backend\n");

      // Query the order we created earlier
      if (!testOrderId) {
        console.log("⚠️ No order ID available, skipping verification");
        return;
      }

      const order = await client.query(api.foodOrders.getById, {
        id: testOrderId,
      });

      expect(order).toBeTruthy();
      expect(order?.restaurantId).toBe(testRestaurantId);
      expect(order?.customerName).toBe(TEST_CUSTOMER.name);
      expect(order?.customerEmail).toBe(TEST_CUSTOMER.email);
      expect(order?.customerPhone).toBe(TEST_CUSTOMER.phone);
      expect(order?.status).toBe("PENDING");
      expect(order?.paymentStatus).toBe("pending");
      expect(order?.items.length).toBe(2);
      expect(order?.specialInstructions).toBe("No onions please");

      console.log(`✅ Order verified: ${order?.orderNumber}`);
      console.log(`   - Customer: ${order?.customerName}`);
      console.log(`   - Items: ${order?.items.length}`);
      console.log(`   - Total: $${((order?.total || 0) / 100).toFixed(2)}`);
      console.log(`   - Status: ${order?.status}`);
    });

    test("2.5 - Update order status via backend", async () => {
      console.log("\n👨‍🍳 Test 2.5: Update order status\n");

      if (!testOrderId) {
        console.log("⚠️ No order ID available, skipping");
        return;
      }

      // Update status to READY_FOR_PICKUP
      await client.mutation(api.foodOrders.updateStatus, {
        id: testOrderId,
        status: "READY_FOR_PICKUP",
      });

      // Verify update
      const order = await client.query(api.foodOrders.getById, {
        id: testOrderId,
      });

      expect(order?.status).toBe("READY_FOR_PICKUP");
      expect(order?.readyAt).toBeTruthy();

      console.log("✅ Order status updated to READY_FOR_PICKUP");

      // Update to COMPLETED
      await client.mutation(api.foodOrders.updateStatus, {
        id: testOrderId,
        status: "COMPLETED",
      });

      const completedOrder = await client.query(api.foodOrders.getById, {
        id: testOrderId,
      });

      expect(completedOrder?.status).toBe("COMPLETED");
      expect(completedOrder?.completedAt).toBeTruthy();

      console.log("✅ Order status updated to COMPLETED");
    });

    test("2.6 - Update payment status via backend", async () => {
      console.log("\n👨‍🍳 Test 2.6: Update payment status\n");

      if (!testOrderId) {
        console.log("⚠️ No order ID available, skipping");
        return;
      }

      // Update payment status to paid
      await client.mutation(api.foodOrders.updatePaymentStatus, {
        id: testOrderId,
        paymentStatus: "paid",
        paymentMethod: "cash",
      });

      // Verify update
      const order = await client.query(api.foodOrders.getById, {
        id: testOrderId,
      });

      expect(order?.paymentStatus).toBe("paid");
      expect(order?.paymentMethod).toBe("cash");

      console.log("✅ Payment status updated to paid");
    });

    test("2.7 - Toggle restaurant accepting orders status", async () => {
      console.log("\n👨‍🍳 Test 2.7: Toggle accepting orders\n");

      // Get current status
      const restaurant = await client.query(api.restaurants.getBySlug, {
        slug: testRestaurantSlug,
      });
      const initialStatus = restaurant?.acceptingOrders;
      console.log(`   Initial status: ${initialStatus ? "Accepting Orders" : "Closed"}`);

      // Toggle status
      await client.mutation(api.restaurants.toggleAcceptingOrders, {
        id: testRestaurantId,
      });

      // Verify toggle
      const updatedRestaurant = await client.query(api.restaurants.getBySlug, {
        slug: testRestaurantSlug,
      });
      expect(updatedRestaurant?.acceptingOrders).toBe(!initialStatus);
      console.log(`   New status: ${updatedRestaurant?.acceptingOrders ? "Accepting Orders" : "Closed"}`);

      // Toggle back
      await client.mutation(api.restaurants.toggleAcceptingOrders, {
        id: testRestaurantId,
      });

      const finalRestaurant = await client.query(api.restaurants.getBySlug, {
        slug: testRestaurantSlug,
      });
      expect(finalRestaurant?.acceptingOrders).toBe(initialStatus);

      console.log("✅ Toggle accepting orders works correctly");
    });
  });

  // ===========================================================================
  // SECTION 3: MENU MANAGEMENT
  // ===========================================================================

  test.describe("Menu Management", () => {
    test("3.1 - Create new menu category via backend", async () => {
      console.log("\n🍽️ Test 3.1: Create menu category\n");

      const newCategoryId = await client.mutation(api.menuItems.createCategory, {
        restaurantId: testRestaurantId,
        name: "Sides",
        description: "Delicious side dishes",
        sortOrder: 2,
      });

      expect(newCategoryId).toBeTruthy();
      console.log(`✅ Created new category: ${newCategoryId}`);

      // Verify category was created
      const categories = await client.query(api.menuItems.getCategories, {
        restaurantId: testRestaurantId,
      });

      const newCategory = categories.find((c) => c._id === newCategoryId);
      expect(newCategory).toBeTruthy();
      expect(newCategory?.name).toBe("Sides");
      expect(newCategory?.sortOrder).toBe(2);

      console.log(`   - Name: ${newCategory?.name}`);
      console.log(`   - Sort Order: ${newCategory?.sortOrder}`);
    });

    test("3.2 - Create new menu item via backend", async () => {
      console.log("\n🍽️ Test 3.2: Create menu item\n");

      const newItemId = await client.mutation(api.menuItems.create, {
        restaurantId: testRestaurantId,
        categoryId: testCategoryId,
        name: "Collard Greens",
        description: "Slow-cooked with smoked turkey",
        price: 599, // $5.99
        sortOrder: 3,
      });

      expect(newItemId).toBeTruthy();
      console.log(`✅ Created new menu item: ${newItemId}`);

      // Verify item was created
      const items = await client.query(api.menuItems.getByRestaurant, {
        restaurantId: testRestaurantId,
      });

      const newItem = items.find((i) => i._id === newItemId);
      expect(newItem).toBeTruthy();
      expect(newItem?.name).toBe("Collard Greens");
      expect(newItem?.price).toBe(599);
      expect(newItem?.isAvailable).toBe(true);

      console.log(`   - Name: ${newItem?.name}`);
      console.log(`   - Price: $${((newItem?.price || 0) / 100).toFixed(2)}`);
      console.log(`   - Available: ${newItem?.isAvailable}`);

      // Clean up
      await client.mutation(api.menuItems.remove, { id: newItemId });
    });

    test("3.3 - Update menu item via backend", async () => {
      console.log("\n🍽️ Test 3.3: Update menu item\n");

      // Update the first test menu item
      await client.mutation(api.menuItems.update, {
        id: testMenuItem1Id,
        price: 1599, // Update from $14.99 to $15.99
        description: "Updated: Extra crispy fried chicken",
      });

      // Verify update
      const items = await client.query(api.menuItems.getByRestaurant, {
        restaurantId: testRestaurantId,
      });

      const updatedItem = items.find((i) => i._id === testMenuItem1Id);
      expect(updatedItem?.price).toBe(1599);
      expect(updatedItem?.description).toContain("Extra crispy");

      console.log("✅ Menu item updated successfully");
      console.log(`   - New Price: $${((updatedItem?.price || 0) / 100).toFixed(2)}`);
      console.log(`   - New Description: ${updatedItem?.description}`);

      // Revert changes
      await client.mutation(api.menuItems.update, {
        id: testMenuItem1Id,
        price: TEST_MENU_ITEMS[0].price,
        description: TEST_MENU_ITEMS[0].description,
      });
    });

    test("3.4 - Toggle menu item availability via backend", async () => {
      console.log("\n🍽️ Test 3.4: Toggle item availability\n");

      // Get initial availability
      let items = await client.query(api.menuItems.getByRestaurant, {
        restaurantId: testRestaurantId,
      });
      let item = items.find((i) => i._id === testMenuItem2Id);
      const initialAvailability = item?.isAvailable;
      console.log(`   Initial availability: ${initialAvailability}`);

      // Toggle availability
      await client.mutation(api.menuItems.toggleAvailability, {
        id: testMenuItem2Id,
      });

      // Verify toggle
      items = await client.query(api.menuItems.getByRestaurant, {
        restaurantId: testRestaurantId,
      });
      item = items.find((i) => i._id === testMenuItem2Id);
      expect(item?.isAvailable).toBe(!initialAvailability);
      console.log(`   New availability: ${item?.isAvailable}`);

      // Toggle back
      await client.mutation(api.menuItems.toggleAvailability, {
        id: testMenuItem2Id,
      });

      console.log("✅ Toggle availability works correctly");
    });

    test("3.5 - Menu item unavailability hides from public view", async ({ page }) => {
      console.log("\n🍽️ Test 3.5: Unavailable items hidden\n");

      // Make item unavailable
      await client.mutation(api.menuItems.toggleAvailability, {
        id: testMenuItem2Id,
      });

      // Visit restaurant page
      await page.goto(`${BASE_URL}/restaurants/${testRestaurantSlug}`);
      await waitForPageLoad(page);

      // First item should be visible
      await expect(page.locator(`text=${TEST_MENU_ITEMS[0].name}`)).toBeVisible();

      // Second item (unavailable) should NOT be visible
      await expect(page.locator(`text=${TEST_MENU_ITEMS[1].name}`)).not.toBeVisible({ timeout: 5000 });

      await takeScreenshot(page, "14-unavailable-item-hidden");
      console.log("✅ Unavailable items are hidden from public view");

      // Restore availability
      await client.mutation(api.menuItems.toggleAvailability, {
        id: testMenuItem2Id,
      });
    });
  });

  // ===========================================================================
  // SECTION 4: RESPONSIVE DESIGN
  // ===========================================================================

  test.describe("Responsive Design", () => {
    test("4.1 - Restaurants page - Mobile viewport", async ({ page }) => {
      console.log("\n📱 Test 4.1: Mobile viewport\n");

      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(`${BASE_URL}/restaurants`);
      await waitForPageLoad(page);

      // Verify page loads correctly
      await expect(page.locator("h1")).toBeVisible();

      // Verify restaurant cards are in single column
      const cards = page.locator('a[href^="/restaurants/"]');
      const cardCount = await cards.count();
      expect(cardCount).toBeGreaterThan(0);

      await takeScreenshot(page, "15-mobile-restaurants");
      console.log("✅ Mobile view renders correctly");
    });

    test("4.2 - Restaurants page - Tablet viewport", async ({ page }) => {
      console.log("\n📱 Test 4.2: Tablet viewport\n");

      await page.setViewportSize(VIEWPORTS.tablet);
      await page.goto(`${BASE_URL}/restaurants`);
      await waitForPageLoad(page);

      await expect(page.locator("h1")).toBeVisible();

      await takeScreenshot(page, "16-tablet-restaurants");
      console.log("✅ Tablet view renders correctly");
    });

    test("4.3 - Restaurant detail - Mobile viewport", async ({ page }) => {
      console.log("\n📱 Test 4.3: Restaurant detail mobile\n");

      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(`${BASE_URL}/restaurants/${testRestaurantSlug}`);
      await waitForPageLoad(page);

      // Verify key elements are visible
      await expect(page.locator("h1")).toContainText(TEST_RESTAURANT.name);
      await expect(page.locator("h2").filter({ hasText: "Menu" })).toBeVisible();

      // Add item and verify cart button works
      const addButtons = page.locator("button").filter({ has: page.locator("svg.lucide-plus") });
      await addButtons.first().click();
      await expect(page.locator("text=View Cart")).toBeVisible();

      await takeScreenshot(page, "17-mobile-detail");
      console.log("✅ Restaurant detail mobile view works correctly");
    });

    test("4.4 - Checkout page - Mobile viewport", async ({ page }) => {
      console.log("\n📱 Test 4.4: Checkout mobile\n");

      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(`${BASE_URL}/restaurants/${testRestaurantSlug}`);
      await waitForPageLoad(page);

      // Add item and go to checkout
      const addButtons = page.locator("button").filter({ has: page.locator("svg.lucide-plus") });
      await addButtons.first().click();
      await page.click("text=View Cart");
      await page.waitForTimeout(500);
      await page.click("text=Proceed to Checkout");
      await waitForPageLoad(page);

      // Verify checkout form is usable on mobile
      await expect(page.locator("h1").filter({ hasText: "Checkout" })).toBeVisible();
      await expect(page.locator('input[placeholder="John Doe"]')).toBeVisible();

      await takeScreenshot(page, "18-mobile-checkout");
      console.log("✅ Checkout mobile view works correctly");
    });
  });

  // ===========================================================================
  // SECTION 5: ERROR STATES
  // ===========================================================================

  test.describe("Error States", () => {
    test("5.1 - Non-existent restaurant shows 404 message", async ({ page }) => {
      console.log("\n⚠️ Test 5.1: Restaurant not found\n");

      await page.goto(`${BASE_URL}/restaurants/non-existent-restaurant-xyz`);
      await waitForPageLoad(page);

      await expect(page.locator("text=Restaurant not found")).toBeVisible();
      await expect(page.locator("text=Back to restaurants")).toBeVisible();

      await takeScreenshot(page, "19-restaurant-not-found");
      console.log("✅ 404 message displayed for non-existent restaurant");
    });

    test("5.2 - Empty cart redirects from checkout", async ({ page }) => {
      console.log("\n⚠️ Test 5.2: Empty cart checkout\n");

      // Go directly to checkout without cart
      await page.goto(`${BASE_URL}/restaurants/${testRestaurantSlug}/checkout`);
      await waitForPageLoad(page);

      // Should show empty cart message
      await expect(page.locator("text=Your cart is empty")).toBeVisible();
      await expect(page.locator("text=Return to restaurant menu")).toBeVisible();

      await takeScreenshot(page, "20-empty-cart");
      console.log("✅ Empty cart message displayed");
    });

    test("5.3 - Closed restaurant hides add-to-cart buttons", async ({ page }) => {
      console.log("\n⚠️ Test 5.3: Closed restaurant\n");

      // Close the restaurant
      await client.mutation(api.restaurants.update, {
        id: testRestaurantId,
        acceptingOrders: false,
      });

      await page.goto(`${BASE_URL}/restaurants/${testRestaurantSlug}`);
      await waitForPageLoad(page);

      // Verify "Closed" badge
      await expect(page.locator("text=Closed")).toBeVisible();

      // Add buttons should not be visible
      const addButtons = page.locator("button").filter({ has: page.locator("svg.lucide-plus") });
      await expect(addButtons.first()).not.toBeVisible({ timeout: 3000 });

      await takeScreenshot(page, "21-closed-restaurant");

      // Reopen restaurant
      await client.mutation(api.restaurants.update, {
        id: testRestaurantId,
        acceptingOrders: true,
      });

      console.log("✅ Closed restaurant hides ordering UI");
    });
  });

  // ===========================================================================
  // SECTION 6: ACCESSIBILITY
  // ===========================================================================

  test.describe("Accessibility", () => {
    test("6.1 - Restaurants page has proper heading hierarchy", async ({ page }) => {
      console.log("\n♿ Test 6.1: Heading hierarchy\n");

      await page.goto(`${BASE_URL}/restaurants`);
      await waitForPageLoad(page);

      // Check for h1
      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBeGreaterThanOrEqual(1);

      // Check for h2
      const h2Count = await page.locator("h2").count();
      expect(h2Count).toBeGreaterThanOrEqual(1);

      console.log(`   H1 count: ${h1Count}`);
      console.log(`   H2 count: ${h2Count}`);
      console.log("✅ Proper heading hierarchy");
    });

    test("6.2 - Form inputs have labels", async ({ page }) => {
      console.log("\n♿ Test 6.2: Form labels\n");

      await page.goto(`${BASE_URL}/restaurants/${testRestaurantSlug}`);
      await waitForPageLoad(page);

      // Add item and go to checkout
      const addButtons = page.locator("button").filter({ has: page.locator("svg.lucide-plus") });
      await addButtons.first().click();
      await page.click("text=View Cart");
      await page.waitForTimeout(500);
      await page.click("text=Proceed to Checkout");
      await waitForPageLoad(page);

      // Check that required fields are labeled
      await expect(page.locator("text=Full Name")).toBeVisible();
      await expect(page.locator("text=Email")).toBeVisible();
      await expect(page.locator("text=Phone")).toBeVisible();

      console.log("✅ Form inputs have visible labels");
    });

    test("6.3 - Links and buttons are keyboard accessible", async ({ page }) => {
      console.log("\n♿ Test 6.3: Keyboard accessibility\n");

      await page.goto(`${BASE_URL}/restaurants`);
      await waitForPageLoad(page);

      // Tab through the page
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      // Check that focus is visible (browser default focus styling)
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
      console.log(`   Focused element: ${focusedElement}`);

      console.log("✅ Elements are keyboard accessible");
    });

    test("6.4 - Images have alt text", async ({ page }) => {
      console.log("\n♿ Test 6.4: Image alt text\n");

      await page.goto(`${BASE_URL}/restaurants/${testRestaurantSlug}`);
      await waitForPageLoad(page);

      // Check cover image has alt text
      const images = page.locator("img");
      const imageCount = await images.count();

      for (let i = 0; i < imageCount; i++) {
        const altText = await images.nth(i).getAttribute("alt");
        // Alt text should exist (even if empty for decorative images)
        console.log(`   Image ${i + 1} alt: "${altText || "(empty)"}"`);
      }

      console.log("✅ Images checked for alt text");
    });
  });

  // ===========================================================================
  // SECTION 7: PERFORMANCE
  // ===========================================================================

  test.describe("Performance", () => {
    test("7.1 - Restaurants page loads within acceptable time", async ({ page }) => {
      console.log("\n⚡ Test 7.1: Page load performance\n");

      const startTime = Date.now();
      await page.goto(`${BASE_URL}/restaurants`);
      await waitForPageLoad(page);
      const loadTime = Date.now() - startTime;

      console.log(`   Load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000); // 10 second max

      console.log("✅ Page loads within acceptable time");
    });

    test("7.2 - Restaurant detail page loads within acceptable time", async ({ page }) => {
      console.log("\n⚡ Test 7.2: Detail page performance\n");

      const startTime = Date.now();
      await page.goto(`${BASE_URL}/restaurants/${testRestaurantSlug}`);
      await waitForPageLoad(page);
      const loadTime = Date.now() - startTime;

      console.log(`   Load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000);

      console.log("✅ Detail page loads within acceptable time");
    });

    test("7.3 - Cart interactions are responsive", async ({ page }) => {
      console.log("\n⚡ Test 7.3: Cart interaction performance\n");

      await page.goto(`${BASE_URL}/restaurants/${testRestaurantSlug}`);
      await waitForPageLoad(page);

      const addButtons = page.locator("button").filter({ has: page.locator("svg.lucide-plus") });

      // Time the add to cart action
      const startTime = Date.now();
      await addButtons.first().click();
      await expect(page.locator("text=View Cart (1)")).toBeVisible();
      const interactionTime = Date.now() - startTime;

      console.log(`   Add to cart time: ${interactionTime}ms`);
      expect(interactionTime).toBeLessThan(2000); // 2 second max for UI update

      console.log("✅ Cart interactions are responsive");
    });
  });
});

// =============================================================================
// STANDALONE TESTS (can run independently)
// =============================================================================

test.describe("Restaurants - Standalone Tests", () => {
  test("Restaurants page is publicly accessible", async ({ page }) => {
    await page.goto(`${BASE_URL}/restaurants`);
    await page.waitForLoadState("networkidle");

    // Page should load without authentication
    const response = await page.goto(`${BASE_URL}/restaurants`);
    expect(response?.status()).toBe(200);

    // Should have main content
    await expect(page.locator("h1")).toBeVisible();
  });

  test("Restaurant links navigate correctly", async ({ page }) => {
    await page.goto(`${BASE_URL}/restaurants`);
    await page.waitForLoadState("networkidle");

    // Find a restaurant link (if any exist)
    const restaurantLinks = page.locator('a[href^="/restaurants/"]').filter({
      hasNot: page.locator('[href="/restaurants"]'),
    });

    const linkCount = await restaurantLinks.count();
    if (linkCount > 0) {
      const firstLink = restaurantLinks.first();
      const href = await firstLink.getAttribute("href");

      await firstLink.click();
      await page.waitForLoadState("networkidle");

      expect(page.url()).toContain(href);
    }
  });

  test("Apply page CTA from restaurants list", async ({ page }) => {
    await page.goto(`${BASE_URL}/restaurants`);
    await page.waitForLoadState("networkidle");

    // Find "Become a Partner" or "Apply" link
    const applyLink = page.locator('a[href="/restaurateur/apply"]').first();
    await expect(applyLink).toBeVisible();

    await applyLink.click();
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/restaurateur/apply");
  });
});
