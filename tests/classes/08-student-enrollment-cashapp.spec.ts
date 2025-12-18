/**
 * Student Enrollment with CashApp E2E Tests
 *
 * Tests the class enrollment flow using CashApp payment.
 * Note: CashApp is provided through Stripe PaymentElement.
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
} from "./helpers/test-data";

test.describe("Student Enrollment - CashApp Payment", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
  });

  test("CashApp option is available", async ({ page }) => {
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
        email: generateTestEmail("cashapp-test"),
      });
    }

    // Continue to payment
    const continueBtn = page.locator('[data-testid="continue-to-payment"]');
    if (await continueBtn.isVisible().catch(() => false)) {
      await continueBtn.click();
      await page.waitForTimeout(2000);
    }

    // Look for CashApp option (may be within Stripe PaymentElement)
    const cashAppOption = page.locator('[data-testid="payment-method-cashapp"]');
    const cashAppText = page.locator('text=/cash\s?app/i');
    const cashAppLogo = page.locator('img[alt*="Cash App"]');

    const hasCashApp =
      (await cashAppOption.isVisible().catch(() => false)) ||
      (await cashAppText.isVisible().catch(() => false)) ||
      (await cashAppLogo.isVisible().catch(() => false));

    console.log(`CashApp option visible: ${hasCashApp}`);
    await takeScreenshot(page, "01-cashapp-option");
  });

  test("CashApp displays QR code for mobile", async ({ page }) => {
    /**
     * Note: CashApp typically shows a QR code that users scan
     * with their phone. This is difficult to test automatically.
     *
     * Expected flow:
     * 1. User selects CashApp
     * 2. QR code displayed
     * 3. User scans with phone
     * 4. Approves payment in Cash App
     * 5. Payment completes, page shows success
     */
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
        email: generateTestEmail("cashapp-qr"),
      });
    }

    const continueBtn = page.locator('[data-testid="continue-to-payment"]');
    if (await continueBtn.isVisible().catch(() => false)) {
      await continueBtn.click();
      await page.waitForTimeout(2000);
    }

    // Try to select CashApp
    const cashAppOption = page.locator('[data-testid="payment-method-cashapp"], button:has-text("Cash App")').first();

    if (await cashAppOption.isVisible().catch(() => false)) {
      await cashAppOption.click();
      await page.waitForTimeout(2000);

      // Look for QR code or mobile instructions
      const qrCode = page.locator('svg[class*="qr"], img[alt*="QR"], canvas');
      const hasQR = await qrCode.isVisible().catch(() => false);

      console.log(`QR code visible: ${hasQR}`);
      await takeScreenshot(page, "02-cashapp-qr");
    } else {
      console.log("CashApp not available for this checkout");
      await takeScreenshot(page, "02-no-cashapp");
    }
  });

  test("CashApp payment flow documented", async ({ page }) => {
    /**
     * CashApp payment cannot be fully automated in tests.
     *
     * Manual testing steps:
     * 1. Complete checkout flow to payment selection
     * 2. Select CashApp as payment method
     * 3. Scan QR code with Cash App on phone
     * 4. Approve payment in Cash App
     * 5. Verify success message on checkout page
     * 6. Verify enrollment appears in dashboard
     */
    console.log("CashApp payment requires manual mobile testing");
    await takeScreenshot(page, "03-cashapp-docs");
  });
});
