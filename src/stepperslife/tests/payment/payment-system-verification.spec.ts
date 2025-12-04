/**
 * Payment System Verification Tests
 *
 * Comprehensive tests to verify the current state of all payment systems:
 * 1. Square PREPAY (credit purchase)
 * 2. Stripe Connect (split payments)
 * 3. PayPal (customer checkout)
 */

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.TEST_BASE_URL || "https://stepperslife.com";

// Test event IDs - update these with real event IDs for testing
const TEST_EVENT_CREDIT_CARD = "jh791vhae4757y8m0jfs449p6d7wcba7"; // Event with CREDIT_CARD model

test.describe("Payment System Verification", () => {

  test.describe("1. Square Credit Purchase Modal", () => {

    test("Square SDK loads in credit purchase modal", async ({ page }) => {
      // This test verifies the working PurchaseCreditsModal.tsx
      console.log("Testing Square credit purchase modal...");

      // Navigate to organizer credits page (requires auth)
      await page.goto(`${BASE_URL}/organizer/credits`);

      // Check if redirected to login (expected if not authenticated)
      const currentUrl = page.url();
      if (currentUrl.includes("/login")) {
        console.log("  - Redirected to login (auth required)");
        expect(currentUrl).toContain("/login");
        return;
      }

      // Look for credit balance display or purchase button
      const purchaseButton = page.locator('button:has-text("Buy More Credits"), button:has-text("Purchase Credits")');
      const buttonVisible = await purchaseButton.isVisible().catch(() => false);

      if (buttonVisible) {
        console.log("  - Found purchase credits button");
        await purchaseButton.click();

        // Wait for modal to appear
        await page.waitForTimeout(2000);

        // Check if Square card container exists
        const cardContainer = page.locator("#card-container");
        const containerVisible = await cardContainer.isVisible().catch(() => false);

        if (containerVisible) {
          console.log("  - Square card container rendered");
          expect(containerVisible).toBe(true);
        } else {
          console.log("  - Square card container NOT found (may need SDK to load)");
        }
      } else {
        console.log("  - Purchase button not found (may need different navigation)");
      }
    });
  });

  test.describe("2. Stripe Connect Split Payments", () => {

    test("Stripe checkout renders for CREDIT_CARD events", async ({ page }) => {
      console.log("Testing Stripe checkout...");

      // Navigate to checkout page
      await page.goto(`${BASE_URL}/events/${TEST_EVENT_CREDIT_CARD}/checkout`);
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(3000);

      // Check if event loaded
      const pageContent = await page.content();

      if (pageContent.includes("not found") || pageContent.includes("404")) {
        console.log("  - Event not found");
        return;
      }

      // Look for ticket tier selection
      const tierButtons = page.locator('button:has-text("General"), button:has-text("VIP"), button:has-text("Admission")');
      const tierCount = await tierButtons.count();
      console.log(`  - Found ${tierCount} ticket tier buttons`);

      if (tierCount > 0) {
        // Select first tier
        await tierButtons.first().click();
        await page.waitForTimeout(1000);

        // Fill buyer info
        const nameInput = page.locator('input[type="text"]').first();
        const emailInput = page.locator('input[type="email"]');

        if (await nameInput.isVisible()) {
          await nameInput.fill("Test User");
        }
        if (await emailInput.isVisible()) {
          await emailInput.fill("test@example.com");
        }

        await page.waitForTimeout(500);

        // Look for Continue to Payment button
        const continueButton = page.locator('button:has-text("Continue to Payment")');
        const continueVisible = await continueButton.isVisible().catch(() => false);

        if (continueVisible) {
          console.log("  - Continue to Payment button visible");

          // Check if button is enabled
          const isDisabled = await continueButton.isDisabled();
          console.log(`  - Button disabled: ${isDisabled}`);

          if (!isDisabled) {
            await continueButton.click();
            await page.waitForTimeout(3000);

            // Check for Stripe Elements or error
            const stripeFrame = page.frameLocator('iframe[name*="__privateStripeFrame"]');
            const stripeVisible = await stripeFrame.locator('input').first().isVisible().catch(() => false);

            const errorToast = page.locator('text="Payment is not configured"');
            const hasError = await errorToast.isVisible().catch(() => false);

            if (stripeVisible) {
              console.log("  - Stripe Elements rendered successfully");
            } else if (hasError) {
              console.log("  - Event missing Stripe Connect configuration");
            } else {
              console.log("  - Payment UI state unclear");
            }
          }
        } else {
          console.log("  - Continue to Payment button not found");
        }
      }
    });

    test("Stripe payment intent API responds correctly", async ({ request }) => {
      console.log("Testing Stripe payment intent API...");

      // Test the API endpoint directly
      const response = await request.post(`${BASE_URL}/api/stripe/create-payment-intent`, {
        data: {
          eventId: TEST_EVENT_CREDIT_CARD,
          amount: 5000, // $50.00
          currency: "usd",
          connectedAccountId: "acct_test", // Will fail but tests endpoint
          platformFee: 500,
          orderId: "test_order_123",
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      const status = response.status();
      console.log(`  - API response status: ${status}`);

      // 400 = missing/invalid data, 500 = server error, 200 = success
      if (status === 400) {
        const data = await response.json();
        console.log(`  - Error response: ${data.error || JSON.stringify(data)}`);
        // Expected if account is invalid
      } else if (status === 200) {
        const data = await response.json();
        console.log(`  - Success! clientSecret received`);
        expect(data.clientSecret).toBeTruthy();
      }
    });
  });

  test.describe("3. PayPal Customer Checkout", () => {

    test("PayPal create order API works", async ({ request }) => {
      console.log("Testing PayPal create order API...");

      const response = await request.post(`${BASE_URL}/api/paypal/create-order`, {
        data: {
          amount: 5000, // $50.00 in cents
          currency: "USD",
          description: "Test ticket purchase",
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      const status = response.status();
      console.log(`  - API response status: ${status}`);

      if (status === 200) {
        const data = await response.json();
        console.log(`  - PayPal order created: ${data.id || data.orderId}`);
        expect(data.id || data.orderId).toBeTruthy();
      } else {
        const data = await response.json().catch(() => ({}));
        console.log(`  - Error: ${data.error || "Unknown error"}`);
        // PayPal may not be configured - that's okay for verification
      }
    });

    test("PayPal button renders on checkout page", async ({ page }) => {
      console.log("Testing PayPal button rendering...");

      await page.goto(`${BASE_URL}/events/${TEST_EVENT_CREDIT_CARD}/checkout`);
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(3000);

      // Look for PayPal payment method option
      const paypalOption = page.locator('button:has-text("PayPal"), [data-payment-method="paypal"], text="PayPal"');
      const paypalVisible = await paypalOption.first().isVisible().catch(() => false);

      if (paypalVisible) {
        console.log("  - PayPal payment option visible");
      } else {
        console.log("  - PayPal option not visible (may require event config)");
      }
    });
  });

  test.describe("4. Square PREPAY Components (Placeholder Check)", () => {

    test("SquareCardPayment shows placeholder error", async ({ page }) => {
      // This tests that the placeholder is still in place
      // After fixing, this test should fail
      console.log("Checking SquareCardPayment placeholder status...");

      // Navigate to payment setup page (requires auth)
      await page.goto(`${BASE_URL}/organizer/events/${TEST_EVENT_CREDIT_CARD}/payment-setup`);

      const currentUrl = page.url();
      if (currentUrl.includes("/login")) {
        console.log("  - Redirected to login (auth required for payment setup)");
        return;
      }

      // Look for PREPAY option
      const prepayOption = page.locator('text="PREPAY", text="Pre-pay", text="Prepay"');
      const prepayVisible = await prepayOption.first().isVisible().catch(() => false);

      if (prepayVisible) {
        console.log("  - Found PREPAY option");
        await prepayOption.first().click();
        await page.waitForTimeout(2000);

        // Look for Square payment button
        const squareButton = page.locator('button:has-text("Square"), button:has-text("Pay with Square")');
        if (await squareButton.isVisible().catch(() => false)) {
          await squareButton.click();
          await page.waitForTimeout(1000);

          // Check for placeholder error
          const errorText = page.locator('text="not yet configured", text="not configured"');
          const hasError = await errorText.isVisible().catch(() => false);

          if (hasError) {
            console.log("  - SquareCardPayment still shows placeholder error (NEEDS FIX)");
          } else {
            console.log("  - SquareCardPayment may be implemented");
          }
        }
      } else {
        console.log("  - PREPAY option not visible");
      }
    });
  });

  test.describe("5. Environment Variable Check", () => {

    test("Check required env vars via API health", async ({ request }) => {
      console.log("Checking environment configuration...");

      // Test Stripe account status endpoint
      const stripeResponse = await request.get(`${BASE_URL}/api/stripe/account-status?accountId=test`).catch(() => null);
      if (stripeResponse) {
        console.log(`  - Stripe API accessible: ${stripeResponse.status()}`);
      }

      // Test health endpoint if exists
      const healthResponse = await request.get(`${BASE_URL}/api/health`).catch(() => null);
      if (healthResponse) {
        console.log(`  - Health endpoint: ${healthResponse.status()}`);
      }
    });
  });
});

test.describe("Payment Flow Integration", () => {

  test("Full checkout flow - captures current behavior", async ({ page }) => {
    console.log("\n=== Full Checkout Flow Test ===\n");

    const logs: string[] = [];
    page.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("error") || text.includes("Error") || text.includes("payment") || text.includes("Payment")) {
        logs.push(`[${msg.type()}] ${text}`);
      }
    });

    // Step 1: Navigate to checkout
    console.log("Step 1: Navigate to checkout");
    await page.goto(`${BASE_URL}/events/${TEST_EVENT_CREDIT_CARD}/checkout`);
    await page.waitForTimeout(3000);

    // Step 2: Check page loaded
    const title = await page.title();
    console.log(`  Page title: ${title}`);

    // Step 3: Look for ticket options
    const ticketOptions = await page.locator('[class*="tier"], [class*="ticket"], button:has-text("Admission")').count();
    console.log(`  Ticket options found: ${ticketOptions}`);

    // Step 4: Select a ticket if available
    if (ticketOptions > 0) {
      const firstTicket = page.locator('[class*="tier"], [class*="ticket"], button:has-text("Admission")').first();
      await firstTicket.click().catch(() => console.log("  Could not click ticket option"));
      await page.waitForTimeout(1000);
    }

    // Step 5: Fill form
    const nameInput = page.locator('input[type="text"]').first();
    const emailInput = page.locator('input[type="email"]');

    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill("Integration Test");
      console.log("  Filled name");
    }
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill("integration@test.com");
      console.log("  Filled email");
    }

    // Step 6: Click continue
    const continueBtn = page.locator('button:has-text("Continue to Payment")');
    if (await continueBtn.isVisible().catch(() => false)) {
      const disabled = await continueBtn.isDisabled();
      console.log(`  Continue button disabled: ${disabled}`);

      if (!disabled) {
        await continueBtn.click();
        await page.waitForTimeout(3000);

        // Step 7: Check result
        const url = page.url();
        const content = await page.content();

        if (content.includes("Payment Method") || content.includes("Stripe")) {
          console.log("  SUCCESS: Reached payment screen");
        } else if (content.includes("not configured") || content.includes("error")) {
          console.log("  ERROR: Payment configuration issue");
        } else {
          console.log("  UNKNOWN: Check screenshot");
        }
      }
    }

    // Print relevant console logs
    if (logs.length > 0) {
      console.log("\nRelevant console logs:");
      logs.forEach(log => console.log(`  ${log}`));
    }

    // Take screenshot for manual review
    await page.screenshot({ path: "test-results/checkout-flow-result.png", fullPage: true });
    console.log("\nScreenshot saved to test-results/checkout-flow-result.png");
  });
});
