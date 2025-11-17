import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1';

test.describe('Quick Verification Tests', () => {

  test('homepage loads without errors', async ({ page }) => {
    const errors: string[] = [];
    const cspViolations: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        if (msg.text().includes('Content Security Policy')) {
          cspViolations.push(msg.text());
        }
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Check page loaded
    await expect(page).toHaveTitle(/SteppersLife/);

    // Check for CSP violations
    console.log('CSP Violations:', cspViolations.length);
    console.log('Total Errors:', errors.length);

    if (cspViolations.length > 0) {
      console.log('CSP Violation Details:', cspViolations);
    }

    expect(cspViolations).toHaveLength(0);
  });

  test('no CSP violations on events page', async ({ page }) => {
    const cspViolations: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
        cspViolations.push(msg.text());
      }
    });

    await page.goto(`${BASE_URL}/events`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('CSP Violations on /events:', cspViolations.length);

    if (cspViolations.length > 0) {
      console.log('Details:', cspViolations);
    }

    expect(cspViolations).toHaveLength(0);
  });

  test('Convex resources load successfully', async ({ page }) => {
    const convexRequests: { url: string; status: number }[] = [];
    const failedConvexRequests: string[] = [];

    page.on('response', (response) => {
      if (response.url().includes('convex.cloud')) {
        convexRequests.push({
          url: response.url(),
          status: response.status()
        });

        if (!response.ok()) {
          failedConvexRequests.push(`${response.url()} - Status: ${response.status()}`);
        }
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    console.log('Convex Requests:', convexRequests.length);
    console.log('Failed Convex Requests:', failedConvexRequests.length);

    if (convexRequests.length > 0) {
      console.log('Convex Request Details:', convexRequests);
    }

    if (failedConvexRequests.length > 0) {
      console.log('Failed Requests:', failedConvexRequests);
    }

    expect(failedConvexRequests).toHaveLength(0);
  });

  test('page renders main content', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check for main navigation
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Check for footer
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    console.log('✓ Main content rendered successfully');
  });

  test('events page renders', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);
    await page.waitForLoadState('networkidle');

    // Page should have title or loading state
    const hasContent = await page.evaluate(() => {
      const text = document.body.textContent || '';
      return text.includes('Events') || text.includes('Loading');
    });

    expect(hasContent).toBeTruthy();
    console.log('✓ Events page rendered');
  });
});
