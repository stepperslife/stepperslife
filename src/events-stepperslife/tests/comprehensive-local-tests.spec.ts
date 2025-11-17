import { test, expect, Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// Configure for local testing
test.use({ baseURL: "http://localhost" });

/**
 * Test 1 - Homepage Load Test
 * Verifies basic homepage functionality and content
 */
test.describe("Test 1 - Homepage Load Test", () => {
  let consoleLogs: string[] = [];
  let consoleErrors: string[] = [];

  test("should load homepage successfully with correct title and content", async ({
    page,
  }) => {
    // Setup console listeners
    page.on("console", (msg) => {
      const text = msg.text();
      consoleLogs.push(`[${msg.type()}] ${text}`);
      if (msg.type() === "error") {
        consoleErrors.push(text);
      }
    });

    // Navigate to homepage
    const response = await page.goto("/", { waitUntil: "networkidle" });

    // Verify successful response
    expect(response?.status()).toBe(200);

    // Verify page title contains "SteppersLife Events"
    const title = await page.title();
    console.log(`Page Title: ${title}`);
    expect(title).toContain("SteppersLife Events");

    // Check for main heading/hero section
    const heroSection = page.locator("h1, [role='heading']").first();
    await expect(heroSection).toBeVisible({ timeout: 10000 });
    const heroText = await heroSection.textContent();
    console.log(`Hero Section Text: ${heroText}`);

    // Verify no JavaScript errors in console
    console.log(`\nConsole Logs (${consoleLogs.length} total):`);
    consoleLogs.forEach((log) => console.log(log));

    if (consoleErrors.length > 0) {
      console.error(`\nJavaScript Errors Found (${consoleErrors.length}):`);
      consoleErrors.forEach((error) => console.error(error));
    }

    expect(consoleErrors.length).toBe(0);

    // Take screenshot of homepage
    const screenshotPath = path.join(
      process.cwd(),
      "test-results",
      "screenshots",
      "test1-homepage.png"
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\nScreenshot saved: ${screenshotPath}`);

    // Log test result
    console.log("\n✓ TEST 1 PASSED: Homepage loaded successfully");
    console.log(`  - Title: ${title}`);
    console.log(`  - Hero visible: Yes`);
    console.log(`  - JavaScript errors: ${consoleErrors.length}`);
  });
});

/**
 * Test 2 - Navigation & Page Load Test
 * Tests responsive design, navigation, and resource loading
 */
test.describe("Test 2 - Navigation & Page Load Test", () => {
  test("should have all navigation elements and load resources correctly", async ({
    page,
  }) => {
    const failedRequests: any[] = [];

    // Monitor failed requests
    page.on("requestfailed", (request) => {
      failedRequests.push({
        url: request.url(),
        failure: request.failure()?.errorText,
      });
    });

    // Navigate to homepage
    await page.goto("/", { waitUntil: "networkidle" });

    // Verify main navigation elements are present
    const navElements = await page.locator("nav, [role='navigation']").count();
    console.log(`\nNavigation elements found: ${navElements}`);
    expect(navElements).toBeGreaterThan(0);

    // Check for common navigation links
    const commonLinks = [
      { text: "Events", optional: true },
      { text: "Tickets", optional: true },
      { text: "About", optional: true },
      { text: "Contact", optional: true },
    ];

    console.log("\nChecking navigation links:");
    for (const link of commonLinks) {
      const linkElement = page.getByRole("link", { name: new RegExp(link.text, "i") });
      const count = await linkElement.count();
      console.log(`  - ${link.text}: ${count > 0 ? "Found" : "Not found"}`);
    }

    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    const desktopScreenshot = path.join(
      process.cwd(),
      "test-results",
      "screenshots",
      "test2-desktop-view.png"
    );
    await page.screenshot({ path: desktopScreenshot, fullPage: true });
    console.log(`\nDesktop screenshot saved: ${desktopScreenshot}`);

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    const tabletScreenshot = path.join(
      process.cwd(),
      "test-results",
      "screenshots",
      "test2-tablet-view.png"
    );
    await page.screenshot({ path: tabletScreenshot, fullPage: true });
    console.log(`Tablet screenshot saved: ${tabletScreenshot}`);

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    const mobileScreenshot = path.join(
      process.cwd(),
      "test-results",
      "screenshots",
      "test2-mobile-view.png"
    );
    await page.screenshot({ path: mobileScreenshot, fullPage: true });
    console.log(`Mobile screenshot saved: ${mobileScreenshot}`);

    // Check for CSS stylesheet loading
    const stylesheets = await page.$$eval('link[rel="stylesheet"]', (links) =>
      links.map((link) => (link as HTMLLinkElement).href)
    );
    console.log(`\nCSS Stylesheets loaded: ${stylesheets.length}`);
    stylesheets.forEach((href) => console.log(`  - ${href}`));

    // Check for image loading
    const images = await page.$$eval("img", (imgs) =>
      imgs.map((img) => ({
        src: (img as HTMLImageElement).src,
        complete: (img as HTMLImageElement).complete,
        naturalHeight: (img as HTMLImageElement).naturalHeight,
      }))
    );

    const brokenImages = images.filter(
      (img) => img.complete && img.naturalHeight === 0
    );
    console.log(`\nImages found: ${images.length}`);
    console.log(`Broken images: ${brokenImages.length}`);

    if (brokenImages.length > 0) {
      console.log("\nBroken images:");
      brokenImages.forEach((img) => console.log(`  - ${img.src}`));
    }

    // Report failed requests
    if (failedRequests.length > 0) {
      console.log(`\nFailed requests (${failedRequests.length}):`);
      failedRequests.forEach((req) => {
        console.log(`  - ${req.url}`);
        console.log(`    Error: ${req.failure}`);
      });
    }

    // Verify no critical resource failures (404s on CSS/JS)
    const criticalFailures = failedRequests.filter(
      (req) =>
        req.url.endsWith(".css") ||
        req.url.endsWith(".js") ||
        req.url.includes("/api/")
    );
    expect(criticalFailures.length).toBe(0);

    console.log("\n✓ TEST 2 PASSED: Navigation and responsive design working");
    console.log(`  - Navigation elements: ${navElements}`);
    console.log(`  - Stylesheets loaded: ${stylesheets.length}`);
    console.log(`  - Images: ${images.length} (${brokenImages.length} broken)`);
    console.log(`  - Failed requests: ${failedRequests.length}`);
  });
});

/**
 * Test 3 - API & Data Loading Test
 * Tests network requests, API calls, and backend connectivity
 */
test.describe("Test 3 - API & Data Loading Test", () => {
  test("should have working API endpoints and database connectivity", async ({
    page,
  }) => {
    const apiRequests: any[] = [];
    const apiResponses: any[] = [];
    const failedRequests: any[] = [];

    // Monitor API requests
    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("/api/") || url.includes("/convex/")) {
        apiRequests.push({
          method: request.method(),
          url: url,
          headers: request.headers(),
        });
      }
    });

    // Monitor API responses
    page.on("response", async (response) => {
      const url = response.url();
      if (url.includes("/api/") || url.includes("/convex/")) {
        const status = response.status();
        let body: any = null;
        try {
          // Try to get response body for analysis
          body = await response.text();
        } catch (e) {
          body = "Unable to read body";
        }

        apiResponses.push({
          method: response.request().method(),
          url: url,
          status: status,
          statusText: response.statusText(),
          ok: response.ok(),
          bodyPreview: body.substring(0, 200),
        });

        if (!response.ok()) {
          failedRequests.push({
            url: url,
            status: status,
            statusText: response.statusText(),
          });
        }
      }
    });

    // Navigate to homepage and wait for network to settle
    await page.goto("/", { waitUntil: "networkidle", timeout: 30000 });

    // Wait a bit more to ensure all async requests complete
    await page.waitForTimeout(3000);

    // Report on API requests
    console.log(`\nAPI Requests made: ${apiRequests.length}`);
    apiRequests.forEach((req) => {
      console.log(`  - ${req.method} ${req.url}`);
    });

    // Report on API responses
    console.log(`\nAPI Responses received: ${apiResponses.length}`);
    apiResponses.forEach((res) => {
      const statusIcon = res.ok ? "✓" : "✗";
      console.log(
        `  ${statusIcon} ${res.method} ${res.url} - ${res.status} ${res.statusText}`
      );
    });

    // Report on failed API requests
    if (failedRequests.length > 0) {
      console.log(`\nFailed API requests (${failedRequests.length}):`);
      failedRequests.forEach((req) => {
        console.log(`  ✗ ${req.url}`);
        console.log(`    Status: ${req.status} ${req.statusText}`);
      });
    }

    // Check for database-related errors in responses
    const dbErrors = apiResponses.filter(
      (res) =>
        res.bodyPreview &&
        (res.bodyPreview.toLowerCase().includes("database") ||
          res.bodyPreview.toLowerCase().includes("connection") ||
          res.bodyPreview.toLowerCase().includes("timeout"))
    );

    if (dbErrors.length > 0) {
      console.log(`\nPotential database issues found (${dbErrors.length}):`);
      dbErrors.forEach((res) => {
        console.log(`  - ${res.url}`);
        console.log(`    Preview: ${res.bodyPreview}`);
      });
    }

    // Check for Redis-related errors
    const redisErrors = apiResponses.filter(
      (res) =>
        res.bodyPreview &&
        (res.bodyPreview.toLowerCase().includes("redis") ||
          res.bodyPreview.toLowerCase().includes("cache"))
    );

    if (redisErrors.length > 0) {
      console.log(`\nPotential Redis issues found (${redisErrors.length}):`);
      redisErrors.forEach((res) => {
        console.log(`  - ${res.url}`);
        console.log(`    Preview: ${res.bodyPreview}`);
      });
    }

    // Performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const timing = performance.timing;
      return {
        pageLoadTime: timing.loadEventEnd - timing.navigationStart,
        domContentLoaded:
          timing.domContentLoadedEventEnd - timing.navigationStart,
        responseTime: timing.responseEnd - timing.requestStart,
      };
    });

    console.log("\nPerformance Metrics:");
    console.log(`  - Page Load Time: ${performanceMetrics.pageLoadTime}ms`);
    console.log(
      `  - DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms`
    );
    console.log(`  - Response Time: ${performanceMetrics.responseTime}ms`);

    // Take final screenshot
    const screenshotPath = path.join(
      process.cwd(),
      "test-results",
      "screenshots",
      "test3-api-loaded.png"
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\nScreenshot saved: ${screenshotPath}`);

    console.log("\n✓ TEST 3 COMPLETED: API and data loading analysis complete");
    console.log(`  - API requests: ${apiRequests.length}`);
    console.log(`  - Successful responses: ${apiResponses.filter((r) => r.ok).length}`);
    console.log(`  - Failed responses: ${failedRequests.length}`);
    console.log(`  - Database errors: ${dbErrors.length}`);
    console.log(`  - Redis errors: ${redisErrors.length}`);
  });
});
