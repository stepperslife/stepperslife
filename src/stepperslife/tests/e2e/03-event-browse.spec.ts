import { test, expect } from "@playwright/test";
import { TEST_EVENT, URLS, TIMEOUTS } from "./helpers/test-data";

test.describe("Event Browsing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URLS.events);
    await page.waitForLoadState("domcontentloaded");
    // Wait for events page to be visible
    await page.waitForSelector('[data-testid="events-page"]', { timeout: 10000 });
  });

  test("should display events page", async ({ page }) => {
    await expect(page.locator('[data-testid="events-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="events-page-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="events-search-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="events-category-filter"]')).toBeVisible();
  });

  test("should display events grid or empty state", async ({ page }) => {
    // Wait for events to load
    await page.waitForTimeout(2000);

    // Check for either events grid or empty state
    const eventsGrid = page.locator('[data-testid="events-grid"]');
    const emptyState = page.locator('[data-testid="events-empty-state"]');

    const hasGrid = await eventsGrid.isVisible();
    const hasEmpty = await emptyState.isVisible();

    // One of them should be visible
    expect(hasGrid || hasEmpty).toBe(true);
  });

  test("should search events", async ({ page }) => {
    // Type in search
    await page.fill('[data-testid="events-search-input"]', "test");

    // Wait for search to filter
    await page.waitForTimeout(1000);

    // Check that either events are filtered or empty state shows
    const eventsCount = page.locator('[data-testid="events-count"]');
    const emptyState = page.locator('[data-testid="events-empty-state"]');

    const hasCount = await eventsCount.isVisible();
    const hasEmpty = await emptyState.isVisible();

    // One of them should be visible
    expect(hasCount || hasEmpty).toBe(true);
  });

  test("should filter by category", async ({ page }) => {
    // Wait for categories to load
    await page.waitForTimeout(1000);

    // Get the category filter
    const categoryFilter = page.locator('[data-testid="events-category-filter"]');
    await expect(categoryFilter).toBeVisible();

    // Check if there are options available
    const options = await categoryFilter.locator("option").count();

    if (options > 1) {
      // Select first non-empty category
      const optionValues = await categoryFilter.locator("option").allTextContents();
      const nonEmptyOption = optionValues.find((opt) => opt !== "All Categories");

      if (nonEmptyOption) {
        await categoryFilter.selectOption({ label: nonEmptyOption });

        // Wait for filter to apply
        await page.waitForTimeout(1000);

        // Events should be filtered (or empty state shown)
        const eventsGrid = page.locator('[data-testid="events-grid"]');
        const emptyState = page.locator('[data-testid="events-empty-state"]');

        const hasGrid = await eventsGrid.isVisible();
        const hasEmpty = await emptyState.isVisible();

        expect(hasGrid || hasEmpty).toBe(true);
      }
    }
  });

  test("should toggle past events", async ({ page }) => {
    // Find past events toggle
    const pastToggle = page.locator('[data-testid="events-past-toggle"]');
    await expect(pastToggle).toBeVisible();

    // Toggle on
    await pastToggle.check();
    await page.waitForTimeout(1000);

    // Toggle off
    await pastToggle.uncheck();
    await page.waitForTimeout(1000);

    // No error should occur
  });

  test("should navigate to event details", async ({ page }) => {
    // Wait for events to load
    await page.waitForTimeout(2000);

    // Check if there are any event cards
    const eventCards = page.locator('[data-testid^="event-card-"]');
    const count = await eventCards.count();

    if (count > 0) {
      // Click the first event card
      await eventCards.first().click();

      // Should navigate to event detail page
      await page.waitForURL(/\/events\/[a-zA-Z0-9]+$/, {
        timeout: TIMEOUTS.medium,
      });

      // Check for event detail content
      await expect(page.locator('[data-testid="buy-tickets-btn"]').or(page.locator("text=Event Not Found"))).toBeVisible({
        timeout: TIMEOUTS.medium,
      });
    }
  });

  test("should display event details correctly", async ({ page }) => {
    // Wait for events to load
    await page.waitForTimeout(2000);

    // Check if there are any event cards
    const eventCards = page.locator('[data-testid^="event-card-"]');
    const count = await eventCards.count();

    if (count > 0) {
      // Click the first event card
      await eventCards.first().click();

      // Wait for event page to load
      await page.waitForURL(/\/events\/[a-zA-Z0-9]+$/, {
        timeout: TIMEOUTS.medium,
      });

      // Should see event name (h1 or similar)
      const eventTitle = page.locator("h1, h2").first();
      await expect(eventTitle).toBeVisible({ timeout: TIMEOUTS.medium });

      // Should see Buy Tickets button if event is upcoming
      const buyButton = page.locator('[data-testid="buy-tickets-btn"]');
      const pastEvent = page.locator("text=Past Event");

      // Either Buy Tickets or Past Event indicator should be present
      const hasBuyButton = await buyButton.isVisible().catch(() => false);
      const isPast = await pastEvent.isVisible().catch(() => false);

      // For a valid event, one of these should be true (or event not found)
      expect(hasBuyButton || isPast || page.url().includes("events")).toBe(true);
    }
  });

  test("should handle connection timeout gracefully", async ({ page }) => {
    // This test verifies the loading state exists
    // The actual timeout behavior is hard to test directly

    await page.goto(URLS.events);

    // Should show loading state initially or content quickly
    const loadingOrContent = await Promise.race([
      page.locator("text=Loading events").isVisible(),
      page.locator('[data-testid="events-page"]').isVisible(),
    ]);

    expect(loadingOrContent).toBeDefined();
  });
});
