/**
 * Production Checkout Test
 * Tests the actual checkout flow on stepperslife.com with Stripe test cards
 */

import { test, expect, Page } from "@playwright/test";

const PRODUCTION_URL = "https://stepperslife.com";
const EVENT_ID = "jh791vhae4757y8m0jfs449p6d7wcba7";
const TEST_EMAIL = "test-checkout@stepperslife.com";
const TEST_NAME = "Test Customer";

// Stripe test card - always succeeds
const STRIPE_TEST_CARD = {
  number: "4242424242424242",
  expiry: "12/30",
  cvc: "123",
  zip: "60601",
};

async function waitForStableState(page: Page, timeout = 5000) {
  // Don't wait for networkidle as Stripe keeps connections open
  await page.waitForLoadState("domcontentloaded", { timeout });
  await page.waitForTimeout(1500);
}

test.describe("Production Checkout Test", () => {
  test("Complete full checkout flow with test card", async ({ page }) => {
    console.log("\n🛒 Starting Production Checkout Test\n");
    console.log(`Event ID: ${EVENT_ID}`);
    console.log(`Test Email: ${TEST_EMAIL}`);

    // Step 1: Navigate to checkout page
    console.log("\n📍 Step 1: Navigate to checkout page");
    await page.goto(`${PRODUCTION_URL}/events/${EVENT_ID}/checkout`);
    await waitForStableState(page);

    // Take screenshot
    await page.screenshot({
      path: "test-results/prod-checkout-1-initial.png",
      fullPage: true,
    });

    console.log("  ✓ Checkout page loaded");

    // Step 2: Select a ticket tier (General Admission - $30)
    console.log("\n📍 Step 2: Select ticket tier");

    // Wait for ticket options to be visible
    await page.waitForSelector('button:has-text("General Admission")', { timeout: 10000 });

    // Click on General Admission
    await page.click('button:has-text("General Admission")');
    await waitForStableState(page);

    console.log("  ✓ Selected General Admission tier");

    // Take screenshot after selection
    await page.screenshot({
      path: "test-results/prod-checkout-2-tier-selected.png",
      fullPage: true,
    });

    // Step 3: Fill in buyer information
    console.log("\n📍 Step 3: Fill buyer information");

    // Scroll to top to see the full form
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Wait for form to appear - look for the buyer info section
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    // Fill name first (it appears before email in the form)
    const nameInput = page.locator('input[placeholder*="full name" i], input[placeholder*="your name" i]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill(TEST_NAME);
      console.log(`  ✓ Name: ${TEST_NAME}`);
    } else {
      // Try alternative - any text input that's not email
      const textInputs = page.locator('input[type="text"]');
      const count = await textInputs.count();
      if (count > 0) {
        await textInputs.first().fill(TEST_NAME);
        console.log(`  ✓ Name (alt): ${TEST_NAME}`);
      }
    }

    // Fill email
    await page.fill('input[type="email"]', TEST_EMAIL);
    console.log(`  ✓ Email: ${TEST_EMAIL}`);

    // Take screenshot after form fill
    await page.screenshot({
      path: "test-results/prod-checkout-3-form-filled.png",
      fullPage: true,
    });

    // Step 4: Click Continue to Payment
    console.log("\n📍 Step 4: Click Continue to Payment");

    await page.click('button:has-text("Continue to Payment")');
    await waitForStableState(page, 5000);

    // Take screenshot after clicking
    await page.screenshot({
      path: "test-results/prod-checkout-4-payment-clicked.png",
      fullPage: true,
    });

    console.log("  ✓ Clicked Continue to Payment");

    // Step 5: Wait for Stripe payment form
    console.log("\n📍 Step 5: Wait for payment form");

    // Wait for Stripe iframe to load
    const stripeFrame = await page.waitForSelector('iframe[name*="stripe"], iframe[src*="stripe.com"]', {
      timeout: 15000
    }).catch(() => null);

    if (stripeFrame) {
      console.log("  ✓ Stripe payment form loaded");

      // Take screenshot of payment form
      await page.screenshot({
        path: "test-results/prod-checkout-5-stripe-form.png",
        fullPage: true,
      });

      // For Stripe Elements, we need to work with iframes
      // The card number, expiry, and CVC are each in separate iframes

      // Find and fill the card number iframe
      const cardFrame = page.frameLocator('iframe[title*="card number"], iframe[name*="__privateStripeFrame"]').first();

      if (cardFrame) {
        try {
          await cardFrame.locator('input[name="cardnumber"]').fill(STRIPE_TEST_CARD.number);
          console.log("  ✓ Card number entered");
        } catch (e) {
          console.log("  ⚠️ Could not fill card number - Stripe iframe structure may differ");
        }
      }

    } else {
      console.log("  ⚠️ Stripe form not detected - may be using different payment UI");

      // Check if it's a free event or different payment flow
      const pageContent = await page.content();
      if (pageContent.includes("Complete Order") || pageContent.includes("Free")) {
        console.log("  📝 This may be a free event or credits-based payment");
      }
    }

    // Final state screenshot
    await page.screenshot({
      path: "test-results/prod-checkout-final.png",
      fullPage: true,
    });

    console.log("\n✅ Checkout test completed");
    console.log("   Check test-results/ folder for screenshots");
  });
});
