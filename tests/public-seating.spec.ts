import { test, expect } from '@playwright/test';

test('screenshot public event page with seating', async ({ page }) => {
  const eventId = 'k575qreqbdp1a6c9z01kv931f97y4r6v';

  // Go to the PUBLIC event page (no auth needed)
  await page.goto(`/events/${eventId}`);

  // Wait for content to fully render
  await page.waitForTimeout(5000);

  // Take screenshot - capture the full page
  await page.screenshot({
    path: 'test-results/event-page-with-seating.png',
    fullPage: true
  });
});
