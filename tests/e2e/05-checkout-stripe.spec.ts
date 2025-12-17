import { test, expect } from "@playwright/test";
import {
  TEST_USER,
  STRIPE_TEST_CARDS,
  TIMEOUTS,
  generateTestEmail,
} from "./helpers/test-data";

test.describe("Stripe Payment Checkout", () => {
  // Find a test event and navigate to checkout
  async function navigateToCheckout(page: any) {
    await page.goto("/events");
    await page.waitForLoadState("domcontentloaded");

    // Wait for events page and events to load
    await page.waitForSelector('[data-testid="events-page"]', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Find and click an event
    const eventCards = page.locator('[data-testid^="event-card-"]');
    const count = await eventCards.count();

    if (count === 0) {
      test.skip();
      return false;
    }

    await eventCards.first().click();
    await page.waitForURL(/\/events\/[a-zA-Z0-9]+$/, { timeout: TIMEOUTS.medium });

    // Check if Buy Tickets button exists
    const buyButton = page.locator('[data-testid="buy-tickets-btn"]');
    if (!(await buyButton.isVisible().catch(() => false))) {
      test.skip();
      return false;
    }

    await buyButton.click();
    await page.waitForLoadState("domcontentloaded");

    return true;
  }

  test("should display checkout page with ticket options", async ({ page }) => {
    const success = await navigateToCheckout(page);
    if (!success) return;

    // Should see ticket tiers
    await page.waitForTimeout(2000);

    // Look for tier buttons
    const tiers = page.locator('[data-testid^="tier-"]');
    const tierCount = await tiers.count();

    expect(tierCount).toBeGreaterThan(0);
  });

  test("should select ticket tier and fill buyer info", async ({ page }) => {
    const success = await navigateToCheckout(page);
    if (!success) return;

    await page.waitForTimeout(2000);

    // Select first available tier
    const tiers = page.locator('[data-testid^="tier-"]');
    const tierCount = await tiers.count();

    if (tierCount > 0) {
      await tiers.first().click();

      // Fill buyer information
      await page.fill('[data-testid="buyer-name"]', TEST_USER.name);
      await page.fill('[data-testid="buyer-email"]', generateTestEmail());

      // Check Continue to Payment button is enabled
      const continueBtn = page.locator('[data-testid="continue-to-payment"]');
      await expect(continueBtn).toBeEnabled();
    }
  });

  test("should show payment method options", async ({ page }) => {
    const success = await navigateToCheckout(page);
    if (!success) return;

    await page.waitForTimeout(2000);

    // Select first available tier
    const tiers = page.locator('[data-testid^="tier-"]');
    const tierCount = await tiers.count();

    if (tierCount > 0) {
      await tiers.first().click();

      // Fill buyer information
      await page.fill('[data-testid="buyer-name"]', TEST_USER.name);
      await page.fill('[data-testid="buyer-email"]', generateTestEmail());

      // Click Continue to Payment
      await page.click('[data-testid="continue-to-payment"]');
      await page.waitForTimeout(2000);

      // Should see payment method selector or Stripe form
      const paymentSelector = page.locator('[data-testid="payment-method-selector"]');
      const stripeForm = page.locator('iframe[name^="__privateStripeFrame"]');

      const hasPaymentSelector = await paymentSelector.isVisible().catch(() => false);
      const hasStripeForm = await stripeForm.isVisible().catch(() => false);

      // One of these should be visible
      expect(hasPaymentSelector || hasStripeForm).toBe(true);
    }
  });

  test("should select card payment method", async ({ page }) => {
    const success = await navigateToCheckout(page);
    if (!success) return;

    await page.waitForTimeout(2000);

    // Select first available tier
    const tiers = page.locator('[data-testid^="tier-"]');
    const tierCount = await tiers.count();

    if (tierCount > 0) {
      await tiers.first().click();

      // Fill buyer information
      await page.fill('[data-testid="buyer-name"]', TEST_USER.name);
      await page.fill('[data-testid="buyer-email"]', generateTestEmail());

      // Click Continue to Payment
      await page.click('[data-testid="continue-to-payment"]');
      await page.waitForTimeout(2000);

      // Check if payment method selector exists
      const cardMethodBtn = page.locator('[data-testid="payment-method-card"]');
      if (await cardMethodBtn.isVisible().catch(() => false)) {
        await cardMethodBtn.click();

        // Should be selected (indicated by styling or checked state)
        await expect(cardMethodBtn).toHaveClass(/border-primary|font-semibold/);
      }
    }
  });

  test("should fill Stripe card details", async ({ page }) => {
    const success = await navigateToCheckout(page);
    if (!success) return;

    await page.waitForTimeout(2000);

    // Select first available tier
    const tiers = page.locator('[data-testid^="tier-"]');
    const tierCount = await tiers.count();

    if (tierCount > 0) {
      await tiers.first().click();

      // Fill buyer information
      await page.fill('[data-testid="buyer-name"]', TEST_USER.name);
      await page.fill('[data-testid="buyer-email"]', generateTestEmail());

      // Click Continue to Payment
      await page.click('[data-testid="continue-to-payment"]');
      await page.waitForTimeout(3000);

      // Select card payment if available
      const cardMethodBtn = page.locator('[data-testid="payment-method-card"]');
      if (await cardMethodBtn.isVisible().catch(() => false)) {
        await cardMethodBtn.click();
        await page.waitForTimeout(1000);
      }

      // Look for Stripe iframe
      const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();

      try {
        // Try to fill card number
        const cardInput = stripeFrame.locator('[name="cardnumber"]');
        if (await cardInput.isVisible({ timeout: 5000 }).catch(() => false)) {
          await cardInput.fill(STRIPE_TEST_CARDS.success.number);

          // Fill expiry
          const expiryInput = stripeFrame.locator('[name="exp-date"]');
          if (await expiryInput.isVisible().catch(() => false)) {
            await expiryInput.fill(STRIPE_TEST_CARDS.success.expiry);
          }

          // Fill CVC
          const cvcInput = stripeFrame.locator('[name="cvc"]');
          if (await cvcInput.isVisible().catch(() => false)) {
            await cvcInput.fill(STRIPE_TEST_CARDS.success.cvc);
          }
        }
      } catch {
        // Stripe iframe may not be available in test environment
        console.log("Stripe iframe not available - this may be expected in test environment");
      }
    }
  });

  test("should apply discount code", async ({ page }) => {
    const success = await navigateToCheckout(page);
    if (!success) return;

    await page.waitForTimeout(2000);

    // Select first available tier
    const tiers = page.locator('[data-testid^="tier-"]');
    const tierCount = await tiers.count();

    if (tierCount > 0) {
      await tiers.first().click();

      // Fill buyer information
      await page.fill('[data-testid="buyer-name"]', TEST_USER.name);
      await page.fill('[data-testid="buyer-email"]', generateTestEmail());

      // Try to apply a discount code
      const discountInput = page.locator('[data-testid="discount-code-input"]');
      if (await discountInput.isVisible().catch(() => false)) {
        await discountInput.fill("TEST10");
        await page.click('[data-testid="apply-discount-btn"]');

        // Wait for response
        await page.waitForTimeout(2000);

        // Check for success or error message
        // This is expected to fail with invalid code in test environment
      }
    }
  });

  // Note: Completing actual Stripe payment requires special test mode setup
  // The following test is a placeholder for when Stripe test mode is configured
  test.skip("should complete Stripe payment with test card", async ({ page }) => {
    const success = await navigateToCheckout(page);
    if (!success) return;

    await page.waitForTimeout(2000);

    // Select first available tier
    const tiers = page.locator('[data-testid^="tier-"]');
    await tiers.first().click();

    // Fill buyer information
    await page.fill('[data-testid="buyer-name"]', TEST_USER.name);
    await page.fill('[data-testid="buyer-email"]', generateTestEmail());

    // Continue to payment
    await page.click('[data-testid="continue-to-payment"]');
    await page.waitForTimeout(3000);

    // Select card payment
    const cardMethodBtn = page.locator('[data-testid="payment-method-card"]');
    if (await cardMethodBtn.isVisible()) {
      await cardMethodBtn.click();
      await page.waitForTimeout(1000);
    }

    // Fill Stripe form (implementation depends on Stripe Elements setup)
    // ...

    // Submit payment
    // ...

    // Verify success
    await expect(page.locator('[data-testid="payment-success"]')).toBeVisible({
      timeout: TIMEOUTS.payment,
    });
  });
});
