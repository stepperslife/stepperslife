/**
 * Final hydration debug
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL = "https://stepperslife.com";
const EVENT_ID = "jh791vhae4757y8m0jfs449p6d7wcba7";

test("Final hydration debug", async ({ page }) => {
  const allLogs: string[] = [];
  page.on("console", (msg) => {
    const text = msg.text();
    allLogs.push(`[${msg.type()}] ${text}`);
    // Print warnings/errors immediately
    if (msg.type() === 'warning' || msg.type() === 'error') {
      if (!text.includes('401')) {
        console.log(`  >> ${text.substring(0, 200)}`);
      }
    }
  });

  page.on("pageerror", (error) => {
    console.log(`  !! PAGE ERROR: ${error.message}`);
  });

  console.log("Loading page...");
  await page.goto(`${PRODUCTION_URL}/events/${EVENT_ID}/checkout`);

  // Wait for hydration
  console.log("Waiting for hydration...");
  await page.waitForTimeout(5000);

  // Select tier
  console.log("Selecting tier...");
  await page.click('button:has-text("General Admission")');
  await page.waitForTimeout(1500);

  // Fill form
  console.log("Filling form...");
  await page.fill('input[type="text"]', "Hydration Final");
  await page.fill('input[type="email"]', "final@test.com");
  await page.waitForTimeout(500);

  // Check if React is properly hydrated
  const reactState = await page.evaluate(() => {
    const root = document.getElementById('__next');
    if (!root) return { hasRoot: false };

    const reactKeys = Object.keys(root).filter(k => k.startsWith('__react'));
    const btn = document.getElementById('continue-payment-btn');

    return {
      hasRoot: true,
      rootReactKeys: reactKeys,
      buttonExists: !!btn,
      buttonReactKeys: btn ? Object.keys(btn).filter(k => k.startsWith('__react')) : [],
    };
  });

  console.log(`React state: ${JSON.stringify(reactState, null, 2)}`);

  // Call the handler directly via React props
  console.log("\nCalling onClick handler directly...");
  const callResult = await page.evaluate(() => {
    const btn = document.getElementById('continue-payment-btn');
    if (!btn) return { success: false, reason: "No button" };

    const propsKey = Object.keys(btn).find(k => k.startsWith('__reactProps'));
    if (!propsKey) return { success: false, reason: "No reactProps" };

    const props = (btn as any)[propsKey];
    if (!props || !props.onClick) return { success: false, reason: "No onClick" };

    try {
      const fakeEvent = {
        preventDefault: () => {},
        stopPropagation: () => {},
      };
      props.onClick(fakeEvent);
      return { success: true, buttonTextAfter: btn.textContent };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  console.log(`Direct call result: ${JSON.stringify(callResult, null, 2)}`);

  await page.waitForTimeout(3000);

  // Check final state
  const finalText = await page.locator('#continue-payment-btn').textContent().catch(() => "NOT FOUND");
  const paymentVisible = await page.locator('text="Payment Method"').isVisible().catch(() => false);

  console.log(`\nFinal button text: "${finalText}"`);
  console.log(`Payment visible: ${paymentVisible}`);

  // Print React-related logs
  const reactLogs = allLogs.filter(l =>
    l.includes('hydrat') ||
    l.includes('React') ||
    l.includes('warning') ||
    l.includes('error')
  );
  if (reactLogs.length > 0) {
    console.log(`\nReact-related logs (${reactLogs.length}):`);
    reactLogs.forEach(l => console.log(`  ${l}`));
  }
});
