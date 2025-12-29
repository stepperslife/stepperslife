import { test, expect } from '@playwright/test';

test('screenshot seating chart modal', async ({ page }) => {
  const eventId = 'k575qreqbdp1a6c9z01kv931f97y4r6v';

  // Go to the PUBLIC event page (no auth needed)
  await page.goto(`/events/${eventId}`);

  // Wait for page to load
  await page.waitForTimeout(3000);

  // Click the "View Seating Chart" button
  await page.click('button:has-text("View Seating Chart")');

  // Wait for modal/chart to appear
  await page.waitForTimeout(2000);

  // Take screenshot
  await page.screenshot({
    path: 'test-results/seating-chart-view.png',
    fullPage: false
  });
});
