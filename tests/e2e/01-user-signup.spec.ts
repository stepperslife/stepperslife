import { test, expect } from "@playwright/test";
import { generateTestEmail, generateTestName, URLS, TIMEOUTS } from "./helpers/test-data";

test.describe("User Registration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URLS.register);
    await page.waitForLoadState("domcontentloaded");
    // Wait for form to be visible
    await page.waitForSelector('[data-testid="register-form"]', { timeout: 10000 });
  });

  test("should display registration form", async ({ page }) => {
    await expect(page.locator('[data-testid="register-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-password"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-confirm-password"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-agree-terms"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-submit"]')).toBeVisible();
  });

  test("should register new user with email/password", async ({ page }) => {
    const testEmail = generateTestEmail();
    const testName = generateTestName();
    const testPassword = "TestPassword123!";

    // Fill registration form
    await page.fill('[data-testid="register-name"]', testName);
    await page.fill('[data-testid="register-email"]', testEmail);
    await page.fill('[data-testid="register-password"]', testPassword);
    await page.fill('[data-testid="register-confirm-password"]', testPassword);
    await page.click('[data-testid="register-agree-terms"]');

    // Submit form
    await page.click('[data-testid="register-submit"]');

    // Wait for redirect to login page
    await page.waitForURL(/\/login/, { timeout: TIMEOUTS.medium });

    // Verify success (URL should contain registered=true or similar)
    expect(page.url()).toContain("/login");
  });

  test("should reject weak passwords", async ({ page }) => {
    const testEmail = generateTestEmail();
    const testName = generateTestName();

    // Fill form with weak password
    await page.fill('[data-testid="register-name"]', testName);
    await page.fill('[data-testid="register-email"]', testEmail);
    await page.fill('[data-testid="register-password"]', "weak");
    await page.fill('[data-testid="register-confirm-password"]', "weak");
    await page.click('[data-testid="register-agree-terms"]');

    // Submit form
    await page.click('[data-testid="register-submit"]');

    // Should show error message
    await expect(page.locator('[data-testid="register-error"]')).toBeVisible({
      timeout: TIMEOUTS.short,
    });
  });

  test("should show error for password mismatch", async ({ page }) => {
    const testEmail = generateTestEmail();
    const testName = generateTestName();

    // Fill form with mismatched passwords
    await page.fill('[data-testid="register-name"]', testName);
    await page.fill('[data-testid="register-email"]', testEmail);
    await page.fill('[data-testid="register-password"]', "TestPassword123!");
    await page.fill('[data-testid="register-confirm-password"]', "DifferentPassword123!");
    await page.click('[data-testid="register-agree-terms"]');

    // Submit form
    await page.click('[data-testid="register-submit"]');

    // Should show error message
    await expect(page.locator('[data-testid="register-error"]')).toBeVisible({
      timeout: TIMEOUTS.short,
    });
  });

  test("should require terms acceptance", async ({ page }) => {
    const testEmail = generateTestEmail();
    const testName = generateTestName();
    const testPassword = "TestPassword123!";

    // Fill form without accepting terms
    await page.fill('[data-testid="register-name"]', testName);
    await page.fill('[data-testid="register-email"]', testEmail);
    await page.fill('[data-testid="register-password"]', testPassword);
    await page.fill('[data-testid="register-confirm-password"]', testPassword);
    // Intentionally NOT clicking terms checkbox

    // Submit form
    await page.click('[data-testid="register-submit"]');

    // Should show error message
    await expect(page.locator('[data-testid="register-error"]')).toBeVisible({
      timeout: TIMEOUTS.short,
    });
  });

  test("should link to login page", async ({ page }) => {
    // Find and click the sign in link
    await page.click('a[href="/login"]');

    // Should navigate to login page
    await page.waitForURL(/\/login/, { timeout: TIMEOUTS.short });
  });
});
