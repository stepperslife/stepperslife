/**
 * Authentication Setup for Playwright Tests
 *
 * This file creates authenticated storage states that can be reused
 * across tests, eliminating the need to log in for each test.
 *
 * Usage:
 * 1. Run: npx playwright test --project=setup
 * 2. Tests will use the saved storage state automatically
 */

import { test as setup, expect } from "@playwright/test";
import path from "path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3004";

// Storage state file paths
export const ADMIN_STORAGE_STATE = path.join(
  __dirname,
  "../.auth/admin.json"
);
export const USER_STORAGE_STATE = path.join(
  __dirname,
  "../.auth/user.json"
);
export const ORGANIZER_STORAGE_STATE = path.join(
  __dirname,
  "../.auth/organizer.json"
);

// Test credentials
const TEST_ADMIN = {
  email: "ira@irawatkins.com",
  password: "Bobby321!",
};

const TEST_USER = {
  email: "test-user@stepperslife.com",
  password: "TestUser123!",
};

const TEST_ORGANIZER = {
  email: "test-organizer@stepperslife.com",
  password: "TestOrganizer123!",
};

/**
 * Setup: Authenticate as Admin
 */
setup("authenticate as admin", async ({ page }) => {
  console.log("🔐 Setting up admin authentication...");

  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState("networkidle");

  // Click password login toggle
  const passwordToggle = page.locator('[data-testid="password-login-toggle"]');
  if (await passwordToggle.isVisible()) {
    await passwordToggle.click();
    await page.waitForTimeout(300);
  }

  // Fill credentials
  await page.fill('[data-testid="password-email-input"], input[type="email"]', TEST_ADMIN.email);
  await page.fill('[data-testid="password-input"], input[type="password"]', TEST_ADMIN.password);

  // Submit
  await page.click('[data-testid="login-submit-button"], button[type="submit"]');

  // Wait for redirect (successful login)
  await page.waitForURL((url) => !url.toString().includes("/login"), {
    timeout: 15000,
  });

  // Verify logged in
  await expect(page.locator('[data-testid="profile-dropdown-trigger"]')).toBeVisible({
    timeout: 10000,
  });

  console.log("✅ Admin authenticated successfully");

  // Save storage state
  await page.context().storageState({ path: ADMIN_STORAGE_STATE });
});

/**
 * Setup: Authenticate as Regular User
 */
setup("authenticate as user", async ({ page }) => {
  console.log("🔐 Setting up user authentication...");

  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState("networkidle");

  // Click password login toggle
  const passwordToggle = page.locator('[data-testid="password-login-toggle"]');
  if (await passwordToggle.isVisible()) {
    await passwordToggle.click();
    await page.waitForTimeout(300);
  }

  // Fill credentials
  await page.fill('[data-testid="password-email-input"], input[type="email"]', TEST_USER.email);
  await page.fill('[data-testid="password-input"], input[type="password"]', TEST_USER.password);

  // Submit
  await page.click('[data-testid="login-submit-button"], button[type="submit"]');

  // Wait for redirect or error
  try {
    await page.waitForURL((url) => !url.toString().includes("/login"), {
      timeout: 10000,
    });
    console.log("✅ User authenticated successfully");
    await page.context().storageState({ path: USER_STORAGE_STATE });
  } catch {
    // User may not exist, create placeholder state
    console.log("⚠️ User login failed, creating empty state");
    await page.context().storageState({ path: USER_STORAGE_STATE });
  }
});

/**
 * Setup: Authenticate as Organizer
 */
setup("authenticate as organizer", async ({ page }) => {
  console.log("🔐 Setting up organizer authentication...");

  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState("networkidle");

  // Click password login toggle
  const passwordToggle = page.locator('[data-testid="password-login-toggle"]');
  if (await passwordToggle.isVisible()) {
    await passwordToggle.click();
    await page.waitForTimeout(300);
  }

  // Fill credentials
  await page.fill('[data-testid="password-email-input"], input[type="email"]', TEST_ORGANIZER.email);
  await page.fill('[data-testid="password-input"], input[type="password"]', TEST_ORGANIZER.password);

  // Submit
  await page.click('[data-testid="login-submit-button"], button[type="submit"]');

  // Wait for redirect or error
  try {
    await page.waitForURL((url) => !url.toString().includes("/login"), {
      timeout: 10000,
    });
    console.log("✅ Organizer authenticated successfully");
    await page.context().storageState({ path: ORGANIZER_STORAGE_STATE });
  } catch {
    // Organizer may not exist, create placeholder state
    console.log("⚠️ Organizer login failed, creating empty state");
    await page.context().storageState({ path: ORGANIZER_STORAGE_STATE });
  }
});
