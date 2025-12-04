/**
 * Debug Stripe response
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL = "https://stepperslife.com";
const EVENT_ID = "jh791vhae4757y8m0jfs449p6d7wcba7";

test("Debug Stripe response", async ({ page }) => {
  // Track Stripe API response
  let stripeResponse: any = null;
  page.on("response", async (res) => {
    if (res.url().includes("/api/stripe/create-payment-intent")) {
      const status = res.status();
      let body = "";
      try {
        body = await res.text();
      } catch (e) {
        body = "(could not read)";
      }
      stripeResponse = { status, body: body.substring(0, 500) };
      console.log(`Stripe response: ${status} - ${body.substring(0, 200)}`);
    }
  });

  // Load page
  await page.goto(`${PRODUCTION_URL}/events/${EVENT_ID}/checkout`);
  await page.waitForTimeout(3000);

  // Select tier and fill form
  await page.click('button:has-text("General Admission")');
  await page.waitForTimeout(1500);
  await page.fill('input[type="text"]', "Stripe Debug");
  await page.fill('input[type="email"]', "stripe@test.com");
  await page.waitForTimeout(500);

  // Call onClick directly
  await page.evaluate(() => {
    const btn = document.getElementById('continue-payment-btn');
    const propsKey = Object.keys(btn!).find(k => k.startsWith('__reactProps'));
    (btn as any)[propsKey!].onClick({ preventDefault: () => {} });
  });

  // Wait for Stripe response
  await page.waitForTimeout(8000);

  // Take screenshot
  await page.screenshot({ path: "test-results/stripe-debug.png", fullPage: true });

  // Check results
  console.log(`\nStripe response:`, stripeResponse);

  const paymentVisible = await page.locator('text="Payment Method"').isVisible().catch(() => false);
  const stripeForm = await page.locator('[class*="StripeElement"], [class*="stripe"]').count();
  const errorAlert = await page.locator('[role="alert"], [class*="error"]').count();

  console.log(`Payment visible: ${paymentVisible}`);
  console.log(`Stripe form elements: ${stripeForm}`);
  console.log(`Error alerts: ${errorAlert}`);

  // Check for error text
  const errorText = await page.locator('text=/error|failed|unable/i').allTextContents();
  if (errorText.length > 0) {
    console.log(`Error text found: ${errorText.join(', ')}`);
  }
});
