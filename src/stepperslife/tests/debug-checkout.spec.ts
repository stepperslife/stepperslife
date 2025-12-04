/**
 * Debug Checkout Test
 * Tests specifically the tier selection and Continue to Payment button
 */

import { test, expect, Page } from "@playwright/test";

const PRODUCTION_URL = "https://stepperslife.com";
const EVENT_ID = "jh791vhae4757y8m0jfs449p6d7wcba7";

test.describe("Debug Checkout Flow", () => {
  test("Test tier selection and Continue to Payment button", async ({ page }) => {
    // Capture console logs
    const logs: string[] = [];
    page.on("console", (msg) => {
      logs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Navigate to checkout page
    console.log("\n📍 Step 1: Navigate to checkout page");
    await page.goto(`${PRODUCTION_URL}/events/${EVENT_ID}/checkout`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Screenshot initial state
    await page.screenshot({
      path: "test-results/debug-1-initial.png",
      fullPage: true,
    });

    console.log("  ✓ Checkout page loaded");

    // Step 2: Click on General Admission tier
    console.log("\n📍 Step 2: Click on General Admission tier");

    // Wait for ticket buttons to appear
    const tierButtons = page.locator('button:has-text("General Admission")');
    const count = await tierButtons.count();
    console.log(`  Found ${count} tier button(s) with text "General Admission"`);

    if (count === 0) {
      console.log("  ❌ No tier buttons found!");
      await page.screenshot({
        path: "test-results/debug-2-no-buttons.png",
        fullPage: true,
      });
      return;
    }

    // Click the tier button
    await tierButtons.first().click();
    await page.waitForTimeout(1000);

    // Check if tier was selected (should have border-primary class)
    const selectedTierClass = await tierButtons.first().getAttribute("class");
    console.log(`  Tier button classes after click: ${selectedTierClass}`);

    const isSelected = selectedTierClass?.includes("border-primary") || selectedTierClass?.includes("bg-accent");
    console.log(`  ✓ Tier selected: ${isSelected}`);

    // Screenshot after tier selection
    await page.screenshot({
      path: "test-results/debug-2-tier-selected.png",
      fullPage: true,
    });

    // Step 3: Fill in buyer information
    console.log("\n📍 Step 3: Fill in buyer information");

    // Wait for form fields to appear (they should appear after tier is selected)
    const nameInput = page.locator('input[placeholder*="John" i], input[type="text"]').first();
    const emailInput = page.locator('input[type="email"]');

    // Check if inputs are visible
    const nameVisible = await nameInput.isVisible().catch(() => false);
    const emailVisible = await emailInput.isVisible().catch(() => false);

    console.log(`  Name input visible: ${nameVisible}`);
    console.log(`  Email input visible: ${emailVisible}`);

    if (!nameVisible || !emailVisible) {
      console.log("  ⚠️ Form fields not visible - tier selection may have failed");
      await page.screenshot({
        path: "test-results/debug-3-no-form.png",
        fullPage: true,
      });
    } else {
      // Fill in the form
      await nameInput.fill("Test User Debug");
      await emailInput.fill("test-debug@stepperslife.com");
      console.log("  ✓ Filled buyer information");
      await page.waitForTimeout(500);
    }

    // Screenshot after form fill
    await page.screenshot({
      path: "test-results/debug-3-form-filled.png",
      fullPage: true,
    });

    // Step 4: Find and click Continue to Payment button
    console.log("\n📍 Step 4: Click Continue to Payment button");

    const continueButton = page.locator('button:has-text("Continue to Payment")');
    const continueButtonCount = await continueButton.count();
    console.log(`  Found ${continueButtonCount} Continue to Payment button(s)`);

    if (continueButtonCount === 0) {
      console.log("  ❌ Continue to Payment button not found!");
      await page.screenshot({
        path: "test-results/debug-4-no-button.png",
        fullPage: true,
      });
      return;
    }

    // Check if button is disabled
    const isDisabled = await continueButton.first().isDisabled();
    console.log(`  Button disabled: ${isDisabled}`);

    const buttonClass = await continueButton.first().getAttribute("class");
    console.log(`  Button classes: ${buttonClass}`);

    // Click the button
    console.log("  Clicking Continue to Payment...");
    await continueButton.first().click();

    // Wait for response
    await page.waitForTimeout(3000);

    // Screenshot after clicking
    await page.screenshot({
      path: "test-results/debug-4-after-click.png",
      fullPage: true,
    });

    // Check current URL
    const currentUrl = page.url();
    console.log(`  Current URL after click: ${currentUrl}`);

    // Check if payment section appeared
    const paymentSection = page.locator('text="Payment Method"');
    const paymentVisible = await paymentSection.isVisible().catch(() => false);
    console.log(`  Payment section visible: ${paymentVisible}`);

    // Check for Stripe elements
    const stripeElements = page.locator('iframe[src*="stripe"]');
    const stripeCount = await stripeElements.count();
    console.log(`  Stripe iframe count: ${stripeCount}`);

    // Final screenshot
    await page.screenshot({
      path: "test-results/debug-5-final.png",
      fullPage: true,
    });

    // Print all console logs
    console.log("\n📋 Browser Console Logs:");
    for (const log of logs.filter(l => l.includes("[Checkout]"))) {
      console.log(`  ${log}`);
    }

    console.log("\n✅ Debug test completed");
  });
});
