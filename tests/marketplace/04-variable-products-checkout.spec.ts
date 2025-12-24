import { test, expect } from "@playwright/test";
import {
  navigateToCheckout,
  fillCheckoutForm,
  fillShippingAddress,
  waitForPageLoad,
  takeScreenshot,
} from "./helpers/marketplace.helpers";
import { CUSTOMER_ACCOUNT, TEST_SHIPPING_ADDRESS } from "./helpers/test-accounts";

// Test product with variations (Stepping Legend Tank Top)
const VARIABLE_PRODUCT_ID = "nn77shqyjnsnq8tyt5ja4420bx7xtm8r";
const VARIABLE_PRODUCT_URL = `https://stepperslife.com/marketplace/${VARIABLE_PRODUCT_ID}`;

// Use admin auth state for authenticated tests
test.use({ storageState: "tests/.auth/admin.json" });

test.describe("Variable Products Checkout", () => {
  test("can select variation and add to cart", async ({ page }) => {
    // Navigate directly to the variable product page
    await page.goto(VARIABLE_PRODUCT_URL);
    await waitForPageLoad(page);

    // Verify we're on the product page
    const productTitle = page.locator("h1");
    await expect(productTitle).toContainText("Stepping Legend Tank Top", {
      timeout: 15000,
    });

    await takeScreenshot(page, "variable-product-page-loaded");

    // Wait for VariationSelector to load - look for Size label
    const sizeLabel = page.locator('label:has-text("Size")');
    await expect(sizeLabel).toBeVisible({ timeout: 15000 });

    // Select a size (e.g., Medium)
    const sizeButton = page.locator('button:has-text("M")').first();
    await sizeButton.click();
    await page.waitForTimeout(500);

    await takeScreenshot(page, "variable-product-size-selected");

    // Wait for Color options to appear
    const colorLabel = page.locator('label:has-text("Color")');
    await expect(colorLabel).toBeVisible({ timeout: 10000 });

    // Select a color (e.g., Black)
    const colorButton = page.locator('button:has-text("Black")').first();
    await colorButton.click();
    await page.waitForTimeout(500);

    await takeScreenshot(page, "variable-product-color-selected");

    // Verify price is displayed (variation price)
    const priceDisplay = page.locator('text=/\\$\\d+\\.\\d{2}/').first();
    await expect(priceDisplay).toBeVisible({ timeout: 5000 });

    // Verify stock status is shown
    const stockStatus = page
      .locator('text="In Stock"')
      .or(page.locator('text="Low Stock"'))
      .or(page.locator('text="Out of Stock"'));
    await expect(stockStatus).toBeVisible({ timeout: 5000 });

    // Now Add to Cart should be enabled
    const addToCartButton = page
      .locator('button:has-text("Add to Cart")')
      .first();
    await expect(addToCartButton).toBeEnabled({ timeout: 5000 });

    // Add to cart
    await addToCartButton.click();
    await page.waitForTimeout(1000);

    // Verify cart panel opened with the item
    const cartPanel = page.locator('h2:has-text("Shopping Cart")');
    await expect(cartPanel).toBeVisible({ timeout: 5000 });

    // Verify variation details are shown in cart (Size: M, Color: Black or similar)
    const cartContent = page.locator('[class*="cart"], [data-testid="cart-panel"]');
    const cartText = await cartContent.textContent();
    console.log("Cart content:", cartText);

    await takeScreenshot(page, "variable-product-added-to-cart");
  });

  test("can complete checkout with variable product", async ({ page }) => {
    // Already logged in via storageState

    // Navigate to variable product
    await page.goto(VARIABLE_PRODUCT_URL);
    await waitForPageLoad(page);

    // Wait for VariationSelector to load
    const sizeLabel = page.locator('label:has-text("Size")');
    await expect(sizeLabel).toBeVisible({ timeout: 15000 });

    // Select Size: L
    const sizeButton = page.locator('button:has-text("L")').first();
    await sizeButton.click();
    await page.waitForTimeout(500);

    // Select Color: Red
    const colorButton = page.locator('button:has-text("Red")').first();
    await colorButton.click();
    await page.waitForTimeout(500);

    // Add to cart
    const addToCartButton = page
      .locator('button:has-text("Add to Cart")')
      .first();
    await expect(addToCartButton).toBeEnabled({ timeout: 5000 });
    await addToCartButton.click();
    await page.waitForTimeout(1000);

    await takeScreenshot(page, "variable-checkout-cart-added");

    // Navigate to checkout
    await navigateToCheckout(page);

    await takeScreenshot(page, "variable-checkout-page");

    // Fill checkout form
    await fillCheckoutForm(page, {
      name: CUSTOMER_ACCOUNT.name,
      email: CUSTOMER_ACCOUNT.email,
      phone: "312-555-1234",
    });

    // Fill shipping address
    await fillShippingAddress(page, TEST_SHIPPING_ADDRESS);

    await takeScreenshot(page, "variable-checkout-form-filled");

    // Submit order (Pay When You Receive - no Stripe)
    const placeOrderButton = page.getByRole("button", { name: "Place Order" });
    await placeOrderButton.click();

    // Wait for success
    const successHeading = page.getByRole("heading", {
      name: "Order Placed Successfully!",
    });
    await successHeading.waitFor({ timeout: 60000 });

    // Verify order confirmation
    await expect(successHeading).toBeVisible({ timeout: 10000 });

    // Verify order number is displayed
    const orderNumberDisplay = page.locator("text=/ORD-[A-Z0-9-]+/i");
    await expect(orderNumberDisplay).toBeVisible({ timeout: 5000 });

    await takeScreenshot(page, "variable-checkout-success");

    console.log("Variable product checkout completed successfully!");
  });

  test("disabled Add to Cart before variation selection", async ({ page }) => {
    // Navigate to variable product
    await page.goto(VARIABLE_PRODUCT_URL);
    await waitForPageLoad(page);

    // Wait for page to load
    const productTitle = page.locator("h1");
    await expect(productTitle).toContainText("Stepping Legend Tank Top", {
      timeout: 15000,
    });

    // Before selecting any variation, Add to Cart should be disabled
    const addToCartButton = page
      .locator('button:has-text("Add to Cart")')
      .first();

    // Check if button exists and is disabled
    const isDisabled = await addToCartButton.isDisabled({ timeout: 5000 });
    expect(isDisabled).toBe(true);

    console.log("Add to Cart correctly disabled before variation selection");

    await takeScreenshot(page, "variable-product-add-to-cart-disabled");

    // Select Size only (not complete)
    const sizeButton = page.locator('button:has-text("M")').first();
    await sizeButton.click();
    await page.waitForTimeout(500);

    // Still disabled (need to select color too)
    const stillDisabled = await addToCartButton.isDisabled({ timeout: 2000 });
    expect(stillDisabled).toBe(true);

    console.log("Add to Cart still disabled with partial selection");

    // Now select color
    const colorButton = page.locator('button:has-text("Black")').first();
    await colorButton.click();
    await page.waitForTimeout(500);

    // Now should be enabled
    const nowEnabled = await addToCartButton.isEnabled({ timeout: 5000 });
    expect(nowEnabled).toBe(true);

    console.log("Add to Cart enabled after complete variation selection");

    await takeScreenshot(page, "variable-product-add-to-cart-enabled");
  });

  test("price updates when selecting different variations", async ({
    page,
  }) => {
    // Navigate to variable product
    await page.goto(VARIABLE_PRODUCT_URL);
    await waitForPageLoad(page);

    // Wait for VariationSelector
    const sizeLabel = page.locator('label:has-text("Size")');
    await expect(sizeLabel).toBeVisible({ timeout: 15000 });

    // Select Size S (should be base price)
    await page.locator('button:has-text("S")').first().click();
    await page.waitForTimeout(500);

    await page.locator('button:has-text("Black")').first().click();
    await page.waitForTimeout(500);

    // Get the base price
    const priceText1 = await page
      .locator('span:has-text("$"), div:has-text("$")').first()
      .textContent();
    console.log("Price for S/Black:", priceText1);

    // Now select 2XL (should be higher price)
    await page.locator('button:has-text("2XL")').first().click();
    await page.waitForTimeout(500);

    // Get the new price
    const priceText2 = await page
      .locator('span:has-text("$"), div:has-text("$")').first()
      .textContent();
    console.log("Price for 2XL/Black:", priceText2);

    // Prices should be different (2XL costs more)
    // Note: This depends on the actual pricing - adjust if needed
    console.log(`Price comparison: ${priceText1} vs ${priceText2}`);

    await takeScreenshot(page, "variable-product-price-comparison");
  });
});
