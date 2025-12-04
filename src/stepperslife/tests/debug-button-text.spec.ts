/**
 * Debug Button Text Change
 * Verifies the button text changes on click
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL = "https://stepperslife.com";
const EVENT_ID = "jh791vhae4757y8m0jfs449p6d7wcba7";

test("Button text should change on click", async ({ page }) => {
  // Navigate
  await page.goto(`${PRODUCTION_URL}/events/${EVENT_ID}/checkout`);
  await page.waitForTimeout(3000);

  // Select tier
  await page.click('button:has-text("General Admission")');
  await page.waitForTimeout(1500);

  // Fill form
  await page.fill('input[type="text"]', "Button Text Test");
  await page.fill('input[type="email"]', "button@test.com");
  await page.waitForTimeout(500);

  // Get button text before click
  const continueBtn = page.locator('#continue-payment-btn, button:has-text("Continue to Payment")');
  const textBefore = await continueBtn.textContent();
  console.log(`Button text BEFORE click: "${textBefore}"`);

  // Screenshot before
  await page.screenshot({ path: "test-results/button-before.png", fullPage: true });

  // Click the button
  await continueBtn.click();

  // Wait a tiny bit
  await page.waitForTimeout(100);

  // Get button text after click
  const textAfter = await continueBtn.textContent().catch(() => "BUTTON NOT FOUND");
  console.log(`Button text AFTER click: "${textAfter}"`);

  // Screenshot after
  await page.screenshot({ path: "test-results/button-after.png", fullPage: true });

  // Wait more to see what happens
  await page.waitForTimeout(5000);

  // Final state
  const textFinal = await continueBtn.textContent().catch(() => "BUTTON NOT FOUND");
  console.log(`Button text FINAL: "${textFinal}"`);

  // Check results
  const paymentVisible = await page.locator('text="Payment Method"').isVisible().catch(() => false);
  console.log(`Payment section visible: ${paymentVisible}`);

  // Verify button text changed
  if (textAfter === "Processing...") {
    console.log("✅ Button click handler IS running!");
  } else {
    console.log("❌ Button click handler NOT running - text didn't change");
  }
});
