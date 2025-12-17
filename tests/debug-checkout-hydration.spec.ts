/**
 * Debug Checkout - Hydration Check
 * Waits for full hydration and checks React props
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL = "https://stepperslife.com";
const EVENT_ID = "jh791vhae4757y8m0jfs449p6d7wcba7";

test("Check React hydration and event handlers", async ({ page }) => {
  const logs: string[] = [];
  page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));

  // Navigate and wait for full load
  await page.goto(`${PRODUCTION_URL}/events/${EVENT_ID}/checkout`);

  // Wait for network to settle
  await page.waitForLoadState("networkidle").catch(() => {
    console.log("networkidle timeout - Stripe keeps connections open");
  });

  // Extra wait for hydration
  await page.waitForTimeout(5000);

  console.log("Page fully loaded, checking hydration...");

  // Check if React is hydrated
  const hydrationCheck = await page.evaluate(() => {
    // Look for React root
    const root = document.getElementById('__next') || document.body.firstElementChild;
    const hasReactRoot = root && Object.keys(root).some(k => k.startsWith('__reactContainer'));

    // Find the Continue button
    const buttons = Array.from(document.querySelectorAll('button'));
    const continueBtn = buttons.find(b => b.textContent?.includes('Continue to Payment'));

    if (!continueBtn) {
      return { hydrated: hasReactRoot, buttonFound: false };
    }

    // Get React fiber/props
    const reactKeys = Object.keys(continueBtn).filter(k =>
      k.startsWith('__reactFiber') || k.startsWith('__reactProps')
    );

    // Check onClick handler
    const propsKey = Object.keys(continueBtn).find(k => k.startsWith('__reactProps'));
    let hasOnClick = false;
    let onClickType = 'none';

    if (propsKey) {
      const props = (continueBtn as any)[propsKey];
      if (props && props.onClick) {
        hasOnClick = true;
        onClickType = typeof props.onClick;
      }
    }

    return {
      hydrated: hasReactRoot,
      buttonFound: true,
      reactKeys: reactKeys,
      hasOnClick: hasOnClick,
      onClickType: onClickType,
      buttonDisabled: continueBtn.disabled,
      buttonClasses: continueBtn.className,
    };
  });

  console.log("Hydration check:", JSON.stringify(hydrationCheck, null, 2));

  // Select tier
  console.log("\nSelecting tier...");
  await page.click('button:has-text("General Admission")');
  await page.waitForTimeout(1500);

  // Fill form
  console.log("Filling form...");
  await page.fill('input[type="text"]', "Hydration Test");
  await page.fill('input[type="email"]', "hydration@test.com");
  await page.waitForTimeout(1000);

  // Recheck button after form filled
  const buttonCheckAfterForm = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const continueBtn = buttons.find(b => b.textContent?.includes('Continue to Payment'));

    if (!continueBtn) return { found: false };

    const propsKey = Object.keys(continueBtn).find(k => k.startsWith('__reactProps'));
    let hasOnClick = false;

    if (propsKey) {
      const props = (continueBtn as any)[propsKey];
      hasOnClick = props && typeof props.onClick === 'function';
    }

    return {
      found: true,
      hasOnClick,
      disabled: continueBtn.disabled,
    };
  });

  console.log("Button after form:", buttonCheckAfterForm);

  // Screenshot before click
  await page.screenshot({ path: "test-results/hydration-before.png" });

  // Now try clicking with React event simulation
  console.log("\nClicking button...");

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const continueBtn = buttons.find(b => b.textContent?.includes('Continue to Payment'));

    if (!continueBtn) {
      console.log('[Eval] Button not found!');
      return;
    }

    // Try calling onClick from React props directly
    const propsKey = Object.keys(continueBtn).find(k => k.startsWith('__reactProps'));
    if (propsKey) {
      const props = (continueBtn as any)[propsKey];
      if (props && props.onClick) {
        console.log('[Eval] Calling onClick directly from React props');
        // Create a synthetic event
        const syntheticEvent = {
          preventDefault: () => {},
          stopPropagation: () => {},
          target: continueBtn,
          currentTarget: continueBtn,
          nativeEvent: new MouseEvent('click'),
        };
        props.onClick(syntheticEvent);
      }
    }

    // Also dispatch regular click
    console.log('[Eval] Dispatching native click');
    continueBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  // Wait for response
  await page.waitForTimeout(5000);

  // Screenshot after
  await page.screenshot({ path: "test-results/hydration-after.png" });

  // Check results
  const paymentVisible = await page.locator('text="Payment Method"').isVisible().catch(() => false);
  const toastCount = await page.locator('[class*="toast"], [data-sonner-toaster]').count();

  console.log(`\nPayment visible: ${paymentVisible}`);
  console.log(`Toast count: ${toastCount}`);

  // Print all logs from browser
  console.log(`\nAll browser logs (${logs.length}):`);
  logs.forEach(l => console.log(`  ${l}`));
});
