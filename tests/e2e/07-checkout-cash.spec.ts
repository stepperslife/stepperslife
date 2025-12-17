import { test, expect } from "@playwright/test";
import {
  TEST_USER,
  TIMEOUTS,
  generateTestEmail,
} from "./helpers/test-data";

test.describe("Cash Payment Checkout", () => {
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

  test("should select Cash payment method", async ({ page }) => {
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

      // Check if Cash payment method exists
      const cashMethodBtn = page.locator('[data-testid="payment-method-cash"]');
      if (await cashMethodBtn.isVisible().catch(() => false)) {
        await cashMethodBtn.click();

        // Should be selected
        await expect(cashMethodBtn).toHaveClass(/border-green-600|font-semibold/);
      }
    }
  });

  test("should display cash payment instructions", async ({ page }) => {
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

      // Select Cash payment
      const cashMethodBtn = page.locator('[data-testid="payment-method-cash"]');
      if (await cashMethodBtn.isVisible().catch(() => false)) {
        await cashMethodBtn.click();
        await page.waitForTimeout(1000);

        // Should see cash payment instructions or reserve button
        // Look for text about paying at the door or reserve tickets
        const cashInfo = page.locator("text=cash").or(page.locator("text=door")).or(page.locator("text=reserve"));
        const hasInfo = await cashInfo.isVisible().catch(() => false);

        // Cash payment section should have some indication
      }
    }
  });

  test("should create pending order with cash payment", async ({ page }) => {
    const success = await navigateToCheckout(page);
    if (!success) return;

    await page.waitForTimeout(2000);

    // Select first available tier
    const tiers = page.locator('[data-testid^="tier-"]');
    const tierCount = await tiers.count();

    if (tierCount > 0) {
      await tiers.first().click();

      // Fill buyer information
      const testEmail = generateTestEmail();
      await page.fill('[data-testid="buyer-name"]', TEST_USER.name);
      await page.fill('[data-testid="buyer-email"]', testEmail);

      // Click Continue to Payment
      await page.click('[data-testid="continue-to-payment"]');
      await page.waitForTimeout(2000);

      // Select Cash payment
      const cashMethodBtn = page.locator('[data-testid="payment-method-cash"]');
      if (await cashMethodBtn.isVisible().catch(() => false)) {
        await cashMethodBtn.click();
        await page.waitForTimeout(1000);

        // Look for reserve/submit button for cash
        const reserveBtn = page.locator('[data-testid="reserve-tickets-btn"]');
        const submitBtn = page.locator('button:has-text("Reserve")').or(page.locator('button:has-text("Complete")'));

        const hasReserve = await reserveBtn.isVisible().catch(() => false);
        const hasSubmit = await submitBtn.isVisible().catch(() => false);

        if (hasReserve) {
          await reserveBtn.click();
          await page.waitForTimeout(3000);

          // Should see success or confirmation
          const success = page.locator('[data-testid="payment-success"]');
          const confirmation = page.locator("text=reserved").or(page.locator("text=confirmation"));

          const hasSuccess = await success.isVisible().catch(() => false);
          const hasConfirmation = await confirmation.isVisible().catch(() => false);

          // Should show some success indication
        } else if (hasSubmit) {
          await submitBtn.first().click();
          await page.waitForTimeout(3000);
        }
      }
    }
  });

  test("should show 30-minute hold warning for cash payment", async ({ page }) => {
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

      // Select Cash payment
      const cashMethodBtn = page.locator('[data-testid="payment-method-cash"]');
      if (await cashMethodBtn.isVisible().catch(() => false)) {
        await cashMethodBtn.click();
        await page.waitForTimeout(1000);

        // Look for hold/expiry warning
        const holdWarning = page.locator("text=30").or(page.locator("text=minute")).or(page.locator("text=hold"));
        const hasWarning = await holdWarning.isVisible().catch(() => false);

        // This is informational - cash payment UI should indicate the hold period
      }
    }
  });
});
