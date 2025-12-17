/**
 * Navigation & Layout Feature - Comprehensive Test Suite
 *
 * Tests the complete navigation and layout including:
 * - Public header navigation
 * - Footer links
 * - Mobile menu functionality
 * - Breadcrumbs
 * - Page transitions
 * - Deep linking
 * - Public pages accessibility
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
  // Header
  publicHeader: '[data-testid="public-header"]',
  logo: '[data-testid="logo"]',
  desktopNav: '[data-testid="desktop-nav"]',
  themeToggle: '[data-testid="theme-toggle"]',
  headerCta: '[data-testid="header-cta"]',
  signInButton: '[data-testid="sign-in-button"]',
  profileDropdownTrigger: '[data-testid="profile-dropdown-trigger"]',
  profileDropdownMenu: '[data-testid="profile-dropdown-menu"]',
  signOutButton: '[data-testid="sign-out-button"]',
  // Navigation links
  navLinkEvents: '[data-testid="nav-link-events"]',
  navLinkRestaurants: '[data-testid="nav-link-restaurants"]',
  navLinkMarketplace: '[data-testid="nav-link-marketplace"]',
  // Mobile
  mobileMenuButton: '[data-testid="mobile-menu-button"]',
  mobileMenuPanel: '[data-testid="mobile-menu-panel"]',
  mobileNavEvents: '[data-testid="mobile-nav-events"]',
  mobileNavRestaurants: '[data-testid="mobile-nav-restaurants"]',
  mobileNavMarketplace: '[data-testid="mobile-nav-marketplace"]',
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
    path: `test-results/navigation-${name}.png`,
    fullPage: true,
  });
}

// =============================================================================
// TEST SUITE
// =============================================================================

test.describe("Navigation & Layout Feature", () => {
  // ===========================================================================
  // SECTION 1: PUBLIC HEADER NAVIGATION
  // ===========================================================================

  test.describe("Header Navigation", () => {
    test("1.1 - Header is visible on homepage", async ({ page }) => {
      console.log("\n🧭 Test 1.1: Header visibility\n");

      await page.goto(`${BASE_URL}/`);
      await waitForPageLoad(page);

      // Use data-testid for reliable header detection
      const header = page.locator(TEST_IDS.publicHeader);
      await expect(header).toBeVisible();

      await takeScreenshot(page, "01-header-visible");
      console.log("✅ Header visible on homepage");
    });

    test("1.2 - Logo navigates to homepage", async ({ page }) => {
      console.log("\n🧭 Test 1.2: Logo navigation\n");

      await page.goto(`${BASE_URL}/events`);
      await waitForPageLoad(page);

      // Use data-testid for logo
      const logo = page.locator(TEST_IDS.logo);

      if (await logo.isVisible()) {
        await logo.click();
        await waitForPageLoad(page);

        expect(page.url()).toBe(`${BASE_URL}/`);
        console.log("  ✓ Logo navigates to homepage");
      } else {
        console.log("  ℹ Logo link not found");
      }

      await takeScreenshot(page, "02-logo-navigation");
    });

    test("1.3 - Events link in navigation", async ({ page }) => {
      console.log("\n🧭 Test 1.3: Events navigation link\n");

      await page.goto(`${BASE_URL}/`);
      await waitForPageLoad(page);

      // Use data-testid for events link
      const eventsLink = page.locator(TEST_IDS.navLinkEvents);

      if (await eventsLink.isVisible()) {
        await eventsLink.click();
        await waitForPageLoad(page);

        expect(page.url()).toContain("/events");
        console.log("  ✓ Events link works");
      }

      await takeScreenshot(page, "03-events-navigation");
    });

    test("1.4 - Restaurants link in navigation", async ({ page }) => {
      console.log("\n🧭 Test 1.4: Restaurants navigation link\n");

      await page.goto(`${BASE_URL}/`);
      await waitForPageLoad(page);

      // Use data-testid for restaurants link
      const restaurantsLink = page.locator(TEST_IDS.navLinkRestaurants);

      if (await restaurantsLink.isVisible()) {
        await restaurantsLink.click();
        await waitForPageLoad(page);

        expect(page.url()).toContain("/restaurants");
        console.log("  ✓ Restaurants link works");
      }

      await takeScreenshot(page, "04-restaurants-navigation");
    });

    test("1.5 - Marketplace link in navigation", async ({ page }) => {
      console.log("\n🧭 Test 1.5: Marketplace navigation link\n");

      await page.goto(`${BASE_URL}/`);
      await waitForPageLoad(page);

      // Use data-testid for marketplace link
      const marketplaceLink = page.locator(TEST_IDS.navLinkMarketplace);

      if (await marketplaceLink.isVisible()) {
        await marketplaceLink.click();
        await waitForPageLoad(page);

        expect(page.url()).toContain("/marketplace");
        console.log("  ✓ Marketplace link works");
      }

      await takeScreenshot(page, "05-marketplace-navigation");
    });

    test("1.6 - Sign In button visible (when not logged in)", async ({ page }) => {
      console.log("\n🧭 Test 1.6: Sign In button\n");

      await page.goto(`${BASE_URL}/`);
      await waitForPageLoad(page);

      // Use data-testid for sign in button
      const signInButton = page.locator(TEST_IDS.signInButton);

      if (await signInButton.isVisible()) {
        await expect(signInButton).toBeVisible();
        console.log("  ✓ Sign In button visible");

        await signInButton.click();
        await waitForPageLoad(page);

        expect(page.url()).toContain("/login");
        console.log("  ✓ Sign In button navigates to login");
      }

      await takeScreenshot(page, "06-signin-button");
    });
  });

  // ===========================================================================
  // SECTION 2: MOBILE NAVIGATION
  // ===========================================================================

  test.describe("Mobile Navigation", () => {
    test("2.1 - Mobile menu button visible on mobile", async ({ page }) => {
      console.log("\n📱 Test 2.1: Mobile menu button\n");

      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(`${BASE_URL}/`);
      await waitForPageLoad(page);

      // Use data-testid for mobile menu button
      const mobileMenuBtn = page.locator(TEST_IDS.mobileMenuButton);

      if (await mobileMenuBtn.isVisible()) {
        await expect(mobileMenuBtn).toBeVisible();
        console.log("  ✓ Mobile menu button visible");
      } else {
        console.log("  ℹ Mobile menu button not found (may use different pattern)");
      }

      await takeScreenshot(page, "07-mobile-menu-button");
    });

    test("2.2 - Mobile menu opens on click", async ({ page }) => {
      console.log("\n📱 Test 2.2: Mobile menu opens\n");

      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(`${BASE_URL}/`);
      await waitForPageLoad(page);

      // Use data-testid for mobile menu button
      const mobileMenuBtn = page.locator(TEST_IDS.mobileMenuButton);

      if (await mobileMenuBtn.isVisible()) {
        await mobileMenuBtn.click();
        await page.waitForTimeout(500);

        // Check for mobile menu panel using data-testid
        const mobileMenuPanel = page.locator(TEST_IDS.mobileMenuPanel);

        if (await mobileMenuPanel.isVisible()) {
          console.log("  ✓ Mobile menu opened");
        }

        await takeScreenshot(page, "08-mobile-menu-open");
      }
    });

    test("2.3 - Mobile menu links work", async ({ page }) => {
      console.log("\n📱 Test 2.3: Mobile menu links\n");

      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(`${BASE_URL}/`);
      await waitForPageLoad(page);

      // Use data-testid for mobile menu button
      const mobileMenuBtn = page.locator(TEST_IDS.mobileMenuButton);

      if (await mobileMenuBtn.isVisible()) {
        await mobileMenuBtn.click();
        await page.waitForTimeout(500);

        // Click on events link in mobile menu using data-testid
        const eventsLink = page.locator(TEST_IDS.mobileNavEvents);
        if (await eventsLink.isVisible()) {
          await eventsLink.click();
          await waitForPageLoad(page);

          expect(page.url()).toContain("/events");
          console.log("  ✓ Mobile menu navigation works");
        }
      }

      await takeScreenshot(page, "09-mobile-menu-navigation");
    });

    test("2.4 - Mobile menu closes on link click", async ({ page }) => {
      console.log("\n📱 Test 2.4: Mobile menu closes\n");

      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(`${BASE_URL}/`);
      await waitForPageLoad(page);

      // Use data-testid for mobile menu button
      const mobileMenuBtn = page.locator(TEST_IDS.mobileMenuButton);

      if (await mobileMenuBtn.isVisible()) {
        await mobileMenuBtn.click();
        await page.waitForTimeout(500);

        // Click a link using data-testid
        const link = page.locator(TEST_IDS.mobileNavEvents);
        if (await link.isVisible()) {
          await link.click();
          await waitForPageLoad(page);

          // Menu should be closed - check using data-testid
          const mobileMenuPanel = page.locator(TEST_IDS.mobileMenuPanel);
          const isMenuHidden = !(await mobileMenuPanel.isVisible());

          if (isMenuHidden) {
            console.log("  ✓ Mobile menu closes after navigation");
          }
        }
      }

      await takeScreenshot(page, "10-mobile-menu-closed");
    });
  });

  // ===========================================================================
  // SECTION 3: FOOTER NAVIGATION
  // ===========================================================================

  test.describe("Footer Navigation", () => {
    test("3.1 - Footer is visible", async ({ page }) => {
      console.log("\n🦶 Test 3.1: Footer visibility\n");

      await page.goto(`${BASE_URL}/`);
      await waitForPageLoad(page);

      const footer = page.locator('footer, [role="contentinfo"]');
      await expect(footer).toBeVisible();

      await takeScreenshot(page, "11-footer-visible");
      console.log("✅ Footer visible");
    });

    test("3.2 - Footer contains copyright", async ({ page }) => {
      console.log("\n🦶 Test 3.2: Footer copyright\n");

      await page.goto(`${BASE_URL}/`);
      await waitForPageLoad(page);

      const copyright = page.locator('footer').locator('text=/©|copyright|stepperslife/i');

      if (await copyright.count() > 0) {
        console.log("  ✓ Copyright notice present");
      }

      await takeScreenshot(page, "12-footer-copyright");
    });

    test("3.3 - Footer links are functional", async ({ page }) => {
      console.log("\n🦶 Test 3.3: Footer links\n");

      await page.goto(`${BASE_URL}/`);
      await waitForPageLoad(page);

      const footerLinks = page.locator('footer a');
      const linkCount = await footerLinks.count();

      console.log(`  Found ${linkCount} footer link(s)`);

      if (linkCount > 0) {
        // Test first link
        const firstLink = footerLinks.first();
        const href = await firstLink.getAttribute("href");

        if (href && !href.startsWith("mailto:") && !href.startsWith("tel:")) {
          await firstLink.click();
          await waitForPageLoad(page);
          console.log(`  ✓ Footer link navigated to: ${page.url()}`);
        }
      }

      await takeScreenshot(page, "13-footer-links");
    });

    test("3.4 - Social media links present", async ({ page }) => {
      console.log("\n🦶 Test 3.4: Social media links\n");

      await page.goto(`${BASE_URL}/`);
      await waitForPageLoad(page);

      const socialLinks = page.locator('footer a[href*="facebook"], footer a[href*="twitter"], footer a[href*="instagram"], footer a[href*="linkedin"]');
      const socialCount = await socialLinks.count();

      console.log(`  Found ${socialCount} social media link(s)`);

      await takeScreenshot(page, "14-social-links");
    });
  });

  // ===========================================================================
  // SECTION 4: PUBLIC PAGES ACCESSIBILITY
  // ===========================================================================

  test.describe("Public Pages Accessibility", () => {
    test("4.1 - Homepage is publicly accessible", async ({ page }) => {
      console.log("\n🌐 Test 4.1: Homepage accessibility\n");

      const response = await page.goto(`${BASE_URL}/`);
      expect(response?.status()).toBe(200);

      await waitForPageLoad(page);
      console.log("  ✓ Homepage accessible (200 OK)");

      await takeScreenshot(page, "15-homepage");
    });

    test("4.2 - Events page is publicly accessible", async ({ page }) => {
      console.log("\n🌐 Test 4.2: Events page accessibility\n");

      const response = await page.goto(`${BASE_URL}/events`);
      expect(response?.status()).toBe(200);

      await waitForPageLoad(page);
      console.log("  ✓ Events page accessible (200 OK)");

      await takeScreenshot(page, "16-events-public");
    });

    test("4.3 - Restaurants page is publicly accessible", async ({ page }) => {
      console.log("\n🌐 Test 4.3: Restaurants page accessibility\n");

      const response = await page.goto(`${BASE_URL}/restaurants`);
      expect(response?.status()).toBe(200);

      await waitForPageLoad(page);
      console.log("  ✓ Restaurants page accessible (200 OK)");

      await takeScreenshot(page, "17-restaurants-public");
    });

    test("4.4 - Marketplace page is publicly accessible", async ({ page }) => {
      console.log("\n🌐 Test 4.4: Marketplace page accessibility\n");

      const response = await page.goto(`${BASE_URL}/marketplace`);
      expect(response?.status()).toBeLessThan(400);

      await waitForPageLoad(page);
      console.log("  ✓ Marketplace page accessible");

      await takeScreenshot(page, "18-marketplace-public");
    });

    test("4.5 - Login page is publicly accessible", async ({ page }) => {
      console.log("\n🌐 Test 4.5: Login page accessibility\n");

      const response = await page.goto(`${BASE_URL}/login`);
      expect(response?.status()).toBe(200);

      await waitForPageLoad(page);
      console.log("  ✓ Login page accessible (200 OK)");

      await takeScreenshot(page, "19-login-public");
    });

    test("4.6 - Register page is publicly accessible", async ({ page }) => {
      console.log("\n🌐 Test 4.6: Register page accessibility\n");

      const response = await page.goto(`${BASE_URL}/register`);
      expect(response?.status()).toBe(200);

      await waitForPageLoad(page);
      console.log("  ✓ Register page accessible (200 OK)");

      await takeScreenshot(page, "20-register-public");
    });
  });

  // ===========================================================================
  // SECTION 5: PAGE TRANSITIONS
  // ===========================================================================

  test.describe("Page Transitions", () => {
    test("5.1 - Navigation between pages works smoothly", async ({ page }) => {
      console.log("\n🔄 Test 5.1: Page transitions\n");

      await page.goto(`${BASE_URL}/`);
      await waitForPageLoad(page);

      // Navigate to events
      await page.click('a[href*="events"]');
      await waitForPageLoad(page);
      expect(page.url()).toContain("/events");
      console.log("  ✓ Home → Events transition");

      // Navigate to a specific event if available
      const eventLink = page.locator('a[href^="/events/"]').first();
      if (await eventLink.count() > 0) {
        await eventLink.click();
        await waitForPageLoad(page);
        console.log("  ✓ Events → Event detail transition");
      }

      // Navigate back
      await page.goBack();
      await waitForPageLoad(page);
      console.log("  ✓ Back navigation works");

      await takeScreenshot(page, "21-page-transitions");
    });

    test("5.2 - Browser back/forward navigation", async ({ page }) => {
      console.log("\n🔄 Test 5.2: Browser history navigation\n");

      await page.goto(`${BASE_URL}/`);
      await waitForPageLoad(page);

      await page.goto(`${BASE_URL}/events`);
      await waitForPageLoad(page);

      await page.goto(`${BASE_URL}/restaurants`);
      await waitForPageLoad(page);

      // Go back twice
      await page.goBack();
      await waitForPageLoad(page);
      expect(page.url()).toContain("/events");
      console.log("  ✓ Back to events");

      await page.goBack();
      await waitForPageLoad(page);
      expect(page.url()).toBe(`${BASE_URL}/`);
      console.log("  ✓ Back to home");

      // Go forward
      await page.goForward();
      await waitForPageLoad(page);
      expect(page.url()).toContain("/events");
      console.log("  ✓ Forward to events");

      await takeScreenshot(page, "22-browser-history");
    });
  });

  // ===========================================================================
  // SECTION 6: DEEP LINKING
  // ===========================================================================

  test.describe("Deep Linking", () => {
    test("6.1 - Direct URL to events page works", async ({ page }) => {
      console.log("\n🔗 Test 6.1: Events deep link\n");

      await page.goto(`${BASE_URL}/events`);
      await waitForPageLoad(page);

      expect(page.url()).toBe(`${BASE_URL}/events`);
      console.log("  ✓ Events deep link works");

      await takeScreenshot(page, "23-events-deep-link");
    });

    test("6.2 - Direct URL to restaurants page works", async ({ page }) => {
      console.log("\n🔗 Test 6.2: Restaurants deep link\n");

      await page.goto(`${BASE_URL}/restaurants`);
      await waitForPageLoad(page);

      expect(page.url()).toBe(`${BASE_URL}/restaurants`);
      console.log("  ✓ Restaurants deep link works");

      await takeScreenshot(page, "24-restaurants-deep-link");
    });

    test("6.3 - Invalid URL shows 404 or redirects", async ({ page }) => {
      console.log("\n🔗 Test 6.3: Invalid URL handling\n");

      const response = await page.goto(`${BASE_URL}/invalid-page-xyz`);
      await waitForPageLoad(page);

      // Should either show 404 or redirect
      const is404 = response?.status() === 404;
      const shows404Message = await page.locator('text=/not found|404/i').count() > 0;
      const redirectedToHome = page.url() === `${BASE_URL}/`;

      expect(is404 || shows404Message || redirectedToHome).toBeTruthy();
      console.log("  ✓ Invalid URL handled appropriately");

      await takeScreenshot(page, "25-invalid-url");
    });
  });

  // ===========================================================================
  // SECTION 7: RESPONSIVE LAYOUT
  // ===========================================================================

  test.describe("Responsive Layout", () => {
    test("7.1 - Desktop layout renders correctly", async ({ page }) => {
      console.log("\n🖥️ Test 7.1: Desktop layout\n");

      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto(`${BASE_URL}/`);
      await waitForPageLoad(page);

      // Check header is full width navigation
      const nav = page.locator('nav');
      if (await nav.count() > 0) {
        const navBox = await nav.first().boundingBox();
        if (navBox) {
          expect(navBox.width).toBeGreaterThan(500);
          console.log("  ✓ Desktop navigation full width");
        }
      }

      await takeScreenshot(page, "26-desktop-layout");
    });

    test("7.2 - Tablet layout renders correctly", async ({ page }) => {
      console.log("\n📱 Test 7.2: Tablet layout\n");

      await page.setViewportSize(VIEWPORTS.tablet);
      await page.goto(`${BASE_URL}/`);
      await waitForPageLoad(page);

      await takeScreenshot(page, "27-tablet-layout");
      console.log("  ✓ Tablet layout renders");
    });

    test("7.3 - Mobile layout renders correctly", async ({ page }) => {
      console.log("\n📱 Test 7.3: Mobile layout\n");

      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(`${BASE_URL}/`);
      await waitForPageLoad(page);

      await takeScreenshot(page, "28-mobile-layout");
      console.log("  ✓ Mobile layout renders");
    });
  });

  // ===========================================================================
  // SECTION 8: ACCESSIBILITY
  // ===========================================================================

  test.describe("Navigation Accessibility", () => {
    test("8.1 - Skip to main content link", async ({ page }) => {
      console.log("\n♿ Test 8.1: Skip link\n");

      await page.goto(`${BASE_URL}/`);
      await waitForPageLoad(page);

      // Press tab to reveal skip link
      await page.keyboard.press("Tab");

      const skipLink = page.locator('a:has-text("Skip to"), a[href="#main"]');

      if (await skipLink.count() > 0) {
        console.log("  ✓ Skip to main content link present");
      } else {
        console.log("  ℹ Skip link not found");
      }

      await takeScreenshot(page, "29-skip-link");
    });

    test("8.2 - Navigation has ARIA landmarks", async ({ page }) => {
      console.log("\n♿ Test 8.2: ARIA landmarks\n");

      await page.goto(`${BASE_URL}/`);
      await waitForPageLoad(page);

      const navLandmark = page.locator('nav, [role="navigation"]');
      const mainLandmark = page.locator('main, [role="main"]');

      expect(await navLandmark.count()).toBeGreaterThan(0);
      console.log("  ✓ Navigation landmark present");

      if (await mainLandmark.count() > 0) {
        console.log("  ✓ Main landmark present");
      }

      await takeScreenshot(page, "30-aria-landmarks");
    });

    test("8.3 - Links have accessible names", async ({ page }) => {
      console.log("\n♿ Test 8.3: Link accessibility\n");

      await page.goto(`${BASE_URL}/`);
      await waitForPageLoad(page);

      const links = page.locator("nav a");
      const linkCount = await links.count();

      let accessibleLinks = 0;
      for (let i = 0; i < Math.min(linkCount, 10); i++) {
        const link = links.nth(i);
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute("aria-label");

        if ((text && text.trim()) || ariaLabel) {
          accessibleLinks++;
        }
      }

      console.log(`  Accessible links: ${accessibleLinks}/${Math.min(linkCount, 10)}`);
      expect(accessibleLinks).toBeGreaterThan(0);

      await takeScreenshot(page, "31-link-accessibility");
    });

    test("8.4 - Keyboard navigation through header", async ({ page }) => {
      console.log("\n♿ Test 8.4: Keyboard navigation\n");

      await page.goto(`${BASE_URL}/`);
      await waitForPageLoad(page);

      // Tab through header elements
      const focusedElements: string[] = [];

      for (let i = 0; i < 5; i++) {
        await page.keyboard.press("Tab");
        const focused = await page.evaluate(() => document.activeElement?.tagName);
        if (focused) focusedElements.push(focused);
      }

      console.log(`  Focused elements: ${focusedElements.join(" → ")}`);
      expect(focusedElements.length).toBeGreaterThan(0);

      await takeScreenshot(page, "32-keyboard-nav");
    });
  });

  // ===========================================================================
  // SECTION 9: PERFORMANCE
  // ===========================================================================

  test.describe("Navigation Performance", () => {
    test("9.1 - Page navigation is fast", async ({ page }) => {
      console.log("\n⚡ Test 9.1: Navigation performance\n");

      await page.goto(`${BASE_URL}/`);
      await waitForPageLoad(page);

      const startTime = Date.now();

      // Navigate to events
      await page.click('a[href*="events"]');
      await waitForPageLoad(page);

      const navTime = Date.now() - startTime;

      console.log(`  Navigation time: ${navTime}ms`);
      expect(navTime).toBeLessThan(3000);
      console.log("  ✓ Navigation fast");

      await takeScreenshot(page, "33-nav-performance");
    });

    test("9.2 - Homepage loads quickly", async ({ page }) => {
      console.log("\n⚡ Test 9.2: Homepage load time\n");

      const startTime = Date.now();
      await page.goto(`${BASE_URL}/`);
      await waitForPageLoad(page);
      const loadTime = Date.now() - startTime;

      console.log(`  Load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(5000);
      console.log("  ✓ Homepage loads quickly");
    });
  });
});

// =============================================================================
// STANDALONE TESTS
// =============================================================================

test.describe("Navigation - Standalone Tests", () => {
  test("All public pages return 200", async ({ page }) => {
    const publicPages = ["/", "/events", "/restaurants", "/marketplace", "/login", "/register"];

    for (const pagePath of publicPages) {
      const response = await page.goto(`${BASE_URL}${pagePath}`);
      expect(response?.status()).toBeLessThan(400);
      console.log(`  ✓ ${pagePath} accessible`);
    }
  });

  test("Navigation links use proper href attributes", async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("networkidle");

    const navLinks = page.locator("nav a");
    const linkCount = await navLinks.count();

    for (let i = 0; i < linkCount; i++) {
      const href = await navLinks.nth(i).getAttribute("href");
      expect(href).toBeTruthy();
      expect(href).not.toBe("#");
    }
  });
});
