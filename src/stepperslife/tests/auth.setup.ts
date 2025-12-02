/**
 * Authentication Setup for Playwright Tests
 *
 * This file handles authentication state setup for tests that require
 * logged-in users (admin, vendor, organizer, etc.)
 *
 * The authenticated state is saved to tests/.auth/admin.json and reused
 * across tests to avoid logging in repeatedly.
 */

import { test as setup, expect } from "@playwright/test";
import path from "path";

const AUTH_FILE = path.join(__dirname, ".auth/admin.json");

// Admin credentials for authenticated tests
const ADMIN_CREDENTIALS = {
  email: process.env.TEST_ADMIN_EMAIL || "ira@irawatkins.com",
  password: process.env.TEST_ADMIN_PASSWORD || "Bobby321!",
};

setup("authenticate as admin", async ({ page }) => {
  console.log("\n🔐 Setting up admin authentication...\n");

  const baseUrl = process.env.BASE_URL || "http://localhost:3004";

  // Navigate to login page
  await page.goto(`${baseUrl}/login`);
  await page.waitForLoadState("networkidle");

  // Check if we're already logged in (redirected away from login)
  if (!page.url().includes("/login")) {
    console.log("  Already authenticated, saving state...");
    await page.context().storageState({ path: AUTH_FILE });
    return;
  }

  // Fill in login form
  console.log(`  Logging in as: ${ADMIN_CREDENTIALS.email}`);

  // Wait for form to be ready
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });

  // Fill credentials
  await page.fill('input[type="email"]', ADMIN_CREDENTIALS.email);
  await page.fill('input[type="password"]', ADMIN_CREDENTIALS.password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for navigation after login
  await page.waitForTimeout(3000);
  await page.waitForLoadState("networkidle");

  // Verify login was successful (should not be on login page)
  const currentUrl = page.url();
  if (currentUrl.includes("/login")) {
    // Check for error message
    const errorMessage = page.locator('[role="alert"], .text-destructive, .text-red-500');
    if (await errorMessage.isVisible()) {
      const errorText = await errorMessage.textContent();
      console.log(`  ❌ Login failed: ${errorText}`);
      throw new Error(`Login failed: ${errorText}`);
    }
    console.log("  ⚠️ Still on login page, but no error visible");
  } else {
    console.log(`  ✅ Login successful, redirected to: ${currentUrl}`);
  }

  // Save authentication state
  await page.context().storageState({ path: AUTH_FILE });
  console.log(`  💾 Auth state saved to: ${AUTH_FILE}\n`);
});

setup("verify auth file exists", async () => {
  const fs = await import("fs");

  // Check if auth file was created
  if (fs.existsSync(AUTH_FILE)) {
    const stats = fs.statSync(AUTH_FILE);
    console.log(`\n✅ Auth file created: ${AUTH_FILE}`);
    console.log(`   Size: ${stats.size} bytes\n`);
  } else {
    console.log("\n⚠️ Auth file not found, tests requiring auth may fail\n");
  }
});
