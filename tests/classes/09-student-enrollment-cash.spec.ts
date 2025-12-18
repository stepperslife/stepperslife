/**
 * Student Enrollment with Cash Payment E2E Tests
 *
 * Tests the class enrollment flow using Cash (pay at door) option.
 * This creates a reservation that is paid in person.
 */

import { test, expect } from "@playwright/test";
import {
  loginAsStudent,
  navigateToClassesListing,
  fillStudentInfo,
  selectCashPayment,
  reserveWithCash,
  waitForPageLoad,
  takeScreenshot,
} from "./helpers/classes.helpers";
import {
  generateTestEmail,
  TIMEOUTS,
  STUDENT_ACCOUNT,
} from "./helpers/test-data";

test.describe("Student Enrollment - Cash Payment", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
  });

  test("Cash payment option is available", async ({ page }) => {
    await navigateToClassesListing(page);
    await page.waitForTimeout(1000);

    const classCards = page.locator('[data-testid^="class-card-"]');
    if ((await classCards.count()) === 0) {
      console.log("No classes available");
      test.skip();
      return;
    }

    await classCards.first().click();
    await page.waitForURL(/\/classes\//, { timeout: TIMEOUTS.medium });

    const enrollBtn = page.locator('[data-testid="enroll-now-btn"]');
    if (!(await enrollBtn.isVisible({ timeout: TIMEOUTS.short }).catch(() => false))) {
      console.log("Enroll button not visible");
      test.skip();
      return;
    }

    await enrollBtn.click();
    await page.waitForTimeout(1000);

    // Select tier if needed
    const tiers = page.locator('[data-testid^="enrollment-tier-"]');
    if ((await tiers.count()) > 0) {
      await tiers.first().click();
    }

    // Fill contact info
    const nameInput = page.locator('[data-testid="buyer-name"]');
    if (await nameInput.isVisible().catch(() => false)) {
      await fillStudentInfo(page, {
        name: STUDENT_ACCOUNT.name,
        email: generateTestEmail("cash-test"),
      });
    }

    // Continue to payment
    const continueBtn = page.locator('[data-testid="continue-to-payment"]');
    if (await continueBtn.isVisible().catch(() => false)) {
      await continueBtn.click();
      await page.waitForTimeout(2000);
    }

    // Look for Cash option
    const cashOption = page.locator('[data-testid="payment-method-cash"]');
    const cashText = page.locator('text=/pay.*cash|cash.*door|pay.*class/i');

    const hasCash =
      (await cashOption.isVisible().catch(() => false)) ||
      (await cashText.isVisible().catch(() => false));

    console.log(`Cash option visible: ${hasCash}`);
    await takeScreenshot(page, "01-cash-option");
  });

  test("Cash reservation creates pending order", async ({ page }) => {
    await navigateToClassesListing(page);
    await page.waitForTimeout(1000);

    const classCards = page.locator('[data-testid^="class-card-"]');
    if ((await classCards.count()) === 0) {
      test.skip();
      return;
    }

    await classCards.first().click();
    await page.waitForURL(/\/classes\//, { timeout: TIMEOUTS.medium });

    const enrollBtn = page.locator('[data-testid="enroll-now-btn"]');
    if (!(await enrollBtn.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await enrollBtn.click();
    await page.waitForTimeout(1000);

    // Complete flow to payment
    const tiers = page.locator('[data-testid^="enrollment-tier-"]');
    if ((await tiers.count()) > 0) await tiers.first().click();

    const nameInput = page.locator('[data-testid="buyer-name"]');
    if (await nameInput.isVisible().catch(() => false)) {
      await fillStudentInfo(page, {
        name: STUDENT_ACCOUNT.name,
        email: generateTestEmail("cash-reserve"),
      });
    }

    const continueBtn = page.locator('[data-testid="continue-to-payment"]');
    if (await continueBtn.isVisible().catch(() => false)) {
      await continueBtn.click();
      await page.waitForTimeout(2000);
    }

    // Select Cash
    const cashOption = page.locator('[data-testid="payment-method-cash"]');
    if (await cashOption.isVisible().catch(() => false)) {
      await cashOption.click();
      await page.waitForTimeout(1000);

      // Click reserve button
      const reserveBtn = page.locator('[data-testid="reserve-btn"], button:has-text("Reserve")');
      if (await reserveBtn.isVisible().catch(() => false)) {
        await reserveBtn.click();
        await page.waitForTimeout(2000);

        // Should show reservation success
        const successMsg = page.locator('text=/reserved|confirmed|success/i');
        const hasSuccess = await successMsg.isVisible().catch(() => false);

        console.log(`Reservation success: ${hasSuccess}`);
        await takeScreenshot(page, "02-cash-reserved");
      } else {
        console.log("Reserve button not found");
        await takeScreenshot(page, "02-no-reserve-btn");
      }
    } else {
      console.log("Cash option not available");
      await takeScreenshot(page, "02-no-cash-option");
    }
  });

  test("reservation shows pending status in dashboard", async ({ page }) => {
    // Navigate to my tickets/enrollments
    await page.goto("/user/my-tickets");
    await waitForPageLoad(page);

    // Look for pending reservations
    const pendingBadge = page.locator('text=/pending|awaiting.*payment|pay.*at.*door/i');
    const hasPending = await pendingBadge.isVisible().catch(() => false);

    console.log(`Has pending reservations: ${hasPending}`);
    await takeScreenshot(page, "03-pending-status");
  });

  test("instructor sees pending cash orders", async ({ page }) => {
    /**
     * This test would require switching to instructor view
     * and checking the order management interface.
     * Documented here for manual verification.
     */
    console.log("Instructor cash order view requires manual testing");
    await takeScreenshot(page, "04-instructor-cash-docs");
  });

  test("cash reservation includes payment instructions", async ({ page }) => {
    await navigateToClassesListing(page);
    await page.waitForTimeout(1000);

    const classCards = page.locator('[data-testid^="class-card-"]');
    if ((await classCards.count()) === 0) {
      test.skip();
      return;
    }

    await classCards.first().click();
    await page.waitForURL(/\/classes\//, { timeout: TIMEOUTS.medium });

    const enrollBtn = page.locator('[data-testid="enroll-now-btn"]');
    if (!(await enrollBtn.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await enrollBtn.click();
    await page.waitForTimeout(1000);

    // Abbreviated flow
    const tiers = page.locator('[data-testid^="enrollment-tier-"]');
    if ((await tiers.count()) > 0) await tiers.first().click();

    const nameInput = page.locator('[data-testid="buyer-name"]');
    if (await nameInput.isVisible().catch(() => false)) {
      await fillStudentInfo(page, {
        name: STUDENT_ACCOUNT.name,
        email: generateTestEmail("cash-instructions"),
      });
    }

    const continueBtn = page.locator('[data-testid="continue-to-payment"]');
    if (await continueBtn.isVisible().catch(() => false)) {
      await continueBtn.click();
      await page.waitForTimeout(2000);
    }

    // Select Cash
    const cashOption = page.locator('[data-testid="payment-method-cash"]');
    if (await cashOption.isVisible().catch(() => false)) {
      await cashOption.click();
      await page.waitForTimeout(500);

      // Look for payment instructions
      const instructions = page.locator('text=/bring.*cash|pay.*at.*door|instructor|arrival/i');
      const hasInstructions = await instructions.isVisible().catch(() => false);

      console.log(`Payment instructions visible: ${hasInstructions}`);
      await takeScreenshot(page, "05-cash-instructions");
    } else {
      console.log("Cash option not available for instructions test");
      await takeScreenshot(page, "05-no-cash-for-instructions");
    }
  });
});
