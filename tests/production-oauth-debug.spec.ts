/**
 * Production OAuth Debug Test
 *
 * Tests the Google OAuth flow against the production site
 */

import { test, expect } from "@playwright/test";

const PROD_URL = "https://stepperslife.com";

test.describe("Production Google OAuth Debug", () => {
  test("1. Production login page loads", async ({ page }) => {
    console.log("\n🔍 Testing production login page...");

    await page.goto(`${PROD_URL}/login`);
    await page.waitForLoadState("load");
    await page.waitForTimeout(3000);

    console.log("Current URL:", page.url());

    // Check for Google login button
    const googleButton = page.locator('[data-testid="google-login-button"]');
    const isVisible = await googleButton.isVisible();
    console.log("Google button visible:", isVisible);

    await page.screenshot({ path: "test-results/prod-oauth-1-login.png", fullPage: true });
    expect(isVisible).toBe(true);
  });

  test("2. Production OAuth redirect check", async ({ page, context }) => {
    console.log("\n🔍 Testing production OAuth redirect...");

    await page.goto(`${PROD_URL}/login`);
    await page.waitForLoadState("load");
    await page.waitForTimeout(3000);

    // Get the Google button
    const googleButton = page.locator('[data-testid="google-login-button"]');

    // Listen for network requests
    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("accounts.google.com") || url.includes("stepperslife.com/api/auth")) {
        console.log("Request:", url.substring(0, 150) + "...");
      }
    });

    page.on("response", (response) => {
      const url = response.url();
      if (url.includes("accounts.google.com") || url.includes("stepperslife.com/api/auth")) {
        console.log("Response:", response.status(), url.substring(0, 100) + "...");
      }
    });

    // Click Google button
    await googleButton.click();
    await page.waitForTimeout(5000);

    console.log("\nFinal URL:", page.url());

    // Check cookies
    const cookies = await context.cookies();
    console.log("\nAll cookies:");
    cookies.forEach((c) => {
      console.log(`  ${c.name} (${c.domain}): ${c.value.substring(0, 20)}...`);
    });

    // Check for stepperslife.com cookies specifically
    const stepperslifeCookies = cookies.filter(c => c.domain.includes("stepperslife"));
    console.log("\nStepperslife cookies:", stepperslifeCookies.map(c => c.name));

    await page.screenshot({ path: "test-results/prod-oauth-2-redirect.png", fullPage: true });

    // Parse URL to get redirect_uri
    const currentUrl = page.url();
    if (currentUrl.includes("accounts.google.com")) {
      try {
        const urlObj = new URL(currentUrl);
        const redirectUri = urlObj.searchParams.get("redirect_uri");
        console.log("\nredirect_uri in URL:", redirectUri);

        // Check the continue URL which has the full OAuth params
        const continueUrl = urlObj.searchParams.get("continue");
        if (continueUrl) {
          const continueUrlObj = new URL(continueUrl);
          const clientId = continueUrlObj.searchParams.get("client_id");
          console.log("client_id:", clientId);
        }
      } catch (e) {
        console.log("Could not parse URL");
      }
    }
  });

  test("3. Check what happens after Google sign-in", async ({ page, context }) => {
    console.log("\n🔍 Starting OAuth flow (will stop at Google sign-in)...");
    console.log("To complete this test, you need to manually sign in with Google");
    console.log("and then observe where it redirects\n");

    // Set up request interception to see all requests
    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("stepperslife.com/api/auth/callback") ||
          url.includes("stepperslife.com/login")) {
        console.log("AUTH REQUEST:", request.method(), url);
      }
    });

    page.on("response", (response) => {
      const url = response.url();
      if (url.includes("stepperslife.com/api/auth") ||
          url.includes("stepperslife.com/login")) {
        console.log("AUTH RESPONSE:", response.status(), url);
      }
    });

    await page.goto(`${PROD_URL}/login`);
    await page.waitForLoadState("load");
    await page.waitForTimeout(2000);

    // Click Google and go to Google sign-in
    const googleButton = page.locator('[data-testid="google-login-button"]');
    await googleButton.click();

    // Wait and capture where we end up
    await page.waitForTimeout(10000);

    console.log("\nAfter waiting 10s:");
    console.log("Current URL:", page.url());

    // Get all cookies
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c => c.name === "session_token");
    console.log("session_token cookie:", sessionCookie ? "found" : "not found");

    await page.screenshot({ path: "test-results/prod-oauth-3-result.png", fullPage: true });
  });

  test("4. Test callback URL directly with fake params", async ({ page }) => {
    console.log("\n🔍 Testing callback URL handling...");

    // Try to hit the callback URL with test params to see error handling
    // This will fail but show us what errors we get
    await page.goto(`${PROD_URL}/api/auth/callback/google?code=test&state=test`);
    await page.waitForTimeout(3000);

    console.log("Callback response URL:", page.url());

    // The error should show up in the URL or page
    const bodyText = await page.textContent("body");
    console.log("Page content:", bodyText?.substring(0, 500));

    await page.screenshot({ path: "test-results/prod-oauth-4-callback.png", fullPage: true });
  });

  test("5. Check /api/auth/me endpoint", async ({ page }) => {
    console.log("\n🔍 Checking /api/auth/me...");

    await page.goto(`${PROD_URL}/api/auth/me`);
    await page.waitForTimeout(1000);

    const bodyText = await page.textContent("body");
    console.log("/api/auth/me response:", bodyText);
  });
});
