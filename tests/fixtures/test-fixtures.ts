/**
 * Enhanced Playwright Test Fixtures
 *
 * Provides reusable fixtures for authenticated sessions, test data,
 * and common helper functions.
 */

import { test as base, expect, Page } from "@playwright/test";
import path from "path";

// Storage state paths
const AUTH_DIR = path.join(__dirname, "../.auth");

// =============================================================================
// TYPES
// =============================================================================

interface TestUser {
  email: string;
  password: string;
  name?: string;
  role?: "admin" | "user" | "organizer" | "staff";
}

interface TestFixtures {
  // Authenticated pages
  adminPage: Page;
  userPage: Page;
  organizerPage: Page;

  // Helper functions
  login: (page: Page, credentials: TestUser) => Promise<boolean>;
  waitForPageLoad: (page: Page, pageName?: string) => Promise<boolean>;
  takeScreenshot: (page: Page, name: string) => Promise<void>;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const BASE_URL = process.env.BASE_URL || "http://localhost:3004";
const MAX_PAGE_LOAD_TIME = 5000;

const TEST_CREDENTIALS = {
  admin: {
    email: "ira@irawatkins.com",
    password: "Bobby321!",
    name: "Admin User",
    role: "admin" as const,
  },
  user: {
    email: "test-user@stepperslife.com",
    password: "TestUser123!",
    name: "Test User",
    role: "user" as const,
  },
  organizer: {
    email: "test-organizer@stepperslife.com",
    password: "TestOrganizer123!",
    name: "Test Organizer",
    role: "organizer" as const,
  },
};

// =============================================================================
// FIXTURES
// =============================================================================

export const test = base.extend<TestFixtures>({
  /**
   * Admin authenticated page
   */
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.join(AUTH_DIR, "admin.json"),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  /**
   * User authenticated page
   */
  userPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.join(AUTH_DIR, "user.json"),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  /**
   * Organizer authenticated page
   */
  organizerPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.join(AUTH_DIR, "organizer.json"),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  /**
   * Login helper function
   */
  login: async ({}, use) => {
    const loginFn = async (page: Page, credentials: TestUser): Promise<boolean> => {
      try {
        await page.goto(`${BASE_URL}/login`);
        await page.waitForLoadState("networkidle");

        // Expand password login form
        const passwordToggle = page.locator('[data-testid="password-login-toggle"]');
        if (await passwordToggle.isVisible()) {
          await passwordToggle.click();
          await page.waitForTimeout(300);
        }

        // Fill credentials
        await page.fill(
          '[data-testid="password-email-input"], input[type="email"]',
          credentials.email
        );
        await page.fill(
          '[data-testid="password-input"], input[type="password"]',
          credentials.password
        );

        // Submit
        await page.click('[data-testid="login-submit-button"], button[type="submit"]');

        // Wait for redirect
        await page.waitForURL((url) => !url.toString().includes("/login"), {
          timeout: 15000,
        });

        return true;
      } catch (error) {
        console.error("Login failed:", error);
        return false;
      }
    };

    await use(loginFn);
  },

  /**
   * Wait for page load helper
   */
  waitForPageLoad: async ({}, use) => {
    const waitFn = async (page: Page, pageName = "Page"): Promise<boolean> => {
      console.log(`\n🔍 Loading: ${pageName}`);
      const startTime = Date.now();

      try {
        await page.waitForLoadState("networkidle", { timeout: MAX_PAGE_LOAD_TIME });

        // Check for loading spinner
        const loadingSpinner = page.locator(".animate-spin").first();
        await page.waitForTimeout(500);

        const isStuck = await loadingSpinner.isVisible().catch(() => false);
        if (isStuck) {
          await page.waitForTimeout(2000);
          const stillStuck = await loadingSpinner.isVisible().catch(() => false);
          if (stillStuck) {
            console.log(`  ❌ STUCK in loading spinner`);
            return false;
          }
        }

        const loadTime = Date.now() - startTime;
        console.log(`  ✅ Loaded in ${loadTime}ms`);

        expect(loadTime).toBeLessThan(MAX_PAGE_LOAD_TIME);
        return true;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.log(`  ❌ Error: ${message}`);
        return false;
      }
    };

    await use(waitFn);
  },

  /**
   * Screenshot helper
   */
  takeScreenshot: async ({}, use) => {
    const screenshotFn = async (page: Page, name: string): Promise<void> => {
      const timestamp = Date.now();
      await page.screenshot({
        path: `test-results/screenshots/${name}-${timestamp}.png`,
        fullPage: true,
      });
    };

    await use(screenshotFn);
  },
});

// Re-export expect from base
export { expect };

// =============================================================================
// HELPER FUNCTIONS (standalone)
// =============================================================================

/**
 * Check if page loaded successfully without infinite loading spinner
 */
export async function checkPageLoaded(page: Page, pageName: string): Promise<boolean> {
  console.log(`\n🔍 Testing: ${pageName}`);
  const startTime = Date.now();

  try {
    await page.waitForLoadState("networkidle", { timeout: MAX_PAGE_LOAD_TIME });

    const loadingSpinner = page.locator(".animate-spin").first();
    await page.waitForTimeout(1000);

    const isStuck = await loadingSpinner.isVisible().catch(() => false);
    if (isStuck) {
      await page.waitForTimeout(2000);
      const stillStuck = await loadingSpinner.isVisible().catch(() => false);
      if (stillStuck) {
        console.log(`  ❌ STUCK in loading spinner`);
        return false;
      }
    }

    const loadTime = Date.now() - startTime;
    console.log(`  ✅ Page loaded successfully in ${loadTime}ms`);

    expect(loadTime).toBeLessThan(MAX_PAGE_LOAD_TIME);
    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`  ❌ Error: ${message}`);
    return false;
  }
}

/**
 * Reusable login helper (standalone)
 */
export async function login(
  page: Page,
  email: string,
  password: string
): Promise<boolean> {
  try {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("networkidle");

    // Expand password login
    const passwordToggle = page.locator('[data-testid="password-login-toggle"]');
    if (await passwordToggle.isVisible()) {
      await passwordToggle.click();
      await page.waitForTimeout(300);
    }

    await page.fill('[data-testid="password-email-input"], input[type="email"]', email);
    await page.fill('[data-testid="password-input"], input[type="password"]', password);
    await page.click('[data-testid="login-submit-button"], button[type="submit"]');

    await page.waitForTimeout(3000);
    await page.waitForLoadState("networkidle");

    const currentUrl = page.url();
    return !currentUrl.includes("/login");
  } catch (error) {
    console.log(`  Login failed: ${error}`);
    return false;
  }
}

/**
 * Wait for stable state
 */
export async function waitForStableState(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
}

/**
 * Generate unique test data
 */
export function generateTestData() {
  const timestamp = Date.now();
  return {
    email: `test-${timestamp}@stepperslife.com`,
    eventName: `Test Event ${timestamp}`,
    productName: `Test Product ${timestamp}`,
    userName: `Test User ${timestamp}`,
  };
}

// Export credentials for use in tests
export { TEST_CREDENTIALS, BASE_URL, MAX_PAGE_LOAD_TIME };
