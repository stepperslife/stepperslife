/**
 * Simple Debug Checkout Test
 * Clicks button via JavaScript and checks for any response
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL = "https://stepperslife.com";
const EVENT_ID = "jh791vhae4757y8m0jfs449p6d7wcba7";

test("Simple button click test", async ({ page }) => {
  const logs: string[] = [];
  page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));

  // Navigate
  await page.goto(`${PRODUCTION_URL}/events/${EVENT_ID}/checkout`);
  await page.waitForTimeout(3000);

  // Select tier
  await page.click('button:has-text("General Admission")');
  await page.waitForTimeout(1000);

  // Fill form
  await page.fill('input[type="text"]', "Simple Test");
  await page.fill('input[type="email"]', "simple@test.com");
  await page.waitForTimeout(500);

  // Screenshot before
  await page.screenshot({ path: "test-results/simple-before.png" });

  // Click button via JS with logging
  const clicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const continueBtn = buttons.find(b => b.textContent?.includes('Continue to Payment'));
    if (continueBtn) {
      console.log('[Test-JS] Found Continue button, clicking...');
      // Check if it has any React event handlers
      const reactKey = Object.keys(continueBtn).find(k => k.startsWith('__reactFiber') || k.startsWith('__reactProps'));
      console.log('[Test-JS] React key found:', reactKey ? 'yes' : 'no');

      // Try to trigger click
      continueBtn.click();
      console.log('[Test-JS] Click dispatched');
      return { found: true, clicked: true };
    }
    return { found: false, clicked: false };
  });

  console.log("Click result:", clicked);

  // Wait
  await page.waitForTimeout(3000);

  // Screenshot after
  await page.screenshot({ path: "test-results/simple-after.png" });

  // Check for changes
  const paymentVisible = await page.locator('text="Payment Method"').isVisible().catch(() => false);
  const toastVisible = await page.locator('[class*="toast"]').count();

  console.log(`Payment visible: ${paymentVisible}`);
  console.log(`Toast elements: ${toastVisible}`);

  // Print relevant logs
  const relevantLogs = logs.filter(l =>
    l.includes('Test') ||
    l.includes('Checkout') ||
    l.includes('order') ||
    l.includes('toast') ||
    l.includes('Creating')
  );
  console.log(`\nRelevant logs (${relevantLogs.length}):`);
  relevantLogs.forEach(l => console.log(`  ${l}`));
});
