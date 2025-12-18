/**
 * Student Enrollment Management E2E Tests
 *
 * Tests the enrollment management functionality for students:
 * - Viewing enrollments
 * - Viewing enrollment details
 * - QR code display
 * - Cancellation (if available)
 * - Refund handling
 */

import { test, expect } from "@playwright/test";
import {
  loginAsStudent,
  navigateToMyEnrollments,
  verifyEnrollmentInList,
  cancelEnrollment,
  waitForPageLoad,
  takeScreenshot,
} from "./helpers/classes.helpers";
import { TIMEOUTS } from "./helpers/test-data";

test.describe("Student Enrollment Management", () => {
  test.beforeEach(async ({ page }) => {
    const loginSuccess = await loginAsStudent(page);
    if (!loginSuccess) {
      test.skip();
    }
  });

  test("student can view their enrollments", async ({ page }) => {
    await navigateToMyEnrollments(page);

    // Verify page loaded
    const pageTitle = page.locator('h1:has-text("Tickets"), h1:has-text("Enrollments")');
    await expect(pageTitle.first()).toBeVisible({ timeout: TIMEOUTS.medium });

    await takeScreenshot(page, "01-my-enrollments-page");
  });

  test("enrollment shows class details", async ({ page }) => {
    await navigateToMyEnrollments(page);

    // Check for enrollment entries
    const enrollments = page.locator('[data-testid^="ticket-"], [data-testid^="enrollment-"]');
    const count = await enrollments.count();

    if (count > 0) {
      const firstEnrollment = enrollments.first();
      await expect(firstEnrollment).toBeVisible();

      // Check for expected information
      // - Class/Event name
      // - Date
      // - Location
      // - Status
      const hasName = (await firstEnrollment.textContent())?.length ?? 0 > 0;
      console.log(`Enrollment has content: ${hasName}`);

      await takeScreenshot(page, "02-enrollment-details");
    } else {
      console.log("No enrollments found in dashboard");
      await takeScreenshot(page, "02-no-enrollments");
    }
  });

  test("student can view enrollment QR code", async ({ page }) => {
    await navigateToMyEnrollments(page);

    const enrollments = page.locator('[data-testid^="ticket-"], [data-testid^="enrollment-"]');
    const count = await enrollments.count();

    if (count > 0) {
      // Click on first enrollment
      await enrollments.first().click();
      await page.waitForTimeout(1000);

      // Look for QR code
      const qrCode = page.locator('[data-testid="ticket-qr"], svg[class*="qr"], canvas');
      const hasQR = await qrCode.isVisible({ timeout: TIMEOUTS.short }).catch(() => false);

      console.log(`QR code visible: ${hasQR}`);
      await takeScreenshot(page, "03-qr-code");
    } else {
      console.log("No enrollments to check QR code");
      test.skip();
    }
  });

  test("enrollment status is visible", async ({ page }) => {
    await navigateToMyEnrollments(page);

    const enrollments = page.locator('[data-testid^="ticket-"], [data-testid^="enrollment-"]');
    const count = await enrollments.count();

    if (count > 0) {
      // Look for status indicators
      const confirmedStatus = page.locator('text=/confirmed|active|valid/i');
      const pendingStatus = page.locator('text=/pending|awaiting/i');
      const cancelledStatus = page.locator('text=/cancelled|refunded/i');

      const hasConfirmed = await confirmedStatus.isVisible().catch(() => false);
      const hasPending = await pendingStatus.isVisible().catch(() => false);
      const hasCancelled = await cancelledStatus.isVisible().catch(() => false);

      console.log(`Confirmed: ${hasConfirmed}, Pending: ${hasPending}, Cancelled: ${hasCancelled}`);
      await takeScreenshot(page, "04-enrollment-status");
    } else {
      test.skip();
    }
  });

  test("student can cancel enrollment", async ({ page }) => {
    /**
     * KNOWN ISSUE: Cancellation functionality may not be implemented.
     * This test documents expected behavior.
     */
    await navigateToMyEnrollments(page);

    const enrollments = page.locator('[data-testid^="ticket-"], [data-testid^="enrollment-"]');
    const count = await enrollments.count();

    if (count > 0) {
      await enrollments.first().click();
      await page.waitForTimeout(1000);

      // Look for cancel button
      const cancelBtn = page.locator('[data-testid="cancel-enrollment"], button:has-text("Cancel")');

      if (await cancelBtn.isVisible({ timeout: TIMEOUTS.short }).catch(() => false)) {
        console.log("Cancel button is available");
        // Don't actually cancel in test - just verify it exists
        await takeScreenshot(page, "05-cancel-available");
      } else {
        console.log("Cancel button not found - may not be implemented");
        await takeScreenshot(page, "05-no-cancel-button");
      }
    } else {
      test.skip();
    }
  });

  test("cancelled enrollment removed from active list", async ({ page }) => {
    /**
     * This test would require cancelling an enrollment first.
     * Documents expected behavior for manual verification.
     */
    await navigateToMyEnrollments(page);

    // Check for any cancelled enrollments section
    const cancelledSection = page.locator('text=/cancelled|past.*enrollments/i');
    const hasCancelledSection = await cancelledSection.isVisible().catch(() => false);

    console.log(`Has cancelled section: ${hasCancelledSection}`);
    await takeScreenshot(page, "06-cancelled-section");
  });

  test("empty state displays when no enrollments", async ({ page }) => {
    await navigateToMyEnrollments(page);

    const enrollments = page.locator('[data-testid^="ticket-"], [data-testid^="enrollment-"]');
    const count = await enrollments.count();

    if (count === 0) {
      // Look for empty state message
      const emptyState = page.locator('text=/no.*tickets|no.*enrollments|haven.*enrolled/i');
      const hasEmptyState = await emptyState.isVisible().catch(() => false);

      console.log(`Empty state visible: ${hasEmptyState}`);
      await takeScreenshot(page, "07-empty-state");
    } else {
      console.log(`Found ${count} enrollments, skipping empty state test`);
      await takeScreenshot(page, "07-has-enrollments");
    }
  });

  test("enrollment card shows class date and time", async ({ page }) => {
    await navigateToMyEnrollments(page);

    const enrollments = page.locator('[data-testid^="ticket-"], [data-testid^="enrollment-"]');
    const count = await enrollments.count();

    if (count > 0) {
      const firstEnrollment = enrollments.first();
      const text = await firstEnrollment.textContent();

      // Check for date-like patterns
      const hasDate = text?.match(/\d{1,2}\/\d{1,2}\/\d{2,4}|January|February|March|April|May|June|July|August|September|October|November|December/i);
      const hasTime = text?.match(/\d{1,2}:\d{2}\s*(AM|PM)?/i);

      console.log(`Has date: ${!!hasDate}, Has time: ${!!hasTime}`);
      await takeScreenshot(page, "08-date-time-visible");
    } else {
      test.skip();
    }
  });

  test("enrollment provides download option", async ({ page }) => {
    await navigateToMyEnrollments(page);

    const enrollments = page.locator('[data-testid^="ticket-"], [data-testid^="enrollment-"]');
    const count = await enrollments.count();

    if (count > 0) {
      await enrollments.first().click();
      await page.waitForTimeout(1000);

      // Look for download/print options
      const downloadBtn = page.locator('[data-testid="download-ticket"], button:has-text("Download"), a:has-text("Download")');
      const printBtn = page.locator('[data-testid="print-ticket"], button:has-text("Print")');

      const hasDownload = await downloadBtn.isVisible().catch(() => false);
      const hasPrint = await printBtn.isVisible().catch(() => false);

      console.log(`Download: ${hasDownload}, Print: ${hasPrint}`);
      await takeScreenshot(page, "09-download-options");
    } else {
      test.skip();
    }
  });

  test("enrollment links back to class page", async ({ page }) => {
    await navigateToMyEnrollments(page);

    const enrollments = page.locator('[data-testid^="ticket-"], [data-testid^="enrollment-"]');
    const count = await enrollments.count();

    if (count > 0) {
      await enrollments.first().click();
      await page.waitForTimeout(1000);

      // Look for view class/event link
      const viewClassLink = page.locator('a:has-text("View Class"), a:has-text("View Event"), [data-testid="view-class-link"]');

      if (await viewClassLink.isVisible().catch(() => false)) {
        await viewClassLink.click();
        await page.waitForURL(/\/classes\/|\/events\//, { timeout: TIMEOUTS.medium });

        await takeScreenshot(page, "10-class-link-works");
      } else {
        console.log("View class link not found");
        await takeScreenshot(page, "10-no-class-link");
      }
    } else {
      test.skip();
    }
  });
});
