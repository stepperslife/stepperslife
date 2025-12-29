import { test, expect } from '@playwright/test';

test('walk through table buying flow', async ({ page }) => {
  const eventId = 'k575qreqbdp1a6c9z01kv931f97y4r6v';

  // Go to the PUBLIC event page
  await page.goto(`/events/${eventId}`);
  await page.waitForTimeout(2000);

  // Screenshot 1: Initial event page
  await page.screenshot({
    path: 'test-results/buy-flow-1-event-page.png',
    fullPage: true
  });

  // Click "View Seating Chart" button
  await page.click('button:has-text("View Seating Chart")');
  await page.waitForTimeout(2000);

  // Screenshot 2: Seating chart view
  await page.screenshot({
    path: 'test-results/buy-flow-2-seating-chart.png',
    fullPage: false
  });

  // Try to click on Table 1
  const table1 = page.locator('text=Table 1').first();
  if (await table1.isVisible()) {
    await table1.click();
    await page.waitForTimeout(1000);
  }

  // Screenshot 3: After clicking table
  await page.screenshot({
    path: 'test-results/buy-flow-3-after-table-click.png',
    fullPage: false
  });

  // Try clicking various elements to find interactive seats
  // Try SVG circles
  try {
    const circles = page.locator('svg circle').first();
    if (await circles.count() > 0) {
      await circles.click({ timeout: 2000 });
      await page.waitForTimeout(500);
    }
  } catch (e) {
    console.log('No SVG circles found');
  }

  // Screenshot 4: After trying to click elements
  await page.screenshot({
    path: 'test-results/buy-flow-4-interactions.png',
    fullPage: false
  });

  // Check the full page for any buttons or actionable elements
  await page.screenshot({
    path: 'test-results/buy-flow-5-full-page.png',
    fullPage: true
  });

  // Look for Quick Actions section mentioned in the UI
  const quickActions = page.locator('text=Quick Actions');
  if (await quickActions.isVisible()) {
    await quickActions.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
  }

  // Screenshot 6: Quick Actions area
  await page.screenshot({
    path: 'test-results/buy-flow-6-quick-actions.png',
    fullPage: false
  });
});
