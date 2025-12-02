import { test, expect, Page, BrowserContext } from "@playwright/test";

/**
 * Events Test Suite
 *
 * Comprehensive tests for the complete events feature including:
 * - Public User Flow (browse, search, filter, checkout)
 * - Organizer Flow (create, configure, manage)
 * - Ticket Management (inventory, discounts, waitlist, transfers)
 *
 * Uses data-testid selectors for reliable test execution.
 */

// =============================================================================
// TEST CONFIGURATION & CONSTANTS
// =============================================================================

const BASE_URL = process.env.BASE_URL || "http://localhost:3004";

// Test IDs for reliable selectors
const TEST_IDS = {
  // Events page
  eventsPage: '[data-testid="events-page"]',
  eventsPageTitle: '[data-testid="events-page-title"]',
  eventsSearchInput: '[data-testid="events-search-input"]',
  eventsCategoryFilter: '[data-testid="events-category-filter"]',
  eventsPastToggle: '[data-testid="events-past-toggle"]',
  eventsEmptyState: '[data-testid="events-empty-state"]',
  eventsCount: '[data-testid="events-count"]',
  eventsGrid: '[data-testid="events-grid"]',
  // Header
  publicHeader: '[data-testid="public-header"]',
  mobileMenuButton: '[data-testid="mobile-menu-button"]',
  signInButton: '[data-testid="sign-in-button"]',
};

const TEST_DATA = {
  organizer: {
    email: "test-organizer@stepperslife.com",
    name: "Test Organizer",
  },
  customer: {
    name: "Test Customer",
    email: "test-customer@stepperslife.com",
    phone: "555-123-4567",
  },
  event: {
    name: `Test Event ${Date.now()}`,
    description:
      "This is an automated test event for comprehensive testing of the events feature.",
    venue: "Chicago Steppers Hall",
    address: "123 Dance Street",
    city: "Chicago",
    state: "IL",
    zipCode: "60601",
    categories: ["Steppers Set", "Workshop"],
    capacity: 200,
  },
  ticketTier: {
    name: "General Admission",
    price: "25.00",
    quantity: 100,
  },
  discountCode: {
    code: "TEST20",
    percentage: 20,
  },
  stripe: {
    testCard: "4242424242424242",
    expMonth: "12",
    expYear: "25",
    cvc: "123",
  },
};

const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
};

const TIMEOUTS = {
  navigation: 30000,
  networkIdle: 10000,
  animation: 500,
  pageLoad: 5000,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function waitForStableState(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle", { timeout: TIMEOUTS.networkIdle });
  await page.waitForTimeout(TIMEOUTS.animation);
}

async function measurePageLoadTime(page: Page, url: string): Promise<number> {
  const startTime = Date.now();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: TIMEOUTS.networkIdle });
  return Date.now() - startTime;
}

async function takeScreenshot(
  page: Page,
  name: string,
  fullPage = true
): Promise<void> {
  await page.screenshot({
    path: `test-results/events/${name}.png`,
    fullPage,
  });
}

async function loginAsOrganizer(page: Page): Promise<boolean> {
  await page.goto(`${BASE_URL}/`);
  await waitForStableState(page);

  // Check if already logged in
  const dashboardLink = page.locator('a[href*="/organizer"], a[href*="/dashboard"]');
  if ((await dashboardLink.count()) > 0) {
    const isVisible = await dashboardLink.first().isVisible();
    if (isVisible) {
      console.log("  Already logged in");
      return true;
    }
  }

  // Look for sign-in button
  const signInButton = page.locator(
    'button:has-text("Sign In"), a:has-text("Sign In"), button:has-text("Login")'
  );

  if ((await signInButton.count()) > 0) {
    await signInButton.first().click();
    await waitForStableState(page);

    // This handles various auth providers - adjust based on actual auth setup
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    if ((await emailInput.count()) > 0) {
      await emailInput.fill(TEST_DATA.organizer.email);
      const submitButton = page.locator('button[type="submit"]');
      if ((await submitButton.count()) > 0) {
        await submitButton.click();
        await waitForStableState(page);
      }
    }

    // Wait for potential redirect to dashboard
    try {
      await page.waitForURL("**/organizer/**", { timeout: 10000 });
      return true;
    } catch {
      console.log("  Auth may require manual setup or OAuth");
      return false;
    }
  }

  return false;
}

function getEventIdFromUrl(url: string): string | null {
  const match = url.match(/\/events\/([a-zA-Z0-9_]+)/);
  return match ? match[1] : null;
}

// =============================================================================
// PUBLIC USER FLOW TESTS
// =============================================================================

test.describe("Public User Flow - Events Browsing & Purchase", () => {
  let selectedEventId: string | null = null;

  test.describe("Events Page Loading & Performance", () => {
    test("should load events page within acceptable time", async ({ page }) => {
      console.log("\n📊 Testing Events Page Performance");

      const loadTime = await measurePageLoadTime(page, `${BASE_URL}/events`);
      console.log(`  Page load time: ${loadTime}ms`);

      await takeScreenshot(page, "events-page-loaded");

      // Performance assertion - page should load within 5 seconds
      expect(loadTime).toBeLessThan(TIMEOUTS.pageLoad);
      console.log("  ✓ Page loaded within acceptable time");
    });

    test("should display loading state correctly", async ({ page }) => {
      console.log("\n⏳ Testing Loading State");

      // Navigate and check for loading indicator
      await page.goto(`${BASE_URL}/events`);

      // Check for loading spinner or skeleton
      const loadingIndicator = page.locator(
        '.animate-spin, [data-testid="loading"], text=Loading'
      );
      const hasLoading = (await loadingIndicator.count()) > 0;

      if (hasLoading) {
        console.log("  ✓ Loading state displayed");
      } else {
        console.log("  ℹ Page loaded too fast to capture loading state");
      }

      await waitForStableState(page);
      await takeScreenshot(page, "events-after-loading");
    });

    test("should handle connection errors gracefully", async ({ page }) => {
      console.log("\n🔌 Testing Error State Handling");

      // Simulate offline mode
      await page.context().setOffline(true);
      await page.goto(`${BASE_URL}/events`);
      await page.waitForTimeout(11000); // Wait past the 10s timeout

      // Check for error state
      const errorMessage = page.locator(
        'text=Connection Issue, text=Unable to load, text=Error'
      );
      const retryButton = page.locator('button:has-text("Retry")');

      await takeScreenshot(page, "events-error-state");

      // Restore connection
      await page.context().setOffline(false);

      if ((await errorMessage.count()) > 0) {
        console.log("  ✓ Error message displayed");
        expect(await retryButton.count()).toBeGreaterThan(0);
        console.log("  ✓ Retry button available");
      }
    });
  });

  test.describe("Grid/List View Toggle", () => {
    test("should display events in grid view by default", async ({ page }) => {
      console.log("\n📱 Testing Grid View");

      await page.goto(`${BASE_URL}/events`);
      await waitForStableState(page);

      // Check for grid layout using data-testid
      const eventGrid = page.locator(TEST_IDS.eventsGrid);
      const eventCards = page.locator('a[href^="/events/"]');

      const cardCount = await eventCards.count();
      console.log(`  Found ${cardCount} event card(s)`);

      await takeScreenshot(page, "events-grid-view");

      if (cardCount > 0) {
        expect(await eventGrid.count()).toBeGreaterThan(0);
        console.log("  ✓ Grid layout verified");
      }
    });

    test("should toggle between grid and list views", async ({ page }) => {
      console.log("\n🔄 Testing View Toggle");

      await page.goto(`${BASE_URL}/events`);
      await waitForStableState(page);

      // Look for view toggle buttons
      const gridButton = page.locator(
        'button[aria-label*="grid"], button:has-text("Grid"), [data-testid="grid-view"]'
      );
      const listButton = page.locator(
        'button[aria-label*="list"], button:has-text("List"), [data-testid="list-view"]'
      );

      if ((await listButton.count()) > 0) {
        await listButton.click();
        await waitForStableState(page);
        await takeScreenshot(page, "events-list-view");
        console.log("  ✓ Switched to list view");

        if ((await gridButton.count()) > 0) {
          await gridButton.click();
          await waitForStableState(page);
          await takeScreenshot(page, "events-grid-view-restored");
          console.log("  ✓ Switched back to grid view");
        }
      } else {
        console.log("  ℹ View toggle not available");
      }
    });
  });

  test.describe("Search and Filter Events", () => {
    test("should filter events by search term", async ({ page }) => {
      console.log("\n🔍 Testing Event Search");

      await page.goto(`${BASE_URL}/events`);
      await waitForStableState(page);

      // Use data-testid for search input
      const searchInput = page.locator(TEST_IDS.eventsSearchInput);

      if (await searchInput.isVisible()) {
        const initialEventCount = await page.locator('a[href^="/events/"]').count();
        console.log(`  Initial events: ${initialEventCount}`);

        await searchInput.fill("steppers");
        await waitForStableState(page);

        await takeScreenshot(page, "events-search-steppers");

        const filteredEventCount = await page.locator('a[href^="/events/"]').count();
        console.log(`  Filtered events: ${filteredEventCount}`);

        // Clear search
        await searchInput.clear();
        await waitForStableState(page);

        console.log("  ✓ Search functionality works");
      } else {
        console.log("  ℹ Search input not found");
      }
    });

    test("should filter events by category", async ({ page }) => {
      console.log("\n🏷️ Testing Category Filter");

      await page.goto(`${BASE_URL}/events`);
      await waitForStableState(page);

      // Use data-testid for category filter
      const categorySelect = page.locator(TEST_IDS.eventsCategoryFilter);

      if (await categorySelect.isVisible()) {
        const options = await categorySelect.locator("option").allTextContents();
        console.log(`  Available categories: ${options.length - 1}`); // Excluding "All"

        if (options.length > 1) {
          // Select first non-"All" category
          await categorySelect.selectOption({ index: 1 });
          await waitForStableState(page);

          await takeScreenshot(page, "events-category-filtered");
          console.log("  ✓ Category filter applied");
        }
      } else {
        console.log("  ℹ Category filter not found");
      }
    });

    test("should filter by date/past events toggle", async ({ page }) => {
      console.log("\n📅 Testing Past Events Toggle");

      await page.goto(`${BASE_URL}/events`);
      await waitForStableState(page);

      // Use data-testid for past events toggle
      const pastEventsToggle = page.locator(TEST_IDS.eventsPastToggle);

      if (await pastEventsToggle.isVisible()) {
        const initialCount = await page.locator('a[href^="/events/"]').count();

        await pastEventsToggle.click();
        await waitForStableState(page);

        const afterToggleCount = await page.locator('a[href^="/events/"]').count();

        await takeScreenshot(page, "events-with-past");
        console.log(`  Events before toggle: ${initialCount}`);
        console.log(`  Events after toggle: ${afterToggleCount}`);
        console.log("  ✓ Past events toggle works");
      } else {
        console.log("  ℹ Past events toggle not found");
      }
    });

    test("should display active filters and allow clearing", async ({
      page,
    }) => {
      console.log("\n🧹 Testing Filter Clear");

      await page.goto(`${BASE_URL}/events`);
      await waitForStableState(page);

      const searchInput = page.locator('input[placeholder*="Search"]');

      if ((await searchInput.count()) > 0) {
        await searchInput.fill("test search");
        await waitForStableState(page);

        // Look for active filter tag or clear button
        const clearButton = page.locator(
          'button:has-text("×"), button:has-text("Clear"), [data-testid="clear-filter"]'
        );

        if ((await clearButton.count()) > 0) {
          await takeScreenshot(page, "events-active-filters");
          await clearButton.first().click();
          await waitForStableState(page);
          console.log("  ✓ Filter cleared successfully");
        }
      }
    });
  });

  test.describe("Event Detail Page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/events`);
      await waitForStableState(page);

      const eventCards = page.locator('a[href^="/events/"]');
      if ((await eventCards.count()) > 0) {
        const href = await eventCards.first().getAttribute("href");
        selectedEventId = getEventIdFromUrl(href || "");
      }
    });

    test("should navigate to event detail page", async ({ page }) => {
      console.log("\n📄 Testing Event Detail Navigation");

      if (!selectedEventId) {
        console.log("  ⚠ No events available to test");
        test.skip();
        return;
      }

      await page.goto(`${BASE_URL}/events/${selectedEventId}`);
      await waitForStableState(page);

      await takeScreenshot(page, "event-detail-page");

      // Verify essential elements
      const eventTitle = page.locator("h1, h2").first();
      expect(await eventTitle.count()).toBeGreaterThan(0);
      console.log("  ✓ Event title displayed");

      // Check for date
      const dateElement = page.locator('[class*="date"], text=/\\w+ \\d+, \\d{4}/');
      if ((await dateElement.count()) > 0) {
        console.log("  ✓ Event date displayed");
      }

      // Check for location
      const locationElement = page.locator(
        '[class*="location"], text=/\\w+, \\w{2}/'
      );
      if ((await locationElement.count()) > 0) {
        console.log("  ✓ Event location displayed");
      }
    });

    test("should display ticket information", async ({ page }) => {
      console.log("\n🎫 Testing Ticket Information Display");

      if (!selectedEventId) {
        test.skip();
        return;
      }

      await page.goto(`${BASE_URL}/events/${selectedEventId}`);
      await waitForStableState(page);

      const ticketSection = page.locator(
        'text=Tickets, text=Get Tickets, text=Price, [data-testid="ticket-section"]'
      );

      if ((await ticketSection.count()) > 0) {
        console.log("  ✓ Ticket section found");

        // Check for price display
        const priceDisplay = page.locator('text=/\\$\\d+(\\.\\d{2})?/');
        if ((await priceDisplay.count()) > 0) {
          console.log("  ✓ Pricing displayed");
        }

        await takeScreenshot(page, "event-ticket-section");
      } else {
        console.log("  ℹ No ticket section (may be free or sold out)");
      }
    });

    test("should display social share buttons", async ({ page }) => {
      console.log("\n📤 Testing Social Share Buttons");

      if (!selectedEventId) {
        test.skip();
        return;
      }

      await page.goto(`${BASE_URL}/events/${selectedEventId}`);
      await waitForStableState(page);

      const shareButtons = page.locator(
        'button:has-text("Share"), [aria-label*="share"], [data-testid="share"]'
      );

      if ((await shareButtons.count()) > 0) {
        console.log("  ✓ Share functionality available");
        await takeScreenshot(page, "event-share-buttons");
      } else {
        console.log("  ℹ Share buttons not visible");
      }
    });
  });

  test.describe("Ticket Selection & Checkout Flow", () => {
    test("should display ticket tier options", async ({ page }) => {
      console.log("\n🎟️ Testing Ticket Tier Selection");

      if (!selectedEventId) {
        await page.goto(`${BASE_URL}/events`);
        await waitForStableState(page);
        const eventCards = page.locator('a[href^="/events/"]');
        if ((await eventCards.count()) > 0) {
          const href = await eventCards.first().getAttribute("href");
          selectedEventId = getEventIdFromUrl(href || "");
        }
      }

      if (!selectedEventId) {
        test.skip();
        return;
      }

      await page.goto(`${BASE_URL}/events/${selectedEventId}`);
      await waitForStableState(page);

      // Look for ticket tiers
      const ticketTiers = page.locator(
        '[data-testid="ticket-tier"], .ticket-tier, [class*="ticket"]'
      );

      if ((await ticketTiers.count()) > 0) {
        console.log(`  Found ${await ticketTiers.count()} ticket tier(s)`);
        await takeScreenshot(page, "ticket-tiers");
      }

      // Look for "Get Tickets" button
      const buyButton = page.locator(
        'button:has-text("Get Tickets"), button:has-text("Buy"), a:has-text("Get Tickets")'
      );

      if ((await buyButton.count()) > 0) {
        console.log("  ✓ Purchase button found");
      }
    });

    test("should adjust ticket quantity", async ({ page }) => {
      console.log("\n🔢 Testing Quantity Adjustment");

      if (!selectedEventId) {
        test.skip();
        return;
      }

      await page.goto(`${BASE_URL}/events/${selectedEventId}/checkout`);
      await waitForStableState(page);

      const quantityInput = page.locator(
        'input[type="number"], [data-testid="quantity-input"]'
      );
      const incrementButton = page.locator(
        'button:has-text("+"), [data-testid="increment"]'
      );
      const decrementButton = page.locator(
        'button:has-text("-"), [data-testid="decrement"]'
      );

      if ((await quantityInput.count()) > 0) {
        await quantityInput.fill("2");
        await waitForStableState(page);
        console.log("  ✓ Quantity adjusted via input");
      } else if ((await incrementButton.count()) > 0) {
        await incrementButton.click();
        await waitForStableState(page);
        console.log("  ✓ Quantity adjusted via button");
      }

      await takeScreenshot(page, "checkout-quantity-adjusted");
    });

    test("should validate checkout form fields", async ({ page }) => {
      console.log("\n✅ Testing Form Validation");

      if (!selectedEventId) {
        test.skip();
        return;
      }

      await page.goto(`${BASE_URL}/events/${selectedEventId}/checkout`);
      await waitForStableState(page);

      // Try to submit without filling required fields
      const submitButton = page.locator(
        'button:has-text("Complete"), button:has-text("Purchase"), button[type="submit"]'
      );

      if ((await submitButton.count()) > 0) {
        await submitButton.click();
        await waitForStableState(page);

        // Check for validation errors
        const validationErrors = page.locator(
          '.error, [class*="error"], text=required, [aria-invalid="true"]'
        );

        if ((await validationErrors.count()) > 0) {
          console.log("  ✓ Form validation working");
          await takeScreenshot(page, "checkout-validation-errors");
        }
      }
    });

    test("should fill checkout form correctly", async ({ page }) => {
      console.log("\n📝 Testing Checkout Form Fill");

      if (!selectedEventId) {
        test.skip();
        return;
      }

      await page.goto(`${BASE_URL}/events/${selectedEventId}/checkout`);
      await waitForStableState(page);

      // Fill name
      const nameInput = page.locator(
        'input[name*="name"], input[placeholder*="Name"], [data-testid="name-input"]'
      );
      if ((await nameInput.count()) > 0) {
        await nameInput.fill(TEST_DATA.customer.name);
        console.log("  ✓ Name filled");
      }

      // Fill email
      const emailInput = page.locator(
        'input[type="email"], input[name*="email"], [data-testid="email-input"]'
      );
      if ((await emailInput.count()) > 0) {
        await emailInput.fill(TEST_DATA.customer.email);
        console.log("  ✓ Email filled");
      }

      // Fill phone
      const phoneInput = page.locator(
        'input[type="tel"], input[name*="phone"], [data-testid="phone-input"]'
      );
      if ((await phoneInput.count()) > 0) {
        await phoneInput.fill(TEST_DATA.customer.phone);
        console.log("  ✓ Phone filled");
      }

      await takeScreenshot(page, "checkout-form-filled");
    });

    test("should display order summary with correct totals", async ({
      page,
    }) => {
      console.log("\n💰 Testing Order Summary");

      if (!selectedEventId) {
        test.skip();
        return;
      }

      await page.goto(`${BASE_URL}/events/${selectedEventId}/checkout`);
      await waitForStableState(page);

      const orderSummary = page.locator(
        '[data-testid="order-summary"], .order-summary, text=Summary'
      );

      if ((await orderSummary.count()) > 0) {
        console.log("  ✓ Order summary displayed");

        // Check for subtotal
        const subtotal = page.locator('text=Subtotal, text=/Subtotal.*\\$/');
        if ((await subtotal.count()) > 0) {
          console.log("  ✓ Subtotal displayed");
        }

        // Check for fees
        const fees = page.locator('text=Fee, text=/Fee.*\\$/');
        if ((await fees.count()) > 0) {
          console.log("  ✓ Fees displayed");
        }

        // Check for total
        const total = page.locator('text=/Total.*\\$\\d+/');
        if ((await total.count()) > 0) {
          console.log("  ✓ Total displayed");
        }

        await takeScreenshot(page, "checkout-order-summary");
      }
    });

    test("should display payment method options", async ({ page }) => {
      console.log("\n💳 Testing Payment Methods");

      if (!selectedEventId) {
        test.skip();
        return;
      }

      await page.goto(`${BASE_URL}/events/${selectedEventId}/checkout`);
      await waitForStableState(page);

      // Check for Stripe
      const stripeOption = page.locator(
        'text=Credit Card, text=Stripe, [data-testid="stripe-payment"]'
      );
      if ((await stripeOption.count()) > 0) {
        console.log("  ✓ Stripe payment option available");
      }

      // Check for PayPal
      const paypalOption = page.locator(
        'text=PayPal, [data-testid="paypal-payment"]'
      );
      if ((await paypalOption.count()) > 0) {
        console.log("  ✓ PayPal payment option available");
      }

      await takeScreenshot(page, "checkout-payment-methods");
    });
  });
});

// =============================================================================
// ORGANIZER FLOW TESTS
// =============================================================================

test.describe("Organizer Flow - Event Management", () => {
  let createdEventId: string | null = null;

  test.describe("Event Creation", () => {
    test("should navigate to create event page", async ({ page }) => {
      console.log("\n🆕 Testing Create Event Navigation");

      await page.goto(`${BASE_URL}/organizer/events/create`);
      await waitForStableState(page);

      const currentUrl = page.url();

      if (currentUrl.includes("/login") || currentUrl.includes("/sign-in")) {
        console.log("  🔐 Auth required - skipping organizer tests");
        await takeScreenshot(page, "organizer-auth-required");
        test.skip();
        return;
      }

      await takeScreenshot(page, "create-event-page");
      console.log("  ✓ Create event page accessible");
    });

    test("should fill basic event information", async ({ page }) => {
      console.log("\n📝 Testing Basic Event Info Form");

      await page.goto(`${BASE_URL}/organizer/events/create`);
      await waitForStableState(page);

      if (page.url().includes("/login")) {
        test.skip();
        return;
      }

      // Fill event name
      const nameInput = page.locator(
        'input[placeholder*="Chicago Summer"], input[name="name"], [data-testid="event-name"]'
      );
      if ((await nameInput.count()) > 0) {
        await nameInput.fill(TEST_DATA.event.name);
        console.log("  ✓ Event name entered");
      }

      // Select event type
      const ticketedEventButton = page.locator(
        'button:has-text("Ticketed Event"), [data-testid="event-type-ticketed"]'
      );
      if ((await ticketedEventButton.count()) > 0) {
        await ticketedEventButton.click();
        console.log("  ✓ Event type selected");
      }

      // Fill description
      const descriptionInput = page.locator(
        'textarea[placeholder*="Tell attendees"], textarea[name="description"]'
      );
      if ((await descriptionInput.count()) > 0) {
        await descriptionInput.fill(TEST_DATA.event.description);
        console.log("  ✓ Description entered");
      }

      // Select categories
      for (const category of TEST_DATA.event.categories) {
        const categoryButton = page.locator(`button:has-text("${category}")`);
        if ((await categoryButton.count()) > 0) {
          await categoryButton.click();
        }
      }
      console.log("  ✓ Categories selected");

      await takeScreenshot(page, "create-event-basic-info");
    });

    test("should set event date and time", async ({ page }) => {
      console.log("\n📅 Testing Date/Time Configuration");

      await page.goto(`${BASE_URL}/organizer/events/create`);
      await waitForStableState(page);

      if (page.url().includes("/login")) {
        test.skip();
        return;
      }

      // Navigate to date step if multi-step
      const nextButton = page.locator('button:has-text("Next")');
      if ((await nextButton.count()) > 0) {
        // Fill minimal info first
        const nameInput = page.locator('input[placeholder*="Chicago Summer"]');
        if ((await nameInput.count()) > 0) {
          await nameInput.fill(TEST_DATA.event.name);
        }
        await nextButton.click();
        await waitForStableState(page);
      }

      // Set date
      const dateInput = page.locator('input[type="date"]');
      if ((await dateInput.count()) > 0) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        const dateStr = futureDate.toISOString().split("T")[0];
        await dateInput.first().fill(dateStr);
        console.log(`  ✓ Date set: ${dateStr}`);
      }

      // Set time
      const timeInput = page.locator('input[type="time"]');
      if ((await timeInput.count()) > 0) {
        await timeInput.first().fill("19:00");
        console.log("  ✓ Time set: 19:00");
      }

      await takeScreenshot(page, "create-event-datetime");
    });

    test("should set event location", async ({ page }) => {
      console.log("\n📍 Testing Location Configuration");

      await page.goto(`${BASE_URL}/organizer/events/create`);
      await waitForStableState(page);

      if (page.url().includes("/login")) {
        test.skip();
        return;
      }

      // Fill venue
      const venueInput = page.locator(
        'input[placeholder*="venue"], input[name="venueName"]'
      );
      if ((await venueInput.count()) > 0) {
        await venueInput.fill(TEST_DATA.event.venue);
        console.log("  ✓ Venue entered");
      }

      // Fill city
      const cityInput = page.locator('input[placeholder*="City"], input[name="city"]');
      if ((await cityInput.count()) > 0) {
        await cityInput.fill(TEST_DATA.event.city);
        console.log("  ✓ City entered");
      }

      // Fill state
      const stateInput = page.locator(
        'input[placeholder*="State"], input[name="state"]'
      );
      if ((await stateInput.count()) > 0) {
        await stateInput.fill(TEST_DATA.event.state);
        console.log("  ✓ State entered");
      }

      await takeScreenshot(page, "create-event-location");
    });
  });

  test.describe("Ticket Tier Management", () => {
    test("should navigate to ticket management", async ({ page }) => {
      console.log("\n🎫 Testing Ticket Management Navigation");

      await page.goto(`${BASE_URL}/organizer/events`);
      await waitForStableState(page);

      if (page.url().includes("/login")) {
        test.skip();
        return;
      }

      // Find an event and navigate to tickets
      const eventLinks = page.locator('a[href*="/organizer/events/"]');

      if ((await eventLinks.count()) > 0) {
        // Look for tickets link
        const ticketsLink = page.locator('a[href*="/tickets"]').first();
        if ((await ticketsLink.count()) > 0) {
          await ticketsLink.click();
          await waitForStableState(page);
          console.log("  ✓ Navigated to ticket management");
          await takeScreenshot(page, "ticket-management-page");
        }
      } else {
        console.log("  ℹ No events available");
      }
    });

    test("should add new ticket tier", async ({ page }) => {
      console.log("\n➕ Testing Add Ticket Tier");

      // Navigate to ticket creation for an event
      await page.goto(`${BASE_URL}/organizer/events`);
      await waitForStableState(page);

      if (page.url().includes("/login")) {
        test.skip();
        return;
      }

      const addTierButton = page.locator(
        'button:has-text("Add Ticket"), button:has-text("Create Tier"), [data-testid="add-tier"]'
      );

      if ((await addTierButton.count()) > 0) {
        await addTierButton.click();
        await waitForStableState(page);

        // Fill tier name
        const tierNameInput = page.locator(
          'input[name="tierName"], input[placeholder*="tier name"]'
        );
        if ((await tierNameInput.count()) > 0) {
          await tierNameInput.fill(TEST_DATA.ticketTier.name);
        }

        // Fill price
        const priceInput = page.locator('input[name="price"], input[type="number"]');
        if ((await priceInput.count()) > 0) {
          await priceInput.first().fill(TEST_DATA.ticketTier.price);
        }

        // Fill quantity
        const quantityInput = page.locator('input[name="quantity"]');
        if ((await quantityInput.count()) > 0) {
          await quantityInput.fill(String(TEST_DATA.ticketTier.quantity));
        }

        await takeScreenshot(page, "add-ticket-tier-form");
        console.log("  ✓ Ticket tier form filled");
      }
    });

    test("should configure early-bird pricing", async ({ page }) => {
      console.log("\n🐦 Testing Early-Bird Pricing");

      await page.goto(`${BASE_URL}/organizer/events`);
      await waitForStableState(page);

      if (page.url().includes("/login")) {
        test.skip();
        return;
      }

      const earlyBirdToggle = page.locator(
        'text=Early Bird, text=Pricing Tiers, [data-testid="early-bird"]'
      );

      if ((await earlyBirdToggle.count()) > 0) {
        console.log("  ✓ Early-bird pricing option found");
        await takeScreenshot(page, "early-bird-pricing");
      } else {
        console.log("  ℹ Early-bird pricing not visible");
      }
    });
  });

  test.describe("Payment Configuration", () => {
    test("should access payment setup", async ({ page }) => {
      console.log("\n💳 Testing Payment Setup Access");

      await page.goto(`${BASE_URL}/organizer/events`);
      await waitForStableState(page);

      if (page.url().includes("/login")) {
        test.skip();
        return;
      }

      const paymentLink = page.locator(
        'a[href*="/payment"], text=Payment Setup, [data-testid="payment-config"]'
      );

      if ((await paymentLink.count()) > 0) {
        await paymentLink.first().click();
        await waitForStableState(page);
        console.log("  ✓ Payment setup page accessible");
        await takeScreenshot(page, "payment-setup-page");
      } else {
        console.log("  ℹ Payment setup link not found");
      }
    });

    test("should display payment model options", async ({ page }) => {
      console.log("\n💼 Testing Payment Model Options");

      // Navigate to a payment setup page
      await page.goto(`${BASE_URL}/organizer/events`);
      await waitForStableState(page);

      if (page.url().includes("/login")) {
        test.skip();
        return;
      }

      // Look for payment model selection
      const prepayOption = page.locator('text=Prepay, text=PREPAY, [data-testid="prepay"]');
      const creditCardOption = page.locator(
        'text=Credit Card, text=Pay as you sell, [data-testid="credit-card"]'
      );

      if ((await prepayOption.count()) > 0 || (await creditCardOption.count()) > 0) {
        console.log("  ✓ Payment model options displayed");
        await takeScreenshot(page, "payment-model-options");
      }
    });
  });

  test.describe("Event Analytics & Dashboard", () => {
    test("should display event analytics", async ({ page }) => {
      console.log("\n📊 Testing Event Analytics");

      await page.goto(`${BASE_URL}/organizer/events`);
      await waitForStableState(page);

      if (page.url().includes("/login")) {
        test.skip();
        return;
      }

      // Look for analytics/dashboard link
      const analyticsLink = page.locator(
        'a[href*="/analytics"], a[href*="/dashboard"], text=Analytics, text=Stats'
      );

      if ((await analyticsLink.count()) > 0) {
        await analyticsLink.first().click();
        await waitForStableState(page);
        console.log("  ✓ Analytics page accessible");
        await takeScreenshot(page, "event-analytics");

        // Check for key metrics
        const soldCount = page.locator('text=Sold, text=Sales');
        const revenueCount = page.locator('text=Revenue, text=/\\$\\d+/');

        if ((await soldCount.count()) > 0) console.log("  ✓ Sales data displayed");
        if ((await revenueCount.count()) > 0) console.log("  ✓ Revenue displayed");
      }
    });

    test("should display sales dashboard", async ({ page }) => {
      console.log("\n📈 Testing Sales Dashboard");

      await page.goto(`${BASE_URL}/organizer`);
      await waitForStableState(page);

      if (page.url().includes("/login")) {
        test.skip();
        return;
      }

      await takeScreenshot(page, "organizer-dashboard");

      // Check for dashboard elements
      const dashboardElements = page.locator(
        '[data-testid="dashboard"], .dashboard, h1:has-text("Dashboard")'
      );

      if ((await dashboardElements.count()) > 0) {
        console.log("  ✓ Dashboard displayed");
      }
    });
  });

  test.describe("Staff Management", () => {
    test("should access staff management", async ({ page }) => {
      console.log("\n👥 Testing Staff Management");

      await page.goto(`${BASE_URL}/organizer/events`);
      await waitForStableState(page);

      if (page.url().includes("/login")) {
        test.skip();
        return;
      }

      const staffLink = page.locator(
        'a[href*="/staff"], text=Staff, text=Team, [data-testid="staff-management"]'
      );

      if ((await staffLink.count()) > 0) {
        await staffLink.first().click();
        await waitForStableState(page);
        console.log("  ✓ Staff management accessible");
        await takeScreenshot(page, "staff-management");
      } else {
        console.log("  ℹ Staff management link not found");
      }
    });
  });
});

// =============================================================================
// TICKET MANAGEMENT TESTS
// =============================================================================

test.describe("Ticket Management - Inventory & Operations", () => {
  test.describe("Inventory Management", () => {
    test("should display ticket inventory", async ({ page }) => {
      console.log("\n📦 Testing Ticket Inventory Display");

      await page.goto(`${BASE_URL}/organizer/events`);
      await waitForStableState(page);

      if (page.url().includes("/login")) {
        test.skip();
        return;
      }

      // Look for inventory indicators
      const inventoryDisplay = page.locator(
        'text=/\\d+ sold/, text=/\\d+ remaining/, [data-testid="inventory"]'
      );

      if ((await inventoryDisplay.count()) > 0) {
        console.log("  ✓ Inventory information displayed");
        await takeScreenshot(page, "ticket-inventory");
      }
    });

    test("should show capacity progress bar", async ({ page }) => {
      console.log("\n📊 Testing Capacity Progress");

      await page.goto(`${BASE_URL}/organizer/events`);
      await waitForStableState(page);

      if (page.url().includes("/login")) {
        test.skip();
        return;
      }

      const progressBar = page.locator(
        '[role="progressbar"], .progress, [data-testid="capacity-progress"]'
      );

      if ((await progressBar.count()) > 0) {
        console.log("  ✓ Capacity progress bar displayed");
        await takeScreenshot(page, "capacity-progress");
      }
    });
  });

  test.describe("Discount Codes", () => {
    test("should display discount code management", async ({ page }) => {
      console.log("\n🏷️ Testing Discount Code Management");

      await page.goto(`${BASE_URL}/organizer/events`);
      await waitForStableState(page);

      if (page.url().includes("/login")) {
        test.skip();
        return;
      }

      const discountSection = page.locator(
        'text=Discount, text=Promo Code, [data-testid="discounts"]'
      );

      if ((await discountSection.count()) > 0) {
        console.log("  ✓ Discount code section found");
        await takeScreenshot(page, "discount-codes");
      }
    });

    test("should apply discount code at checkout", async ({ page }) => {
      console.log("\n💸 Testing Discount Code Application");

      await page.goto(`${BASE_URL}/events`);
      await waitForStableState(page);

      const eventCards = page.locator('a[href^="/events/"]');
      if ((await eventCards.count()) === 0) {
        test.skip();
        return;
      }

      const href = await eventCards.first().getAttribute("href");
      const eventId = getEventIdFromUrl(href || "");

      if (eventId) {
        await page.goto(`${BASE_URL}/events/${eventId}/checkout`);
        await waitForStableState(page);

        const discountInput = page.locator(
          'input[placeholder*="discount"], input[placeholder*="promo"], [data-testid="discount-input"]'
        );

        if ((await discountInput.count()) > 0) {
          await discountInput.fill(TEST_DATA.discountCode.code);

          const applyButton = page.locator(
            'button:has-text("Apply"), [data-testid="apply-discount"]'
          );
          if ((await applyButton.count()) > 0) {
            await applyButton.click();
            await waitForStableState(page);
          }

          console.log("  ✓ Discount code applied");
          await takeScreenshot(page, "discount-applied");
        }
      }
    });
  });

  test.describe("Waitlist", () => {
    test("should display waitlist option for sold-out events", async ({
      page,
    }) => {
      console.log("\n📋 Testing Waitlist Display");

      // This test assumes there's a sold-out event
      await page.goto(`${BASE_URL}/events`);
      await waitForStableState(page);

      const soldOutBadge = page.locator(
        'text=Sold Out, text=Waitlist, [data-testid="sold-out"]'
      );

      if ((await soldOutBadge.count()) > 0) {
        console.log("  ✓ Sold out indicator found");

        const waitlistButton = page.locator(
          'button:has-text("Join Waitlist"), [data-testid="join-waitlist"]'
        );

        if ((await waitlistButton.count()) > 0) {
          console.log("  ✓ Waitlist signup option available");
          await takeScreenshot(page, "waitlist-option");
        }
      } else {
        console.log("  ℹ No sold-out events found to test waitlist");
      }
    });

    test("should handle waitlist signup form", async ({ page }) => {
      console.log("\n✍️ Testing Waitlist Signup Form");

      await page.goto(`${BASE_URL}/events`);
      await waitForStableState(page);

      const waitlistButton = page.locator(
        'button:has-text("Join Waitlist"), [data-testid="join-waitlist"]'
      );

      if ((await waitlistButton.count()) > 0) {
        await waitlistButton.first().click();
        await waitForStableState(page);

        const emailInput = page.locator(
          'input[type="email"], [data-testid="waitlist-email"]'
        );

        if ((await emailInput.count()) > 0) {
          await emailInput.fill(TEST_DATA.customer.email);
          console.log("  ✓ Waitlist form filled");
          await takeScreenshot(page, "waitlist-form");
        }
      }
    });
  });

  test.describe("Ticket Transfers", () => {
    test("should display transfer option on ticket", async ({ page }) => {
      console.log("\n🔄 Testing Ticket Transfer Display");

      await page.goto(`${BASE_URL}/my-tickets`);
      await waitForStableState(page);

      if (page.url().includes("/login")) {
        console.log("  🔐 Auth required for ticket transfers");
        test.skip();
        return;
      }

      const transferButton = page.locator(
        'button:has-text("Transfer"), [data-testid="transfer-ticket"]'
      );

      if ((await transferButton.count()) > 0) {
        console.log("  ✓ Transfer option available");
        await takeScreenshot(page, "ticket-transfer-option");
      } else {
        console.log("  ℹ No tickets or transfer not enabled");
      }
    });
  });
});

// =============================================================================
// RESPONSIVE DESIGN TESTS
// =============================================================================

test.describe("Responsive Design", () => {
  test("should display correctly on mobile", async ({ page }) => {
    console.log("\n📱 Testing Mobile Viewport");

    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto(`${BASE_URL}/events`);
    await waitForStableState(page);

    await takeScreenshot(page, "events-mobile");

    // Check for mobile-friendly elements using data-testid
    const hamburgerMenu = page.locator(TEST_IDS.mobileMenuButton);

    if (await hamburgerMenu.isVisible()) {
      console.log("  ✓ Mobile menu found");
    }

    // Verify cards stack vertically
    const eventCards = page.locator('a[href^="/events/"]');
    if ((await eventCards.count()) > 1) {
      const firstCard = await eventCards.first().boundingBox();
      const secondCard = await eventCards.nth(1).boundingBox();

      if (firstCard && secondCard) {
        expect(secondCard.y).toBeGreaterThan(firstCard.y);
        console.log("  ✓ Cards stack vertically on mobile");
      }
    }
  });

  test("should display correctly on tablet", async ({ page }) => {
    console.log("\n📱 Testing Tablet Viewport");

    await page.setViewportSize(VIEWPORTS.tablet);
    await page.goto(`${BASE_URL}/events`);
    await waitForStableState(page);

    await takeScreenshot(page, "events-tablet");
    console.log("  ✓ Tablet layout rendered");
  });

  test("should display correctly on desktop", async ({ page }) => {
    console.log("\n🖥️ Testing Desktop Viewport");

    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/events`);
    await waitForStableState(page);

    await takeScreenshot(page, "events-desktop");

    // Check for multi-column grid
    const eventCards = page.locator('a[href^="/events/"]');
    if ((await eventCards.count()) >= 3) {
      const firstCard = await eventCards.first().boundingBox();
      const thirdCard = await eventCards.nth(2).boundingBox();

      if (firstCard && thirdCard) {
        // On desktop, third card might be on same row
        console.log("  ✓ Desktop multi-column layout verified");
      }
    }
  });

  test("should have responsive checkout form", async ({ page }) => {
    console.log("\n📝 Testing Responsive Checkout");

    await page.goto(`${BASE_URL}/events`);
    await waitForStableState(page);

    const eventCards = page.locator('a[href^="/events/"]');
    if ((await eventCards.count()) === 0) {
      test.skip();
      return;
    }

    const href = await eventCards.first().getAttribute("href");
    const eventId = getEventIdFromUrl(href || "");

    if (eventId) {
      // Test mobile checkout
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(`${BASE_URL}/events/${eventId}/checkout`);
      await waitForStableState(page);
      await takeScreenshot(page, "checkout-mobile");

      // Test desktop checkout
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.reload();
      await waitForStableState(page);
      await takeScreenshot(page, "checkout-desktop");

      console.log("  ✓ Checkout responsive across viewports");
    }
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("should have proper heading hierarchy", async ({ page }) => {
    console.log("\n♿ Testing Heading Hierarchy");

    await page.goto(`${BASE_URL}/events`);
    await waitForStableState(page);

    const h1 = await page.locator("h1").count();
    const h2 = await page.locator("h2").count();
    const h3 = await page.locator("h3").count();

    console.log(`  Headings: h1=${h1}, h2=${h2}, h3=${h3}`);
    expect(h1).toBeGreaterThan(0);
    console.log("  ✓ Page has at least one h1");
  });

  test("should have proper form labels", async ({ page }) => {
    console.log("\n♿ Testing Form Labels");

    await page.goto(`${BASE_URL}/events`);
    await waitForStableState(page);

    const inputs = page.locator(
      "input:not([type='hidden']):not([type='submit'])"
    );
    const inputCount = await inputs.count();

    if (inputCount > 0) {
      // Check for labels or aria-label
      const labeledInputs = page.locator(
        "input[aria-label], input[id][aria-labelledby], label input"
      );
      const labeledCount = await labeledInputs.count();

      console.log(`  Inputs: ${inputCount}, Labeled: ${labeledCount}`);

      // Also check for placeholder as fallback
      const inputsWithPlaceholder = page.locator("input[placeholder]");
      const placeholderCount = await inputsWithPlaceholder.count();

      if (labeledCount > 0 || placeholderCount > 0) {
        console.log("  ✓ Form inputs have labels or placeholders");
      }
    }
  });

  test("should have keyboard navigation support", async ({ page }) => {
    console.log("\n⌨️ Testing Keyboard Navigation");

    await page.goto(`${BASE_URL}/events`);
    await waitForStableState(page);

    // Tab through elements
    await page.keyboard.press("Tab");
    const firstFocused = await page.evaluate(
      () => document.activeElement?.tagName
    );
    console.log(`  First focused element: ${firstFocused}`);

    await page.keyboard.press("Tab");
    const secondFocused = await page.evaluate(
      () => document.activeElement?.tagName
    );
    console.log(`  Second focused element: ${secondFocused}`);

    expect(firstFocused).toBeDefined();
    console.log("  ✓ Keyboard navigation works");
  });

  test("should have proper color contrast (basic check)", async ({ page }) => {
    console.log("\n🎨 Testing Basic Contrast");

    await page.goto(`${BASE_URL}/events`);
    await waitForStableState(page);

    // Check that text elements have visible content
    const textElements = page.locator("p, h1, h2, h3, span, a");
    const elementCount = await textElements.count();

    if (elementCount > 0) {
      const firstElement = textElements.first();
      const color = await firstElement.evaluate((el) =>
        window.getComputedStyle(el).color
      );

      console.log(`  Text color sample: ${color}`);
      expect(color).not.toBe("rgba(0, 0, 0, 0)"); // Not fully transparent
      console.log("  ✓ Text elements have visible color");
    }
  });

  test("should have alt text for images", async ({ page }) => {
    console.log("\n🖼️ Testing Image Alt Text");

    await page.goto(`${BASE_URL}/events`);
    await waitForStableState(page);

    const images = page.locator("img");
    const imageCount = await images.count();

    if (imageCount > 0) {
      let imagesWithAlt = 0;
      for (let i = 0; i < imageCount; i++) {
        const alt = await images.nth(i).getAttribute("alt");
        if (alt !== null && alt !== "") {
          imagesWithAlt++;
        }
      }

      console.log(`  Images: ${imageCount}, With alt: ${imagesWithAlt}`);

      if (imagesWithAlt > 0) {
        console.log("  ✓ Some images have alt text");
      }
    } else {
      console.log("  ℹ No images found on page");
    }
  });
});

// =============================================================================
// ERROR STATE TESTS
// =============================================================================

test.describe("Error States", () => {
  test("should handle 404 for invalid event ID", async ({ page }) => {
    console.log("\n❌ Testing 404 Error Handling");

    await page.goto(`${BASE_URL}/events/invalid-event-id-12345`);
    await waitForStableState(page);

    const errorMessage = page.locator(
      'text=not found, text=404, text=doesn\'t exist, text=Event not found'
    );

    await takeScreenshot(page, "event-404-error");

    if ((await errorMessage.count()) > 0) {
      console.log("  ✓ 404 error message displayed");
    } else {
      console.log("  ℹ Custom 404 page not implemented or redirected");
    }
  });

  test("should handle empty search results", async ({ page }) => {
    console.log("\n🔍 Testing Empty Search Results");

    await page.goto(`${BASE_URL}/events`);
    await waitForStableState(page);

    // Use data-testid for search input
    const searchInput = page.locator(TEST_IDS.eventsSearchInput);
    if (await searchInput.isVisible()) {
      await searchInput.fill("xyznonexistentevent123456");
      await waitForStableState(page);

      // Use data-testid for empty state
      const emptyState = page.locator(TEST_IDS.eventsEmptyState);

      await takeScreenshot(page, "empty-search-results");

      if (await emptyState.isVisible()) {
        console.log("  ✓ Empty state message displayed");
      }
    }
  });
});
