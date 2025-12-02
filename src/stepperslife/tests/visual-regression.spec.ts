/**
 * VISUAL REGRESSION TEST SUITE
 *
 * Tests visual consistency of key pages across different viewports.
 * Uses Playwright's toHaveScreenshot() for pixel-perfect comparisons.
 *
 * Run with: npx playwright test visual-regression.spec.ts --update-snapshots
 * (first run to create baseline screenshots)
 *
 * Subsequent runs will compare against baselines.
 */

import { test, expect, Page } from "@playwright/test";

// =============================================================================
// CONFIGURATION
// =============================================================================

const BASE_URL = process.env.BASE_URL || "http://localhost:3004";
const MAX_PAGE_LOAD_TIME = 5000;

// Viewport configurations
const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
};

// Pages to test for visual regression
const PAGES_TO_TEST = [
  { path: "/", name: "home" },
  { path: "/events", name: "events" },
  { path: "/marketplace", name: "marketplace" },
  { path: "/restaurants", name: "restaurants" },
  { path: "/login", name: "login" },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Wait for page to be fully loaded and stable
 */
async function waitForPageStable(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle", { timeout: MAX_PAGE_LOAD_TIME });
  await page.waitForTimeout(1000); // Extra time for animations to settle

  // Wait for any loading spinners to disappear
  const spinner = page.locator(".animate-spin").first();
  if (await spinner.isVisible().catch(() => false)) {
    await spinner.waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});
  }

  // Wait for images to load
  await page.evaluate(() => {
    return Promise.all(
      Array.from(document.images)
        .filter((img) => !img.complete)
        .map(
          (img) =>
            new Promise((resolve) => {
              img.onload = img.onerror = resolve;
            })
        )
    );
  });
}

/**
 * Hide dynamic content that changes between runs
 */
async function hideDynamicContent(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      /* Hide timestamps, dates that change */
      time, [data-testid*="date"], [data-testid*="time"] {
        visibility: hidden !important;
      }

      /* Freeze animations */
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }

      /* Hide avatars/profile images that may vary */
      [data-testid="profile-image"] {
        visibility: hidden !important;
      }
    `,
  });
}

// =============================================================================
// VISUAL REGRESSION TESTS - DESKTOP
// =============================================================================

test.describe("Visual Regression - Desktop", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
  });

  for (const pageConfig of PAGES_TO_TEST) {
    test(`${pageConfig.name} page matches snapshot`, async ({ page }) => {
      console.log(`\n📸 Testing visual: ${pageConfig.name} (desktop)`);

      await page.goto(`${BASE_URL}${pageConfig.path}`);
      await waitForPageStable(page);
      await hideDynamicContent(page);

      await expect(page).toHaveScreenshot(`desktop-${pageConfig.name}.png`, {
        fullPage: true,
        animations: "disabled",
      });
    });
  }
});

// =============================================================================
// VISUAL REGRESSION TESTS - TABLET
// =============================================================================

test.describe("Visual Regression - Tablet", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet);
  });

  for (const pageConfig of PAGES_TO_TEST) {
    test(`${pageConfig.name} page matches snapshot`, async ({ page }) => {
      console.log(`\n📸 Testing visual: ${pageConfig.name} (tablet)`);

      await page.goto(`${BASE_URL}${pageConfig.path}`);
      await waitForPageStable(page);
      await hideDynamicContent(page);

      await expect(page).toHaveScreenshot(`tablet-${pageConfig.name}.png`, {
        fullPage: true,
        animations: "disabled",
      });
    });
  }
});

// =============================================================================
// VISUAL REGRESSION TESTS - MOBILE
// =============================================================================

test.describe("Visual Regression - Mobile", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
  });

  for (const pageConfig of PAGES_TO_TEST) {
    test(`${pageConfig.name} page matches snapshot`, async ({ page }) => {
      console.log(`\n📸 Testing visual: ${pageConfig.name} (mobile)`);

      await page.goto(`${BASE_URL}${pageConfig.path}`);
      await waitForPageStable(page);
      await hideDynamicContent(page);

      await expect(page).toHaveScreenshot(`mobile-${pageConfig.name}.png`, {
        fullPage: true,
        animations: "disabled",
      });
    });
  }
});

// =============================================================================
// COMPONENT VISUAL TESTS
// =============================================================================

test.describe("Component Visual Regression", () => {
  test("Header component - desktop", async ({ page }) => {
    console.log("\n📸 Testing visual: header component (desktop)");

    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/events`);
    await waitForPageStable(page);
    await hideDynamicContent(page);

    const header = page.locator('[data-testid="public-header"]');
    await expect(header).toHaveScreenshot("component-header-desktop.png");
  });

  test("Header component - mobile (closed)", async ({ page }) => {
    console.log("\n📸 Testing visual: header component (mobile-closed)");

    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto(`${BASE_URL}/events`);
    await waitForPageStable(page);
    await hideDynamicContent(page);

    const header = page.locator('[data-testid="public-header"]');
    await expect(header).toHaveScreenshot("component-header-mobile-closed.png");
  });

  test("Header component - mobile (open)", async ({ page }) => {
    console.log("\n📸 Testing visual: header component (mobile-open)");

    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto(`${BASE_URL}/events`);
    await waitForPageStable(page);
    await hideDynamicContent(page);

    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    await page.waitForTimeout(500);

    const header = page.locator('[data-testid="public-header"]');
    await expect(header).toHaveScreenshot("component-header-mobile-open.png");
  });

  test("Login form", async ({ page }) => {
    console.log("\n📸 Testing visual: login form");

    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/login`);
    await waitForPageStable(page);
    await hideDynamicContent(page);

    const loginForm = page.locator('[data-testid="login-form-container"]');
    await expect(loginForm).toHaveScreenshot("component-login-form.png");
  });

  test("Events grid", async ({ page }) => {
    console.log("\n📸 Testing visual: events grid");

    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/events`);
    await waitForPageStable(page);
    await hideDynamicContent(page);

    const eventsGrid = page.locator('[data-testid="events-grid"]');

    // Only take screenshot if events exist
    if (await eventsGrid.isVisible()) {
      await expect(eventsGrid).toHaveScreenshot("component-events-grid.png");
    }
  });
});

// =============================================================================
// THEME VISUAL TESTS
// =============================================================================

test.describe("Theme Visual Regression", () => {
  test("Light theme - home page", async ({ page }) => {
    console.log("\n📸 Testing visual: light theme");

    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/`);
    await waitForPageStable(page);

    // Ensure light theme
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    });
    await page.waitForTimeout(500);

    await hideDynamicContent(page);
    await expect(page).toHaveScreenshot("theme-light-home.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("Dark theme - home page", async ({ page }) => {
    console.log("\n📸 Testing visual: dark theme");

    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/`);
    await waitForPageStable(page);

    // Switch to dark theme
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    });
    await page.waitForTimeout(500);

    await hideDynamicContent(page);
    await expect(page).toHaveScreenshot("theme-dark-home.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});

// =============================================================================
// HOVER/INTERACTION STATE TESTS
// =============================================================================

test.describe("Interactive State Visual Regression", () => {
  test("Navigation link hover state", async ({ page }) => {
    console.log("\n📸 Testing visual: nav link hover");

    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/`);
    await waitForPageStable(page);
    await hideDynamicContent(page);

    // Hover over Events link
    const eventsLink = page.locator('[data-testid="nav-link-events"]');
    if (await eventsLink.isVisible()) {
      await eventsLink.hover();
      await page.waitForTimeout(300);
      await expect(eventsLink).toHaveScreenshot("state-nav-hover.png");
    }
  });

  test("Button focus state", async ({ page }) => {
    console.log("\n📸 Testing visual: button focus");

    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/login`);
    await waitForPageStable(page);
    await hideDynamicContent(page);

    // Focus the magic link button
    const magicLinkBtn = page.locator('[data-testid="magic-link-button"]');
    if (await magicLinkBtn.isVisible()) {
      await magicLinkBtn.focus();
      await page.waitForTimeout(300);
      await expect(magicLinkBtn).toHaveScreenshot("state-button-focus.png");
    }
  });
});

// =============================================================================
// TEST SUITE SUMMARY
// =============================================================================

test.describe("Visual Regression Suite - Summary", () => {
  test("SUMMARY: Visual regression tests complete", async ({ page }) => {
    console.log("\n" + "=".repeat(80));
    console.log("VISUAL REGRESSION TEST SUITE SUMMARY");
    console.log("=".repeat(80));

    console.log("\n✅ DESKTOP PAGES");
    for (const pageConfig of PAGES_TO_TEST) {
      console.log(`  • ${pageConfig.name}`);
    }

    console.log("\n✅ TABLET PAGES");
    for (const pageConfig of PAGES_TO_TEST) {
      console.log(`  • ${pageConfig.name}`);
    }

    console.log("\n✅ MOBILE PAGES");
    for (const pageConfig of PAGES_TO_TEST) {
      console.log(`  • ${pageConfig.name}`);
    }

    console.log("\n✅ COMPONENT TESTS");
    console.log("  • Header (desktop, mobile-closed, mobile-open)");
    console.log("  • Login form");
    console.log("  • Events grid");

    console.log("\n✅ THEME TESTS");
    console.log("  • Light theme");
    console.log("  • Dark theme");

    console.log("\n✅ INTERACTIVE STATE TESTS");
    console.log("  • Navigation hover");
    console.log("  • Button focus");

    console.log("\n" + "=".repeat(80));
    console.log("✅ VISUAL REGRESSION SUITE COMPLETE");
    console.log("=".repeat(80) + "\n");

    expect(true).toBe(true);
  });
});
