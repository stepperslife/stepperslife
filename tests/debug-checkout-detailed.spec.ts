/**
 * Detailed Debug Checkout Test
 * Tests with page error monitoring and network request tracking
 */

import { test, expect, Page } from "@playwright/test";

const PRODUCTION_URL = "https://stepperslife.com";
const EVENT_ID = "jh791vhae4757y8m0jfs449p6d7wcba7";

test.describe("Detailed Debug Checkout Flow", () => {
  test("Test with network and error monitoring", async ({ page }) => {
    // Capture ALL console logs
    const allLogs: string[] = [];
    page.on("console", (msg) => {
      allLogs.push(`[console.${msg.type()}] ${msg.text()}`);
    });

    // Capture page errors
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(`[PAGE ERROR] ${error.message}`);
    });

    // Track network requests to Convex
    const convexRequests: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("convex") || url.includes("stripe")) {
        convexRequests.push(`[REQUEST] ${request.method()} ${url.substring(0, 100)}`);
      }
    });

    page.on("response", (response) => {
      const url = response.url();
      if (url.includes("convex")) {
        convexRequests.push(`[RESPONSE] ${response.status()} ${url.substring(0, 80)}`);
      }
    });

    // Navigate to checkout page
    console.log("\n📍 Navigate to checkout page");
    await page.goto(`${PRODUCTION_URL}/events/${EVENT_ID}/checkout`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000);

    console.log("  Page loaded");

    // Step 2: Select General Admission
    console.log("\n📍 Select General Admission tier");
    const tierButton = page.locator('button:has-text("General Admission")').first();
    await tierButton.click();
    await page.waitForTimeout(1000);
    console.log("  Tier clicked");

    // Step 3: Fill form
    console.log("\n📍 Fill buyer information");
    const nameInput = page.locator('input[type="text"]').first();
    const emailInput = page.locator('input[type="email"]');

    await nameInput.fill("Test Debug User");
    await emailInput.fill("test-detailed@stepperslife.com");
    await page.waitForTimeout(500);
    console.log("  Form filled");

    // Step 4: Click Continue to Payment and WAIT for network
    console.log("\n📍 Click Continue to Payment");

    const continueButton = page.locator('button:has-text("Continue to Payment")');

    // Log button state before clicking
    const buttonText = await continueButton.textContent();
    const isDisabled = await continueButton.isDisabled();
    console.log(`  Button text: "${buttonText}", disabled: ${isDisabled}`);

    // Click and wait for any network activity or DOM change
    const [response] = await Promise.all([
      // Wait for any request to complete (mutation would go to Convex)
      page.waitForResponse(
        (resp) => resp.url().includes("convex") && resp.status() !== 0,
        { timeout: 10000 }
      ).catch(() => null),
      // Click the button
      continueButton.click(),
    ]);

    if (response) {
      console.log(`  Got Convex response: ${response.status()} ${response.url().substring(0, 60)}`);
      try {
        const body = await response.json();
        console.log(`  Response body preview: ${JSON.stringify(body).substring(0, 200)}`);
      } catch (e) {
        console.log(`  Could not parse response body`);
      }
    } else {
      console.log("  ⚠️ No Convex response received within timeout");
    }

    // Wait a bit more
    await page.waitForTimeout(3000);

    // Check what's on the page now
    console.log("\n📍 Checking page state after click");

    // Check for payment section
    const paymentMethodText = await page.locator('text="Payment Method"').count();
    console.log(`  "Payment Method" text found: ${paymentMethodText > 0}`);

    // Check for any error toast
    const toastError = await page.locator('[class*="toast"], [role="alert"]').count();
    console.log(`  Toast/Alert elements: ${toastError}`);

    // Try getting toast text if any
    const toastText = await page.locator('[class*="toast"], [role="alert"]').first().textContent().catch(() => null);
    if (toastText) {
      console.log(`  Toast text: "${toastText}"`);
    }

    // Check if showPayment state changed (look for payment form indicators)
    const stripeForm = await page.locator('iframe[src*="stripe"]').count();
    const cardInput = await page.locator('[class*="CardElement"], [data-testid*="card"]').count();
    console.log(`  Stripe iframes: ${stripeForm}, Card inputs: ${cardInput}`);

    // Final screenshot
    await page.screenshot({
      path: "test-results/debug-detailed-final.png",
      fullPage: true,
    });

    // Print errors
    if (errors.length > 0) {
      console.log("\n❌ Page Errors:");
      errors.forEach(e => console.log(`  ${e}`));
    } else {
      console.log("\n✓ No page errors");
    }

    // Print checkout-related console logs
    console.log("\n📋 Checkout Console Logs:");
    const checkoutLogs = allLogs.filter(l =>
      l.toLowerCase().includes("checkout") ||
      l.toLowerCase().includes("order") ||
      l.toLowerCase().includes("payment") ||
      l.toLowerCase().includes("error")
    );
    if (checkoutLogs.length > 0) {
      checkoutLogs.forEach(l => console.log(`  ${l}`));
    } else {
      console.log("  (none found)");
    }

    // Print Convex network activity
    console.log("\n📡 Convex Network Activity:");
    if (convexRequests.length > 0) {
      convexRequests.slice(-10).forEach(r => console.log(`  ${r}`));
    } else {
      console.log("  (none captured)");
    }

    console.log("\n✅ Test completed");
  });
});
