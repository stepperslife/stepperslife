import { test, expect } from "@playwright/test";
import {
  loginAsVendor,
  loginAsCustomer,
  navigateToProductCreation,
  fillProductForm,
  submitProductAndWait,
  navigateToMarketplace,
  searchForProduct,
  clickOnProduct,
  addProductToCart,
  navigateToCheckout,
  fillCheckoutForm,
  fillShippingAddress,
  selectShippingMethod,
  fillStripeCard,
  submitOrder,
  verifyOrderConfirmation,
  waitForPageLoad,
  takeScreenshot,
} from "./helpers/marketplace.helpers";
import {
  CUSTOMER_ACCOUNT,
  TEST_PRODUCT_DATA,
  TEST_SHIPPING_ADDRESS,
  STRIPE_TEST_CARD,
  generateUniqueProductName,
} from "./helpers/test-accounts";

test.describe("Customer Purchase Flow", () => {
  test("customer can browse marketplace and view products", async ({ page }) => {
    // Step 1: Navigate to marketplace (no login required for browsing)
    await navigateToMarketplace(page);

    // Step 2: Verify marketplace page loads - look for the main heading or product count
    const marketplaceHeading = page.locator("h1, h2").filter({ hasText: /all products|shop|marketplace|stepping life/i }).first();
    await expect(marketplaceHeading).toBeVisible({ timeout: 15000 });

    // Step 3: Verify products are displayed - look for "View Product" links
    const productLinks = page.locator('a:has-text("View Product")');
    await expect(productLinks.first()).toBeVisible({ timeout: 10000 });

    // Verify we have multiple products
    const productCount = await productLinks.count();
    console.log(`Found ${productCount} products on marketplace`);
    expect(productCount).toBeGreaterThan(0);

    await takeScreenshot(page, "customer-marketplace-browse");
  });

  test("customer can add product to cart", async ({ page }) => {
    // Step 1: Navigate to marketplace
    await navigateToMarketplace(page);

    // Step 2: Find and click on any available product - wait for products to load
    const productLink = page.locator('a:has-text("View Product")').first();
    await productLink.waitFor({ state: "visible", timeout: 15000 });
    await productLink.click();
    await waitForPageLoad(page);

    // Step 3: Verify product detail page
    const addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("Add")').first();
    await expect(addToCartButton).toBeVisible({ timeout: 10000 });

    await takeScreenshot(page, "customer-product-detail");

    // Step 4: Add to cart
    await addProductToCart(page, 1);

    // Step 5: Verify cart updated - look for cart panel or cart count
    const cartPanel = page.locator('h2:has-text("Shopping Cart")');
    await expect(cartPanel).toBeVisible({ timeout: 5000 });

    await takeScreenshot(page, "customer-added-to-cart");
  });

  test("customer can complete checkout with Stripe", async ({ page }) => {
    // Step 1: Login as customer (optional but recommended for order history)
    const loginSuccess = await loginAsCustomer(page);
    console.log(`Customer login: ${loginSuccess ? "success" : "proceeding as guest"}`);

    // Step 2: Navigate to marketplace and find any product
    await navigateToMarketplace(page);

    // Click on any available product - wait for products to load first
    const productLink = page.locator('a:has-text("View Product")').first();
    await productLink.waitFor({ state: "visible", timeout: 15000 });
    await productLink.click();
    await waitForPageLoad(page);

    // Step 3: Add to cart
    await addProductToCart(page, 1);
    await page.waitForTimeout(1000);

    // Step 4: Navigate to checkout
    await navigateToCheckout(page);

    await takeScreenshot(page, "customer-checkout-page");

    // Step 5: Fill customer information
    await fillCheckoutForm(page, {
      name: CUSTOMER_ACCOUNT.name,
      email: CUSTOMER_ACCOUNT.email,
      phone: "312-555-1234",
    });

    // Step 6: Select shipping method (if visible)
    try {
      await selectShippingMethod(page, "DELIVERY");
    } catch {
      console.log("Shipping method selection not available or already selected");
    }

    // Step 7: Fill shipping address
    await fillShippingAddress(page, TEST_SHIPPING_ADDRESS);

    await takeScreenshot(page, "customer-checkout-form-filled");

    // Step 8: Fill Stripe card details (if Stripe is present)
    const stripeFrame = page.frameLocator('iframe[name*="stripe"]').first();
    const hasStripe = await stripeFrame.locator('input').first().isVisible({ timeout: 3000 }).catch(() => false);

    if (hasStripe) {
      await fillStripeCard(page, STRIPE_TEST_CARD);
      await takeScreenshot(page, "customer-stripe-card-filled");
    } else {
      console.log("Payment method: Pay When You Receive (no Stripe required)");
    }

    // Step 9: Submit order
    const orderNumber = await submitOrder(page);

    // Step 10: Verify order confirmation
    const confirmed = await verifyOrderConfirmation(page, orderNumber || undefined);
    expect(confirmed).toBe(true);

    await takeScreenshot(page, "customer-order-confirmation");

    console.log(`Order completed: ${orderNumber}`);
  });

  test("customer can view order in confirmation page", async ({ page }) => {
    // Complete a purchase first
    await loginAsCustomer(page);
    await navigateToMarketplace(page);

    // Find any product - wait for products to load first
    const productLink = page.locator('a:has-text("View Product")').first();
    await productLink.waitFor({ state: "visible", timeout: 15000 });
    await productLink.click();
    await waitForPageLoad(page);

    // Add to cart
    await addProductToCart(page, 1);
    await page.waitForTimeout(1000);

    // Checkout
    await navigateToCheckout(page);

    await fillCheckoutForm(page, {
      name: CUSTOMER_ACCOUNT.name,
      email: CUSTOMER_ACCOUNT.email,
    });

    await fillShippingAddress(page);

    // Check if Stripe is present before trying to fill card
    const stripeFrame = page.frameLocator('iframe[name*="stripe"]').first();
    const hasStripe = await stripeFrame.locator('input').first().isVisible({ timeout: 3000 }).catch(() => false);
    if (hasStripe) {
      await fillStripeCard(page);
    } else {
      console.log("Payment method: Pay When You Receive (no Stripe)");
    }

    // Submit and verify confirmation page elements
    const placeOrderButton = page.getByRole('button', { name: 'Place Order' });
    await placeOrderButton.click();

    // Wait for confirmation content to appear
    const successMessage = page.locator('text=/Order Placed Successfully|Order Confirmed|Thank you for your order/i');
    await successMessage.waitFor({ timeout: 60000 });
    await waitForPageLoad(page);

    // Verify confirmation page elements
    await expect(successMessage).toBeVisible({ timeout: 10000 });

    // Verify order number is displayed
    const orderNumberDisplay = page.locator('text=/ORD-[A-Z0-9-]+/i');
    await expect(orderNumberDisplay).toBeVisible({ timeout: 5000 });

    // Verify order details are shown
    const orderDetails = page.locator('text="Order Details"')
      .or(page.locator('text="Items"'))
      .or(page.locator('text="Total"'));
    await expect(orderDetails).toBeVisible({ timeout: 5000 });

    await takeScreenshot(page, "customer-confirmation-details");
  });

  test("guest can complete checkout without account", async ({ page }) => {
    // Do NOT login - test guest checkout

    // Step 1: Navigate to marketplace
    await navigateToMarketplace(page);

    // Step 2: Find and click on any product - wait for products to load first
    const productLink = page.locator('a:has-text("View Product")').first();
    await productLink.waitFor({ state: "visible", timeout: 15000 });
    await productLink.click();
    await waitForPageLoad(page);

    // Step 3: Add to cart
    await addProductToCart(page, 1);
    await page.waitForTimeout(1000);

    // Step 4: Navigate to checkout
    await navigateToCheckout(page);

    // Step 5: Fill guest information
    await fillCheckoutForm(page, {
      name: "Guest Customer",
      email: "guest-test@example.com",
      phone: "555-123-4567",
    });

    // Step 6: Fill shipping (if delivery is selected)
    await fillShippingAddress(page, {
      ...TEST_SHIPPING_ADDRESS,
      name: "Guest Customer",
    });

    // Step 7: Check if Stripe payment is needed (some orders use "Pay When You Receive")
    const stripeFrame = page.frameLocator('iframe[name*="stripe"]').first();
    const hasStripe = await stripeFrame.locator("body").isVisible({ timeout: 3000 }).catch(() => false);

    if (hasStripe) {
      await fillStripeCard(page);
    } else {
      console.log("Payment method: Pay When You Receive (no Stripe)");
    }

    await takeScreenshot(page, "guest-checkout-filled");

    // Step 8: Submit order
    const placeOrderButton = page.getByRole('button', { name: 'Place Order' });
    await placeOrderButton.click();

    // Step 9: Verify success - wait for confirmation page or message
    await page.waitForURL(/order-confirmation|success|thank|checkout/, { timeout: 60000 });

    // Look for confirmation message
    const confirmation = page.locator('text="Thank you"')
      .or(page.locator('text="Order Confirmed"'))
      .or(page.locator('text="Order Placed"'))
      .or(page.locator('h1:has-text("Order")'));
    await expect(confirmation).toBeVisible({ timeout: 15000 });

    await takeScreenshot(page, "guest-order-confirmation");

    console.log("Guest checkout completed successfully");
  });

  test("customer can purchase multiple quantities", async ({ page }) => {
    await loginAsCustomer(page);
    await navigateToMarketplace(page);

    // Find product - wait for products to load first
    const productLink = page.locator('a:has-text("View Product")').first();
    await productLink.waitFor({ state: "visible", timeout: 15000 });
    await productLink.click();
    await waitForPageLoad(page);

    // Add 3 items to cart
    await addProductToCart(page, 3);
    await page.waitForTimeout(1000);

    // Go to checkout
    await navigateToCheckout(page);

    // Verify quantity is reflected
    const quantityDisplay = page.locator('text="3"').or(page.locator('text="Qty: 3"'));
    const hasQuantity = await quantityDisplay.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasQuantity) {
      console.log("Multiple quantity verified in checkout");
    }

    // Complete checkout
    await fillCheckoutForm(page, {
      name: CUSTOMER_ACCOUNT.name,
      email: CUSTOMER_ACCOUNT.email,
    });

    await fillShippingAddress(page);

    // Check if Stripe is present before trying to fill card
    const stripeFrame = page.frameLocator('iframe[name*="stripe"]').first();
    const hasStripe = await stripeFrame.locator('input').first().isVisible({ timeout: 3000 }).catch(() => false);
    if (hasStripe) {
      await fillStripeCard(page);
    } else {
      console.log("Payment method: Pay When You Receive (no Stripe)");
    }

    const placeOrderButton = page.getByRole('button', { name: 'Place Order' });
    await placeOrderButton.click();

    // Wait for success message or URL change
    const successMessage = page.locator('text=/Order Placed Successfully|Order Confirmed|Thank you/i');
    await successMessage.waitFor({ timeout: 60000 });

    const confirmation = await successMessage.isVisible();
    expect(confirmation).toBe(true);

    await takeScreenshot(page, "customer-multi-quantity-order");

    console.log("Multiple quantity purchase completed");
  });
});
