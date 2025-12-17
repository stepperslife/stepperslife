/**
 * Google OAuth Debug Test
 *
 * This test helps debug the Google OAuth flow by checking:
 * 1. Login page loads
 * 2. Google OAuth button works
 * 3. Cookies are set correctly
 * 4. OAuth callback handling
 */

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3004";

test.describe("Google OAuth Debug", () => {
  test("1. Login page loads with Google button", async ({ page }) => {
    console.log("\n🔍 Testing login page...");
    console.log("BASE_URL:", BASE_URL);

    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("load");
    await page.waitForTimeout(2000);

    // Check for Google login button
    const googleButton = page.locator('[data-testid="google-login-button"]');
    const isVisible = await googleButton.isVisible();
    console.log("Google button visible:", isVisible);

    expect(isVisible).toBe(true);

    // Screenshot
    await page.screenshot({ path: "test-results/oauth-1-login-page.png", fullPage: true });
  });

  test("2. Google OAuth redirect URL check", async ({ page, context }) => {
    console.log("\n🔍 Checking Google OAuth redirect...");

    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("load");
    await page.waitForTimeout(2000);

    // Get the Google button
    const googleButton = page.locator('[data-testid="google-login-button"]');

    // Listen for navigation
    let redirectUrl = "";
    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("accounts.google.com")) {
        console.log("Google redirect URL:", url);
        redirectUrl = url;
      }
    });

    // Click Google button and wait for navigation
    await googleButton.click();
    await page.waitForTimeout(3000);

    console.log("Current URL after click:", page.url());

    // Check if we're on Google's OAuth page or still on our site
    const currentUrl = page.url();
    if (currentUrl.includes("accounts.google.com")) {
      console.log("✅ Successfully redirected to Google");

      // Parse the redirect_uri from the URL
      const urlParams = new URL(currentUrl).searchParams;
      const redirectUri = urlParams.get("redirect_uri");
      console.log("redirect_uri parameter:", redirectUri);

      expect(redirectUri).toBeTruthy();
      expect(redirectUri).toContain("/api/auth/callback/google");
    } else {
      console.log("❌ Did not redirect to Google");
      console.log("Current URL:", currentUrl);
    }

    await page.screenshot({ path: "test-results/oauth-2-google-redirect.png", fullPage: true });
  });

  test("3. Check cookies after OAuth initiation", async ({ page, context }) => {
    console.log("\n🔍 Checking OAuth cookies...");

    // Go to login and initiate OAuth
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("load");
    await page.waitForTimeout(2000);

    // Click Google button
    const googleButton = page.locator('[data-testid="google-login-button"]');
    await googleButton.click();

    // Wait a moment for cookies to be set
    await page.waitForTimeout(1000);

    // Get cookies before redirect completes
    const cookies = await context.cookies();
    console.log("All cookies:", cookies.map(c => ({ name: c.name, domain: c.domain, path: c.path })));

    // Look for oauth_state cookie
    const oauthStateCookie = cookies.find(c => c.name === "oauth_state");
    const oauthCallbackCookie = cookies.find(c => c.name === "oauth_callback_url");

    console.log("oauth_state cookie:", oauthStateCookie ? "found" : "not found");
    console.log("oauth_callback_url cookie:", oauthCallbackCookie ? "found" : "not found");

    if (oauthStateCookie) {
      console.log("  - domain:", oauthStateCookie.domain);
      console.log("  - httpOnly:", oauthStateCookie.httpOnly);
      console.log("  - secure:", oauthStateCookie.secure);
      console.log("  - sameSite:", oauthStateCookie.sameSite);
    }
  });

  test("4. Direct API test - /api/auth/google", async ({ page, request }) => {
    console.log("\n🔍 Testing /api/auth/google directly...");

    // Make a request to the OAuth initiation endpoint
    const response = await request.get(`${BASE_URL}/api/auth/google?callbackUrl=/`);

    console.log("Response status:", response.status());
    console.log("Response URL:", response.url());

    // It should redirect to Google
    const headers = response.headers();
    console.log("Location header:", headers["location"]);

    if (headers["location"]) {
      const googleUrl = new URL(headers["location"]);
      const redirectUri = googleUrl.searchParams.get("redirect_uri");
      console.log("redirect_uri:", redirectUri);

      expect(redirectUri).toBeTruthy();
      expect(redirectUri).toContain("/api/auth/callback/google");
    }
  });

  test("5. Test production URL simulation", async ({ page }) => {
    console.log("\n🔍 Testing with production domain simulation...");

    // Check what the current redirect URI would be
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("load");

    // Get page console logs
    page.on("console", (msg) => {
      if (msg.text().includes("[Google OAuth]")) {
        console.log("Console:", msg.text());
      }
    });

    // Try to trigger the OAuth flow
    const googleButton = page.locator('[data-testid="google-login-button"]');
    if (await googleButton.isVisible()) {
      await googleButton.click();
      await page.waitForTimeout(3000);
    }

    console.log("Final URL:", page.url());
    await page.screenshot({ path: "test-results/oauth-5-final.png", fullPage: true });
  });

  test("6. Check session after manual Google auth", async ({ page, context }) => {
    console.log("\n🔍 This test requires manual Google login...");
    console.log("To test: manually complete Google OAuth and check /api/auth/me");

    // First check if already logged in
    const meResponse = await page.goto(`${BASE_URL}/api/auth/me`);
    const meBody = await page.textContent("body");
    console.log("/api/auth/me response:", meBody);

    // Check cookies
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c => c.name === "session_token" || c.name === "auth-token");
    console.log("Session cookie found:", !!sessionCookie);
    if (sessionCookie) {
      console.log("  - name:", sessionCookie.name);
      console.log("  - domain:", sessionCookie.domain);
      console.log("  - value length:", sessionCookie.value.length);
    }
  });
});
