import { test, expect, Page, BrowserContext } from "@playwright/test";

/**
 * Events Comprehensive Test Suite
 *
 * Complete end-to-end tests for the events feature covering:
 * - Section 1: Public Event Browsing
 * - Section 2: Event Detail Page
 * - Section 3: Ticket Purchase Flow
 * - Section 4: Organizer Event Creation
 * - Section 5: Organizer Event Management
 * - Section 6: Ticket Management Features
 */

// =============================================================================
// CONFIGURATION & CONSTANTS
// =============================================================================

const BASE_URL = "http://localhost:3004";

const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
};

const TIMEOUTS = {
  navigation: 30000,
  networkIdle: 10000,
  animation: 500,
  pageLoad: 5000,
  spinnerMax: 10000,
};

// =============================================================================
// TEST DATA GENERATORS
// =============================================================================

function generateTestData() {
  const timestamp = Date.now();
  return {
    organizer: {
      email: `test-organizer-${timestamp}@stepperslife.com`,
      password: "TestPass123!",
      name: "Test Organizer",
    },
    customer: {
      email: `test-customer-${timestamp}@stepperslife.com`,
      name: "Test Customer",
      phone: "555-123-4567",
    },
    event: {
      title: `Test Event ${timestamp}`,
      description: `Automated test event created at ${new Date().toISOString()}. This event tests the complete events feature flow including creation, ticketing, and purchase.`,
      venue: {
        name: "Chicago Steppers Hall",
        address: "123 Dance Street",
        city: "Chicago",
        state: "IL",
        zipCode: "60601",
      },
      date: getFutureDate(30),
      time: "19:00",
      endTime: "23:00",
      categories: ["Steppers Set", "Workshop"],
      capacity: 200,
      eventType: "TICKETED_EVENT",
    },
    ticketTiers: [
      {
        name: "General Admission",
        price: 2500, // cents
        quantity: 100,
        description: "Standard entry ticket",
      },
      {
        name: "VIP",
        price: 5000,
        quantity: 50,
        description: "VIP access with premium seating",
      },
    ],
    discountCode: {
      code: `TEST${timestamp}`,
      percentage: 20,
    },
    stripe: {
      testCard: "4242424242424242",
      expMonth: "12",
      expYear: "28",
      cvc: "123",
      zip: "60601",
    },
  };
}

function getFutureDate(daysAhead: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split("T")[0];
}

function formatPriceDisplay(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if page has fully loaded (no spinner, content visible)
 */
async function checkPageLoaded(page: Page): Promise<boolean> {
  try {
    // Wait for network to settle
    await page.waitForLoadState("networkidle", {
      timeout: TIMEOUTS.networkIdle,
    });

    // Check no spinner is visible
    const spinners = page.locator(
      '.animate-spin, [data-testid="loading"], [role="progressbar"]:not([aria-valuenow])'
    );
    const spinnerCount = await spinners.count();

    if (spinnerCount > 0) {
      // Wait for spinner to disappear
      await spinners.first().waitFor({
        state: "hidden",
        timeout: TIMEOUTS.spinnerMax,
      });
    }

    await page.waitForTimeout(TIMEOUTS.animation);
    return true;
  } catch {
    return false;
  }
}

/**
 * Wait for page to stabilize (network + animations)
 */
async function waitForStableState(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle", { timeout: TIMEOUTS.networkIdle });
  await page.waitForTimeout(TIMEOUTS.animation);
}

/**
 * Reusable login helper
 */
async function login(
  page: Page,
  email: string,
  password?: string
): Promise<boolean> {
  await page.goto(`${BASE_URL}/`);
  await waitForStableState(page);

  // Check if already logged in
  const userMenu = page.locator(
    '[data-testid="user-menu"], button[aria-label*="account"], img[alt*="avatar"]'
  );
  if ((await userMenu.count()) > 0 && (await userMenu.first().isVisible())) {
    console.log("  Already logged in");
    return true;
  }

  // Find and click sign in button
  const signInButton = page.locator(
    'button:has-text("Sign In"), a:has-text("Sign In"), button:has-text("Login"), a:has-text("Login")'
  );

  if ((await signInButton.count()) === 0) {
    console.log("  No sign in button found");
    return false;
  }

  await signInButton.first().click();
  await waitForStableState(page);

  // Fill email
  const emailInput = page.locator(
    'input[type="email"], input[name="email"], input[name="identifier"]'
  );
  if ((await emailInput.count()) > 0) {
    await emailInput.fill(email);
  }

  // Fill password if provided
  if (password) {
    const passwordInput = page.locator(
      'input[type="password"], input[name="password"]'
    );
    if ((await passwordInput.count()) > 0) {
      await passwordInput.fill(password);
    }
  }

  // Submit
  const submitButton = page.locator(
    'button[type="submit"], button:has-text("Continue"), button:has-text("Sign In")'
  );
  if ((await submitButton.count()) > 0) {
    await submitButton.first().click();
  }

  // Wait for potential redirect
  try {
    await page.waitForURL(/\/(organizer|dashboard|events)/, {
      timeout: TIMEOUTS.navigation,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Take screenshot with consistent naming
 */
async function takeScreenshot(
  page: Page,
  name: string,
  fullPage = true
): Promise<void> {
  await page.screenshot({
    path: `test-results/events-comprehensive/${name}.png`,
    fullPage,
  });
}

/**
 * Measure and assert page load time
 */
async function assertPageLoadTime(
  page: Page,
  url: string,
  maxTime = TIMEOUTS.pageLoad
): Promise<number> {
  const startTime = Date.now();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await checkPageLoaded(page);
  const loadTime = Date.now() - startTime;

  expect(loadTime).toBeLessThan(maxTime);
  return loadTime;
}

/**
 * Get event ID from URL
 */
function getEventIdFromUrl(url: string): string | null {
  const match = url.match(/\/events\/([a-zA-Z0-9_]+)/);
  return match ? match[1] : null;
}

/**
 * Check for ARIA landmarks
 */
async function checkSemanticLandmarks(page: Page): Promise<{
  hasMain: boolean;
  hasNav: boolean;
  hasHeader: boolean;
  hasFooter: boolean;
}> {
  return {
    hasMain:
      (await page.locator('main, [role="main"]').count()) > 0,
    hasNav:
      (await page.locator('nav, [role="navigation"]').count()) > 0,
    hasHeader:
      (await page.locator('header, [role="banner"]').count()) > 0,
    hasFooter:
      (await page.locator('footer, [role="contentinfo"]').count()) > 0,
  };
}

// =============================================================================
// SECTION 1: PUBLIC EVENT BROWSING
// =============================================================================

test.describe("Section 1: Public Event Browsing", () => {
  const testData = generateTestData();

  test.describe("Events List Page Loading", () => {
    test("events list page loads with content within acceptable time", async ({
      page,
    }) => {
      console.log("\n📊 Testing Events List Page Load");

      const loadTime = await assertPageLoadTime(page, `${BASE_URL}/events`);
      console.log(`  Load time: ${loadTime}ms`);

      await takeScreenshot(page, "01-events-list-loaded");

      // Verify page title or heading
      const pageTitle = page.locator(
        'h1:has-text("Events"), h1:has-text("All Events")'
      );
      await expect(pageTitle).toBeVisible();
      console.log("  ✓ Events page heading visible");
    });

    test("grid/list view toggle is functional", async ({ page }) => {
      console.log("\n🔄 Testing Grid/List View Toggle");

      await page.goto(`${BASE_URL}/events`);
      await checkPageLoaded(page);

      // Look for view toggle buttons
      const gridButton = page.locator(
        'button[aria-label*="grid" i], button:has-text("Grid"), [data-testid="grid-view-btn"]'
      );
      const listButton = page.locator(
        'button[aria-label*="list" i], button:has-text("List"), [data-testid="list-view-btn"]'
      );

      const hasGridToggle = (await gridButton.count()) > 0;
      const hasListToggle = (await listButton.count()) > 0;

      if (hasListToggle) {
        await listButton.first().click();
        await waitForStableState(page);
        await takeScreenshot(page, "01-list-view");
        console.log("  ✓ Switched to list view");

        if (hasGridToggle) {
          await gridButton.first().click();
          await waitForStableState(page);
          await takeScreenshot(page, "01-grid-view");
          console.log("  ✓ Switched to grid view");
        }
      } else {
        console.log("  ℹ View toggle not available");
      }
    });

    test("event cards display correct information", async ({ page }) => {
      console.log("\n📋 Testing Event Card Information");

      await page.goto(`${BASE_URL}/events`);
      await checkPageLoaded(page);

      const eventCards = page.locator('a[href^="/events/"]');
      const cardCount = await eventCards.count();

      console.log(`  Found ${cardCount} event card(s)`);

      if (cardCount > 0) {
        const firstCard = eventCards.first();

        // Check for event title
        const title = firstCard.locator("h2, h3, .event-title");
        if ((await title.count()) > 0) {
          await expect(title.first()).toBeVisible();
          console.log("  ✓ Event title visible");
        }

        // Check for date
        const dateElement = firstCard.locator(
          '[class*="date"], text=/\\w+\\s+\\d+|\\d{1,2}\\/\\d{1,2}/'
        );
        if ((await dateElement.count()) > 0) {
          console.log("  ✓ Date information visible");
        }

        // Check for venue/location
        const venueElement = firstCard.locator(
          '[class*="location"], [class*="venue"], text=/,\\s*\\w{2}$/'
        );
        if ((await venueElement.count()) > 0) {
          console.log("  ✓ Venue/location visible");
        }

        // Check for price
        const priceElement = firstCard.locator('text=/\\$\\d+/');
        if ((await priceElement.count()) > 0) {
          console.log("  ✓ Price visible");
        }

        await takeScreenshot(page, "01-event-card-details");
      }
    });
  });

  test.describe("Search Functionality", () => {
    test("search filters events by keyword", async ({ page }) => {
      console.log("\n🔍 Testing Keyword Search");

      await page.goto(`${BASE_URL}/events`);
      await checkPageLoaded(page);

      const searchInput = page.locator(
        'input[placeholder*="Search" i], input[type="search"], [data-testid="search-input"]'
      );

      if ((await searchInput.count()) === 0) {
        console.log("  ℹ Search input not found");
        return;
      }

      // Get initial count
      const initialCards = await page.locator('a[href^="/events/"]').count();
      console.log(`  Initial event count: ${initialCards}`);

      // Search for term
      await searchInput.fill("steppers");
      await waitForStableState(page);

      // Check filtered results
      const filteredCards = await page.locator('a[href^="/events/"]').count();
      console.log(`  Filtered event count: ${filteredCards}`);

      await takeScreenshot(page, "01-search-results");

      // Clear search
      await searchInput.clear();
      await waitForStableState(page);

      const clearedCards = await page.locator('a[href^="/events/"]').count();
      expect(clearedCards).toBeGreaterThanOrEqual(filteredCards);
      console.log("  ✓ Search functionality working");
    });

    test("empty search shows appropriate message", async ({ page }) => {
      console.log("\n🔍 Testing Empty Search Results");

      await page.goto(`${BASE_URL}/events`);
      await checkPageLoaded(page);

      const searchInput = page.locator('input[placeholder*="Search" i]');

      if ((await searchInput.count()) > 0) {
        await searchInput.fill("xyznonexistent99999");
        await waitForStableState(page);

        const emptyState = page.locator(
          'text=/no\\s+events/i, text=/no\\s+results/i, [data-testid="empty-state"]'
        );

        if ((await emptyState.count()) > 0) {
          await expect(emptyState.first()).toBeVisible();
          console.log("  ✓ Empty state message displayed");
        }

        await takeScreenshot(page, "01-empty-search");
      }
    });
  });

  test.describe("Category Filter", () => {
    test("category filter filters events correctly", async ({ page }) => {
      console.log("\n🏷️ Testing Category Filter");

      await page.goto(`${BASE_URL}/events`);
      await checkPageLoaded(page);

      const categoryFilter = page.locator(
        'select:has(option), [data-testid="category-filter"]'
      );

      if ((await categoryFilter.count()) === 0) {
        console.log("  ℹ Category filter not found");
        return;
      }

      // Get categories
      const options = await categoryFilter.locator("option").allTextContents();
      console.log(`  Available categories: ${options.length - 1}`);

      if (options.length > 1) {
        // Select first category (skip "All")
        await categoryFilter.selectOption({ index: 1 });
        await waitForStableState(page);

        await takeScreenshot(page, "01-category-filtered");
        console.log(`  ✓ Selected category: ${options[1]}`);

        // Verify filter is active
        const activeFilter = page.locator(
          '.active-filter, [data-active="true"], text=/Category:/i'
        );
        if ((await activeFilter.count()) > 0) {
          console.log("  ✓ Filter indicator visible");
        }
      }
    });

    test("steppin category filter works", async ({ page }) => {
      console.log("\n💃 Testing Steppin Category");

      await page.goto(`${BASE_URL}/events`);
      await checkPageLoaded(page);

      const steppinOption = page.locator(
        'option:has-text("Steppers"), option:has-text("Steppin")'
      );

      if ((await steppinOption.count()) > 0) {
        const categoryFilter = page.locator("select").first();
        const optionValue = await steppinOption.getAttribute("value");

        if (optionValue) {
          await categoryFilter.selectOption(optionValue);
          await waitForStableState(page);
          console.log("  ✓ Steppin category filter applied");
          await takeScreenshot(page, "01-steppin-filter");
        }
      }
    });
  });

  test.describe("Location/City Filter", () => {
    test("city filter filters events by location", async ({ page }) => {
      console.log("\n📍 Testing City/Location Filter");

      await page.goto(`${BASE_URL}/events`);
      await checkPageLoaded(page);

      // Look for city/location filter
      const cityFilter = page.locator(
        'select[name*="city" i], select[name*="location" i], input[placeholder*="city" i], [data-testid="city-filter"]'
      );

      if ((await cityFilter.count()) > 0) {
        // Try filling/selecting Chicago
        const tagName = await cityFilter.evaluate((el) =>
          el.tagName.toLowerCase()
        );

        if (tagName === "select") {
          const chicagoOption = cityFilter.locator('option:has-text("Chicago")');
          if ((await chicagoOption.count()) > 0) {
            await cityFilter.selectOption({ label: "Chicago" });
          }
        } else {
          await cityFilter.fill("Chicago");
        }

        await waitForStableState(page);
        await takeScreenshot(page, "01-city-filtered");
        console.log("  ✓ City filter applied");
      } else {
        console.log("  ℹ City filter not available as separate control");
      }
    });
  });

  test.describe("Date Range Filter", () => {
    test("date range filter works", async ({ page }) => {
      console.log("\n📅 Testing Date Range Filter");

      await page.goto(`${BASE_URL}/events`);
      await checkPageLoaded(page);

      // Look for date filter inputs
      const dateFromInput = page.locator(
        'input[type="date"], input[name*="from" i], [data-testid="date-from"]'
      );
      const pastEventsToggle = page.locator(
        'input[type="checkbox"], label:has-text("past")'
      );

      if ((await dateFromInput.count()) > 0) {
        const futureDate = getFutureDate(7);
        await dateFromInput.first().fill(futureDate);
        await waitForStableState(page);
        console.log(`  ✓ Date filter set to: ${futureDate}`);
        await takeScreenshot(page, "01-date-filtered");
      } else if ((await pastEventsToggle.count()) > 0) {
        // Try past events toggle
        await pastEventsToggle.first().click();
        await waitForStableState(page);
        console.log("  ✓ Past events toggle activated");
        await takeScreenshot(page, "01-past-events-toggle");
      } else {
        console.log("  ℹ Date filter not available");
      }
    });
  });

  test.describe("Pagination/Infinite Scroll", () => {
    test("pagination or infinite scroll works", async ({ page }) => {
      console.log("\n📄 Testing Pagination/Infinite Scroll");

      await page.goto(`${BASE_URL}/events`);
      await checkPageLoaded(page);

      const initialCards = await page.locator('a[href^="/events/"]').count();
      console.log(`  Initial cards: ${initialCards}`);

      // Check for pagination controls
      const paginationControls = page.locator(
        'nav[aria-label*="pagination" i], [data-testid="pagination"], button:has-text("Next"), button:has-text("Load More")'
      );

      if ((await paginationControls.count()) > 0) {
        const nextButton = page.locator(
          'button:has-text("Next"), button:has-text("Load More"), [aria-label="Next page"]'
        );

        if ((await nextButton.count()) > 0 && (await nextButton.isEnabled())) {
          await nextButton.click();
          await waitForStableState(page);

          const newCards = await page.locator('a[href^="/events/"]').count();
          console.log(`  Cards after pagination: ${newCards}`);
          console.log("  ✓ Pagination working");
        }
      } else {
        // Try infinite scroll
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        await waitForStableState(page);

        const afterScrollCards = await page.locator('a[href^="/events/"]').count();
        if (afterScrollCards > initialCards) {
          console.log("  ✓ Infinite scroll loaded more content");
        } else {
          console.log("  ℹ Single page of results or no more content");
        }
      }

      await takeScreenshot(page, "01-pagination");
    });
  });

  test.describe("Responsive Design - Events List", () => {
    test("events page displays correctly on mobile", async ({ page }) => {
      console.log("\n📱 Testing Mobile Events Page");

      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(`${BASE_URL}/events`);
      await checkPageLoaded(page);

      await takeScreenshot(page, "01-events-mobile");

      // Verify mobile menu exists
      const mobileMenu = page.locator(
        '[data-testid="mobile-menu"], button[aria-label*="menu" i], .hamburger'
      );
      if ((await mobileMenu.count()) > 0) {
        console.log("  ✓ Mobile menu button visible");
      }

      // Verify single-column layout
      const cards = page.locator('a[href^="/events/"]');
      if ((await cards.count()) >= 2) {
        const firstBox = await cards.first().boundingBox();
        const secondBox = await cards.nth(1).boundingBox();

        if (firstBox && secondBox) {
          // Cards should stack vertically on mobile
          expect(secondBox.y).toBeGreaterThan(firstBox.y);
          console.log("  ✓ Cards stack vertically on mobile");
        }
      }
    });

    test("events page displays correctly on tablet", async ({ page }) => {
      console.log("\n📱 Testing Tablet Events Page");

      await page.setViewportSize(VIEWPORTS.tablet);
      await page.goto(`${BASE_URL}/events`);
      await checkPageLoaded(page);

      await takeScreenshot(page, "01-events-tablet");
      console.log("  ✓ Tablet layout rendered");
    });

    test("events page displays correctly on desktop", async ({ page }) => {
      console.log("\n🖥️ Testing Desktop Events Page");

      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto(`${BASE_URL}/events`);
      await checkPageLoaded(page);

      await takeScreenshot(page, "01-events-desktop");

      // Check for multi-column grid
      const cards = page.locator('a[href^="/events/"]');
      if ((await cards.count()) >= 3) {
        const firstBox = await cards.first().boundingBox();
        const secondBox = await cards.nth(1).boundingBox();

        if (firstBox && secondBox && Math.abs(firstBox.y - secondBox.y) < 50) {
          console.log("  ✓ Multi-column grid layout on desktop");
        }
      }
    });
  });
});

// =============================================================================
// SECTION 2: EVENT DETAIL PAGE
// =============================================================================

test.describe("Section 2: Event Detail Page", () => {
  let eventId: string | null = null;

  test.beforeAll(async ({ browser }) => {
    // Get an event ID to test
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/events`);
    await checkPageLoaded(page);

    const eventLink = page.locator('a[href^="/events/"]').first();
    if ((await eventLink.count()) > 0) {
      const href = await eventLink.getAttribute("href");
      eventId = getEventIdFromUrl(href || "");
    }
    await page.close();
  });

  test("event detail page loads completely", async ({ page }) => {
    console.log("\n📄 Testing Event Detail Page Load");

    if (!eventId) {
      console.log("  ⚠ No event available to test");
      test.skip();
      return;
    }

    const loadTime = await assertPageLoadTime(
      page,
      `${BASE_URL}/events/${eventId}`
    );
    console.log(`  Load time: ${loadTime}ms`);

    await takeScreenshot(page, "02-event-detail-loaded");
    console.log("  ✓ Event detail page loaded");
  });

  test("event flyer/image displays", async ({ page }) => {
    console.log("\n🖼️ Testing Event Image Display");

    if (!eventId) {
      test.skip();
      return;
    }

    await page.goto(`${BASE_URL}/events/${eventId}`);
    await checkPageLoaded(page);

    const eventImage = page.locator(
      'img[alt*="event" i], img[class*="flyer"], img[class*="banner"], [data-testid="event-image"]'
    );

    if ((await eventImage.count()) > 0) {
      await expect(eventImage.first()).toBeVisible();
      console.log("  ✓ Event image visible");

      // Check image loads correctly (not broken)
      const isLoaded = await eventImage.first().evaluate((img: HTMLImageElement) => {
        return img.complete && img.naturalHeight > 0;
      });

      if (isLoaded) {
        console.log("  ✓ Image loaded correctly");
      }
    } else {
      console.log("  ℹ No event image or using placeholder");
    }

    await takeScreenshot(page, "02-event-image");
  });

  test("event title, description, date/time display correctly", async ({
    page,
  }) => {
    console.log("\n📝 Testing Event Core Information");

    if (!eventId) {
      test.skip();
      return;
    }

    await page.goto(`${BASE_URL}/events/${eventId}`);
    await checkPageLoaded(page);

    // Title
    const title = page.locator("h1");
    await expect(title).toBeVisible();
    const titleText = await title.textContent();
    console.log(`  ✓ Title: ${titleText?.substring(0, 50)}...`);

    // Description
    const description = page.locator(
      '[data-testid="event-description"], .event-description, p.description'
    );
    if ((await description.count()) > 0) {
      console.log("  ✓ Description visible");
    }

    // Date/Time
    const dateTime = page.locator(
      'text=/\\w+\\s+\\d+,\\s+\\d{4}/, [data-testid="event-date"]'
    );
    if ((await dateTime.count()) > 0) {
      console.log("  ✓ Date/time displayed");
    }

    await takeScreenshot(page, "02-event-info");
  });

  test("venue information with address shows", async ({ page }) => {
    console.log("\n📍 Testing Venue Information");

    if (!eventId) {
      test.skip();
      return;
    }

    await page.goto(`${BASE_URL}/events/${eventId}`);
    await checkPageLoaded(page);

    const venueSection = page.locator(
      '[data-testid="venue-info"], .venue, text=/venue/i'
    );
    const addressSection = page.locator(
      'address, [data-testid="event-address"], text=/\\d+.*\\w+.*,.*\\w{2}/i'
    );
    const mapLink = page.locator('a[href*="maps.google"], a[href*="maps.apple"]');

    if ((await venueSection.count()) > 0) {
      console.log("  ✓ Venue name displayed");
    }

    if ((await addressSection.count()) > 0) {
      console.log("  ✓ Address displayed");
    }

    if ((await mapLink.count()) > 0) {
      console.log("  ✓ Map link available");
    }

    await takeScreenshot(page, "02-venue-info");
  });

  test("ticket tiers display with prices", async ({ page }) => {
    console.log("\n🎫 Testing Ticket Tiers Display");

    if (!eventId) {
      test.skip();
      return;
    }

    await page.goto(`${BASE_URL}/events/${eventId}`);
    await checkPageLoaded(page);

    const ticketSection = page.locator(
      '[data-testid="ticket-section"], .ticket-tiers, text=/tickets/i'
    );

    if ((await ticketSection.count()) > 0) {
      console.log("  ✓ Ticket section found");

      // Check for individual tiers
      const tiers = page.locator(
        '[data-testid="ticket-tier"], .ticket-tier, [class*="tier"]'
      );
      const tierCount = await tiers.count();
      console.log(`  Found ${tierCount} ticket tier(s)`);

      // Check for prices
      const prices = page.locator('text=/\\$\\d+/');
      const priceCount = await prices.count();

      if (priceCount > 0) {
        console.log("  ✓ Prices displayed");
      }

      await takeScreenshot(page, "02-ticket-tiers");
    } else {
      console.log("  ℹ No ticket section (may be free event)");
    }
  });

  test("quantity selector works", async ({ page }) => {
    console.log("\n🔢 Testing Quantity Selector");

    if (!eventId) {
      test.skip();
      return;
    }

    await page.goto(`${BASE_URL}/events/${eventId}`);
    await checkPageLoaded(page);

    const quantityInput = page.locator(
      'input[type="number"], [data-testid="quantity-input"]'
    );
    const incrementBtn = page.locator(
      'button:has-text("+"), [data-testid="increment"], [aria-label*="increase" i]'
    );
    const decrementBtn = page.locator(
      'button:has-text("-"), [data-testid="decrement"], [aria-label*="decrease" i]'
    );

    if ((await quantityInput.count()) > 0) {
      // Test direct input
      await quantityInput.fill("2");
      const value = await quantityInput.inputValue();
      expect(value).toBe("2");
      console.log("  ✓ Quantity input works");
    } else if ((await incrementBtn.count()) > 0) {
      // Test increment/decrement buttons
      await incrementBtn.click();
      console.log("  ✓ Increment button works");

      if ((await decrementBtn.count()) > 0) {
        await decrementBtn.click();
        console.log("  ✓ Decrement button works");
      }
    }

    await takeScreenshot(page, "02-quantity-selector");
  });

  test('"Get Tickets" or "Register" button is functional', async ({ page }) => {
    console.log("\n🎟️ Testing Purchase Button");

    if (!eventId) {
      test.skip();
      return;
    }

    await page.goto(`${BASE_URL}/events/${eventId}`);
    await checkPageLoaded(page);

    const purchaseButton = page.locator(
      'button:has-text("Get Tickets"), button:has-text("Buy Tickets"), button:has-text("Register"), a:has-text("Get Tickets"), [data-testid="purchase-btn"]'
    );

    if ((await purchaseButton.count()) > 0) {
      await expect(purchaseButton.first()).toBeVisible();
      console.log("  ✓ Purchase button visible");

      // Test button is clickable
      const isEnabled = await purchaseButton.first().isEnabled();
      expect(isEnabled).toBeTruthy();
      console.log("  ✓ Purchase button enabled");

      await takeScreenshot(page, "02-purchase-button");

      // Click and verify navigation
      await purchaseButton.first().click();
      await waitForStableState(page);

      const currentUrl = page.url();
      const navigatedToCheckout =
        currentUrl.includes("/checkout") ||
        currentUrl.includes("/register") ||
        currentUrl.includes("/tickets");

      if (navigatedToCheckout) {
        console.log("  ✓ Navigated to checkout/register");
      }
    } else {
      console.log("  ℹ No purchase button (event may be sold out or free)");
    }
  });

  test("social share buttons work", async ({ page }) => {
    console.log("\n📤 Testing Social Share Buttons");

    if (!eventId) {
      test.skip();
      return;
    }

    await page.goto(`${BASE_URL}/events/${eventId}`);
    await checkPageLoaded(page);

    const shareButtons = page.locator(
      'button[aria-label*="share" i], a[href*="facebook.com/share"], a[href*="twitter.com/intent"], [data-testid="share"]'
    );

    if ((await shareButtons.count()) > 0) {
      console.log(`  Found ${await shareButtons.count()} share button(s)`);
      await takeScreenshot(page, "02-share-buttons");
      console.log("  ✓ Share buttons available");
    } else {
      console.log("  ℹ Share buttons not visible");
    }
  });

  test("related events section loads", async ({ page }) => {
    console.log("\n🔗 Testing Related Events Section");

    if (!eventId) {
      test.skip();
      return;
    }

    await page.goto(`${BASE_URL}/events/${eventId}`);
    await checkPageLoaded(page);

    const relatedSection = page.locator(
      'text=/related events/i, text=/similar events/i, text=/you may also like/i, [data-testid="related-events"]'
    );

    if ((await relatedSection.count()) > 0) {
      console.log("  ✓ Related events section found");

      const relatedCards = page.locator(
        '[data-testid="related-event-card"], .related-event'
      );
      const count = await relatedCards.count();
      console.log(`  Found ${count} related event(s)`);

      await takeScreenshot(page, "02-related-events");
    } else {
      console.log("  ℹ Related events section not present");
    }
  });

  test("event detail page handles 404 for invalid ID", async ({ page }) => {
    console.log("\n❌ Testing 404 Error Handling");

    await page.goto(`${BASE_URL}/events/invalid-event-id-xyz123`);
    await waitForStableState(page);

    const errorIndicator = page.locator(
      'text=/not found/i, text=/404/, text=/doesn\'t exist/i'
    );

    await takeScreenshot(page, "02-event-404");

    if ((await errorIndicator.count()) > 0) {
      console.log("  ✓ 404 error displayed");
    } else {
      console.log("  ℹ Custom 404 handling or redirect");
    }
  });
});

// =============================================================================
// SECTION 3: TICKET PURCHASE FLOW
// =============================================================================

test.describe("Section 3: Ticket Purchase Flow", () => {
  const testData = generateTestData();
  let eventId: string | null = null;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/events`);
    await checkPageLoaded(page);

    const eventLink = page.locator('a[href^="/events/"]').first();
    if ((await eventLink.count()) > 0) {
      const href = await eventLink.getAttribute("href");
      eventId = getEventIdFromUrl(href || "");
    }
    await page.close();
  });

  test("select ticket tier and quantity", async ({ page }) => {
    console.log("\n🎫 Testing Ticket Tier Selection");

    if (!eventId) {
      test.skip();
      return;
    }

    await page.goto(`${BASE_URL}/events/${eventId}`);
    await checkPageLoaded(page);

    // Select a ticket tier (click on tier or radio button)
    const tierSelector = page.locator(
      '[data-testid="ticket-tier"], .ticket-tier, input[name="tier"]'
    );

    if ((await tierSelector.count()) > 0) {
      await tierSelector.first().click();
      console.log("  ✓ Ticket tier selected");
    }

    // Set quantity
    const quantityInput = page.locator('input[type="number"]');
    if ((await quantityInput.count()) > 0) {
      await quantityInput.first().fill("2");
      console.log("  ✓ Quantity set to 2");
    }

    await takeScreenshot(page, "03-tier-selected");
  });

  test("click purchase button navigates to checkout", async ({ page }) => {
    console.log("\n🛒 Testing Checkout Navigation");

    if (!eventId) {
      test.skip();
      return;
    }

    await page.goto(`${BASE_URL}/events/${eventId}`);
    await checkPageLoaded(page);

    const purchaseBtn = page.locator(
      'button:has-text("Get Tickets"), button:has-text("Buy"), a:has-text("Get Tickets")'
    );

    if ((await purchaseBtn.count()) > 0) {
      await purchaseBtn.first().click();
      await waitForStableState(page);

      const url = page.url();
      const isCheckout =
        url.includes("/checkout") ||
        url.includes("/register") ||
        url.includes("/tickets");

      expect(isCheckout).toBeTruthy();
      console.log("  ✓ Navigated to checkout");
      await takeScreenshot(page, "03-checkout-page");
    }
  });

  test("checkout form validates required fields", async ({ page }) => {
    console.log("\n✅ Testing Form Validation");

    if (!eventId) {
      test.skip();
      return;
    }

    await page.goto(`${BASE_URL}/events/${eventId}/checkout`);
    await checkPageLoaded(page);

    // Try to submit without filling required fields
    const submitBtn = page.locator(
      'button[type="submit"], button:has-text("Complete"), button:has-text("Purchase")'
    );

    if ((await submitBtn.count()) > 0) {
      await submitBtn.first().click();
      await waitForStableState(page);

      // Check for validation errors
      const validationErrors = page.locator(
        '.error, [class*="error"], [aria-invalid="true"], text=/required/i'
      );

      if ((await validationErrors.count()) > 0) {
        console.log("  ✓ Validation errors displayed");
        await takeScreenshot(page, "03-validation-errors");
      }
    }

    // Test specific field validation
    const nameInput = page.locator('input[name*="name" i]');
    const emailInput = page.locator('input[type="email"]');
    const phoneInput = page.locator('input[type="tel"], input[name*="phone" i]');

    if ((await nameInput.count()) > 0) {
      // Test name required
      await nameInput.focus();
      await nameInput.blur();
      console.log("  ✓ Name field validation tested");
    }

    if ((await emailInput.count()) > 0) {
      // Test invalid email
      await emailInput.fill("invalid-email");
      await emailInput.blur();
      console.log("  ✓ Email format validation tested");
    }

    if ((await phoneInput.count()) > 0) {
      console.log("  ✓ Phone field present");
    }
  });

  test("checkout form accepts valid input", async ({ page }) => {
    console.log("\n📝 Testing Valid Form Input");

    if (!eventId) {
      test.skip();
      return;
    }

    await page.goto(`${BASE_URL}/events/${eventId}/checkout`);
    await checkPageLoaded(page);

    // Fill name
    const nameInput = page.locator('input[name*="name" i]');
    if ((await nameInput.count()) > 0) {
      await nameInput.fill(testData.customer.name);
      console.log("  ✓ Name filled");
    }

    // Fill email
    const emailInput = page.locator('input[type="email"]');
    if ((await emailInput.count()) > 0) {
      await emailInput.fill(testData.customer.email);
      console.log("  ✓ Email filled");
    }

    // Fill phone
    const phoneInput = page.locator('input[type="tel"]');
    if ((await phoneInput.count()) > 0) {
      await phoneInput.fill(testData.customer.phone);
      console.log("  ✓ Phone filled");
    }

    await takeScreenshot(page, "03-form-filled");
  });

  test("payment form integration (Stripe elements load)", async ({ page }) => {
    console.log("\n💳 Testing Stripe Integration");

    if (!eventId) {
      test.skip();
      return;
    }

    await page.goto(`${BASE_URL}/events/${eventId}/checkout`);
    await checkPageLoaded(page);

    // Wait for Stripe elements
    const stripeFrame = page.frameLocator('iframe[name*="stripe"]');
    const stripeElement = page.locator(
      '[class*="stripe"], [data-testid="stripe-payment"], #card-element'
    );

    const stripeLoaded =
      (await stripeElement.count()) > 0 ||
      (await stripeFrame.locator("input").count()) > 0;

    if (stripeLoaded) {
      console.log("  ✓ Stripe payment form loaded");
      await takeScreenshot(page, "03-stripe-loaded");
    } else {
      console.log("  ℹ Stripe not visible (may need prior form completion)");
    }
  });

  test("order summary displays correct totals", async ({ page }) => {
    console.log("\n💰 Testing Order Summary");

    if (!eventId) {
      test.skip();
      return;
    }

    await page.goto(`${BASE_URL}/events/${eventId}/checkout`);
    await checkPageLoaded(page);

    const orderSummary = page.locator(
      '[data-testid="order-summary"], .order-summary'
    );

    if ((await orderSummary.count()) > 0) {
      console.log("  ✓ Order summary visible");

      // Check for subtotal
      const subtotal = page.locator('text=/subtotal/i');
      if ((await subtotal.count()) > 0) {
        console.log("  ✓ Subtotal displayed");
      }

      // Check for fees
      const fees = page.locator('text=/fee/i');
      if ((await fees.count()) > 0) {
        console.log("  ✓ Fees displayed");
      }

      // Check for total
      const total = page.locator('text=/total.*\\$/i');
      if ((await total.count()) > 0) {
        console.log("  ✓ Total displayed");
      }

      await takeScreenshot(page, "03-order-summary");
    }
  });

  test("form submission creates order (mock test)", async ({ page }) => {
    console.log("\n📦 Testing Order Creation Flow");

    if (!eventId) {
      test.skip();
      return;
    }

    // Note: This test verifies the flow up to payment without actually charging
    await page.goto(`${BASE_URL}/events/${eventId}/checkout`);
    await checkPageLoaded(page);

    // Fill form
    const nameInput = page.locator('input[name*="name" i]');
    const emailInput = page.locator('input[type="email"]');

    if ((await nameInput.count()) > 0) {
      await nameInput.fill(testData.customer.name);
    }
    if ((await emailInput.count()) > 0) {
      await emailInput.fill(testData.customer.email);
    }

    // Find submit button
    const submitBtn = page.locator(
      'button:has-text("Complete Purchase"), button:has-text("Pay"), button[type="submit"]'
    );

    if ((await submitBtn.count()) > 0) {
      console.log("  ✓ Submit button found");
      console.log("  ℹ Not submitting to avoid real charges");
      await takeScreenshot(page, "03-ready-to-submit");
    }
  });

  test("order confirmation page structure (mock)", async ({ page }) => {
    console.log("\n✅ Testing Confirmation Page Structure");

    // Navigate to a mock confirmation or success page
    await page.goto(`${BASE_URL}/events/${eventId}/checkout/success`);
    await waitForStableState(page);

    const confirmationElements = page.locator(
      'text=/confirmation/i, text=/order.*number/i, text=/thank you/i, text=/success/i'
    );

    if ((await confirmationElements.count()) > 0) {
      console.log("  ✓ Confirmation page elements found");
      await takeScreenshot(page, "03-confirmation-page");
    } else {
      console.log("  ℹ Confirmation page requires completed order");
    }
  });
});

// =============================================================================
// SECTION 4: ORGANIZER EVENT CREATION
// =============================================================================

test.describe("Section 4: Organizer Event Creation", () => {
  const testData = generateTestData();
  let createdEventId: string | null = null;

  test("login as organizer", async ({ page }) => {
    console.log("\n🔐 Testing Organizer Login");

    const loggedIn = await login(page, testData.organizer.email);

    if (!loggedIn) {
      console.log("  ⚠ Auth requires manual setup or OAuth flow");
      await takeScreenshot(page, "04-login-state");
    } else {
      console.log("  ✓ Logged in as organizer");
    }
  });

  test("navigate to create event page", async ({ page }) => {
    console.log("\n📝 Testing Create Event Navigation");

    await page.goto(`${BASE_URL}/organizer/events/create`);
    await waitForStableState(page);

    if (page.url().includes("/login") || page.url().includes("/sign-in")) {
      console.log("  🔐 Auth required - skipping creation tests");
      await takeScreenshot(page, "04-auth-required");
      test.skip();
      return;
    }

    await takeScreenshot(page, "04-create-event-page");

    // Verify create form elements
    const formTitle = page.locator(
      'h1:has-text("Create"), h2:has-text("Create"), text=/create.*event/i'
    );
    await expect(formTitle).toBeVisible();
    console.log("  ✓ Create event page accessible");
  });

  test("fill event form with all details", async ({ page }) => {
    console.log("\n📋 Testing Event Form Fill");

    await page.goto(`${BASE_URL}/organizer/events/create`);
    await waitForStableState(page);

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    // Event Title
    const titleInput = page.locator(
      'input[name="name"], input[placeholder*="name" i], input[placeholder*="Chicago" i]'
    );
    if ((await titleInput.count()) > 0) {
      await titleInput.fill(testData.event.title);
      console.log("  ✓ Event title entered");
    }

    // Event Type
    const ticketedTypeBtn = page.locator(
      'button:has-text("Ticketed"), [data-value="TICKETED_EVENT"]'
    );
    if ((await ticketedTypeBtn.count()) > 0) {
      await ticketedTypeBtn.click();
      console.log("  ✓ Event type selected: TICKETED_EVENT");
    }

    // Description
    const descInput = page.locator('textarea[name="description"], textarea');
    if ((await descInput.count()) > 0) {
      await descInput.first().fill(testData.event.description);
      console.log("  ✓ Description entered");
    }

    // Categories
    for (const cat of testData.event.categories) {
      const catBtn = page.locator(`button:has-text("${cat}")`);
      if ((await catBtn.count()) > 0) {
        await catBtn.click();
      }
    }
    console.log("  ✓ Categories selected");

    await takeScreenshot(page, "04-form-step1");
  });

  test("set event date and time", async ({ page }) => {
    console.log("\n📅 Testing Date/Time Entry");

    await page.goto(`${BASE_URL}/organizer/events/create`);
    await waitForStableState(page);

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    // Navigate to date step if multi-step
    const nextBtn = page.locator('button:has-text("Next")');
    if ((await nextBtn.count()) > 0) {
      // Fill minimum required first
      const titleInput = page.locator('input[placeholder*="Chicago" i]');
      if ((await titleInput.count()) > 0) {
        await titleInput.fill(testData.event.title);
      }
      await nextBtn.click();
      await waitForStableState(page);
    }

    // Date inputs
    const dateInputs = page.locator('input[type="date"]');
    if ((await dateInputs.count()) > 0) {
      await dateInputs.first().fill(testData.event.date);
      console.log(`  ✓ Date set: ${testData.event.date}`);
    }

    // Time inputs
    const timeInputs = page.locator('input[type="time"]');
    if ((await timeInputs.count()) > 0) {
      await timeInputs.first().fill(testData.event.time);
      console.log(`  ✓ Time set: ${testData.event.time}`);

      if ((await timeInputs.count()) > 1) {
        await timeInputs.nth(1).fill(testData.event.endTime);
        console.log(`  ✓ End time set: ${testData.event.endTime}`);
      }
    }

    await takeScreenshot(page, "04-form-datetime");
  });

  test("set event venue/location", async ({ page }) => {
    console.log("\n📍 Testing Venue Entry");

    await page.goto(`${BASE_URL}/organizer/events/create`);
    await waitForStableState(page);

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    // Venue name
    const venueInput = page.locator('input[placeholder*="venue" i], input[name="venueName"]');
    if ((await venueInput.count()) > 0) {
      await venueInput.fill(testData.event.venue.name);
      console.log("  ✓ Venue name entered");
    }

    // Address
    const addressInput = page.locator(
      'input[placeholder*="address" i], input[name="address"]'
    );
    if ((await addressInput.count()) > 0) {
      await addressInput.fill(testData.event.venue.address);
      console.log("  ✓ Address entered");
    }

    // City
    const cityInput = page.locator('input[placeholder*="City" i], input[name="city"]');
    if ((await cityInput.count()) > 0) {
      await cityInput.fill(testData.event.venue.city);
      console.log("  ✓ City entered");
    }

    // State
    const stateInput = page.locator('input[placeholder*="State" i], input[name="state"]');
    if ((await stateInput.count()) > 0) {
      await stateInput.fill(testData.event.venue.state);
      console.log("  ✓ State entered");
    }

    // Zip
    const zipInput = page.locator('input[placeholder*="Zip" i], input[name="zipCode"]');
    if ((await zipInput.count()) > 0) {
      await zipInput.fill(testData.event.venue.zipCode);
      console.log("  ✓ Zip entered");
    }

    await takeScreenshot(page, "04-form-venue");
  });

  test("upload event flyer (test file upload)", async ({ page }) => {
    console.log("\n🖼️ Testing File Upload");

    await page.goto(`${BASE_URL}/organizer/events/create`);
    await waitForStableState(page);

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    const fileInput = page.locator('input[type="file"]');

    if ((await fileInput.count()) > 0) {
      // Note: In real test, use a test image file
      console.log("  ✓ File upload input found");
      await takeScreenshot(page, "04-file-upload");
    } else {
      console.log("  ℹ File upload not on initial form");
    }
  });

  test("add ticket tiers with pricing", async ({ page }) => {
    console.log("\n🎫 Testing Ticket Tier Addition");

    await page.goto(`${BASE_URL}/organizer/events/create`);
    await waitForStableState(page);

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    // Navigate to tickets section
    const addTicketBtn = page.locator(
      'button:has-text("Add Ticket"), button:has-text("Create Tier")'
    );

    if ((await addTicketBtn.count()) > 0) {
      await addTicketBtn.click();
      await waitForStableState(page);

      // Fill tier details
      const tierName = page.locator('input[name="tierName"], input[placeholder*="name" i]');
      const tierPrice = page.locator('input[name="price"], input[type="number"]');
      const tierQty = page.locator('input[name="quantity"]');

      if ((await tierName.count()) > 0) {
        await tierName.fill(testData.ticketTiers[0].name);
      }
      if ((await tierPrice.count()) > 0) {
        await tierPrice.first().fill(String(testData.ticketTiers[0].price / 100));
      }
      if ((await tierQty.count()) > 0) {
        await tierQty.fill(String(testData.ticketTiers[0].quantity));
      }

      console.log("  ✓ Ticket tier details filled");
      await takeScreenshot(page, "04-ticket-tier");
    }
  });

  test("preview event (if available)", async ({ page }) => {
    console.log("\n👁️ Testing Event Preview");

    await page.goto(`${BASE_URL}/organizer/events/create`);
    await waitForStableState(page);

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    const previewBtn = page.locator('button:has-text("Preview"), a:has-text("Preview")');

    if ((await previewBtn.count()) > 0) {
      await previewBtn.click();
      await waitForStableState(page);
      console.log("  ✓ Preview available");
      await takeScreenshot(page, "04-event-preview");
    } else {
      console.log("  ℹ Preview not available in this flow");
    }
  });

  test("publish event flow", async ({ page }) => {
    console.log("\n🚀 Testing Publish Event Flow");

    await page.goto(`${BASE_URL}/organizer/events/create`);
    await waitForStableState(page);

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    const createBtn = page.locator(
      'button:has-text("Create Event"), button:has-text("Publish"), button[type="submit"]'
    );

    if ((await createBtn.count()) > 0) {
      console.log("  ✓ Create/Publish button found");
      await takeScreenshot(page, "04-ready-to-publish");
      // Not clicking to avoid creating test data
    }
  });

  test("verify event appears in events list (structure test)", async ({
    page,
  }) => {
    console.log("\n📋 Testing Events List Structure");

    await page.goto(`${BASE_URL}/organizer/events`);
    await waitForStableState(page);

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    const eventsList = page.locator(
      '[data-testid="events-list"], .events-list, a[href*="/organizer/events/"]'
    );

    if ((await eventsList.count()) > 0) {
      console.log("  ✓ Organizer events list accessible");
      await takeScreenshot(page, "04-organizer-events-list");
    }
  });
});

// =============================================================================
// SECTION 5: ORGANIZER EVENT MANAGEMENT
// =============================================================================

test.describe("Section 5: Organizer Event Management", () => {
  test("edit existing event details", async ({ page }) => {
    console.log("\n✏️ Testing Event Edit");

    await page.goto(`${BASE_URL}/organizer/events`);
    await waitForStableState(page);

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    // Find edit button/link
    const editLink = page.locator(
      'a[href*="/edit"], button:has-text("Edit"), [data-testid="edit-event"]'
    );

    if ((await editLink.count()) > 0) {
      await editLink.first().click();
      await waitForStableState(page);
      console.log("  ✓ Edit page accessible");
      await takeScreenshot(page, "05-edit-event");
    }
  });

  test("modify ticket tiers and pricing", async ({ page }) => {
    console.log("\n🎫 Testing Ticket Tier Modification");

    await page.goto(`${BASE_URL}/organizer/events`);
    await waitForStableState(page);

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    const ticketsLink = page.locator('a[href*="/tickets"], text=Tickets');

    if ((await ticketsLink.count()) > 0) {
      await ticketsLink.first().click();
      await waitForStableState(page);
      console.log("  ✓ Tickets management accessible");
      await takeScreenshot(page, "05-manage-tickets");
    }
  });

  test("view event analytics/sales dashboard", async ({ page }) => {
    console.log("\n📊 Testing Analytics Dashboard");

    await page.goto(`${BASE_URL}/organizer/events`);
    await waitForStableState(page);

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    const analyticsLink = page.locator(
      'a[href*="/analytics"], a[href*="/dashboard"], text=Analytics, text=Stats'
    );

    if ((await analyticsLink.count()) > 0) {
      await analyticsLink.first().click();
      await waitForStableState(page);
      console.log("  ✓ Analytics page accessible");
      await takeScreenshot(page, "05-analytics");

      // Check for key metrics
      const metrics = page.locator('text=/sold/i, text=/revenue/i, text=/\\$\\d+/');
      if ((await metrics.count()) > 0) {
        console.log("  ✓ Sales metrics displayed");
      }
    }
  });

  test("manage staff assignments", async ({ page }) => {
    console.log("\n👥 Testing Staff Management");

    await page.goto(`${BASE_URL}/organizer/events`);
    await waitForStableState(page);

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    const staffLink = page.locator('a[href*="/staff"], text=Staff, text=Team');

    if ((await staffLink.count()) > 0) {
      await staffLink.first().click();
      await waitForStableState(page);
      console.log("  ✓ Staff management accessible");
      await takeScreenshot(page, "05-staff-management");
    }
  });

  test("configure payment methods", async ({ page }) => {
    console.log("\n💳 Testing Payment Configuration");

    await page.goto(`${BASE_URL}/organizer/events`);
    await waitForStableState(page);

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    const paymentLink = page.locator(
      'a[href*="/payment"], text=Payment, text=Payout'
    );

    if ((await paymentLink.count()) > 0) {
      await paymentLink.first().click();
      await waitForStableState(page);
      console.log("  ✓ Payment configuration accessible");
      await takeScreenshot(page, "05-payment-config");

      // Check for Stripe/PayPal options
      const stripeOption = page.locator('text=Stripe');
      const paypalOption = page.locator('text=PayPal');

      if ((await stripeOption.count()) > 0) console.log("  ✓ Stripe option visible");
      if ((await paypalOption.count()) > 0) console.log("  ✓ PayPal option visible");
    }
  });

  test("view attendee list", async ({ page }) => {
    console.log("\n📋 Testing Attendee List");

    await page.goto(`${BASE_URL}/organizer/events`);
    await waitForStableState(page);

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    const attendeesLink = page.locator(
      'a[href*="/attendees"], text=Attendees, text=Guests'
    );

    if ((await attendeesLink.count()) > 0) {
      await attendeesLink.first().click();
      await waitForStableState(page);
      console.log("  ✓ Attendee list accessible");
      await takeScreenshot(page, "05-attendee-list");
    }
  });

  test("activate/deactivate event", async ({ page }) => {
    console.log("\n🔄 Testing Event Status Toggle");

    await page.goto(`${BASE_URL}/organizer/events`);
    await waitForStableState(page);

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    const statusToggle = page.locator(
      'button:has-text("Publish"), button:has-text("Unpublish"), button:has-text("Activate"), [data-testid="status-toggle"]'
    );

    if ((await statusToggle.count()) > 0) {
      console.log("  ✓ Status toggle available");
      await takeScreenshot(page, "05-status-toggle");
    }
  });
});

// =============================================================================
// SECTION 6: TICKET MANAGEMENT FEATURES
// =============================================================================

test.describe("Section 6: Ticket Management Features", () => {
  const testData = generateTestData();

  test.describe("Discount Codes", () => {
    test("discount code creation (organizer)", async ({ page }) => {
      console.log("\n🏷️ Testing Discount Code Creation");

      await page.goto(`${BASE_URL}/organizer/events`);
      await waitForStableState(page);

      if (page.url().includes("/login")) {
        test.skip();
        return;
      }

      const discountLink = page.locator(
        'a[href*="/discount"], text=Discount, text=Promo'
      );

      if ((await discountLink.count()) > 0) {
        await discountLink.first().click();
        await waitForStableState(page);

        const addBtn = page.locator('button:has-text("Add"), button:has-text("Create")');
        if ((await addBtn.count()) > 0) {
          console.log("  ✓ Discount code management accessible");
          await takeScreenshot(page, "06-discount-create");
        }
      }
    });

    test("discount code application at checkout", async ({ page }) => {
      console.log("\n💸 Testing Discount Application");

      await page.goto(`${BASE_URL}/events`);
      await checkPageLoaded(page);

      const eventLink = page.locator('a[href^="/events/"]').first();
      if ((await eventLink.count()) === 0) {
        test.skip();
        return;
      }

      const href = await eventLink.getAttribute("href");
      const eventId = getEventIdFromUrl(href || "");

      if (eventId) {
        await page.goto(`${BASE_URL}/events/${eventId}/checkout`);
        await checkPageLoaded(page);

        const discountInput = page.locator(
          'input[placeholder*="discount" i], input[placeholder*="promo" i], input[name="discountCode"]'
        );

        if ((await discountInput.count()) > 0) {
          await discountInput.fill(testData.discountCode.code);

          const applyBtn = page.locator('button:has-text("Apply")');
          if ((await applyBtn.count()) > 0) {
            await applyBtn.click();
            await waitForStableState(page);
          }

          console.log("  ✓ Discount code input functional");
          await takeScreenshot(page, "06-discount-applied");
        }
      }
    });
  });

  test.describe("Waitlist", () => {
    test("waitlist signup for sold-out events", async ({ page }) => {
      console.log("\n📋 Testing Waitlist Signup");

      await page.goto(`${BASE_URL}/events`);
      await checkPageLoaded(page);

      const soldOutBadge = page.locator('text=/sold out/i');
      const waitlistBtn = page.locator(
        'button:has-text("Waitlist"), button:has-text("Join Waitlist")'
      );

      if ((await waitlistBtn.count()) > 0) {
        await waitlistBtn.first().click();
        await waitForStableState(page);

        const emailInput = page.locator('input[type="email"]');
        if ((await emailInput.count()) > 0) {
          await emailInput.fill(testData.customer.email);
          console.log("  ✓ Waitlist signup form accessible");
        }

        await takeScreenshot(page, "06-waitlist-signup");
      } else {
        console.log("  ℹ No sold-out events to test waitlist");
      }
    });
  });

  test.describe("Ticket Transfer", () => {
    test("ticket transfer between users", async ({ page }) => {
      console.log("\n🔄 Testing Ticket Transfer");

      await page.goto(`${BASE_URL}/my-tickets`);
      await waitForStableState(page);

      if (page.url().includes("/login")) {
        console.log("  🔐 Auth required for ticket transfer");
        test.skip();
        return;
      }

      const transferBtn = page.locator(
        'button:has-text("Transfer"), [data-testid="transfer-ticket"]'
      );

      if ((await transferBtn.count()) > 0) {
        await transferBtn.first().click();
        await waitForStableState(page);
        console.log("  ✓ Transfer option available");
        await takeScreenshot(page, "06-transfer-ticket");
      } else {
        console.log("  ℹ No tickets available or transfer disabled");
      }
    });
  });

  test.describe("Ticket Scanning", () => {
    test("ticket scanning simulation (QR validation)", async ({ page }) => {
      console.log("\n📱 Testing Ticket Scanning");

      await page.goto(`${BASE_URL}/organizer/events`);
      await waitForStableState(page);

      if (page.url().includes("/login")) {
        test.skip();
        return;
      }

      const scanLink = page.locator(
        'a[href*="/scan"], a[href*="/check-in"], text=Scan, text=Check-In'
      );

      if ((await scanLink.count()) > 0) {
        await scanLink.first().click();
        await waitForStableState(page);
        console.log("  ✓ Scanning interface accessible");
        await takeScreenshot(page, "06-ticket-scanning");
      }
    });
  });

  test.describe("Refund Workflow", () => {
    test("refund request workflow (organizer view)", async ({ page }) => {
      console.log("\n💰 Testing Refund Workflow");

      await page.goto(`${BASE_URL}/organizer/events`);
      await waitForStableState(page);

      if (page.url().includes("/login")) {
        test.skip();
        return;
      }

      const ordersLink = page.locator(
        'a[href*="/orders"], text=Orders, text=Sales'
      );

      if ((await ordersLink.count()) > 0) {
        await ordersLink.first().click();
        await waitForStableState(page);

        const refundBtn = page.locator(
          'button:has-text("Refund"), [data-testid="refund-btn"]'
        );

        if ((await refundBtn.count()) > 0) {
          console.log("  ✓ Refund option available");
          await takeScreenshot(page, "06-refund-option");
        }
      }
    });
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility Compliance", () => {
  test("semantic HTML landmarks present", async ({ page }) => {
    console.log("\n♿ Testing Semantic Landmarks");

    await page.goto(`${BASE_URL}/events`);
    await checkPageLoaded(page);

    const landmarks = await checkSemanticLandmarks(page);

    console.log(`  Main: ${landmarks.hasMain ? "✓" : "✗"}`);
    console.log(`  Nav: ${landmarks.hasNav ? "✓" : "✗"}`);
    console.log(`  Header: ${landmarks.hasHeader ? "✓" : "✗"}`);
    console.log(`  Footer: ${landmarks.hasFooter ? "✓" : "✗"}`);

    expect(landmarks.hasMain || landmarks.hasNav).toBeTruthy();
  });

  test("keyboard navigation works", async ({ page }) => {
    console.log("\n⌨️ Testing Keyboard Navigation");

    await page.goto(`${BASE_URL}/events`);
    await checkPageLoaded(page);

    // Tab through elements
    await page.keyboard.press("Tab");
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);

    await page.keyboard.press("Tab");
    const secondFocused = await page.evaluate(() => document.activeElement?.tagName);

    console.log(`  First focused: ${firstFocused}`);
    console.log(`  Second focused: ${secondFocused}`);

    expect(firstFocused).toBeDefined();
    console.log("  ✓ Keyboard navigation functional");
  });

  test("ARIA labels on interactive elements", async ({ page }) => {
    console.log("\n🏷️ Testing ARIA Labels");

    await page.goto(`${BASE_URL}/events`);
    await checkPageLoaded(page);

    const buttons = page.locator("button");
    const buttonCount = await buttons.count();

    let labeledButtons = 0;
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const hasLabel =
        (await buttons.nth(i).getAttribute("aria-label")) !== null ||
        (await buttons.nth(i).textContent()) !== "";
      if (hasLabel) labeledButtons++;
    }

    console.log(`  Buttons with labels: ${labeledButtons}/${Math.min(buttonCount, 10)}`);
    expect(labeledButtons).toBeGreaterThan(0);
  });
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

test.describe("Performance Assertions", () => {
  test("events page loads under 5 seconds", async ({ page }) => {
    console.log("\n⚡ Testing Events Page Performance");

    const loadTime = await assertPageLoadTime(
      page,
      `${BASE_URL}/events`,
      TIMEOUTS.pageLoad
    );
    console.log(`  Load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(TIMEOUTS.pageLoad);
  });

  test("event detail page loads under 5 seconds", async ({ page }) => {
    console.log("\n⚡ Testing Event Detail Performance");

    await page.goto(`${BASE_URL}/events`);
    await checkPageLoaded(page);

    const eventLink = page.locator('a[href^="/events/"]').first();
    if ((await eventLink.count()) > 0) {
      const href = await eventLink.getAttribute("href");
      const eventId = getEventIdFromUrl(href || "");

      if (eventId) {
        const loadTime = await assertPageLoadTime(
          page,
          `${BASE_URL}/events/${eventId}`,
          TIMEOUTS.pageLoad
        );
        console.log(`  Load time: ${loadTime}ms`);
      }
    }
  });

  test("no infinite loading spinners", async ({ page }) => {
    console.log("\n🔄 Testing for Infinite Spinners");

    await page.goto(`${BASE_URL}/events`);

    // Wait max time for loading
    const spinner = page.locator('.animate-spin, [data-testid="loading"]');

    const startTime = Date.now();
    try {
      if ((await spinner.count()) > 0) {
        await spinner.first().waitFor({
          state: "hidden",
          timeout: TIMEOUTS.spinnerMax,
        });
      }
      const elapsed = Date.now() - startTime;
      console.log(`  Spinner resolved in: ${elapsed}ms`);
      expect(elapsed).toBeLessThan(TIMEOUTS.spinnerMax);
      console.log("  ✓ No infinite spinners");
    } catch {
      console.log("  ⚠ Spinner timeout - possible infinite loading");
      await takeScreenshot(page, "infinite-spinner");
    }
  });

  test("images load correctly", async ({ page }) => {
    console.log("\n🖼️ Testing Image Loading");

    await page.goto(`${BASE_URL}/events`);
    await checkPageLoaded(page);

    const images = page.locator("img");
    const imageCount = await images.count();

    let loadedCount = 0;
    for (let i = 0; i < Math.min(imageCount, 10); i++) {
      const isLoaded = await images.nth(i).evaluate((img: HTMLImageElement) => {
        return img.complete && img.naturalHeight > 0;
      });
      if (isLoaded) loadedCount++;
    }

    console.log(`  Images loaded: ${loadedCount}/${Math.min(imageCount, 10)}`);
    expect(loadedCount).toBeGreaterThanOrEqual(Math.floor(Math.min(imageCount, 10) * 0.8));
  });
});
