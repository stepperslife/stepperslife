/**
 * Check for overlays blocking clicks
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL = "https://stepperslife.com";
const EVENT_ID = "jh791vhae4757y8m0jfs449p6d7wcba7";

test("Check for click blocking elements", async ({ page }) => {
  await page.goto(`${PRODUCTION_URL}/events/${EVENT_ID}/checkout`);
  await page.waitForTimeout(3000);

  // Select tier
  await page.click('button:has-text("General Admission")');
  await page.waitForTimeout(1500);

  // Fill form
  await page.fill('input[type="text"]', "Overlay Test");
  await page.fill('input[type="email"]', "overlay@test.com");
  await page.waitForTimeout(500);

  // Find button
  const btn = page.locator('button:has-text("Continue to Payment")');

  // Get button position
  const box = await btn.boundingBox();
  console.log(`Button bounding box: ${JSON.stringify(box)}`);

  if (box) {
    // Get element at center of button
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    const elementAtPoint = await page.evaluate(({x, y}) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return { found: false };
      return {
        found: true,
        tagName: el.tagName,
        id: el.id,
        className: el.className,
        textContent: el.textContent?.substring(0, 50),
        isButton: el.tagName === 'BUTTON',
      };
    }, { x: centerX, y: centerY });

    console.log(`Element at button center: ${JSON.stringify(elementAtPoint, null, 2)}`);

    // Check pointer-events
    const pointerEvents = await btn.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        pointerEvents: style.pointerEvents,
        visibility: style.visibility,
        display: style.display,
        opacity: style.opacity,
      };
    });
    console.log(`Button computed style: ${JSON.stringify(pointerEvents, null, 2)}`);
  }

  // Try force clicking
  console.log("\nTrying force click...");
  await btn.click({ force: true });
  await page.waitForTimeout(100);

  const textAfterForce = await btn.textContent().catch(() => "NOT FOUND");
  console.log(`Text after force click: "${textAfterForce}"`);

  // Try dispatchEvent
  console.log("\nTrying dispatchEvent...");
  await btn.dispatchEvent('click');
  await page.waitForTimeout(100);

  const textAfterDispatch = await btn.textContent().catch(() => "NOT FOUND");
  console.log(`Text after dispatchEvent: "${textAfterDispatch}"`);

  // Try evaluate click
  console.log("\nTrying evaluate click on element...");
  await btn.evaluate((el: Element) => {
    if (el instanceof HTMLElement) {
      el.click();
    }
  });
  await page.waitForTimeout(100);

  const textAfterEval = await btn.textContent().catch(() => "NOT FOUND");
  console.log(`Text after evaluate click: "${textAfterEval}"`);
});
