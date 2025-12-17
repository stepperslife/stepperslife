/**
 * Check handler source code
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL = "https://stepperslife.com";
const EVENT_ID = "jh791vhae4757y8m0jfs449p6d7wcba7";

test("Check handler source in deployed code", async ({ page }) => {
  await page.goto(`${PRODUCTION_URL}/events/${EVENT_ID}/checkout`);
  await page.waitForTimeout(3000);

  // Select tier
  await page.click('button:has-text("General Admission")');
  await page.waitForTimeout(1500);

  // Fill form
  await page.fill('input[type="text"]', "Handler Check");
  await page.fill('input[type="email"]', "handler@test.com");
  await page.waitForTimeout(500);

  // Get handler source
  const handlerInfo = await page.evaluate(() => {
    const btn = document.getElementById('continue-payment-btn');
    if (!btn) return { found: false, reason: "Button not found by ID" };

    const reactPropsKey = Object.keys(btn).find(k => k.startsWith('__reactProps'));
    if (!reactPropsKey) return { found: true, noReactProps: true };

    const props = (btn as any)[reactPropsKey];
    if (!props || !props.onClick) return { found: true, noOnClick: true };

    const fnSource = props.onClick.toString();
    return {
      found: true,
      hasOnClick: true,
      fnLength: fnSource.length,
      fnSource: fnSource,
      hasProcessing: fnSource.includes('Processing'),
      hasGetElementById: fnSource.includes('getElementById'),
      hasTextContent: fnSource.includes('textContent'),
    };
  });

  console.log("Handler info:", JSON.stringify(handlerInfo, null, 2));
});
