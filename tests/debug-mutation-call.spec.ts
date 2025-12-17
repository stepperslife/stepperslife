/**
 * Debug mutation call - track what happens after onClick
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL = "https://stepperslife.com";
const EVENT_ID = "jh791vhae4757y8m0jfs449p6d7wcba7";

test("Debug mutation call", async ({ page }) => {
  const allLogs: string[] = [];
  page.on("console", (msg) => allLogs.push(`[${msg.type()}] ${msg.text()}`));

  // Track network
  const networkLog: string[] = [];
  page.on("request", (req) => {
    const url = req.url();
    if (url.includes("convex") || url.includes("api")) {
      networkLog.push(`[REQ] ${req.method()} ${url}`);
    }
  });
  page.on("response", async (res) => {
    const url = res.url();
    if (url.includes("convex")) {
      networkLog.push(`[RES ${res.status()}] ${url}`);
    }
  });

  // Load page
  await page.goto(`${PRODUCTION_URL}/events/${EVENT_ID}/checkout`);
  await page.waitForTimeout(3000);

  // Select tier
  await page.click('button:has-text("General Admission")');
  await page.waitForTimeout(1500);

  // Fill form
  await page.fill('input[type="text"]', "Mutation Debug");
  await page.fill('input[type="email"]', "mutation@test.com");
  await page.waitForTimeout(500);

  // Clear network log
  networkLog.length = 0;

  // Call onClick handler directly
  console.log("\nCalling onClick directly...");
  const callResult = await page.evaluate(() => {
    const btn = document.getElementById('continue-payment-btn');
    if (!btn) return { error: "No button" };

    const propsKey = Object.keys(btn).find(k => k.startsWith('__reactProps'));
    if (!propsKey) return { error: "No reactProps" };

    const props = (btn as any)[propsKey];
    if (!props.onClick) return { error: "No onClick" };

    props.onClick({ preventDefault: () => {} });
    return { success: true };
  });

  console.log(`Call result: ${JSON.stringify(callResult)}`);

  // Wait for any network activity
  await page.waitForTimeout(8000);

  // Check results
  const paymentVisible = await page.locator('text="Payment Method"').isVisible().catch(() => false);
  const toastCount = await page.locator('[class*="toast"], [data-sonner-toaster]').count();

  console.log(`\n=== RESULTS ===`);
  console.log(`Payment visible: ${paymentVisible}`);
  console.log(`Toast count: ${toastCount}`);

  console.log(`\n=== NETWORK LOG ===`);
  if (networkLog.length === 0) {
    console.log("  (no relevant requests)");
  } else {
    networkLog.forEach(l => console.log(`  ${l}`));
  }

  console.log(`\n=== RELEVANT LOGS ===`);
  allLogs.filter(l =>
    l.includes('Checkout') ||
    l.includes('order') ||
    l.includes('mutation') ||
    l.includes('Creating') ||
    l.includes('loading')
  ).forEach(l => console.log(`  ${l}`));
});
