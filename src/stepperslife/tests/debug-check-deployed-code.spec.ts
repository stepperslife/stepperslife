/**
 * Check what code is actually deployed
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL = "https://stepperslife.com";
const EVENT_ID = "jh791vhae4757y8m0jfs449p6d7wcba7";

test("Check deployed code version", async ({ page }) => {
  const logs: string[] = [];
  page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));

  await page.goto(`${PRODUCTION_URL}/events/${EVENT_ID}/checkout`);
  await page.waitForTimeout(3000);

  // Select tier to make button appear
  await page.click('button:has-text("General Admission")');
  await page.waitForTimeout(1000);

  // Fill form
  await page.fill('input[type="text"]', "Code Check");
  await page.fill('input[type="email"]', "check@test.com");
  await page.waitForTimeout(500);

  // Get the onClick handler source code
  const handlerInfo = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const continueBtn = buttons.find(b => b.textContent?.includes('Continue to Payment'));

    if (!continueBtn) return { found: false };

    const propsKey = Object.keys(continueBtn).find(k => k.startsWith('__reactProps'));
    if (!propsKey) return { found: true, noProps: true };

    const props = (continueBtn as any)[propsKey];
    if (!props || !props.onClick) return { found: true, noOnClick: true };

    // Get the function source
    const fnSource = props.onClick.toString();

    // Check for specific strings that should be in our code
    const hasLoadingToast = fnSource.includes('loading') || fnSource.includes('Creating order');
    const hasDebugLog = fnSource.includes('[Checkout]');

    return {
      found: true,
      hasOnClick: true,
      fnSourceLength: fnSource.length,
      fnSourcePreview: fnSource.substring(0, 500),
      hasLoadingToast,
      hasDebugLog,
    };
  });

  console.log("Handler info:", JSON.stringify(handlerInfo, null, 2));

  // Also check for our debug inline click handler
  const inlineHandlerCheck = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const continueBtn = buttons.find(b => b.textContent?.includes('Continue to Payment'));

    if (!continueBtn) return { found: false };

    const propsKey = Object.keys(continueBtn).find(k => k.startsWith('__reactProps'));
    if (!propsKey) return { found: true, noProps: true };

    const props = (continueBtn as any)[propsKey];
    const fnSource = props.onClick?.toString() || '';

    // Check if it's an inline handler with console.log
    const hasInlineLog = fnSource.includes('Button clicked directly');
    const hasPreventDefault = fnSource.includes('preventDefault');

    return {
      hasInlineLog,
      hasPreventDefault,
      isInlineHandler: fnSource.includes('=>') && fnSource.length < 300,
    };
  });

  console.log("Inline handler check:", inlineHandlerCheck);

  console.log("\nAll browser logs:");
  logs.forEach(l => console.log(`  ${l}`));
});
