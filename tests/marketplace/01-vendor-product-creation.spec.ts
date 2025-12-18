import { test, expect } from "@playwright/test";
import {
  loginAsVendor,
  navigateToProductCreation,
  fillProductForm,
  submitProductAndWait,
  navigateToMarketplace,
  waitForPageLoad,
  takeScreenshot,
} from "./helpers/marketplace.helpers";
import { TEST_PRODUCT_DATA, generateUniqueProductName } from "./helpers/test-accounts";

test.describe("Vendor Product Creation", () => {
  let createdProductName: string;

  test.beforeEach(async ({ page }) => {
    // Generate unique product name for this test run
    createdProductName = generateUniqueProductName();
  });

  test("vendor can login and access product creation page", async ({ page }) => {
    // Step 1: Login as vendor
    const loginSuccess = await loginAsVendor(page);
    expect(loginSuccess).toBe(true);

    // Step 2: Navigate to product creation
    await navigateToProductCreation(page);

    // Verify we're on the create product page
    const pageTitle = page.locator("h1, h2").filter({ hasText: /add|create|new.*product/i }).first();
    await expect(pageTitle).toBeVisible({ timeout: 10000 });

    await takeScreenshot(page, "vendor-product-creation-page");
  });

  test("vendor can create a new product with full details", async ({ page }) => {
    // Step 1: Login as vendor
    const loginSuccess = await loginAsVendor(page);
    expect(loginSuccess).toBe(true);

    // Step 2: Navigate to product creation
    await navigateToProductCreation(page);

    // Step 3: Fill product form with unique data
    const productData = {
      ...TEST_PRODUCT_DATA,
      name: createdProductName,
    };

    await fillProductForm(page, productData);

    // Take screenshot before submission
    await takeScreenshot(page, "vendor-product-form-filled");

    // Step 4: Submit the product
    const productId = await submitProductAndWait(page);

    // Verify success
    const successIndicator = page.locator('text="Product created"')
      .or(page.locator('text="successfully"'))
      .or(page.locator('text="Success"'));

    await expect(successIndicator).toBeVisible({ timeout: 15000 });

    await takeScreenshot(page, "vendor-product-created-success");

    console.log(`Product created: ${createdProductName} (ID: ${productId || "unknown"})`);
  });

  test("newly created product appears in marketplace", async ({ page }) => {
    // Step 1: Login as vendor
    const loginSuccess = await loginAsVendor(page);
    expect(loginSuccess).toBe(true);

    // Step 2: Create a product
    await navigateToProductCreation(page);

    const productData = {
      ...TEST_PRODUCT_DATA,
      name: createdProductName,
    };

    await fillProductForm(page, productData);
    await submitProductAndWait(page);

    // Wait for product to be indexed
    await page.waitForTimeout(3000);

    // Step 3: Navigate to marketplace
    await navigateToMarketplace(page);

    // Step 4: Search/look for the product
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill(createdProductName);
      await page.waitForTimeout(2000);
    }

    // Step 5: Verify product appears in marketplace
    // Look for the product name in headings (h3 elements contain product names)
    const productHeading = page.locator(`h3:has-text("${createdProductName}")`).first()
      .or(page.locator(`text="${createdProductName}"`).first());

    await expect(productHeading).toBeVisible({ timeout: 15000 });

    await takeScreenshot(page, "vendor-product-in-marketplace");

    console.log(`Product "${createdProductName}" verified in marketplace`);
  });

  test("vendor can view product in their dashboard", async ({ page }) => {
    // Step 1: Login as vendor
    const loginSuccess = await loginAsVendor(page);
    expect(loginSuccess).toBe(true);

    // Step 2: Create a product
    await navigateToProductCreation(page);

    const productData = {
      ...TEST_PRODUCT_DATA,
      name: createdProductName,
    };

    await fillProductForm(page, productData);
    await submitProductAndWait(page);

    // Step 3: Navigate to vendor products list
    await page.goto("/vendor/dashboard/products");
    await waitForPageLoad(page);

    // Step 4: Verify product appears in vendor's product list
    const productRow = page.locator(`text="${createdProductName}"`).first();
    await expect(productRow).toBeVisible({ timeout: 15000 });

    await takeScreenshot(page, "vendor-product-in-dashboard");

    console.log(`Product "${createdProductName}" verified in vendor dashboard`);
  });

  test("full product creation process with all fields", async ({ page }) => {
    // Comprehensive test covering all form fields

    // Step 1: Login as vendor
    const loginSuccess = await loginAsVendor(page);
    expect(loginSuccess).toBe(true);

    // Step 2: Navigate to product creation
    await navigateToProductCreation(page);

    // Step 3: Fill ALL product fields
    const fullProductData = {
      name: createdProductName,
      description: "This is a comprehensive E2E test product. It includes full details to verify the complete product creation flow works correctly with all fields populated.",
      price: 49.99,
      category: "Apparel & Fashion",
      inventoryQuantity: 25,
      status: "ACTIVE" as const,
    };

    // Fill basic fields
    await fillProductForm(page, fullProductData);

    // Check for and fill any additional fields that might be present
    const weightInput = page.locator('input[name="weight"]');
    if (await weightInput.isVisible().catch(() => false)) {
      await weightInput.fill("1.5");
    }

    const skuInput = page.locator('input[name="sku"]');
    if (await skuInput.isVisible().catch(() => false)) {
      await skuInput.fill(`E2E-${Date.now()}`);
    }

    await takeScreenshot(page, "vendor-full-product-form");

    // Step 4: Submit
    await page.click('button[type="submit"]');

    // Wait for success
    await page.waitForTimeout(3000);

    // Verify success
    const successIndicator = page.locator('text="Product created"')
      .or(page.locator('text="successfully"'))
      .or(page.locator('text="Success"'));

    // Either success message or redirect to products list
    const urlChanged = page.url().includes("/products") && !page.url().includes("/create");
    const hasSuccessMessage = await successIndicator.isVisible({ timeout: 5000 }).catch(() => false);

    expect(urlChanged || hasSuccessMessage).toBe(true);

    await takeScreenshot(page, "vendor-full-product-success");

    // Step 5: Verify in marketplace
    await navigateToMarketplace(page);
    await page.waitForTimeout(2000);

    // Search for product
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill(createdProductName);
      await page.waitForTimeout(2000);
    }

    const productVisible = await page.locator(`text="${createdProductName}"`).first()
      .isVisible({ timeout: 15000 })
      .catch(() => false);

    expect(productVisible).toBe(true);

    console.log(`Full product creation test completed: ${createdProductName}`);
  });
});
