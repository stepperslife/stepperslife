/**
 * Debug Checkout Test V2
 * Captures all console logs and looks for specific checkout messages
 */

import { test, expect, Page } from "@playwright/test";

const PRODUCTION_URL = "https://stepperslife.com";
const EVENT_ID = "jh791vhae4757y8m0jfs449p6d7wcba7";

test.describe("Debug Checkout Flow V2", () => {
  test("Test button click with full console capture", async ({ page }) => {
    // Capture ALL console messages
    const allLogs: string[] = [];
    page.on("console", (msg) => {
      const text = msg.text();
      allLogs.push(`[${msg.type()}] ${text}`);
      // Print checkout-related logs immediately
      if (text.includes("Checkout") || text.includes("order") || text.includes("toast")) {
        console.log(`  >> ${text}`);
      }
    });

    // Capture errors
    page.on("pageerror", (error) => {
      console.log(`  ❌ PAGE ERROR: ${error.message}`);
    });

    // Navigate to checkout page
    console.log("\n📍 Navigate to checkout page");
    await page.goto(`${PRODUCTION_URL}/events/${EVENT_ID}/checkout`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2500);

    console.log("  Page loaded, selecting tier...");

    // Click on General Admission tier
    const tierButton = page.locator('button:has-text("General Admission")').first();
    await tierButton.click();
    await page.waitForTimeout(1000);

    // Check selection
    const tierClass = await tierButton.getAttribute("class");
    const isSelected = tierClass?.includes("border-primary");
    console.log(`  Tier selected: ${isSelected}`);

    if (!isSelected) {
      console.log("  ❌ Tier selection failed!");
      await page.screenshot({ path: "test-results/debug-v2-tier-fail.png", fullPage: true });
      return;
    }

    // Fill form
    console.log("  Filling form...");
    await page.locator('input[type="text"]').first().fill("Test Debug V2");
    await page.locator('input[type="email"]').fill("debug-v2@test.com");
    await page.waitForTimeout(500);

    // Find Continue to Payment button
    const continueBtn = page.locator('button:has-text("Continue to Payment")');
    const btnCount = await continueBtn.count();
    const isDisabled = btnCount > 0 ? await continueBtn.first().isDisabled() : true;

    console.log(`  Continue button count: ${btnCount}, disabled: ${isDisabled}`);

    if (btnCount === 0 || isDisabled) {
      console.log("  ❌ Button not found or disabled!");
      await page.screenshot({ path: "test-results/debug-v2-no-button.png", fullPage: true });
      return;
    }

    // Screenshot before click
    await page.screenshot({ path: "test-results/debug-v2-before-click.png", fullPage: true });

    // CLICK THE BUTTON
    console.log("\n📍 Clicking Continue to Payment...");
    await continueBtn.first().click();

    // Wait and check
    console.log("  Waiting for response...");
    await page.waitForTimeout(5000);

    // Screenshot after click
    await page.screenshot({ path: "test-results/debug-v2-after-click.png", fullPage: true });

    // Check for payment section
    const paymentVisible = await page.locator('text="Payment Method"').isVisible().catch(() => false);
    const stripeVisible = await page.locator('iframe[src*="stripe"]').count();

    console.log(`\n📊 Results:`);
    console.log(`  Payment section visible: ${paymentVisible}`);
    console.log(`  Stripe iframes: ${stripeVisible}`);

    // Print all checkout-related logs
    console.log(`\n📋 All Checkout Logs (${allLogs.filter(l => l.includes("Checkout")).length}):`);
    allLogs.filter(l => l.includes("Checkout") || l.includes("order")).forEach(l => {
      console.log(`  ${l}`);
    });

    // Print any error logs
    const errorLogs = allLogs.filter(l => l.includes("error") || l.includes("Error") || l.includes("[error]"));
    if (errorLogs.length > 0) {
      console.log(`\n❌ Error Logs (${errorLogs.length}):`);
      errorLogs.forEach(l => console.log(`  ${l}`));
    }

    console.log("\n✅ Test completed");
  });
});
