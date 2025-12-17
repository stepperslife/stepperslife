import { Page, expect } from "@playwright/test";
import { TEST_USER, TEST_ORGANIZER, URLS, TIMEOUTS } from "./test-data";

/**
 * Authentication Helper Functions for E2E Tests
 */

/**
 * Register a new user with email/password
 */
export async function registerUser(
  page: Page,
  userData: {
    name: string;
    email: string;
    password: string;
  }
): Promise<void> {
  await page.goto(URLS.register);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForSelector('[data-testid="register-form"]', { timeout: 10000 });

  // Fill registration form
  await page.fill('[data-testid="register-name"]', userData.name);
  await page.fill('[data-testid="register-email"]', userData.email);
  await page.fill('[data-testid="register-password"]', userData.password);
  await page.fill(
    '[data-testid="register-confirm-password"]',
    userData.password
  );

  // Submit form
  await page.click('[data-testid="register-submit"]');

  // Wait for redirect to login page
  await page.waitForURL(/\/login/, { timeout: TIMEOUTS.medium });
}

/**
 * Login with email/password
 */
export async function loginUser(
  page: Page,
  credentials: {
    email: string;
    password: string;
  }
): Promise<void> {
  await page.goto(URLS.login);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForSelector('[data-testid="password-login-toggle"]', { timeout: 10000 });

  // Fill login form
  await page.fill('[data-testid="login-email"]', credentials.email);
  await page.fill('[data-testid="login-password"]', credentials.password);

  // Submit form
  await page.click('[data-testid="login-submit"]');

  // Wait for navigation away from login page
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: TIMEOUTS.medium,
  });
}

/**
 * Login as the default test user
 */
export async function loginAsTestUser(page: Page): Promise<void> {
  await loginUser(page, {
    email: TEST_USER.email,
    password: TEST_USER.password,
  });
}

/**
 * Login as the test organizer
 */
export async function loginAsTestOrganizer(page: Page): Promise<void> {
  await loginUser(page, {
    email: TEST_ORGANIZER.email,
    password: TEST_ORGANIZER.password,
  });
}

/**
 * Logout the current user
 */
export async function logoutUser(page: Page): Promise<void> {
  // Click user menu or logout button
  const logoutButton = page.locator('[data-testid="logout-button"]');
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
  } else {
    // Try clicking user avatar/menu first
    const userMenu = page.locator('[data-testid="user-menu"]');
    if (await userMenu.isVisible()) {
      await userMenu.click();
      await page.click('[data-testid="logout-menu-item"]');
    }
  }

  // Wait for redirect to home or login page
  await page.waitForURL(/\/(login)?$/, { timeout: TIMEOUTS.medium });
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  // Check for user-specific elements that indicate logged-in state
  const userMenu = page.locator('[data-testid="user-menu"]');
  const myTicketsLink = page.locator('[data-testid="my-tickets-link"]');
  const dashboardLink = page.locator('[data-testid="dashboard-link"]');

  return (
    (await userMenu.isVisible()) ||
    (await myTicketsLink.isVisible()) ||
    (await dashboardLink.isVisible())
  );
}

/**
 * Verify user is on the login page
 */
export async function expectLoginPage(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/login/);
  await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
}

/**
 * Verify user is on the register page
 */
export async function expectRegisterPage(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/register/);
  await expect(page.locator('[data-testid="register-form"]')).toBeVisible();
}

/**
 * Register and login a new user in one step
 */
export async function registerAndLogin(
  page: Page,
  userData: {
    name: string;
    email: string;
    password: string;
  }
): Promise<void> {
  await registerUser(page, userData);
  await loginUser(page, {
    email: userData.email,
    password: userData.password,
  });
}

/**
 * Request magic link login
 */
export async function requestMagicLink(
  page: Page,
  email: string
): Promise<void> {
  await page.goto(URLS.login);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForSelector('[data-testid="magic-link-tab"]', { timeout: 10000 });

  // Click magic link tab/button
  await page.click('[data-testid="magic-link-tab"]');

  // Fill email
  await page.fill('[data-testid="magic-link-email"]', email);

  // Submit
  await page.click('[data-testid="magic-link-submit"]');

  // Wait for success message
  await expect(
    page.locator('[data-testid="magic-link-success"]')
  ).toBeVisible();
}

/**
 * Wait for authenticated state
 */
export async function waitForAuth(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      // Check for auth-related cookies or localStorage
      return document.cookie.includes("session") ||
             localStorage.getItem("authToken") !== null;
    },
    { timeout: TIMEOUTS.medium }
  );
}

/**
 * Clear authentication state
 */
export async function clearAuthState(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}
