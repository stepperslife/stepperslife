/**
 * Debug Full Flow - Capture everything
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL = "https://stepperslife.com";
const EVENT_ID = "jh791vhae4757y8m0jfs449p6d7wcba7";

test("Full flow debug", async ({ page }) => {
  const allLogs: string[] = [];
  page.on("console", (msg) => {
    const text = msg.text();
    allLogs.push(`[${msg.type()}] ${text}`);
  });

  // Navigate
  await page.goto(`${PRODUCTION_URL}/events/${EVENT_ID}/checkout`);
  await page.waitForTimeout(3000);

  // Select tier
  await page.click('button:has-text("General Admission")');
  await page.waitForTimeout(1000);

  // Fill form
  await page.fill('input[type="text"]', "Full Flow Test");
  await page.fill('input[type="email"]', "fullflow@test.com");
  await page.waitForTimeout(500);

  // Screenshot before
  await page.screenshot({ path: "test-results/fullflow-before.png" });

  // Click button via Playwright
  console.log("Clicking Continue to Payment...");
  await page.click('button:has-text("Continue to Payment")');

  // Wait for potential async operations
  await page.waitForTimeout(8000);

  // Screenshot after
  await page.screenshot({ path: "test-results/fullflow-after.png" });

  // Check results
  const paymentVisible = await page.locator('text="Payment Method"').isVisible().catch(() => false);
  const stripeIframes = await page.locator('iframe[src*="stripe"]').count();

  // Look for toast messages
  const toastContainer = await page.locator('[data-sonner-toaster], .sonner-toast-container, [class*="toast"]').count();

  // Check page content for any error messages
  const errorMessages = await page.locator('text=/error|failed|invalid/i').allTextContents();

  console.log(`\n=== RESULTS ===`);
  console.log(`Payment visible: ${paymentVisible}`);
  console.log(`Stripe iframes: ${stripeIframes}`);
  console.log(`Toast container: ${toastContainer}`);
  console.log(`Error messages: ${errorMessages.join(', ') || 'none'}`);

  console.log(`\n=== ALL LOGS (${allLogs.length}) ===`);
  allLogs.forEach(l => console.log(l));
});
