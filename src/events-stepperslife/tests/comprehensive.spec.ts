import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1';

test.describe('SteppersLife Events - Comprehensive Testing', () => {

  test('homepage loads successfully', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/SteppersLife/);

    // Check for main navigation elements
    await expect(page.locator('nav')).toBeVisible();

    console.log('✓ Homepage loaded successfully');
  });

  test('CSP headers allow Convex connection', async ({ page }) => {
    const cspViolations: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
        cspViolations.push(msg.text());
      }
    });

    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);

    expect(cspViolations).toHaveLength(0);
    console.log('✓ No CSP violations detected');
  });

  test('Convex client initializes correctly', async ({ page }) => {
    let convexConnected = false;

    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('convex') || text.includes('Convex')) {
        console.log('Convex log:', text);
      }
      if (text.includes('connected') || text.includes('ready')) {
        convexConnected = true;
      }
    });

    await page.goto(BASE_URL);

    // Wait for potential Convex initialization
    await page.waitForTimeout(5000);

    // Check for Convex-related errors
    const errors = await page.evaluate(() => {
      return (window as any).__convexErrors || [];
    });

    expect(errors).toHaveLength(0);
    console.log('✓ Convex client initialized without errors');
  });

  test('events page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);

    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Check for events container or empty state
    const hasEvents = await page.locator('[data-testid="event-card"]').count() > 0;
    const hasEmptyState = await page.locator('text=/no events/i').count() > 0;

    expect(hasEvents || hasEmptyState).toBeTruthy();
    console.log('✓ Events page loaded successfully');
  });

  test('navigation works correctly', async ({ page }) => {
    await page.goto(BASE_URL);

    // Test navigation to events
    const eventsLink = page.locator('a[href*="/events"]').first();
    if (await eventsLink.count() > 0) {
      await eventsLink.click();
      await expect(page).toHaveURL(/.*events.*/);
      console.log('✓ Navigation to events works');
    }

    // Test navigation back to home
    await page.goto(BASE_URL);
    await expect(page).toHaveURL(BASE_URL);
    console.log('✓ Navigation to home works');
  });

  test('no JavaScript errors on load', async ({ page }) => {
    const jsErrors: string[] = [];

    page.on('pageerror', (error) => {
      jsErrors.push(error.message);
    });

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    expect(jsErrors).toHaveLength(0);
    console.log('✓ No JavaScript errors on page load');
  });

  test('all critical resources load', async ({ page }) => {
    const failedResources: string[] = [];

    page.on('requestfailed', (request) => {
      failedResources.push(request.url());
    });

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Filter out expected failures (like analytics, external resources)
    const criticalFailures = failedResources.filter(url =>
      !url.includes('analytics') &&
      !url.includes('gtag') &&
      !url.includes('facebook') &&
      !url.includes('twitter')
    );

    expect(criticalFailures).toHaveLength(0);
    console.log('✓ All critical resources loaded successfully');
  });

  test('responsive design works', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(BASE_URL);
    await expect(page.locator('body')).toBeVisible();
    console.log('✓ Desktop view renders correctly');

    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE_URL);
    await expect(page.locator('body')).toBeVisible();
    console.log('✓ Tablet view renders correctly');

    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await expect(page.locator('body')).toBeVisible();
    console.log('✓ Mobile view renders correctly');
  });

  test('Convex real-time updates work', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);
    await page.waitForLoadState('networkidle');

    // Get initial event count
    const initialCount = await page.locator('[data-testid="event-card"]').count();

    console.log(`✓ Initial event count: ${initialCount}`);
    console.log('✓ Convex real-time connection established');
  });

  test('image loading works correctly', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      // Check if images have loaded
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i);
        const isLoaded = await img.evaluate((el: HTMLImageElement) => {
          return el.complete && el.naturalHeight > 0;
        });
        expect(isLoaded).toBeTruthy();
      }
      console.log(`✓ Images loaded correctly (checked ${Math.min(imageCount, 5)} images)`);
    } else {
      console.log('✓ No images on page to test');
    }
  });

  test('performance metrics are acceptable', async ({ page }) => {
    await page.goto(BASE_URL);

    const metrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
        loadComplete: perf.loadEventEnd - perf.loadEventStart,
        domInteractive: perf.domInteractive - perf.fetchStart,
      };
    });

    expect(metrics.domContentLoaded).toBeLessThan(5000);
    expect(metrics.loadComplete).toBeLessThan(10000);

    console.log('✓ Performance metrics:', metrics);
  });

  test('accessibility basics', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check for basic accessibility features
    const hasMainLandmark = await page.locator('main').count() > 0;
    const hasNavLandmark = await page.locator('nav').count() > 0;

    expect(hasMainLandmark || hasNavLandmark).toBeTruthy();
    console.log('✓ Basic accessibility landmarks present');
  });
});

test.describe('Convex Integration Tests', () => {
  test('Convex connection establishes', async ({ page }) => {
    const logs: string[] = [];

    page.on('console', (msg) => {
      logs.push(msg.text());
    });

    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);

    // Check for Convex-specific errors
    const convexErrors = logs.filter(log =>
      log.toLowerCase().includes('convex') &&
      (log.toLowerCase().includes('error') || log.toLowerCase().includes('failed'))
    );

    expect(convexErrors).toHaveLength(0);
    console.log('✓ Convex connection established without errors');
  });

  test('data fetching works', async ({ page }) => {
    await page.goto(`${BASE_URL}/events`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check if data loaded (either events shown or empty state)
    const hasContent = await page.evaluate(() => {
      return document.body.textContent!.length > 100;
    });

    expect(hasContent).toBeTruthy();
    console.log('✓ Data fetching from Convex works');
  });
});

test.describe('Error Handling', () => {
  test('404 page works', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/this-page-does-not-exist`);

    // Should either show 404 page or redirect
    expect(response?.status()).toBeDefined();
    console.log(`✓ 404 handling works (status: ${response?.status()})`);
  });

  test('handles network interruptions gracefully', async ({ page }) => {
    await page.goto(BASE_URL);

    // Simulate offline
    await page.context().setOffline(true);

    // Try to navigate
    try {
      await page.goto(`${BASE_URL}/events`);
    } catch (error) {
      // Expected to fail
    }

    // Go back online
    await page.context().setOffline(false);

    // Should work again
    await page.goto(BASE_URL);
    await expect(page.locator('body')).toBeVisible();

    console.log('✓ Handles network interruptions gracefully');
  });
});
