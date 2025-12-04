/**
 * Debug Checkout Test V3
 * Force cache bypass and capture all JS errors
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL = "https://stepperslife.com";
const EVENT_ID = "jh791vhae4757y8m0jfs449p6d7wcba7";

test.describe("Debug Checkout Flow V3", () => {
  test("Test with cache bypass and JS error capture", async ({ page, context }) => {
    // Clear cache
    await context.clearCookies();

    // Capture ALL messages
    const allMessages: string[] = [];
    page.on("console", (msg) => {
      allMessages.push(`[console.${msg.type()}] ${msg.text()}`);
    });

    // Capture page errors
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => {
      pageErrors.push(`[pageerror] ${error.message}\n${error.stack}`);
    });

    // Capture request failures
    page.on("requestfailed", (request) => {
      console.log(`  Request failed: ${request.url()}`);
    });

    // Navigate with cache bypass
    console.log("\n📍 Navigate to checkout (bypassing cache)");
    await page.goto(`${PRODUCTION_URL}/events/${EVENT_ID}/checkout`, {
      waitUntil: "domcontentloaded",
    });

    // Force reload to ensure fresh content
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);

    console.log("  Page loaded");

    // Select tier
    console.log("\n📍 Select General Admission");
    const tierBtn = page.locator('button:has-text("General Admission")').first();
    await tierBtn.click();
    await page.waitForTimeout(1000);

    // Fill form
    console.log("📍 Fill form");
    await page.locator('input[type="text"]').first().fill("Test V3 User");
    await page.locator('input[type="email"]').fill("v3@test.com");
    await page.waitForTimeout(500);

    // Get Continue button
    const continueBtn = page.locator('button:has-text("Continue to Payment")');

    // Verify button state
    const btnVisible = await continueBtn.isVisible();
    const btnDisabled = await continueBtn.isDisabled();
    const btnText = await continueBtn.textContent();

    console.log(`\n📊 Button state: visible=${btnVisible}, disabled=${btnDisabled}, text="${btnText}"`);

    // Execute JavaScript directly to check if handler exists
    const handlerCheck = await page.evaluate(() => {
      const btn = document.querySelector('button:has(span:contains("Continue"))') as HTMLButtonElement;
      if (!btn) {
        // Try different selector
        const allButtons = document.querySelectorAll('button');
        for (const b of allButtons) {
          if (b.textContent?.includes('Continue to Payment')) {
            return {
              found: true,
              hasOnClick: typeof (b as any).onclick === 'function',
              innerHTML: b.innerHTML.substring(0, 50),
            };
          }
        }
        return { found: false };
      }
      return {
        found: true,
        hasOnClick: typeof (btn as any).onclick === 'function',
        innerHTML: btn.innerHTML.substring(0, 50),
      };
    });
    console.log(`  Handler check: ${JSON.stringify(handlerCheck)}`);

    // Screenshot before click
    await page.screenshot({ path: "test-results/debug-v3-before.png", fullPage: true });

    // Click using JavaScript to bypass any potential overlay issues
    console.log("\n📍 Clicking via JavaScript...");
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent?.includes('Continue to Payment')) {
          console.log('[Test] Found button, clicking...');
          btn.click();
          return true;
        }
      }
      return false;
    });

    await page.waitForTimeout(5000);

    // Screenshot after click
    await page.screenshot({ path: "test-results/debug-v3-after.png", fullPage: true });

    // Check results
    const paymentVisible = await page.locator('text="Payment Method"').isVisible().catch(() => false);
    console.log(`\n📊 Payment visible: ${paymentVisible}`);

    // Print page errors
    if (pageErrors.length > 0) {
      console.log(`\n❌ Page Errors (${pageErrors.length}):`);
      pageErrors.forEach(e => console.log(e));
    }

    // Print checkout-related logs
    const checkoutLogs = allMessages.filter(m =>
      m.toLowerCase().includes('checkout') ||
      m.toLowerCase().includes('order') ||
      m.toLowerCase().includes('test') ||
      m.toLowerCase().includes('button')
    );
    console.log(`\n📋 Relevant Logs (${checkoutLogs.length}):`);
    checkoutLogs.forEach(l => console.log(`  ${l}`));

    // Check for any unhandled promise rejections
    const rejections = allMessages.filter(m => m.includes('Unhandled') || m.includes('rejection'));
    if (rejections.length > 0) {
      console.log(`\n⚠️ Promise Rejections:`);
      rejections.forEach(r => console.log(`  ${r}`));
    }

    console.log("\n✅ Test completed");
  });
});
