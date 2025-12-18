/**
 * Classes E2E Test Helper Functions
 * Core utilities for testing instructor and student class workflows
 */

import { Page, expect } from "@playwright/test";
import {
  INSTRUCTOR_ACCOUNT,
  STUDENT_ACCOUNT,
  ADMIN_ACCOUNT,
  TestAccount,
} from "./test-accounts";
import {
  TEST_CLASS_DATA,
  CLASS_URLS,
  TIMEOUTS,
  ClassFormData,
  StudentInfo,
  EnrollmentConfirmation,
  EnrollmentStats,
  Enrollee,
  ClassCategory,
  generateUniqueClassName,
  getFutureDate,
} from "./test-data";

// ============================================================
// UTILITY HELPERS
// ============================================================

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(
  page: Page,
  timeout = TIMEOUTS.pageLoad
): Promise<void> {
  await page.waitForLoadState("domcontentloaded", { timeout });
  // Don't wait for networkidle - Convex keeps connections open
  // Just wait for load and give time for React hydration
  await page.waitForLoadState("load", { timeout });
  await page.waitForTimeout(1000);
}

/**
 * Take a screenshot with timestamp
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  await page.screenshot({
    path: `test-results/classes/${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Safe click with wait and retry
 */
export async function safeClick(
  page: Page,
  selector: string,
  options?: { timeout?: number; force?: boolean }
): Promise<void> {
  const element = page.locator(selector);
  await element.waitFor({ state: "visible", timeout: options?.timeout || TIMEOUTS.medium });
  await element.click({ force: options?.force });
}

// ============================================================
// AUTHENTICATION HELPERS
// ============================================================

/**
 * Login with credentials
 */
export async function loginUser(
  page: Page,
  credentials: { email: string; password: string }
): Promise<boolean> {
  try {
    await page.goto(CLASS_URLS.login);
    await waitForPageLoad(page);

    // Wait for password login toggle and click it
    const passwordToggle = page.locator('[data-testid="password-login-toggle"]');
    if (await passwordToggle.isVisible({ timeout: TIMEOUTS.short }).catch(() => false)) {
      await passwordToggle.click();
    }

    // Fill login form
    await page.fill('[data-testid="login-email"]', credentials.email);
    await page.fill('[data-testid="login-password"]', credentials.password);

    // Submit form
    await page.click('[data-testid="login-submit"]');

    // Wait for navigation away from login
    await page.waitForURL((url) => !url.pathname.includes("/login"), {
      timeout: TIMEOUTS.medium,
    });

    console.log(`Login successful for: ${credentials.email}`);
    return true;
  } catch (error) {
    console.error(`Login failed for: ${credentials.email}`, error);
    await takeScreenshot(page, "login-failed");
    return false;
  }
}

/**
 * Login as instructor
 */
export async function loginAsInstructor(page: Page): Promise<boolean> {
  return loginUser(page, {
    email: INSTRUCTOR_ACCOUNT.email,
    password: INSTRUCTOR_ACCOUNT.password,
  });
}

/**
 * Login as student
 */
export async function loginAsStudent(page: Page): Promise<boolean> {
  return loginUser(page, {
    email: STUDENT_ACCOUNT.email,
    password: STUDENT_ACCOUNT.password,
  });
}

/**
 * Login as admin
 */
export async function loginAsAdmin(page: Page): Promise<boolean> {
  return loginUser(page, {
    email: ADMIN_ACCOUNT.email,
    password: ADMIN_ACCOUNT.password,
  });
}

/**
 * Logout current user
 */
export async function logout(page: Page): Promise<void> {
  const logoutButton = page.locator('[data-testid="logout-button"]');
  if (await logoutButton.isVisible({ timeout: TIMEOUTS.short }).catch(() => false)) {
    await logoutButton.click();
    await page.waitForURL(/\/(login)?$/, { timeout: TIMEOUTS.medium });
    return;
  }

  // Try user menu dropdown
  const userMenu = page.locator('[data-testid="user-menu"]');
  if (await userMenu.isVisible({ timeout: TIMEOUTS.short }).catch(() => false)) {
    await userMenu.click();
    await page.click('[data-testid="logout-menu-item"]');
    await page.waitForURL(/\/(login)?$/, { timeout: TIMEOUTS.medium });
  }
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  const indicators = [
    '[data-testid="user-menu"]',
    '[data-testid="my-tickets-link"]',
    '[data-testid="dashboard-link"]',
  ];

  for (const selector of indicators) {
    if (await page.locator(selector).isVisible({ timeout: 1000 }).catch(() => false)) {
      return true;
    }
  }
  return false;
}

// ============================================================
// CLASS CREATION HELPERS
// ============================================================

/**
 * Navigate to class creation page
 */
export async function navigateToClassCreation(page: Page): Promise<void> {
  await page.goto(CLASS_URLS.create);
  await waitForPageLoad(page);
  await page.waitForSelector('[data-testid="class-form"]', {
    timeout: TIMEOUTS.medium,
  });
}

/**
 * Fill the class creation form
 */
export async function fillClassForm(
  page: Page,
  classData: Partial<ClassFormData>
): Promise<void> {
  const data = {
    name: classData.name || generateUniqueClassName(),
    description: classData.description || TEST_CLASS_DATA.description,
    categories: classData.categories || ["Beginner", "Chicago Stepping"],
    startDate: classData.startDate || getFutureDate(7),
    endDate: classData.endDate,
    venueName: classData.venueName || TEST_CLASS_DATA.venueName,
    address: classData.address || TEST_CLASS_DATA.address,
    city: classData.city || TEST_CLASS_DATA.city,
    state: classData.state || TEST_CLASS_DATA.state,
    zipCode: classData.zipCode || TEST_CLASS_DATA.zipCode,
    country: classData.country || TEST_CLASS_DATA.country,
  };

  // Basic Info
  await page.fill('[data-testid="class-name-input"]', data.name);
  await page.fill('[data-testid="class-description-input"]', data.description);

  // Categories
  for (const category of data.categories as ClassCategory[]) {
    const categoryBtn = page.locator(`[data-testid="class-category-${category.toLowerCase().replace(/\s+/g, "-")}"]`);
    if (await categoryBtn.isVisible().catch(() => false)) {
      await categoryBtn.click();
    }
  }

  // Date & Time
  await page.fill('[data-testid="class-start-date"]', data.startDate);
  if (data.endDate) {
    await page.fill('[data-testid="class-end-date"]', data.endDate);
  }

  // Location
  if (data.venueName) {
    await page.fill('[data-testid="class-venue-input"]', data.venueName);
  }
  if (data.address) {
    await page.fill('[data-testid="class-address-input"]', data.address);
  }
  await page.fill('[data-testid="class-city-input"]', data.city);
  await page.fill('[data-testid="class-state-input"]', data.state);
  if (data.zipCode) {
    await page.fill('[data-testid="class-zip-input"]', data.zipCode);
  }
}

/**
 * Select categories for a class
 */
export async function selectClassCategories(
  page: Page,
  categories: ClassCategory[]
): Promise<void> {
  for (const category of categories) {
    const selector = `[data-testid="class-category-${category.toLowerCase().replace(/\s+/g, "-")}"]`;
    const btn = page.locator(selector);
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
    }
  }
}

/**
 * Upload an image for the class
 */
export async function uploadClassImage(
  page: Page,
  imagePath?: string
): Promise<void> {
  const uploadInput = page.locator('[data-testid="class-image-upload"] input[type="file"]');
  if (await uploadInput.isVisible({ timeout: TIMEOUTS.short }).catch(() => false)) {
    // Use a test image if no path provided
    const path = imagePath || "tests/fixtures/test-class-image.jpg";
    await uploadInput.setInputFiles(path);
    // Wait for upload to complete
    await page.waitForTimeout(2000);
  }
}

/**
 * Submit the class form
 */
export async function submitClassForm(page: Page): Promise<string | null> {
  await page.click('[data-testid="class-submit-btn"]');

  // Wait for navigation or success message
  try {
    await page.waitForURL(/\/organizer\/classes/, { timeout: TIMEOUTS.long });

    // Extract class ID from URL if redirected to edit page
    const url = page.url();
    const match = url.match(/\/organizer\/classes\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  } catch {
    // Check for success message
    const successMsg = page.locator('[data-testid="class-create-success"]');
    if (await successMsg.isVisible({ timeout: TIMEOUTS.short }).catch(() => false)) {
      return "created";
    }
    return null;
  }
}

/**
 * Create a class with all defaults (complete flow)
 */
export async function createClassComplete(
  page: Page,
  classData?: Partial<ClassFormData>
): Promise<string> {
  await navigateToClassCreation(page);
  await fillClassForm(page, classData || {});
  const classId = await submitClassForm(page);
  if (!classId) {
    throw new Error("Failed to create class");
  }
  return classId;
}

// ============================================================
// CLASS MANAGEMENT HELPERS
// ============================================================

/**
 * Navigate to instructor's class dashboard
 */
export async function navigateToInstructorClasses(page: Page): Promise<void> {
  await page.goto(CLASS_URLS.instructorDashboard);
  await waitForPageLoad(page);
  await page.waitForSelector('[data-testid="organizer-classes-page"]', {
    timeout: TIMEOUTS.medium,
  });
}

/**
 * Find a class by name in the instructor dashboard
 */
export async function findClassByName(
  page: Page,
  className: string
): Promise<boolean> {
  await navigateToInstructorClasses(page);
  const classRow = page.locator(`text=${className}`);
  return await classRow.isVisible({ timeout: TIMEOUTS.medium }).catch(() => false);
}

/**
 * Edit a class
 */
export async function editClass(page: Page, classId: string): Promise<void> {
  await page.click(`[data-testid="class-edit-btn-${classId}"]`);
  await page.waitForURL(/\/organizer\/classes\/.*\/edit/, {
    timeout: TIMEOUTS.medium,
  });
  await waitForPageLoad(page);
}

/**
 * Publish a class
 */
export async function publishClass(page: Page, classId: string): Promise<void> {
  const publishBtn = page.locator(`[data-testid="class-publish-btn-${classId}"]`);
  await publishBtn.click();

  // Wait for status to update
  await page.waitForTimeout(1000);
}

/**
 * Unpublish a class
 */
export async function unpublishClass(
  page: Page,
  classId: string
): Promise<void> {
  const unpublishBtn = page.locator(`[data-testid="class-publish-btn-${classId}"]`);
  await unpublishBtn.click();
  await page.waitForTimeout(1000);
}

/**
 * Delete a class
 */
export async function deleteClass(page: Page, classId: string): Promise<void> {
  await page.click(`[data-testid="class-delete-btn-${classId}"]`);

  // Confirm deletion in modal
  const confirmBtn = page.locator('[data-testid="confirm-delete-btn"]');
  if (await confirmBtn.isVisible({ timeout: TIMEOUTS.short }).catch(() => false)) {
    await confirmBtn.click();
  }

  // Wait for class to be removed
  await page.waitForTimeout(1000);
}

/**
 * View a class as public user
 */
export async function viewClassAsPublic(
  page: Page,
  classId: string
): Promise<void> {
  await page.click(`[data-testid="class-view-btn-${classId}"]`);
  await page.waitForURL(/\/classes\//, { timeout: TIMEOUTS.medium });
}

// ============================================================
// CLASS BROWSING HELPERS (STUDENT)
// ============================================================

/**
 * Navigate to classes listing page
 */
export async function navigateToClassesListing(page: Page): Promise<void> {
  await page.goto(CLASS_URLS.listing);
  await waitForPageLoad(page);
  await page.waitForSelector('[data-testid="classes-page"]', {
    timeout: TIMEOUTS.medium,
  });
}

/**
 * Search for classes
 */
export async function searchClasses(
  page: Page,
  searchTerm: string
): Promise<void> {
  const searchInput = page.locator('[data-testid="classes-search-input"]');
  await searchInput.fill(searchTerm);
  // Wait for debounce and results to update
  await page.waitForTimeout(500);
}

/**
 * Filter classes by category
 */
export async function filterByCategory(
  page: Page,
  category: string
): Promise<void> {
  const categoryFilter = page.locator('[data-testid="classes-category-filter"]');
  await categoryFilter.click();
  await page.click(`text=${category}`);
  await page.waitForTimeout(500);
}

/**
 * Toggle past classes visibility
 */
export async function togglePastClasses(
  page: Page,
  show: boolean
): Promise<void> {
  const toggle = page.locator('[data-testid="classes-past-toggle"]');
  const isChecked = await toggle.isChecked().catch(() => false);
  if (isChecked !== show) {
    await toggle.click();
    await page.waitForTimeout(500);
  }
}

/**
 * Switch view mode (Grid/List/Masonry)
 */
export async function switchViewMode(
  page: Page,
  mode: "grid" | "list" | "masonry"
): Promise<void> {
  await page.click(`[data-testid="view-toggle-${mode}"]`);
  await page.waitForTimeout(300);
}

/**
 * Get count of visible classes
 */
export async function getVisibleClassCount(page: Page): Promise<number> {
  const cards = page.locator('[data-testid^="class-card-"]');
  return await cards.count();
}

/**
 * Click on a class card
 */
export async function clickOnClass(
  page: Page,
  classNameOrId: string
): Promise<boolean> {
  // Try by ID first
  const cardById = page.locator(`[data-testid="class-card-${classNameOrId}"]`);
  if (await cardById.isVisible({ timeout: TIMEOUTS.short }).catch(() => false)) {
    await cardById.click();
    await page.waitForURL(/\/classes\//, { timeout: TIMEOUTS.medium });
    return true;
  }

  // Try by name
  const cardByName = page.locator(`[data-testid^="class-card-"]:has-text("${classNameOrId}")`);
  if (await cardByName.isVisible({ timeout: TIMEOUTS.short }).catch(() => false)) {
    await cardByName.click();
    await page.waitForURL(/\/classes\//, { timeout: TIMEOUTS.medium });
    return true;
  }

  return false;
}

// ============================================================
// CLASS DETAIL HELPERS
// ============================================================

/**
 * Verify class detail page content
 */
export async function verifyClassDetailPage(page: Page): Promise<{
  title: string;
  description: string;
  date: string;
  location: string;
  instructor: string;
}> {
  await page.waitForSelector('[data-testid="class-detail-page"]', {
    timeout: TIMEOUTS.medium,
  });

  return {
    title: (await page.locator('[data-testid="class-title"]').textContent()) || "",
    description: (await page.locator('[data-testid="class-description"]').textContent()) || "",
    date: (await page.locator('[data-testid="class-date"]').textContent()) || "",
    location: (await page.locator('[data-testid="class-location"]').textContent()) || "",
    instructor: (await page.locator('[data-testid="class-instructor"]').textContent()) || "",
  };
}

/**
 * Click Enroll Now button
 */
export async function clickEnrollNow(page: Page): Promise<void> {
  await page.click('[data-testid="enroll-now-btn"]');
  await page.waitForTimeout(500);
}

/**
 * Share class
 */
export async function shareClass(page: Page): Promise<void> {
  await page.click('[data-testid="share-btn"]');
  await page.waitForTimeout(500);
}

// ============================================================
// ENROLLMENT/CHECKOUT HELPERS
// ============================================================

/**
 * Select enrollment tier
 */
export async function selectEnrollmentTier(
  page: Page,
  tierName: string,
  quantity: number = 1
): Promise<void> {
  const tier = page.locator(`[data-testid="enrollment-tier-${tierName.toLowerCase().replace(/\s+/g, "-")}"]`);
  await tier.click();

  if (quantity > 1) {
    const quantityInput = page.locator('[data-testid="enrollment-quantity"]');
    await quantityInput.fill(quantity.toString());
  }
}

/**
 * Fill student/buyer info
 */
export async function fillStudentInfo(
  page: Page,
  studentInfo: StudentInfo
): Promise<void> {
  await page.fill('[data-testid="buyer-name"]', studentInfo.name);
  await page.fill('[data-testid="buyer-email"]', studentInfo.email);
  if (studentInfo.phone) {
    await page.fill('[data-testid="buyer-phone"]', studentInfo.phone);
  }
}

/**
 * Proceed to payment
 */
export async function proceedToPayment(page: Page): Promise<void> {
  await page.click('[data-testid="continue-to-payment"]');
  await page.waitForTimeout(500);
}

/**
 * Fill Stripe card details
 */
export async function fillStripeCard(
  page: Page,
  card: { number: string; expiry: string; cvc: string; zip: string }
): Promise<void> {
  // Wait for Stripe iframe to load
  await page.waitForTimeout(2000);

  const stripeFrame = page.frameLocator('iframe[name*="__privateStripeFrame"]').first();

  // Card number
  await stripeFrame.locator('input[name="cardnumber"]').fill(card.number);

  // Expiry
  await stripeFrame.locator('input[name="exp-date"]').fill(card.expiry);

  // CVC
  await stripeFrame.locator('input[name="cvc"]').fill(card.cvc);

  // Zip (if visible)
  const zipInput = stripeFrame.locator('input[name="postal"]');
  if (await zipInput.isVisible({ timeout: 1000 }).catch(() => false)) {
    await zipInput.fill(card.zip);
  }
}

/**
 * Submit enrollment payment
 */
export async function submitEnrollment(page: Page): Promise<void> {
  await page.click('[data-testid="pay-now-btn"]');
  await page.waitForTimeout(TIMEOUTS.payment);
}

/**
 * Verify enrollment success
 */
export async function verifyEnrollmentSuccess(
  page: Page
): Promise<EnrollmentConfirmation> {
  await expect(page.locator('[data-testid="payment-success"]')).toBeVisible({
    timeout: TIMEOUTS.payment,
  });

  return {
    orderId: (await page.locator('[data-testid="order-id"]').textContent()) || "",
    className: (await page.locator('[data-testid="order-class-name"]').textContent()) || "",
    tierName: (await page.locator('[data-testid="order-tier-name"]').textContent()) || "",
    quantity: parseInt((await page.locator('[data-testid="order-quantity"]').textContent()) || "1"),
    total: (await page.locator('[data-testid="order-total"]').textContent()) || "",
  };
}

/**
 * Select cash payment option
 */
export async function selectCashPayment(page: Page): Promise<void> {
  await page.click('[data-testid="payment-method-cash"]');
}

/**
 * Reserve with cash payment
 */
export async function reserveWithCash(page: Page): Promise<void> {
  await page.click('[data-testid="reserve-btn"]');
  await page.waitForTimeout(2000);
}

// ============================================================
// ENROLLMENT MANAGEMENT HELPERS
// ============================================================

/**
 * Navigate to my enrollments
 */
export async function navigateToMyEnrollments(page: Page): Promise<void> {
  await page.goto(CLASS_URLS.myEnrollments);
  await waitForPageLoad(page);
}

/**
 * Verify enrollment appears in list
 */
export async function verifyEnrollmentInList(
  page: Page,
  className: string
): Promise<boolean> {
  const enrollment = page.locator(`text=${className}`);
  return await enrollment.isVisible({ timeout: TIMEOUTS.medium }).catch(() => false);
}

/**
 * Cancel an enrollment
 */
export async function cancelEnrollment(
  page: Page,
  enrollmentId: string
): Promise<void> {
  await page.click(`[data-testid="cancel-enrollment-${enrollmentId}"]`);

  // Confirm cancellation
  const confirmBtn = page.locator('[data-testid="confirm-cancel-btn"]');
  if (await confirmBtn.isVisible({ timeout: TIMEOUTS.short }).catch(() => false)) {
    await confirmBtn.click();
  }

  await page.waitForTimeout(2000);
}

// ============================================================
// ANALYTICS HELPERS (INSTRUCTOR)
// ============================================================

/**
 * Navigate to class analytics
 */
export async function navigateToClassAnalytics(
  page: Page,
  classId: string
): Promise<void> {
  await page.goto(`/organizer/classes/${classId}/analytics`);
  await waitForPageLoad(page);
}

/**
 * Get enrollment statistics
 */
export async function getEnrollmentStats(page: Page): Promise<EnrollmentStats> {
  return {
    totalEnrolled: parseInt(
      (await page.locator('[data-testid="stats-total-enrolled"]').textContent()) || "0"
    ),
    totalRevenue: parseFloat(
      (await page.locator('[data-testid="stats-total-revenue"]').textContent())?.replace(/[$,]/g, "") || "0"
    ),
    recentEnrollments: parseInt(
      (await page.locator('[data-testid="stats-recent-enrollments"]').textContent()) || "0"
    ),
  };
}

/**
 * View enrollee list
 */
export async function viewEnrolleeList(page: Page): Promise<Enrollee[]> {
  const rows = page.locator('[data-testid^="enrollee-row-"]');
  const count = await rows.count();
  const enrollees: Enrollee[] = [];

  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    enrollees.push({
      name: (await row.locator('[data-testid="enrollee-name"]').textContent()) || "",
      email: (await row.locator('[data-testid="enrollee-email"]').textContent()) || "",
      tierName: (await row.locator('[data-testid="enrollee-tier"]').textContent()) || "",
      enrolledAt: (await row.locator('[data-testid="enrollee-date"]').textContent()) || "",
      status: ((await row.locator('[data-testid="enrollee-status"]').textContent()) || "confirmed") as "confirmed" | "pending" | "cancelled",
    });
  }

  return enrollees;
}
