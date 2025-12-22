import { test, expect } from "@playwright/test";

const BASE_URL = "https://stepperslife.com";

test.describe("QR Code Scanner Tests", () => {
  test("Scanner page loads correctly", async ({ page }) => {
    // Navigate to the scanner page
    await page.goto(`${BASE_URL}/staff/scan-tickets`);

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Check if we're either on the scanner page or redirected to login
    const url = page.url();
    console.log("Current URL:", url);

    // Take screenshot of the page
    await page.screenshot({ path: "tests/screenshots/scanner-page.png", fullPage: true });

    // If we're on the scanner page, check for expected elements
    if (url.includes("/staff/scan-tickets")) {
      // Check for title or heading
      const heading = page.locator("h1");
      const headingText = await heading.textContent();
      console.log("Page heading:", headingText);

      // Check if we see "Scan Tickets" or event selection UI
      const pageContent = await page.textContent("body");
      console.log("Page contains 'Scan':", pageContent?.includes("Scan"));
      console.log("Page contains 'event':", pageContent?.toLowerCase().includes("event"));
    }
  });

  test("Camera permissions header is set correctly", async ({ page }) => {
    // Make a request to the scanner page and check headers
    const response = await page.goto(`${BASE_URL}/staff/scan-tickets`);
    const headers = response?.headers();

    console.log("Response status:", response?.status());
    console.log("Permissions-Policy header:", headers?.["permissions-policy"]);

    // The camera should be allowed (self) on scanner pages
    const permissionsPolicy = headers?.["permissions-policy"] || "";
    console.log("Full Permissions-Policy:", permissionsPolicy);

    // Check if camera is allowed (should contain "camera=(self)" not "camera=()")
    if (permissionsPolicy.includes("camera=()")) {
      console.log("WARNING: Camera is blocked on scanner page!");
    } else if (permissionsPolicy.includes("camera=(self)")) {
      console.log("SUCCESS: Camera is allowed on scanner page");
    }
  });

  test("Check scanner page elements and UI", async ({ page }) => {
    await page.goto(`${BASE_URL}/staff/scan-tickets`);
    await page.waitForLoadState("networkidle");

    // Wait for any loading spinners to disappear
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: "tests/screenshots/scanner-elements.png", fullPage: true });

    // Check for key UI elements
    const elements = {
      hasQrIcon: await page.locator('[class*="lucide-qr"]').count(),
      hasCalendarIcon: await page.locator('[class*="lucide-calendar"]').count(),
      hasStartScanningText: (await page.textContent("body"))?.includes("Start Scanning"),
      hasScanTicketsText: (await page.textContent("body"))?.includes("Scan Tickets"),
      hasEventSelection: (await page.textContent("body"))?.includes("Select an event"),
      hasNoPermission: (await page.textContent("body"))?.includes("don't have permission"),
      hasLoading: (await page.textContent("body"))?.includes("Loading"),
    };

    console.log("Scanner page elements:", JSON.stringify(elements, null, 2));
  });

  test("My Tickets page loads and shows TodayTicketPrompt if applicable", async ({ page }) => {
    await page.goto(`${BASE_URL}/my-tickets`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: "tests/screenshots/my-tickets-page.png", fullPage: true });

    const pageContent = await page.textContent("body");
    console.log("My Tickets page contains 'Your event is today':", pageContent?.includes("Your event is today"));
    console.log("My Tickets page contains 'tickets':", pageContent?.toLowerCase().includes("ticket"));
  });

  test("Check for FloatingScanButton on homepage", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Take mobile screenshot
    await page.screenshot({ path: "tests/screenshots/homepage-mobile.png", fullPage: true });

    // Look for the floating scan button (has QR icon, positioned fixed)
    const scanButton = page.locator('a[href="/staff/scan-tickets"]');
    const scanButtonCount = await scanButton.count();
    console.log("Scan button links found:", scanButtonCount);

    // Check for fixed positioned elements with QR icons
    const fixedElements = await page.locator('[class*="fixed"]').count();
    console.log("Fixed positioned elements:", fixedElements);
  });

  test("Scanner page with event-specific route", async ({ page }) => {
    // Test the event-specific scanner route
    await page.goto(`${BASE_URL}/scan/test-event`);
    await page.waitForLoadState("networkidle");

    const url = page.url();
    console.log("Event scanner URL:", url);

    await page.screenshot({ path: "tests/screenshots/event-scanner.png", fullPage: true });

    // Check response headers for camera permissions
    const response = await page.goto(`${BASE_URL}/scan/test-event`);
    const headers = response?.headers();
    console.log("Event scanner Permissions-Policy:", headers?.["permissions-policy"]);
  });
});

test.describe("Scanner Functionality Deep Test", () => {
  test("Verify scanner page structure", async ({ page }) => {
    await page.goto(`${BASE_URL}/staff/scan-tickets`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    // Get all text content for analysis
    const bodyText = await page.textContent("body");

    // Log key information
    console.log("\n=== Scanner Page Analysis ===");
    console.log("Contains 'Loading events':", bodyText?.includes("Loading events"));
    console.log("Contains 'No Events Available':", bodyText?.includes("No Events Available"));
    console.log("Contains 'Scanning tickets':", bodyText?.includes("Scanning tickets"));
    console.log("Contains 'Start Scanning':", bodyText?.includes("Start Scanning"));
    console.log("Contains 'Auto-selected':", bodyText?.includes("Auto-selected"));
    console.log("Contains 'Change Event':", bodyText?.includes("Change Event"));
    console.log("Contains 'QR Scanner':", bodyText?.includes("QR Scanner"));
    console.log("Contains 'Start Scanner':", bodyText?.includes("Start Scanner"));
    console.log("Contains 'Manual Entry':", bodyText?.includes("Manual Entry"));

    // Check for buttons
    const buttons = await page.locator("button").allTextContents();
    console.log("\nButtons found:", buttons);

    // Check for cards
    const cards = await page.locator('[class*="card"], [class*="Card"]').count();
    console.log("Cards found:", cards);
  });

  test("Test navigation to scanner from different pages", async ({ page }) => {
    // Set mobile viewport for floating button
    await page.setViewportSize({ width: 390, height: 844 });

    // Test from events page
    await page.goto(`${BASE_URL}/events`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    await page.screenshot({ path: "tests/screenshots/events-page-mobile.png", fullPage: true });

    // Check for scan-related links
    const scanLinks = await page.locator('a[href*="scan"]').count();
    console.log("Scan-related links on events page:", scanLinks);
  });
});
