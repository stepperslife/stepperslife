/**
 * Full test on deployment URL
 */

import { test, expect } from "@playwright/test";

const DEPLOYMENT_URL = "https://stepperslife-6l2nlucdt-stepperlifes-projects.vercel.app";
const EVENT_ID = "jh791vhae4757y8m0jfs449p6d7wcba7";

test("Full flow on deployment URL", async ({ page }) => {
  const logs: string[] = [];
  page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));

  // Navigate
  console.log("Navigating to deployment URL...");
  await page.goto(`${DEPLOYMENT_URL}/events/${EVENT_ID}/checkout`);
  await page.waitForTimeout(3000);

  // Select tier
  console.log("Selecting tier...");
  await page.click('button:has-text("General Admission")');
  await page.waitForTimeout(1500);

  // Check if tier was selected
  const tierSelected = await page.locator('button:has-text("General Admission").border-primary').count();
  console.log(`Tier selected (has border-primary): ${tierSelected > 0}`);

  // Fill form
  console.log("Filling form...");
  await page.fill('input[type="text"]', "Deployment Test");
  await page.fill('input[type="email"]', "deploy@test.com");
  await page.waitForTimeout(500);

  // Now check for Continue button
  const continueBtn = page.locator('button:has-text("Continue to Payment")');
  const btnCount = await continueBtn.count();
  console.log(`Continue button count: ${btnCount}`);

  if (btnCount === 0) {
    console.log("Continue button not found!");
    await page.screenshot({ path: "test-results/deploy-no-button.png", fullPage: true });

    // Check what's in the Order Summary
    const orderSummary = await page.locator('text="Order Summary"').locator('..').textContent();
    console.log(`Order Summary content: ${orderSummary?.substring(0, 200)}`);
    return;
  }

  // Check the onClick handler
  const handlerCheck = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent?.includes('Continue to Payment'));
    if (!btn) return { found: false };

    const propsKey = Object.keys(btn).find(k => k.startsWith('__reactProps'));
    if (!propsKey) return { found: true, noProps: true };

    const props = (btn as any)[propsKey];
    const fnSource = props.onClick?.toString() || '';

    return {
      found: true,
      fnLength: fnSource.length,
      fnPreview: fnSource.substring(0, 300),
      hasCheckoutLog: fnSource.includes('Checkout'),
    };
  });

  console.log("Handler check:", JSON.stringify(handlerCheck, null, 2));

  // Click the button
  console.log("Clicking Continue to Payment...");
  await continueBtn.click();
  await page.waitForTimeout(5000);

  // Screenshot
  await page.screenshot({ path: "test-results/deploy-after-click.png", fullPage: true });

  // Check results
  const paymentVisible = await page.locator('text="Payment Method"').isVisible().catch(() => false);
  console.log(`Payment visible: ${paymentVisible}`);

  // Print all logs
  console.log(`\nAll browser logs (${logs.length}):`);
  logs.filter(l => l.includes('Checkout') || l.includes('order') || l.includes('Creating')).forEach(l => {
    console.log(`  ${l}`);
  });
});
