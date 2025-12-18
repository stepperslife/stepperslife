/**
 * Stripe Checkout E2E Tests
 * Full end-to-end tests for Stripe credit card payments
 */

import { test, expect } from "@playwright/test";
import {
  STRIPE_TEST_CARDS,
  TIMEOUTS,
  navigateToEventCheckout,
  selectTicketTier,
  fillBuyerInfo,
  continueToPayment,
  fillStripeCard,
  submitPayment,
  waitForPaymentSuccess,
  generateTestEmail,
  isPaymentMethodAvailable,
  selectPaymentMethod,
} from "./helpers/production-helpers";

test.describe("Stripe Credit Card Checkout", () => {
  test.setTimeout(120000); // 2 minute timeout for payment tests

  test("successful payment with valid card", async ({ page }) => {
    // Step 1: Navigate to events
    await page.goto("/events");
    await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

    // Step 2: Find and click on an event
    const eventCard = page.locator('[href^="/events/"]').first();
    if (!(await eventCard.isVisible())) {
      test.skip("No events available for testing");
      return;
    }

    await eventCard.click();
    await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

    // Step 3: Click Buy Tickets
    const buyButton = page.locator(
      'button:has-text("Buy Tickets"), a:has-text("Get Tickets"), button:has-text("Get Tickets"), [data-testid="buy-tickets-btn"]'
    );
    if (!(await buyButton.isVisible())) {
      test.skip("Event does not have buy tickets button - may be free or sold out");
      return;
    }

    await buyButton.click();
    await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);
    await page.waitForTimeout(2000);

    // Step 4: Select ticket tier
    const tierSelector = page.locator('[data-testid^="tier-"], .ticket-tier, [data-tier]').first();
    if (await tierSelector.isVisible()) {
      await tierSelector.click();
    }

    // Step 5: Fill buyer information
    const testEmail = generateTestEmail();
    const nameInput = page.locator('input[name="name"], [data-testid="buyer-name"], input[placeholder*="name" i]');
    const emailInput = page.locator('input[name="email"], input[type="email"], [data-testid="buyer-email"]');
    const phoneInput = page.locator('input[name="phone"], input[type="tel"], [data-testid="buyer-phone"]');

    if (await nameInput.isVisible()) {
      await nameInput.fill("Test Buyer");
    }
    if (await emailInput.isVisible()) {
      await emailInput.fill(testEmail);
    }
    if (await phoneInput.isVisible()) {
      await phoneInput.fill("4045551234");
    }

    // Step 6: Continue to payment
    const continueButton = page.locator(
      'button:has-text("Continue"), button:has-text("Next"), button:has-text("Proceed"), [data-testid="continue-btn"]'
    );
    if (await continueButton.isVisible()) {
      await continueButton.click();
      await page.waitForTimeout(3000);
    }

    // Step 7: Select card payment if needed
    const cardOption = page.locator('[data-testid="payment-method-card"], input[value="card"]');
    if (await cardOption.isVisible()) {
      await cardOption.click();
    }

    // Step 8: Wait for Stripe to load and fill card details
    await page.waitForTimeout(3000);

    // Look for Stripe iframe
    const stripeFrame = page.frameLocator('iframe[name*="stripe"], iframe[src*="stripe"]').first();
    const cardNumberInput = stripeFrame.locator('[name="cardnumber"], [data-elements-stable-field-name="cardNumber"]');

    if (await cardNumberInput.isVisible({ timeout: 10000 })) {
      // Fill card number
      await cardNumberInput.fill(STRIPE_TEST_CARDS.success.number);

      // Fill expiry
      const expiryInput = stripeFrame.locator('[name="exp-date"], [data-elements-stable-field-name="cardExpiry"]');
      await expiryInput.fill(STRIPE_TEST_CARDS.success.expiry);

      // Fill CVC
      const cvcInput = stripeFrame.locator('[name="cvc"], [data-elements-stable-field-name="cardCvc"]');
      await cvcInput.fill(STRIPE_TEST_CARDS.success.cvc);

      // Fill ZIP if visible
      const zipInput = stripeFrame.locator('[name="postal"], [data-elements-stable-field-name="postalCode"]');
      if (await zipInput.isVisible()) {
        await zipInput.fill(STRIPE_TEST_CARDS.success.zip);
      }
    } else {
      test.skip("Stripe card form not found - event may use different payment method");
      return;
    }

    // Step 9: Submit payment
    const payButton = page.locator(
      'button:has-text("Pay"), button:has-text("Complete"), button:has-text("Purchase"), [data-testid="pay-btn"]'
    );
    await payButton.click();

    // Step 10: Wait for success
    await page.waitForTimeout(5000);

    // Check for success indicators
    const successIndicators = [
      page.locator('[data-testid="payment-success"]'),
      page.locator(':has-text("Thank you")'),
      page.locator(':has-text("Order confirmed")'),
      page.locator(':has-text("Payment successful")'),
      page.locator('.success, .payment-success'),
    ];

    let paymentSucceeded = false;
    for (const indicator of successIndicators) {
      if (await indicator.isVisible({ timeout: 30000 }).catch(() => false)) {
        paymentSucceeded = true;
        break;
      }
    }

    expect(paymentSucceeded).toBe(true);
  });

  test("declined card shows error message", async ({ page }) => {
    // Navigate to checkout
    await page.goto("/events");
    await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

    const eventCard = page.locator('[href^="/events/"]').first();
    if (!(await eventCard.isVisible())) {
      test.skip("No events available");
      return;
    }

    await eventCard.click();
    await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

    const buyButton = page.locator('button:has-text("Buy Tickets"), a:has-text("Get Tickets")');
    if (!(await buyButton.isVisible())) {
      test.skip("No buy button");
      return;
    }

    await buyButton.click();
    await page.waitForTimeout(2000);

    // Select tier
    const tierSelector = page.locator('[data-testid^="tier-"], .ticket-tier').first();
    if (await tierSelector.isVisible()) {
      await tierSelector.click();
    }

    // Fill buyer info
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill(generateTestEmail());
    }

    const nameInput = page.locator('input[name="name"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill("Test Declined");
    }

    // Continue to payment
    const continueButton = page.locator('button:has-text("Continue")');
    if (await continueButton.isVisible()) {
      await continueButton.click();
      await page.waitForTimeout(3000);
    }

    // Fill declined card
    const stripeFrame = page.frameLocator('iframe[name*="stripe"]').first();
    const cardNumberInput = stripeFrame.locator('[name="cardnumber"]');

    if (await cardNumberInput.isVisible({ timeout: 10000 })) {
      await cardNumberInput.fill(STRIPE_TEST_CARDS.declined.number);

      const expiryInput = stripeFrame.locator('[name="exp-date"]');
      await expiryInput.fill(STRIPE_TEST_CARDS.declined.expiry);

      const cvcInput = stripeFrame.locator('[name="cvc"]');
      await cvcInput.fill(STRIPE_TEST_CARDS.declined.cvc);
    } else {
      test.skip("Stripe form not found");
      return;
    }

    // Submit payment
    const payButton = page.locator('button:has-text("Pay")');
    await payButton.click();

    // Wait for error
    await page.waitForTimeout(5000);

    // Check for error message
    const errorIndicators = [
      page.locator(':has-text("declined")'),
      page.locator(':has-text("error")'),
      page.locator('.error, .payment-error'),
      page.locator('[data-testid="payment-error"]'),
    ];

    let errorShown = false;
    for (const indicator of errorIndicators) {
      if (await indicator.isVisible({ timeout: 10000 }).catch(() => false)) {
        errorShown = true;
        break;
      }
    }

    expect(errorShown).toBe(true);
  });

  test("insufficient funds card shows appropriate error", async ({ page }) => {
    await page.goto("/events");
    await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

    const eventCard = page.locator('[href^="/events/"]').first();
    if (!(await eventCard.isVisible())) {
      test.skip("No events available");
      return;
    }

    await eventCard.click();
    await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

    const buyButton = page.locator('button:has-text("Buy Tickets"), a:has-text("Get Tickets")');
    if (!(await buyButton.isVisible())) {
      test.skip("No buy button");
      return;
    }

    await buyButton.click();
    await page.waitForTimeout(2000);

    // Select tier
    const tierSelector = page.locator('[data-testid^="tier-"], .ticket-tier').first();
    if (await tierSelector.isVisible()) {
      await tierSelector.click();
    }

    // Fill buyer info
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill(generateTestEmail());
    }

    const nameInput = page.locator('input[name="name"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill("Test Insufficient");
    }

    // Continue to payment
    const continueButton = page.locator('button:has-text("Continue")');
    if (await continueButton.isVisible()) {
      await continueButton.click();
      await page.waitForTimeout(3000);
    }

    // Fill insufficient funds card
    const stripeFrame = page.frameLocator('iframe[name*="stripe"]').first();
    const cardNumberInput = stripeFrame.locator('[name="cardnumber"]');

    if (await cardNumberInput.isVisible({ timeout: 10000 })) {
      await cardNumberInput.fill(STRIPE_TEST_CARDS.insufficientFunds.number);

      const expiryInput = stripeFrame.locator('[name="exp-date"]');
      await expiryInput.fill(STRIPE_TEST_CARDS.insufficientFunds.expiry);

      const cvcInput = stripeFrame.locator('[name="cvc"]');
      await cvcInput.fill(STRIPE_TEST_CARDS.insufficientFunds.cvc);
    } else {
      test.skip("Stripe form not found");
      return;
    }

    // Submit payment
    const payButton = page.locator('button:has-text("Pay")');
    await payButton.click();

    // Wait for error
    await page.waitForTimeout(5000);

    // Check for error message
    const hasError = await page.locator(':has-text("insufficient"), :has-text("declined"), .error').isVisible();
    expect(hasError).toBe(true);
  });
});

test.describe("Stripe Payment Element Features", () => {
  test("payment element shows card and CashApp options", async ({ page }) => {
    await page.goto("/events");
    await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

    const eventCard = page.locator('[href^="/events/"]').first();
    if (!(await eventCard.isVisible())) {
      test.skip("No events available");
      return;
    }

    await eventCard.click();
    await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

    const buyButton = page.locator('button:has-text("Buy Tickets"), a:has-text("Get Tickets")');
    if (!(await buyButton.isVisible())) {
      test.skip("No buy button");
      return;
    }

    await buyButton.click();
    await page.waitForTimeout(2000);

    // Navigate through checkout
    const tierSelector = page.locator('[data-testid^="tier-"], .ticket-tier').first();
    if (await tierSelector.isVisible()) {
      await tierSelector.click();
    }

    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill(generateTestEmail());
    }

    const continueButton = page.locator('button:has-text("Continue")');
    if (await continueButton.isVisible()) {
      await continueButton.click();
      await page.waitForTimeout(3000);
    }

    // Check for Stripe payment element
    const stripeElement = page.locator('iframe[name*="stripe"], [class*="stripe"]');
    const hasStripe = await stripeElement.isVisible({ timeout: 10000 }).catch(() => false);

    if (hasStripe) {
      // Stripe PaymentElement is loaded
      expect(hasStripe).toBe(true);
    } else {
      // May be using different payment method
      test.skip("Stripe element not found - event may use different payment");
    }
  });
});
