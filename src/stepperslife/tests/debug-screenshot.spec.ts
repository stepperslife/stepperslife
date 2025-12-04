/**
 * Just take a screenshot
 */

import { test, expect } from "@playwright/test";

const DEPLOYMENT_URL = "https://stepperslife-2293uc4vm-stepperlifes-projects.vercel.app";
const EVENT_ID = "jh791vhae4757y8m0jfs449p6d7wcba7";

test("Screenshot test", async ({ page }) => {
  await page.goto(`${DEPLOYMENT_URL}/events/${EVENT_ID}/checkout`);
  await page.waitForTimeout(5000);

  await page.screenshot({ path: "test-results/deployment-url.png", fullPage: true });

  const pageTitle = await page.title();
  console.log("Page title:", pageTitle);

  const pageUrl = page.url();
  console.log("Page URL:", pageUrl);

  const bodyText = await page.locator('body').textContent();
  console.log("Body preview:", bodyText?.substring(0, 500));
});
