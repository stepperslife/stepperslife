import { test, expect } from '@playwright/test';

test('screenshot seating chart builder', async ({ page }) => {
  // First, login with test organizer credentials
  await page.goto('/login');
  await page.waitForSelector('input[type="email"]');

  // Use test organizer credentials - try e2e test user
  await page.fill('input[type="email"]', 'e2e-test@stepperslife.com');
  await page.fill('input[type="password"]', 'E2ETestPassword123!');
  await page.click('button:has-text("Sign In")');

  // Wait for login to complete and redirect
  await page.waitForURL('**/organizer/**', { timeout: 10000 }).catch(() => {
    console.log('Login may have failed, continuing anyway');
  });

  await page.waitForTimeout(2000);

  // Use a test event ID
  const eventId = 'k575qreqbdp1a6c9z01kv931f97y4r6v';

  // Go to the seating chart builder page
  await page.goto(`/organizer/events/${eventId}/seating`);

  // Wait for content to fully render
  await page.waitForTimeout(5000);

  // Take screenshot - capture the full page
  await page.screenshot({
    path: 'test-results/seating-chart-builder.png',
    fullPage: true
  });
});
