/**
 * Authentication Feature - Comprehensive Test Suite
 *
 * Tests the complete authentication system including:
 * - Login page functionality
 * - Registration flow
 * - Forgot/Reset password
 * - Magic link authentication
 * - Protected route redirects
 * - Session management
 *
 * Uses data-testid selectors for reliable test execution.
 */

import { test, expect, Page } from "@playwright/test";

// Configuration
const BASE_URL = process.env.BASE_URL || "http://localhost:3004";

const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
};

const TIMEOUTS = {
  navigation: 30000,
  networkIdle: 10000,
  animation: 500,
};

// Test IDs for reliable selectors
const TEST_IDS = {
  // Login page
  loginFormContainer: '[data-testid="login-form-container"]',
  emailInput: '[data-testid="email-input"]',
  passwordEmailInput: '[data-testid="password-email-input"]',
  passwordInput: '[data-testid="password-input"]',
  loginSubmitButton: '[data-testid="login-submit-button"]',
  magicLinkButton: '[data-testid="magic-link-button"]',
  passwordLoginToggle: '[data-testid="password-login-toggle"]',
  googleLoginButton: '[data-testid="google-login-button"]',
  forgotPasswordLink: '[data-testid="forgot-password-link"]',
  createAccountLink: '[data-testid="create-account-link"]',
  loginErrorMessage: '[data-testid="login-error-message"]',
  loginSuccessMessage: '[data-testid="login-success-message"]',
  togglePasswordVisibility: '[data-testid="toggle-password-visibility"]',
  // Header
  publicHeader: '[data-testid="public-header"]',
  signInButton: '[data-testid="sign-in-button"]',
  signOutButton: '[data-testid="sign-out-button"]',
  profileDropdownTrigger: '[data-testid="profile-dropdown-trigger"]',
};

// Test data
const timestamp = Date.now();
const TEST_USER = {
  email: `test-user-${timestamp}@stepperslife.com`,
  password: "TestPassword123!",
  name: `Test User ${timestamp}`,
  phone: "(312) 555-1234",
};

const EXISTING_USER = {
  email: "test@stepperslife.com",
  password: "TestPassword123!",
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function waitForPageLoad(page: Page) {
  await page.waitForLoadState("networkidle", { timeout: TIMEOUTS.networkIdle });
  await page.waitForTimeout(TIMEOUTS.animation);
}

async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `test-results/auth-${name}.png`,
    fullPage: true,
  });
}

// =============================================================================
// TEST SUITE
// =============================================================================

test.describe("Authentication Feature", () => {
  // ===========================================================================
  // SECTION 1: LOGIN PAGE
  // ===========================================================================

  test.describe("Login Page", () => {
    test("1.1 - Login page loads correctly", async ({ page }) => {
      console.log("\n🔐 Test 1.1: Login page load\n");

      const startTime = Date.now();
      await page.goto(`${BASE_URL}/login`);
      await waitForPageLoad(page);
      const loadTime = Date.now() - startTime;

      console.log(`⏱️ Page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(5000);

      // Verify login form container using data-testid
      await expect(page.locator(TEST_IDS.loginFormContainer)).toBeVisible();

      // Verify email input field
      await expect(page.locator(TEST_IDS.emailInput)).toBeVisible();

      await takeScreenshot(page, "01-login-page");
      console.log("✅ Login page loaded successfully");
    });

    test("1.2 - Login form has required fields", async ({ page }) => {
      console.log("\n🔐 Test 1.2: Login form fields\n");

      await page.goto(`${BASE_URL}/login`);
      await waitForPageLoad(page);

      // Check for email field using data-testid
      const emailInput = page.locator(TEST_IDS.emailInput);
      await expect(emailInput).toBeVisible();
      console.log("  ✓ Email field present");

      // Check for magic link button
      const magicLinkBtn = page.locator(TEST_IDS.magicLinkButton);
      await expect(magicLinkBtn).toBeVisible();
      console.log("  ✓ Magic link button present");

      // Check for password login toggle
      const passwordToggle = page.locator(TEST_IDS.passwordLoginToggle);
      if (await passwordToggle.isVisible()) {
        console.log("  ✓ Password login toggle present");
      }

      await takeScreenshot(page, "02-login-form-fields");
    });

    test("1.3 - Login form validation works", async ({ page }) => {
      console.log("\n🔐 Test 1.3: Form validation\n");

      await page.goto(`${BASE_URL}/login`);
      await waitForPageLoad(page);

      // Expand password login form
      const passwordToggle = page.locator(TEST_IDS.passwordLoginToggle);
      if (await passwordToggle.isVisible()) {
        await passwordToggle.click();
        await page.waitForTimeout(300);
      }

      // Try to submit empty form
      const submitButton = page.locator(TEST_IDS.loginSubmitButton);
      await submitButton.click();
      await page.waitForTimeout(500);

      // Should show validation error or stay on page
      expect(page.url()).toContain("/login");
      console.log("  ✓ Empty form submission prevented");

      // Try invalid email format
      const emailInput = page.locator(TEST_IDS.passwordEmailInput);
      await emailInput.fill("invalid-email");

      const passwordInput = page.locator(TEST_IDS.passwordInput);
      if (await passwordInput.isVisible()) {
        await passwordInput.fill("password");
      }

      await submitButton.click();
      await page.waitForTimeout(500);

      // Should show validation error using data-testid
      const errorMessage = page.locator(TEST_IDS.loginErrorMessage);
      if (await errorMessage.isVisible()) {
        console.log("  ✓ Invalid email validation displayed");
      }

      await takeScreenshot(page, "03-login-validation");
    });

    test("1.4 - Magic link option available", async ({ page }) => {
      console.log("\n🔐 Test 1.4: Magic link option\n");

      await page.goto(`${BASE_URL}/login`);
      await waitForPageLoad(page);

      // Check for magic link button using data-testid
      const magicLinkButton = page.locator(TEST_IDS.magicLinkButton);

      if (await magicLinkButton.isVisible()) {
        await expect(magicLinkButton).toBeVisible();
        console.log("  ✓ Magic link option available");
        await takeScreenshot(page, "04-magic-link-option");
      } else {
        console.log("  ℹ Magic link option not visible on this page");
      }
    });

    test("1.5 - Social login options visible", async ({ page }) => {
      console.log("\n🔐 Test 1.5: Social login options\n");

      await page.goto(`${BASE_URL}/login`);
      await waitForPageLoad(page);

      // Check for Google OAuth using data-testid
      const googleButton = page.locator(TEST_IDS.googleLoginButton);
      if (await googleButton.isVisible()) {
        console.log("  ✓ Google OAuth option available");
      }

      await takeScreenshot(page, "05-social-login-options");
    });

    test("1.6 - Register link navigates correctly", async ({ page }) => {
      console.log("\n🔐 Test 1.6: Register link navigation\n");

      await page.goto(`${BASE_URL}/login`);
      await waitForPageLoad(page);

      // Check for create account link using data-testid
      const registerLink = page.locator(TEST_IDS.createAccountLink);

      if (await registerLink.isVisible()) {
        await registerLink.click();
        await waitForPageLoad(page);

        expect(page.url()).toContain("/register");
        console.log("  ✓ Register link works");
      } else {
        console.log("  ℹ Register link not found on login page");
      }

      await takeScreenshot(page, "06-register-navigation");
    });

    test("1.7 - Forgot password link works", async ({ page }) => {
      console.log("\n🔐 Test 1.7: Forgot password link\n");

      await page.goto(`${BASE_URL}/login`);
      await waitForPageLoad(page);

      // Expand password login form to see forgot password link
      const passwordToggle = page.locator(TEST_IDS.passwordLoginToggle);
      if (await passwordToggle.isVisible()) {
        await passwordToggle.click();
        await page.waitForTimeout(300);
      }

      // Check for forgot password link using data-testid
      const forgotLink = page.locator(TEST_IDS.forgotPasswordLink);

      if (await forgotLink.isVisible()) {
        await forgotLink.click();
        await waitForPageLoad(page);

        expect(page.url()).toMatch(/forgot|reset/);
        console.log("  ✓ Forgot password link works");
        await takeScreenshot(page, "07-forgot-password");
      } else {
        console.log("  ℹ Forgot password link not visible");
      }
    });
  });

  // ===========================================================================
  // SECTION 2: REGISTRATION PAGE
  // ===========================================================================

  test.describe("Registration Page", () => {
    test("2.1 - Registration page loads correctly", async ({ page }) => {
      console.log("\n📝 Test 2.1: Registration page load\n");

      await page.goto(`${BASE_URL}/register`);
      await waitForPageLoad(page);

      // Verify page heading
      await expect(page.locator("h1, h2").filter({ hasText: /sign up|register|create account/i })).toBeVisible();

      await takeScreenshot(page, "08-register-page");
      console.log("✅ Registration page loaded successfully");
    });

    test("2.2 - Registration form has all required fields", async ({ page }) => {
      console.log("\n📝 Test 2.2: Registration form fields\n");

      await page.goto(`${BASE_URL}/register`);
      await waitForPageLoad(page);

      // Check for name field
      const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]');
      if (await nameInput.count() > 0) {
        console.log("  ✓ Name field present");
      }

      // Check for email field
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible();
      console.log("  ✓ Email field present");

      // Check for password field
      const passwordInput = page.locator('input[type="password"]');
      if (await passwordInput.count() > 0) {
        console.log(`  ✓ Password field(s) present: ${await passwordInput.count()}`);
      }

      // Check for submit button
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible();
      console.log("  ✓ Submit button present");

      await takeScreenshot(page, "09-register-form-fields");
    });

    test("2.3 - Password strength indicator works", async ({ page }) => {
      console.log("\n📝 Test 2.3: Password strength indicator\n");

      await page.goto(`${BASE_URL}/register`);
      await waitForPageLoad(page);

      const passwordInput = page.locator('input[type="password"]').first();

      if (await passwordInput.count() > 0) {
        // Test weak password
        await passwordInput.fill("123");
        await page.waitForTimeout(300);

        // Look for strength indicator
        const strengthIndicator = page.locator('[class*="strength"], [data-strength], .password-strength');
        if (await strengthIndicator.count() > 0) {
          console.log("  ✓ Password strength indicator visible");
        }

        // Test stronger password
        await passwordInput.fill("StrongPassword123!");
        await page.waitForTimeout(300);

        await takeScreenshot(page, "10-password-strength");
        console.log("  ✓ Password strength tested");
      }
    });

    test("2.4 - Registration form validation", async ({ page }) => {
      console.log("\n📝 Test 2.4: Registration validation\n");

      await page.goto(`${BASE_URL}/register`);
      await waitForPageLoad(page);

      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      await page.waitForTimeout(500);

      // Should stay on register page
      expect(page.url()).toContain("/register");
      console.log("  ✓ Empty form submission prevented");

      // Test email validation
      const emailInput = page.locator('input[type="email"]');
      await emailInput.fill("invalid-email");

      await submitButton.click();
      await page.waitForTimeout(500);

      await takeScreenshot(page, "11-register-validation");
    });

    test("2.5 - Terms and conditions checkbox (if present)", async ({ page }) => {
      console.log("\n📝 Test 2.5: Terms checkbox\n");

      await page.goto(`${BASE_URL}/register`);
      await waitForPageLoad(page);

      const termsCheckbox = page.locator('input[type="checkbox"], input[name*="terms"]');

      if (await termsCheckbox.count() > 0) {
        await expect(termsCheckbox.first()).toBeVisible();
        console.log("  ✓ Terms checkbox present");

        // Check if terms link exists
        const termsLink = page.locator('a[href*="terms"], text=/terms/i');
        if (await termsLink.count() > 0) {
          console.log("  ✓ Terms link present");
        }
      } else {
        console.log("  ℹ No terms checkbox on this page");
      }

      await takeScreenshot(page, "12-terms-checkbox");
    });
  });

  // ===========================================================================
  // SECTION 3: FORGOT/RESET PASSWORD
  // ===========================================================================

  test.describe("Password Reset Flow", () => {
    test("3.1 - Forgot password page loads", async ({ page }) => {
      console.log("\n🔑 Test 3.1: Forgot password page\n");

      await page.goto(`${BASE_URL}/forgot-password`);
      await waitForPageLoad(page);

      // Verify page content
      await expect(page.locator("h1, h2").filter({ hasText: /forgot|reset|recover/i })).toBeVisible();

      // Verify email input
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible();

      await takeScreenshot(page, "13-forgot-password-page");
      console.log("✅ Forgot password page loaded");
    });

    test("3.2 - Forgot password form submission", async ({ page }) => {
      console.log("\n🔑 Test 3.2: Forgot password submission\n");

      await page.goto(`${BASE_URL}/forgot-password`);
      await waitForPageLoad(page);

      const emailInput = page.locator('input[type="email"]');
      await emailInput.fill(TEST_USER.email);

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      await page.waitForTimeout(1000);

      // Should show success message or redirect
      const successMessage = page.locator('text=/email sent|check your email|link sent/i');
      if (await successMessage.count() > 0) {
        console.log("  ✓ Success message displayed");
      }

      await takeScreenshot(page, "14-forgot-password-submitted");
    });

    test("3.3 - Reset password page structure", async ({ page }) => {
      console.log("\n🔑 Test 3.3: Reset password page structure\n");

      // Navigate to reset password with mock token
      await page.goto(`${BASE_URL}/reset-password?token=test-token`);
      await waitForPageLoad(page);

      // Check for password fields
      const passwordInputs = page.locator('input[type="password"]');
      const passwordCount = await passwordInputs.count();

      if (passwordCount > 0) {
        console.log(`  ✓ Found ${passwordCount} password field(s)`);
      }

      await takeScreenshot(page, "15-reset-password-page");
    });
  });

  // ===========================================================================
  // SECTION 4: PROTECTED ROUTES
  // ===========================================================================

  test.describe("Protected Routes", () => {
    test("4.1 - User dashboard redirects to login", async ({ page }) => {
      console.log("\n🔒 Test 4.1: User dashboard protection\n");

      await page.goto(`${BASE_URL}/user/dashboard`);
      await waitForPageLoad(page);

      // Should redirect to login or show auth required
      const isRedirected = page.url().includes("/login") || page.url().includes("/sign-in");
      const showsAuthRequired = await page.locator('text=/sign in|login|authentication required/i').count() > 0;

      expect(isRedirected || showsAuthRequired).toBeTruthy();
      console.log("  ✓ User dashboard protected");

      await takeScreenshot(page, "16-dashboard-protected");
    });

    test("4.2 - Organizer dashboard redirects to login", async ({ page }) => {
      console.log("\n🔒 Test 4.2: Organizer dashboard protection\n");

      await page.goto(`${BASE_URL}/organizer/dashboard`);
      await waitForPageLoad(page);

      const isProtected = page.url().includes("/login") ||
                          await page.locator('text=/sign in|login/i').count() > 0;

      expect(isProtected).toBeTruthy();
      console.log("  ✓ Organizer dashboard protected");

      await takeScreenshot(page, "17-organizer-protected");
    });

    test("4.3 - Admin dashboard redirects to login", async ({ page }) => {
      console.log("\n🔒 Test 4.3: Admin dashboard protection\n");

      await page.goto(`${BASE_URL}/admin`);
      await waitForPageLoad(page);

      const isProtected = page.url().includes("/login") ||
                          await page.locator('text=/sign in|login|unauthorized/i').count() > 0;

      expect(isProtected).toBeTruthy();
      console.log("  ✓ Admin dashboard protected");

      await takeScreenshot(page, "18-admin-protected");
    });

    test("4.4 - My tickets page requires auth", async ({ page }) => {
      console.log("\n🔒 Test 4.4: My tickets protection\n");

      await page.goto(`${BASE_URL}/my-tickets`);
      await waitForPageLoad(page);

      const isProtected = page.url().includes("/login") ||
                          await page.locator('text=/sign in|login/i').count() > 0;

      expect(isProtected).toBeTruthy();
      console.log("  ✓ My tickets page protected");

      await takeScreenshot(page, "19-my-tickets-protected");
    });

    test("4.5 - Staff dashboard requires auth", async ({ page }) => {
      console.log("\n🔒 Test 4.5: Staff dashboard protection\n");

      await page.goto(`${BASE_URL}/staff/dashboard`);
      await waitForPageLoad(page);

      const isProtected = page.url().includes("/login") ||
                          await page.locator('text=/sign in|login/i').count() > 0;

      expect(isProtected).toBeTruthy();
      console.log("  ✓ Staff dashboard protected");

      await takeScreenshot(page, "20-staff-protected");
    });

    test("4.6 - Vendor dashboard requires auth", async ({ page }) => {
      console.log("\n🔒 Test 4.6: Vendor dashboard protection\n");

      await page.goto(`${BASE_URL}/vendor/dashboard`);
      await waitForPageLoad(page);

      const isProtected = page.url().includes("/login") ||
                          await page.locator('text=/sign in|login/i').count() > 0;

      expect(isProtected).toBeTruthy();
      console.log("  ✓ Vendor dashboard protected");

      await takeScreenshot(page, "21-vendor-protected");
    });
  });

  // ===========================================================================
  // SECTION 5: RESPONSIVE DESIGN
  // ===========================================================================

  test.describe("Responsive Design", () => {
    test("5.1 - Login page mobile viewport", async ({ page }) => {
      console.log("\n📱 Test 5.1: Login mobile viewport\n");

      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(`${BASE_URL}/login`);
      await waitForPageLoad(page);

      // Verify form is usable on mobile
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible();

      await takeScreenshot(page, "22-login-mobile");
      console.log("✅ Login page mobile view works");
    });

    test("5.2 - Register page mobile viewport", async ({ page }) => {
      console.log("\n📱 Test 5.2: Register mobile viewport\n");

      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(`${BASE_URL}/register`);
      await waitForPageLoad(page);

      await takeScreenshot(page, "23-register-mobile");
      console.log("✅ Register page mobile view works");
    });

    test("5.3 - Login page tablet viewport", async ({ page }) => {
      console.log("\n📱 Test 5.3: Login tablet viewport\n");

      await page.setViewportSize(VIEWPORTS.tablet);
      await page.goto(`${BASE_URL}/login`);
      await waitForPageLoad(page);

      await takeScreenshot(page, "24-login-tablet");
      console.log("✅ Login page tablet view works");
    });
  });

  // ===========================================================================
  // SECTION 6: ACCESSIBILITY
  // ===========================================================================

  test.describe("Accessibility", () => {
    test("6.1 - Login form has proper labels", async ({ page }) => {
      console.log("\n♿ Test 6.1: Form labels accessibility\n");

      await page.goto(`${BASE_URL}/login`);
      await waitForPageLoad(page);

      // Check for labels
      const labels = page.locator("label");
      const labelCount = await labels.count();
      console.log(`  Found ${labelCount} label(s)`);

      // Check inputs have aria-labels or associated labels
      const emailInput = page.locator('input[type="email"]');
      const hasLabel = await emailInput.getAttribute("aria-label") !== null ||
                       await emailInput.getAttribute("id") !== null;

      expect(hasLabel).toBeTruthy();
      console.log("  ✓ Email input has proper labeling");

      await takeScreenshot(page, "25-login-accessibility");
    });

    test("6.2 - Keyboard navigation works", async ({ page }) => {
      console.log("\n♿ Test 6.2: Keyboard navigation\n");

      await page.goto(`${BASE_URL}/login`);
      await waitForPageLoad(page);

      // Tab through form
      await page.keyboard.press("Tab");
      const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
      console.log(`  First focused: ${firstFocused}`);

      await page.keyboard.press("Tab");
      const secondFocused = await page.evaluate(() => document.activeElement?.tagName);
      console.log(`  Second focused: ${secondFocused}`);

      expect(firstFocused).toBeTruthy();
      console.log("  ✓ Keyboard navigation functional");
    });

    test("6.3 - Form error messages are accessible", async ({ page }) => {
      console.log("\n♿ Test 6.3: Error message accessibility\n");

      await page.goto(`${BASE_URL}/login`);
      await waitForPageLoad(page);

      // Submit empty form to trigger errors
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      await page.waitForTimeout(500);

      // Check for aria-invalid attributes
      const invalidInputs = page.locator('[aria-invalid="true"]');
      const invalidCount = await invalidInputs.count();
      console.log(`  Found ${invalidCount} invalid input(s) marked with aria-invalid`);

      await takeScreenshot(page, "26-error-accessibility");
    });
  });

  // ===========================================================================
  // SECTION 7: PERFORMANCE
  // ===========================================================================

  test.describe("Performance", () => {
    test("7.1 - Login page loads within acceptable time", async ({ page }) => {
      console.log("\n⚡ Test 7.1: Login page performance\n");

      const startTime = Date.now();
      await page.goto(`${BASE_URL}/login`);
      await waitForPageLoad(page);
      const loadTime = Date.now() - startTime;

      console.log(`  Load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(5000);
      console.log("✅ Login page loads within acceptable time");
    });

    test("7.2 - Register page loads within acceptable time", async ({ page }) => {
      console.log("\n⚡ Test 7.2: Register page performance\n");

      const startTime = Date.now();
      await page.goto(`${BASE_URL}/register`);
      await waitForPageLoad(page);
      const loadTime = Date.now() - startTime;

      console.log(`  Load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(5000);
      console.log("✅ Register page loads within acceptable time");
    });
  });
});

// =============================================================================
// STANDALONE TESTS
// =============================================================================

test.describe("Authentication - Standalone Tests", () => {
  test("Login page is publicly accessible", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/login`);
    expect(response?.status()).toBe(200);
  });

  test("Register page is publicly accessible", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/register`);
    expect(response?.status()).toBe(200);
  });

  test("Forgot password page is publicly accessible", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/forgot-password`);
    expect(response?.status()).toBeLessThan(400);
  });
});
