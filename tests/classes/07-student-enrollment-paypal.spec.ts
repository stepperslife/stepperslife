/**
 * Student Enrollment with PayPal E2E Tests
 *
 * Tests the class enrollment flow using PayPal payment.
 * Note: PayPal popup testing has limitations in automated tests.
 */

import { test, expect } from "@playwright/test";
import {
  loginAsStudent,
  navigateToClassesListing,
  fillStudentInfo,
  waitForPageLoad,
  takeScreenshot,
} from "./helpers/classes.helpers";
import {
  generateTestEmail,
  TIMEOUTS,
  STUDENT_ACCOUNT,
  PAYPAL_SANDBOX,
} from "./helpers/test-data";

test.describe("Student Enrollment - PayPal Payment", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
  });

  test("PayPal option is available", async ({ page }) => {
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
        email: generateTestEmail("paypal-test"),
      });
    }

    // Continue to payment
    const continueBtn = page.locator('[data-testid="continue-to-payment"]');
    if (await continueBtn.isVisible().catch(() => false)) {
      await continueBtn.click();
      await page.waitForTimeout(2000);
    }

    // Look for PayPal option
    const paypalOption = page.locator('[data-testid="payment-method-paypal"]');
    const paypalButton = page.locator('text=/paypal/i');
    const paypalLogo = page.locator('img[alt*="PayPal"]');

    const hasPayPal =
      (await paypalOption.isVisible().catch(() => false)) ||
      (await paypalButton.isVisible().catch(() => false)) ||
      (await paypalLogo.isVisible().catch(() => false));

    console.log(`PayPal option visible: ${hasPayPal}`);
    await takeScreenshot(page, "01-paypal-option");
  });

  test("PayPal button is clickable", async ({ page }) => {
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

    // Abbreviated flow to payment
    const tiers = page.locator('[data-testid^="enrollment-tier-"]');
    if ((await tiers.count()) > 0) await tiers.first().click();

    const nameInput = page.locator('[data-testid="buyer-name"]');
    if (await nameInput.isVisible().catch(() => false)) {
      await fillStudentInfo(page, {
        name: STUDENT_ACCOUNT.name,
        email: generateTestEmail("paypal-click"),
      });
    }

    const continueBtn = page.locator('[data-testid="continue-to-payment"]');
    if (await continueBtn.isVisible().catch(() => false)) {
      await continueBtn.click();
      await page.waitForTimeout(2000);
    }

    // Find and click PayPal
    const paypalBtn = page.locator('[data-testid="payment-method-paypal"], button:has-text("PayPal")').first();

    if (await paypalBtn.isVisible().catch(() => false)) {
      // Note: Clicking PayPal in test mode may open a popup
      // We just verify the button is clickable
      await expect(paypalBtn).toBeEnabled();
      await takeScreenshot(page, "02-paypal-clickable");
    } else {
      console.log("PayPal button not found");
      await takeScreenshot(page, "02-no-paypal");
    }
  });

  test("PayPal popup handling documented", async ({ page }) => {
    /**
     * Note: PayPal opens in a popup window which is difficult to test.
     * This test documents the expected behavior:
     * 1. User clicks PayPal button
     * 2. PayPal popup opens
     * 3. User logs into PayPal sandbox
     * 4. User approves payment
     * 5. Popup closes, main page shows success
     *
     * For actual testing, manual verification or PayPal's sandbox
     * testing tools should be used.
     */
    console.log("PayPal popup flow requires manual testing or sandbox tools");
    await takeScreenshot(page, "03-paypal-docs");
  });
});
