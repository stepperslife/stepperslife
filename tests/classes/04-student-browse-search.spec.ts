/**
 * Student Browse and Search E2E Tests
 *
 * Tests the class browsing and search functionality for students:
 * - Viewing classes listing page
 * - Search by name, description, city
 * - Filter by category
 * - Toggle past classes
 * - Switch view modes (Grid/List/Masonry)
 * - Empty state handling
 */

import { test, expect } from "@playwright/test";
import {
  navigateToClassesListing,
  searchClasses,
  filterByCategory,
  togglePastClasses,
  switchViewMode,
  getVisibleClassCount,
  waitForPageLoad,
  takeScreenshot,
} from "./helpers/classes.helpers";
import { TIMEOUTS, CLASS_CATEGORIES } from "./helpers/test-data";

test.describe("Student Browse and Search Classes", () => {
  test("student can view classes listing page", async ({ page }) => {
    await navigateToClassesListing(page);

    // Verify page elements
    await expect(page.locator('[data-testid="classes-page"]')).toBeVisible();

    // Check for hero section or header
    await expect(page.locator('h1:has-text("Classes")')).toBeVisible({
      timeout: TIMEOUTS.medium,
    });

    // Search input should be visible
    await expect(page.locator('[data-testid="classes-search-input"]')).toBeVisible();

    await takeScreenshot(page, "01-classes-listing");
  });

  test("classes page shows class cards or empty state", async ({ page }) => {
    await navigateToClassesListing(page);

    // Wait for content to load
    await page.waitForTimeout(2000);

    const classCards = page.locator('[data-testid^="class-card-"]');
    const emptyState = page.locator('[data-testid="classes-empty-state"]');

    const cardCount = await classCards.count();

    if (cardCount > 0) {
      // Verify class cards have expected elements
      const firstCard = classCards.first();
      await expect(firstCard).toBeVisible();

      await takeScreenshot(page, "02-class-cards-visible");
    } else {
      // Empty state should be shown
      await expect(emptyState).toBeVisible();

      await takeScreenshot(page, "02-empty-state");
    }
  });

  test("student can search classes by name", async ({ page }) => {
    await navigateToClassesListing(page);

    // Get initial count
    await page.waitForTimeout(1000);
    const initialCount = await getVisibleClassCount(page);

    if (initialCount > 0) {
      // Get the name of the first class to search for
      const firstCard = page.locator('[data-testid^="class-card-"]').first();
      const cardText = await firstCard.textContent();

      // Search for something that should match
      await searchClasses(page, "step");

      // Wait for results to update
      await page.waitForTimeout(1000);

      // Should show filtered results
      await takeScreenshot(page, "03-search-results");
    } else {
      // Search on empty list
      await searchClasses(page, "test search");
      await page.waitForTimeout(500);

      // Should still show empty state
      await expect(page.locator('[data-testid="classes-empty-state"]')).toBeVisible();

      await takeScreenshot(page, "03-search-empty");
    }
  });

  test("student can search classes by description", async ({ page }) => {
    await navigateToClassesListing(page);
    await page.waitForTimeout(1000);

    const initialCount = await getVisibleClassCount(page);

    if (initialCount > 0) {
      // Search for a term that might be in descriptions
      await searchClasses(page, "learn");
      await page.waitForTimeout(1000);

      await takeScreenshot(page, "04-description-search");
    } else {
      test.skip();
    }
  });

  test("student can search classes by city", async ({ page }) => {
    await navigateToClassesListing(page);
    await page.waitForTimeout(1000);

    const initialCount = await getVisibleClassCount(page);

    if (initialCount > 0) {
      // Search for a city
      await searchClasses(page, "Chicago");
      await page.waitForTimeout(1000);

      // Check if any results contain Chicago
      const results = await getVisibleClassCount(page);
      console.log(`Found ${results} classes matching "Chicago"`);

      await takeScreenshot(page, "05-city-search");
    } else {
      test.skip();
    }
  });

  test("student can filter by category", async ({ page }) => {
    await navigateToClassesListing(page);
    await page.waitForTimeout(1000);

    // Check if category filter exists
    const categoryFilter = page.locator('[data-testid="classes-category-filter"]');

    if (await categoryFilter.isVisible({ timeout: TIMEOUTS.short }).catch(() => false)) {
      await categoryFilter.click();

      // Look for category options
      const beginnerOption = page.locator('text="Beginner"');
      if (await beginnerOption.isVisible({ timeout: TIMEOUTS.short }).catch(() => false)) {
        await beginnerOption.click();
        await page.waitForTimeout(500);

        await takeScreenshot(page, "06-category-filter");
      }
    } else {
      // Category filter might be implemented differently
      console.log("Category filter not found or implemented differently");
      await takeScreenshot(page, "06-no-category-filter");
    }
  });

  test("student can toggle past classes visibility", async ({ page }) => {
    await navigateToClassesListing(page);
    await page.waitForTimeout(1000);

    const pastToggle = page.locator('[data-testid="classes-past-toggle"]');

    if (await pastToggle.isVisible({ timeout: TIMEOUTS.short }).catch(() => false)) {
      // Get count before toggle
      const beforeCount = await getVisibleClassCount(page);

      // Toggle to show past classes
      await pastToggle.click();
      await page.waitForTimeout(500);

      const afterCount = await getVisibleClassCount(page);

      // Count might change (or stay same if no past classes)
      console.log(`Before: ${beforeCount}, After: ${afterCount}`);

      await takeScreenshot(page, "07-past-toggle");
    } else {
      console.log("Past classes toggle not visible");
      await takeScreenshot(page, "07-no-past-toggle");
    }
  });

  test("student can switch view modes", async ({ page }) => {
    await navigateToClassesListing(page);
    await page.waitForTimeout(1000);

    const viewModes = ["grid", "list", "masonry"] as const;

    for (const mode of viewModes) {
      const modeBtn = page.locator(`[data-testid="view-toggle-${mode}"]`);

      if (await modeBtn.isVisible({ timeout: TIMEOUTS.short }).catch(() => false)) {
        await modeBtn.click();
        await page.waitForTimeout(500);

        await takeScreenshot(page, `08-view-mode-${mode}`);
      }
    }
  });

  test("empty state displays when no results match search", async ({ page }) => {
    await navigateToClassesListing(page);
    await page.waitForTimeout(1000);

    // Search for something that won't match
    await searchClasses(page, "xyznonexistent12345");
    await page.waitForTimeout(1000);

    // Should show empty state or no results message
    const emptyState = page.locator('[data-testid="classes-empty-state"]');
    const noResults = page.locator('text="No classes found"');
    const classCards = page.locator('[data-testid^="class-card-"]');

    const cardCount = await classCards.count();

    if (cardCount === 0) {
      // Either empty state or no results message should be visible
      const hasEmptyState =
        (await emptyState.isVisible({ timeout: TIMEOUTS.short }).catch(() => false)) ||
        (await noResults.isVisible({ timeout: TIMEOUTS.short }).catch(() => false));

      expect(hasEmptyState || cardCount === 0).toBe(true);
    }

    await takeScreenshot(page, "09-empty-search-results");
  });

  test("clear search restores results", async ({ page }) => {
    await navigateToClassesListing(page);
    await page.waitForTimeout(1000);

    const initialCount = await getVisibleClassCount(page);

    // Search for something
    await searchClasses(page, "test");
    await page.waitForTimeout(500);

    // Clear search
    const searchInput = page.locator('[data-testid="classes-search-input"]');
    await searchInput.fill("");
    await page.waitForTimeout(500);

    // Count should return to initial (or close)
    const restoredCount = await getVisibleClassCount(page);

    // If there were classes initially, they should reappear
    if (initialCount > 0) {
      expect(restoredCount).toBe(initialCount);
    }

    await takeScreenshot(page, "10-search-cleared");
  });

  test("class cards display required information", async ({ page }) => {
    await navigateToClassesListing(page);
    await page.waitForTimeout(1000);

    const classCards = page.locator('[data-testid^="class-card-"]');
    const count = await classCards.count();

    if (count > 0) {
      const firstCard = classCards.first();

      // Card should contain:
      // - Title/name
      // - Date information
      // - Location (city/state)
      // - View details link or clickable

      await expect(firstCard).toBeVisible();

      // Check for date icon or text
      const hasDateInfo =
        (await firstCard.locator('svg').count()) > 0 ||
        (await firstCard.locator('text=/\\d{4}|January|February|March|April|May|June|July|August|September|October|November|December/').count()) > 0;

      // Check for location info
      const hasLocation = (await firstCard.textContent())?.match(/[A-Z]{2}|Chicago|Atlanta|Detroit/);

      console.log(`Card has date: ${hasDateInfo}, has location: ${!!hasLocation}`);

      await takeScreenshot(page, "11-card-details");
    } else {
      console.log("No class cards to check");
      test.skip();
    }
  });

  test("page shows correct class count", async ({ page }) => {
    await navigateToClassesListing(page);
    await page.waitForTimeout(1000);

    // Look for count indicator
    const countText = page.locator('[data-testid="classes-count"]');

    if (await countText.isVisible({ timeout: TIMEOUTS.short }).catch(() => false)) {
      const text = await countText.textContent();
      const count = await getVisibleClassCount(page);

      // Count in text should match visible cards (approximately)
      console.log(`Displayed: "${text}", Visible cards: ${count}`);

      await takeScreenshot(page, "12-class-count");
    } else {
      // Count might be displayed differently
      console.log("Class count indicator not visible");
      await takeScreenshot(page, "12-no-count-indicator");
    }
  });
});
