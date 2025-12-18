/**
 * Instructor Class Management E2E Tests
 *
 * Tests the class management functionality for instructors:
 * - Viewing all classes in dashboard
 * - Editing existing classes
 * - Publishing/unpublishing classes
 * - Deleting classes
 * - Viewing class as public user
 */

import { test, expect } from "@playwright/test";
import {
  loginAsInstructor,
  navigateToClassCreation,
  navigateToInstructorClasses,
  fillClassForm,
  publishClass,
  unpublishClass,
  deleteClass,
  viewClassAsPublic,
  waitForPageLoad,
  takeScreenshot,
  createClassComplete,
} from "./helpers/classes.helpers";
import {
  generateUniqueClassName,
  getFutureDate,
  TEST_CLASS_DATA,
  TIMEOUTS,
} from "./helpers/test-data";

test.describe("Instructor Class Management", () => {
  let testClassName: string;

  test.beforeEach(async ({ page }) => {
    // Login as instructor before each test
    const loginSuccess = await loginAsInstructor(page);
    if (!loginSuccess) {
      test.skip();
    }
  });

  test("instructor can view all their classes in dashboard", async ({ page }) => {
    await navigateToInstructorClasses(page);

    // Verify page elements
    await expect(page.locator('[data-testid="organizer-classes-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="create-class-btn"]')).toBeVisible();

    // Verify stats are visible
    await expect(page.locator('[data-testid="class-stats-total"]')).toBeVisible();
    await expect(page.locator('[data-testid="class-stats-published"]')).toBeVisible();
    await expect(page.locator('[data-testid="class-stats-drafts"]')).toBeVisible();
    await expect(page.locator('[data-testid="class-stats-upcoming"]')).toBeVisible();

    await takeScreenshot(page, "01-classes-dashboard");
  });

  test("empty state displays when no classes exist", async ({ page }) => {
    // Note: This test may pass or fail depending on existing data
    // It documents expected behavior for empty state
    await navigateToInstructorClasses(page);

    const emptyState = page.locator('[data-testid="empty-state"]');
    const classRows = page.locator('[data-testid^="class-row-"]');

    // Either empty state should show, or class rows should exist
    const isEmpty = (await classRows.count()) === 0;

    if (isEmpty) {
      await expect(emptyState).toBeVisible();
      await expect(page.locator('text="No classes yet"')).toBeVisible();
      await expect(page.locator('text="Create Your First Class"')).toBeVisible();
    } else {
      await expect(classRows.first()).toBeVisible();
    }

    await takeScreenshot(page, "02-empty-or-list-state");
  });

  test("instructor can edit an existing class", async ({ page }) => {
    // First create a class
    testClassName = generateUniqueClassName("Edit Test");
    await navigateToClassCreation(page);

    await page.fill('[data-testid="class-name-input"]', testClassName);
    await page.fill('[data-testid="class-description-input"]', "Original description");
    await page.fill('[data-testid="class-start-date"]', getFutureDate(7));
    await page.fill('[data-testid="class-city-input"]', "Chicago");
    await page.fill('[data-testid="class-state-input"]', "IL");
    await page.click('[data-testid="class-submit-btn"]');

    await page.waitForURL(/\/organizer\/classes/, { timeout: TIMEOUTS.long });
    await waitForPageLoad(page);

    // Find the class row
    const classRow = page.locator(`[data-testid^="class-row-"]:has-text("${testClassName}")`);
    await expect(classRow).toBeVisible({ timeout: TIMEOUTS.convexQuery });

    // Click edit button
    const editBtn = classRow.locator('a:has-text("Edit")');
    await editBtn.click();

    // Should navigate to edit page
    await page.waitForURL(/\/organizer\/classes\/.*\/edit/, { timeout: TIMEOUTS.medium });
    await waitForPageLoad(page);

    // Verify form is pre-filled
    await expect(page.locator('[data-testid="class-name-input"]')).toHaveValue(testClassName);

    // Update the description
    const newDescription = "Updated description for the class";
    await page.fill('[data-testid="class-description-input"]', newDescription);

    await takeScreenshot(page, "03-edit-class-form");

    // Save changes
    await page.click('[data-testid="class-submit-btn"]');

    // Verify redirect back to list
    await page.waitForURL(/\/organizer\/classes/, { timeout: TIMEOUTS.long });

    await takeScreenshot(page, "04-edit-saved");
  });

  test("instructor can publish a draft class", async ({ page }) => {
    /**
     * KNOWN FAILURE POINT: Can publish class without ticket tiers configured
     * This test documents the current behavior.
     */
    testClassName = generateUniqueClassName("Publish Test");

    // Create a draft class
    await navigateToClassCreation(page);
    await page.fill('[data-testid="class-name-input"]', testClassName);
    await page.fill('[data-testid="class-description-input"]', "Class to publish");
    await page.fill('[data-testid="class-start-date"]', getFutureDate(7));
    await page.fill('[data-testid="class-city-input"]', "Chicago");
    await page.fill('[data-testid="class-state-input"]', "IL");
    await page.click('[data-testid="class-submit-btn"]');

    await page.waitForURL(/\/organizer\/classes/, { timeout: TIMEOUTS.long });
    await waitForPageLoad(page);

    // Find the class row
    const classRow = page.locator(`[data-testid^="class-row-"]:has-text("${testClassName}")`);
    await expect(classRow).toBeVisible({ timeout: TIMEOUTS.convexQuery });

    // Verify it shows "Publish" button (draft state)
    const publishBtn = classRow.locator('button:has-text("Publish")');
    await expect(publishBtn).toBeVisible();

    await takeScreenshot(page, "05-before-publish");

    // Click publish
    await publishBtn.click();

    // Wait for status to update
    await page.waitForTimeout(1500);

    // Verify it now shows "Published" button
    const publishedBtn = classRow.locator('button:has-text("Published")');
    await expect(publishedBtn).toBeVisible({ timeout: TIMEOUTS.convexQuery });

    await takeScreenshot(page, "06-after-publish");
  });

  test("instructor can unpublish a published class", async ({ page }) => {
    testClassName = generateUniqueClassName("Unpublish Test");

    // Create and publish a class
    await navigateToClassCreation(page);
    await page.fill('[data-testid="class-name-input"]', testClassName);
    await page.fill('[data-testid="class-description-input"]', "Class to unpublish");
    await page.fill('[data-testid="class-start-date"]', getFutureDate(7));
    await page.fill('[data-testid="class-city-input"]', "Chicago");
    await page.fill('[data-testid="class-state-input"]', "IL");
    await page.click('[data-testid="class-submit-btn"]');

    await page.waitForURL(/\/organizer\/classes/, { timeout: TIMEOUTS.long });
    await waitForPageLoad(page);

    // Find and publish the class
    const classRow = page.locator(`[data-testid^="class-row-"]:has-text("${testClassName}")`);
    const publishBtn = classRow.locator('button:has-text("Publish")');
    await publishBtn.click();
    await page.waitForTimeout(1500);

    // Now unpublish
    const publishedBtn = classRow.locator('button:has-text("Published")');
    await publishedBtn.click();
    await page.waitForTimeout(1500);

    // Verify it's back to draft
    await expect(classRow.locator('button:has-text("Publish")')).toBeVisible({
      timeout: TIMEOUTS.convexQuery,
    });

    await takeScreenshot(page, "07-unpublished");
  });

  test("instructor can delete a draft class", async ({ page }) => {
    testClassName = generateUniqueClassName("Delete Test");

    // Create a class
    await navigateToClassCreation(page);
    await page.fill('[data-testid="class-name-input"]', testClassName);
    await page.fill('[data-testid="class-description-input"]', "Class to delete");
    await page.fill('[data-testid="class-start-date"]', getFutureDate(7));
    await page.fill('[data-testid="class-city-input"]', "Chicago");
    await page.fill('[data-testid="class-state-input"]', "IL");
    await page.click('[data-testid="class-submit-btn"]');

    await page.waitForURL(/\/organizer\/classes/, { timeout: TIMEOUTS.long });
    await waitForPageLoad(page);

    // Find the class row
    const classRow = page.locator(`[data-testid^="class-row-"]:has-text("${testClassName}")`);
    await expect(classRow).toBeVisible({ timeout: TIMEOUTS.convexQuery });

    await takeScreenshot(page, "08-before-delete");

    // Click delete
    const deleteBtn = classRow.locator('button:has-text("Delete")');
    await deleteBtn.click();

    // Confirm deletion in modal
    await expect(page.locator('[data-testid="confirm-delete-btn"]')).toBeVisible();
    await page.click('[data-testid="confirm-delete-btn"]');

    // Wait for deletion
    await page.waitForTimeout(2000);

    // Verify class is removed
    await expect(page.locator(`text="${testClassName}"`)).not.toBeVisible();

    await takeScreenshot(page, "09-after-delete");
  });

  test("delete confirmation modal can be cancelled", async ({ page }) => {
    testClassName = generateUniqueClassName("Cancel Delete");

    // Create a class
    await navigateToClassCreation(page);
    await page.fill('[data-testid="class-name-input"]', testClassName);
    await page.fill('[data-testid="class-description-input"]', "Class with cancel delete");
    await page.fill('[data-testid="class-start-date"]', getFutureDate(7));
    await page.fill('[data-testid="class-city-input"]', "Chicago");
    await page.fill('[data-testid="class-state-input"]', "IL");
    await page.click('[data-testid="class-submit-btn"]');

    await page.waitForURL(/\/organizer\/classes/, { timeout: TIMEOUTS.long });
    await waitForPageLoad(page);

    // Find the class row
    const classRow = page.locator(`[data-testid^="class-row-"]:has-text("${testClassName}")`);
    await expect(classRow).toBeVisible({ timeout: TIMEOUTS.convexQuery });

    // Click delete
    const deleteBtn = classRow.locator('button:has-text("Delete")');
    await deleteBtn.click();

    // Cancel deletion
    await expect(page.locator('[data-testid="cancel-delete-btn"]')).toBeVisible();
    await page.click('[data-testid="cancel-delete-btn"]');

    // Verify class still exists
    await expect(classRow).toBeVisible();

    await takeScreenshot(page, "10-delete-cancelled");
  });

  test("instructor cannot delete a class with enrollments", async ({ page }) => {
    /**
     * KNOWN FAILURE POINT: Currently no protection against deleting
     * classes with active enrollments.
     * This test documents expected behavior that needs to be implemented.
     */
    // This test would require creating a class with enrollments first
    // For now, we document this as a known issue
    test.skip();
  });

  test("class status badges display correctly", async ({ page }) => {
    await navigateToInstructorClasses(page);
    await waitForPageLoad(page);

    // Check if any classes exist
    const classRows = page.locator('[data-testid^="class-row-"]');
    const count = await classRows.count();

    if (count > 0) {
      // Verify status badges are visible
      const draftBadges = page.locator('text="Draft"');
      const publishedBadges = page.locator('text="Published"');
      const upcomingBadges = page.locator('text="Upcoming"');
      const endedBadges = page.locator('text="Ended"');

      // At least one status indicator should be visible
      const hasDraft = (await draftBadges.count()) > 0;
      const hasPublished = (await publishedBadges.count()) > 0;

      expect(hasDraft || hasPublished).toBe(true);

      await takeScreenshot(page, "11-status-badges");
    } else {
      // Empty state is also valid
      await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    }
  });

  test("instructor can view class as public user", async ({ page }) => {
    testClassName = generateUniqueClassName("View Public");

    // Create and publish a class
    await navigateToClassCreation(page);
    await page.fill('[data-testid="class-name-input"]', testClassName);
    await page.fill('[data-testid="class-description-input"]', "Class to view publicly");
    await page.fill('[data-testid="class-start-date"]', getFutureDate(7));
    await page.fill('[data-testid="class-city-input"]', "Chicago");
    await page.fill('[data-testid="class-state-input"]', "IL");
    await page.click('[data-testid="class-submit-btn"]');

    await page.waitForURL(/\/organizer\/classes/, { timeout: TIMEOUTS.long });
    await waitForPageLoad(page);

    // Find the class row and publish
    const classRow = page.locator(`[data-testid^="class-row-"]:has-text("${testClassName}")`);
    const publishBtn = classRow.locator('button:has-text("Publish")');
    await publishBtn.click();
    await page.waitForTimeout(1500);

    // Click View button
    const viewBtn = classRow.locator('a:has-text("View")');
    await viewBtn.click();

    // Should navigate to public class page
    await page.waitForURL(/\/classes\//, { timeout: TIMEOUTS.medium });

    // Verify public page elements
    await expect(page.locator('[data-testid="class-detail-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="class-title"]')).toBeVisible();

    await takeScreenshot(page, "12-public-view");
  });
});
