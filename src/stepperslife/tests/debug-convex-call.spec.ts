/**
 * Debug Convex mutation call
 * Watch for network errors when calling createOrder
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL = "https://stepperslife.com";
const EVENT_ID = "jh791vhae4757y8m0jfs449p6d7wcba7";

test("Debug Convex mutation call", async ({ page }) => {
  const logs: string[] = [];
  page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));

  // Track network requests
  const networkErrors: string[] = [];
  const convexRequests: string[] = [];

  page.on("requestfailed", (request) => {
    networkErrors.push(`[FAILED] ${request.url()}`);
  });

  page.on("response", async (response) => {
    const url = response.url();
    if (url.includes("convex")) {
      const status = response.status();
      let preview = "";
      try {
        const body = await response.text();
        preview = body.substring(0, 200);
      } catch (e) {
        preview = "(could not read body)";
      }
      convexRequests.push(`[RESPONSE ${status}] ${url.substring(0, 80)} - ${preview}`);
    }
  });

  // Navigate
  await page.goto(`${PRODUCTION_URL}/events/${EVENT_ID}/checkout`);
  await page.waitForTimeout(3000);

  // Select tier
  await page.click('button:has-text("General Admission")');
  await page.waitForTimeout(1500);

  // Fill form
  await page.fill('input[type="text"]', "Convex Debug Test");
  await page.fill('input[type="email"]', "convex-debug@test.com");
  await page.waitForTimeout(500);

  // Clear previous network logs
  convexRequests.length = 0;
  networkErrors.length = 0;

  // Click Continue to Payment
  console.log("\nClicking Continue to Payment...");
  await page.click('button:has-text("Continue to Payment")');

  // Wait for mutation to complete
  await page.waitForTimeout(8000);

  // Screenshot
  await page.screenshot({ path: "test-results/convex-debug.png", fullPage: true });

  // Check results
  const paymentVisible = await page.locator('text="Payment Method"').isVisible().catch(() => false);
  const toastElements = await page.locator('[class*="toast"], [data-sonner-toaster]').count();

  console.log("\n=== RESULTS ===");
  console.log(`Payment visible: ${paymentVisible}`);
  console.log(`Toast elements: ${toastElements}`);

  console.log("\n=== NETWORK ERRORS ===");
  if (networkErrors.length === 0) {
    console.log("  (none)");
  } else {
    networkErrors.forEach(e => console.log(`  ${e}`));
  }

  console.log("\n=== CONVEX REQUESTS ===");
  if (convexRequests.length === 0) {
    console.log("  (none captured)");
  } else {
    convexRequests.forEach(r => console.log(`  ${r}`));
  }

  console.log("\n=== BROWSER LOGS ===");
  logs.filter(l => !l.includes("401")).forEach(l => console.log(`  ${l}`));
});
