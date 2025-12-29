/**
 * Role Permission Tests
 * Tests that user roles have correct access to payment features
 */

import { test, expect } from "@playwright/test";
import {
  loginAsAdmin,
  loginAsOrganizer,
  loginAsUser,
  logout,
  TIMEOUTS,
  TEST_CREDENTIALS,
} from "./helpers/production-helpers";

test.describe("Admin Role Permissions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("admin can access organizer dashboard", async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);

    if (loggedIn) {
      await page.goto("/organizer/dashboard");
      await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

      // Should not redirect to login
      expect(page.url()).not.toContain("/login");
      expect(page.url()).toContain("/organizer");
    } else {
      test.skip(true, "Admin login failed - check credentials");
    }
  });

  test("admin can access admin dashboard", async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);

    if (loggedIn) {
      await page.goto("/admin");
      await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

      // Should have access
      expect(page.url()).not.toContain("/login");
      expect(page.url()).not.toContain("unauthorized");
    } else {
      test.skip(true, "Admin login failed - check credentials");
    }
  });

  test("admin can access Stripe Connect page", async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);

    if (loggedIn) {
      await page.goto("/organizer/stripe-connect");
      await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

      // Should have access
      expect(page.url()).not.toContain("/login");
    } else {
      test.skip(true, "Admin login failed - check credentials");
    }
  });

  test("admin can access credits page", async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);

    if (loggedIn) {
      await page.goto("/organizer/credits");
      await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

      // Should have access
      expect(page.url()).not.toContain("/login");
    } else {
      test.skip(true, "Admin login failed - check credentials");
    }
  });
});

test.describe("Organizer Role Permissions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("organizer can access organizer dashboard", async ({ page }) => {
    const loggedIn = await loginAsOrganizer(page);

    if (loggedIn) {
      await page.goto("/organizer/dashboard");
      await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

      // Should not redirect to login
      expect(page.url()).not.toContain("/login");
    } else {
      test.skip(true, "Organizer login failed - check credentials");
    }
  });

  test("organizer can access Stripe Connect page", async ({ page }) => {
    const loggedIn = await loginAsOrganizer(page);

    if (loggedIn) {
      await page.goto("/organizer/stripe-connect");
      await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

      // Should have access
      expect(page.url()).not.toContain("/login");
    } else {
      test.skip(true, "Organizer login failed - check credentials");
    }
  });

  test("organizer can access credits page", async ({ page }) => {
    const loggedIn = await loginAsOrganizer(page);

    if (loggedIn) {
      await page.goto("/organizer/credits");
      await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

      // Should have access
      expect(page.url()).not.toContain("/login");
    } else {
      test.skip(true, "Organizer login failed - check credentials");
    }
  });

  test("organizer can access event management", async ({ page }) => {
    const loggedIn = await loginAsOrganizer(page);

    if (loggedIn) {
      await page.goto("/organizer/events");
      await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

      // Should have access
      expect(page.url()).not.toContain("/login");
    } else {
      test.skip(true, "Organizer login failed - check credentials");
    }
  });

  test("organizer CANNOT access admin dashboard", async ({ page }) => {
    const loggedIn = await loginAsOrganizer(page);

    if (loggedIn) {
      await page.goto("/admin");
      await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

      // Should be redirected or see unauthorized
      const isRedirected =
        page.url().includes("/login") ||
        page.url().includes("unauthorized") ||
        !page.url().includes("/admin");

      expect(isRedirected).toBe(true);
    } else {
      test.skip(true, "Organizer login failed - check credentials");
    }
  });
});

test.describe("User Role Permissions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("user can access events page", async ({ page }) => {
    const loggedIn = await loginAsUser(page);

    if (loggedIn) {
      await page.goto("/events");
      await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

      // Should have access
      expect(page.url()).toContain("/events");
    } else {
      // Events should be accessible even without login
      await page.goto("/events");
      expect(page.url()).toContain("/events");
    }
  });

  test("user can access my tickets page", async ({ page }) => {
    const loggedIn = await loginAsUser(page);

    if (loggedIn) {
      await page.goto("/user/my-tickets");
      await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

      // Should have access (either page loads or redirects if no tickets)
      expect(page.url()).not.toContain("/login");
    } else {
      test.skip(true, "User login failed - check credentials");
    }
  });

  test("user CANNOT access organizer dashboard", async ({ page }) => {
    const loggedIn = await loginAsUser(page);

    if (loggedIn) {
      await page.goto("/organizer/dashboard");
      await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

      // Should be redirected
      const isRestricted =
        page.url().includes("/login") ||
        page.url().includes("unauthorized") ||
        !page.url().includes("/organizer");

      expect(isRestricted).toBe(true);
    } else {
      test.skip(true, "User login failed - check credentials");
    }
  });

  test("user CANNOT access admin dashboard", async ({ page }) => {
    const loggedIn = await loginAsUser(page);

    if (loggedIn) {
      await page.goto("/admin");
      await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

      // Should be redirected
      const isRestricted =
        page.url().includes("/login") ||
        page.url().includes("unauthorized") ||
        !page.url().includes("/admin");

      expect(isRestricted).toBe(true);
    } else {
      test.skip(true, "User login failed - check credentials");
    }
  });

  test("user CANNOT access Stripe Connect page", async ({ page }) => {
    const loggedIn = await loginAsUser(page);

    if (loggedIn) {
      await page.goto("/organizer/stripe-connect");
      await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

      // Should be redirected
      const isRestricted =
        page.url().includes("/login") ||
        page.url().includes("unauthorized") ||
        !page.url().includes("/organizer");

      expect(isRestricted).toBe(true);
    } else {
      test.skip(true, "User login failed - check credentials");
    }
  });

  test("user CANNOT access credits page", async ({ page }) => {
    const loggedIn = await loginAsUser(page);

    if (loggedIn) {
      await page.goto("/organizer/credits");
      await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

      // Should be redirected
      const isRestricted =
        page.url().includes("/login") ||
        page.url().includes("unauthorized") ||
        !page.url().includes("/organizer");

      expect(isRestricted).toBe(true);
    } else {
      test.skip(true, "User login failed - check credentials");
    }
  });
});

test.describe("Unauthenticated Access", () => {
  test("unauthenticated user can view events", async ({ page }) => {
    await page.goto("/events");
    await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

    // Events should be publicly accessible
    expect(page.url()).toContain("/events");
  });

  test("unauthenticated user can view event details", async ({ page }) => {
    await page.goto("/events");
    await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

    // Try to click on an event
    const eventLink = page.locator('[href^="/events/"]').first();
    if (await eventLink.isVisible()) {
      await eventLink.click();
      await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

      // Should be able to view event details
      expect(page.url()).toContain("/events/");
    }
  });

  test("unauthenticated user is redirected from organizer pages", async ({ page }) => {
    await page.goto("/organizer/dashboard");
    await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

    // Should redirect to login
    expect(page.url()).toContain("/login");
  });

  test("unauthenticated user is redirected from admin pages", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

    // Should redirect to login
    expect(page.url()).toContain("/login");
  });

  test("unauthenticated user is redirected from my-tickets", async ({ page }) => {
    await page.goto("/user/my-tickets");
    await page.waitForLoadState("domcontentloaded"); await page.waitForTimeout(3000);

    // Should redirect to login OR show login prompt on page
    const url = page.url();
    const hasLoginRedirect = url.includes("/login");
    const hasLoginPrompt = await page.locator(':has-text("log in"), :has-text("Sign In"), :has-text("Sign in")').first().isVisible({ timeout: 5000 }).catch(() => false);

    expect(hasLoginRedirect || hasLoginPrompt).toBe(true);
  });
});
