/**
 * Test directly on the new deployment URL
 */

import { test, expect } from "@playwright/test";

// Direct deployment URL, bypassing CDN
const DEPLOYMENT_URL = "https://stepperslife-2293uc4vm-stepperlifes-projects.vercel.app";
const EVENT_ID = "jh791vhae4757y8m0jfs449p6d7wcba7";

test("Test on direct deployment URL", async ({ page }) => {
  const logs: string[] = [];
  page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));

  // Navigate to direct deployment URL
  await page.goto(`${DEPLOYMENT_URL}/events/${EVENT_ID}/checkout`);
  await page.waitForTimeout(3000);

  // Check deployed code version
  const codeCheck = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const continueBtn = buttons.find(b => b.textContent?.includes('Continue to Payment'));
    if (!continueBtn) return { found: false };

    const propsKey = Object.keys(continueBtn).find(k => k.startsWith('__reactProps'));
    if (!propsKey) return { found: true, noProps: true };

    const props = (continueBtn as any)[propsKey];
    const fnSource = props.onClick?.toString() || '';

    return {
      found: true,
      fnLength: fnSource.length,
      fnPreview: fnSource.substring(0, 200),
      hasCheckoutLog: fnSource.includes('Checkout'),
    };
  });

  console.log("Code check on deployment URL:", JSON.stringify(codeCheck, null, 2));

  // If code is good, run the test
  if (codeCheck.hasCheckoutLog) {
    // Select tier
    await page.click('button:has-text("General Admission")');
    await page.waitForTimeout(1000);

    // Fill form
    await page.fill('input[type="text"]', "Direct URL Test");
    await page.fill('input[type="email"]', "direct@test.com");
    await page.waitForTimeout(500);

    // Click button
    await page.click('button:has-text("Continue to Payment")');
    await page.waitForTimeout(5000);

    // Check results
    const paymentVisible = await page.locator('text="Payment Method"').isVisible().catch(() => false);
    console.log(`Payment visible: ${paymentVisible}`);

    console.log("\nAll logs:");
    logs.forEach(l => console.log(`  ${l}`));
  } else {
    console.log("Code not updated yet on deployment URL");
    console.log("\nAll logs:");
    logs.forEach(l => console.log(`  ${l}`));
  }
});
