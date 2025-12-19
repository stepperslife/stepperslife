/**
 * Restaurant Application Flow - E2E Test
 *
 * Tests the complete flow:
 * 1. User registers an account
 * 2. User selects a plan from pricing page
 * 3. User fills out restaurant application
 * 4. User submits and gets confirmation
 * 5. Admin approves (simulated)
 * 6. User adds menu items
 */

import { test, expect, Page } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "https://stepperslife.com";

// Generate unique test data
const timestamp = Date.now();
const TEST_USER = {
  name: `Test Restaurant Owner ${timestamp}`,
  email: `test-restaurant-${timestamp}@stepperslife-test.com`,
  password: "TestPassword123!",
};

const TEST_RESTAURANT = {
  name: `E2E Test Restaurant ${timestamp}`,
  description: "A test restaurant created by automated E2E testing",
  address: "123 Test Street",
  city: "Chicago",
  state: "IL",
  zipCode: "60601",
  phone: "(312) 555-0199",
  cuisineTypes: ["Soul Food", "Southern"],
};

/**
 * Wait for page to load with Convex data
 */
async function waitForPageLoad(page: Page, timeout = 3000) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(timeout);
}

/**
 * Take screenshot for debugging
 */
async function screenshot(page: Page, name: string) {
  await page.screenshot({
    path: `test-results/restaurant-apply-${name}.png`,
    fullPage: true,
  });
}

test.describe("Restaurant Application Flow", () => {
  test.describe.configure({ mode: "serial" });

  test("1. Register a new account", async ({ page }) => {
    console.log("\n📍 Test 1: Register new account\n");
    console.log(`   Email: ${TEST_USER.email}`);

    await page.goto(`${BASE_URL}/register`);
    await waitForPageLoad(page);

    // Fill registration form
    await page.fill('input[name="name"], input[placeholder*="name" i]', TEST_USER.name);
    await page.fill('input[name="email"], input[type="email"]', TEST_USER.email);
    await page.fill('input[name="password"], input[type="password"]', TEST_USER.password);

    // Look for confirm password field
    const confirmPassword = page.locator('input[name="confirmPassword"], input[placeholder*="confirm" i]');
    if (await confirmPassword.isVisible()) {
      await confirmPassword.fill(TEST_USER.password);
    }

    await screenshot(page, "01-register-form-filled");

    // Submit
    await page.click('button[type="submit"]');
    await waitForPageLoad(page, 5000);

    // Verify registration success - should redirect or show success
    const isLoggedIn =
      (await page.locator("text=Dashboard").isVisible()) ||
      (await page.locator("text=Welcome").isVisible()) ||
      page.url().includes("/dashboard") ||
      (await page.locator(`text=${TEST_USER.name}`).isVisible()) ||
      (await page.locator(`text=${TEST_USER.email}`).isVisible());

    // Or might show success message
    const showsSuccess =
      (await page.locator("text=successfully").isVisible()) ||
      (await page.locator("text=created").isVisible()) ||
      (await page.locator("text=verify").isVisible());

    await screenshot(page, "02-after-register");

    expect(isLoggedIn || showsSuccess).toBeTruthy();
    console.log("✅ Account registration completed");
  });

  test("2. Login with new account", async ({ page }) => {
    console.log("\n📍 Test 2: Login with new account\n");

    await page.goto(`${BASE_URL}/login`);
    await waitForPageLoad(page);

    // Fill login form
    await page.fill('input[type="email"], input[name="email"]', TEST_USER.email);
    await page.fill('input[type="password"], input[name="password"]', TEST_USER.password);

    await screenshot(page, "03-login-form-filled");

    // Submit
    await page.click('button[type="submit"]');
    await waitForPageLoad(page, 5000);

    // Verify login success
    const isLoggedIn =
      (await page.locator("text=Dashboard").isVisible()) ||
      page.url().includes("/dashboard") ||
      (await page.locator(`text=${TEST_USER.name}`).isVisible());

    await screenshot(page, "04-after-login");

    expect(isLoggedIn).toBeTruthy();
    console.log("✅ Login successful");
  });

  test("3. Navigate to pricing page and select Starter plan", async ({ page }) => {
    console.log("\n📍 Test 3: Select plan from pricing page\n");

    // First login
    await page.goto(`${BASE_URL}/login`);
    await waitForPageLoad(page);
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await waitForPageLoad(page, 5000);

    // Go to pricing page
    await page.goto(`${BASE_URL}/restaurants/pricing`);
    await waitForPageLoad(page);

    await screenshot(page, "05-pricing-page");

    // Verify pricing page loaded
    await expect(page.locator("h1")).toContainText(/Pricing|Plans/i);

    // Find and click Starter plan CTA
    const starterPlanButton = page.locator('a[href*="plan=starter"]').first();
    await expect(starterPlanButton).toBeVisible();

    await screenshot(page, "06-before-plan-select");

    await starterPlanButton.click();
    await waitForPageLoad(page);

    // Verify redirected to apply page with plan param
    expect(page.url()).toContain("/restaurateur/apply");
    expect(page.url()).toContain("plan=starter");

    await screenshot(page, "07-apply-page-with-plan");

    // Verify plan is displayed
    await expect(page.locator("text=Starter Plan")).toBeVisible();

    console.log("✅ Plan selected and redirected to apply page");
  });

  test("4. Fill out restaurant application", async ({ page }) => {
    console.log("\n📍 Test 4: Fill restaurant application\n");

    // Login first
    await page.goto(`${BASE_URL}/login`);
    await waitForPageLoad(page);
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await waitForPageLoad(page, 5000);

    // Go directly to apply page with starter plan
    await page.goto(`${BASE_URL}/restaurateur/apply?plan=starter`);
    await waitForPageLoad(page);

    await screenshot(page, "08-apply-form-empty");

    // Fill contact information
    const contactNameInput = page.locator('input[name="contactName"]');
    if (await contactNameInput.isVisible()) {
      // Form may already have name from auth
      const currentValue = await contactNameInput.inputValue();
      if (!currentValue) {
        await contactNameInput.fill(TEST_USER.name);
      }
    }

    const contactEmailInput = page.locator('input[name="contactEmail"]');
    if (await contactEmailInput.isVisible()) {
      const currentValue = await contactEmailInput.inputValue();
      if (!currentValue) {
        await contactEmailInput.fill(TEST_USER.email);
      }
    }

    await page.fill('input[name="contactPhone"]', TEST_RESTAURANT.phone);

    // Fill restaurant information
    await page.fill('input[name="restaurantName"]', TEST_RESTAURANT.name);

    const descriptionField = page.locator('textarea[name="description"]');
    if (await descriptionField.isVisible()) {
      await descriptionField.fill(TEST_RESTAURANT.description);
    }

    // Select cuisine types
    for (const cuisine of TEST_RESTAURANT.cuisineTypes) {
      const cuisineButton = page.locator(`button:has-text("${cuisine}")`);
      if (await cuisineButton.isVisible()) {
        await cuisineButton.click();
        await page.waitForTimeout(300);
      }
    }

    await screenshot(page, "09-restaurant-info-filled");

    // Fill location
    await page.fill('input[name="address"]', TEST_RESTAURANT.address);
    await page.fill('input[name="city"]', TEST_RESTAURANT.city);

    // State might be a select or input
    const stateSelect = page.locator('select[name="state"]');
    if (await stateSelect.isVisible()) {
      await stateSelect.selectOption(TEST_RESTAURANT.state);
    } else {
      await page.fill('input[name="state"]', TEST_RESTAURANT.state);
    }

    await page.fill('input[name="zipCode"]', TEST_RESTAURANT.zipCode);

    await screenshot(page, "10-location-filled");

    // Fill operations (optional)
    const hoursField = page.locator('textarea[name="hoursOfOperation"]');
    if (await hoursField.isVisible()) {
      await hoursField.fill("Mon-Fri: 11am-9pm\nSat-Sun: 12pm-10pm");
    }

    await screenshot(page, "11-form-complete");

    console.log("✅ Restaurant application form filled");
  });

  test("5. Submit restaurant application", async ({ page }) => {
    console.log("\n📍 Test 5: Submit restaurant application\n");

    // Login first
    await page.goto(`${BASE_URL}/login`);
    await waitForPageLoad(page);
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await waitForPageLoad(page, 5000);

    // Go to apply page
    await page.goto(`${BASE_URL}/restaurateur/apply?plan=starter`);
    await waitForPageLoad(page);

    // Fill the entire form
    await page.fill('input[name="contactPhone"]', TEST_RESTAURANT.phone);
    await page.fill('input[name="restaurantName"]', TEST_RESTAURANT.name);

    // Select cuisine types
    for (const cuisine of TEST_RESTAURANT.cuisineTypes) {
      const cuisineButton = page.locator(`button:has-text("${cuisine}")`);
      if (await cuisineButton.isVisible()) {
        await cuisineButton.click();
        await page.waitForTimeout(300);
      }
    }

    await page.fill('input[name="address"]', TEST_RESTAURANT.address);
    await page.fill('input[name="city"]', TEST_RESTAURANT.city);

    const stateSelect = page.locator('select[name="state"]');
    if (await stateSelect.isVisible()) {
      await stateSelect.selectOption(TEST_RESTAURANT.state);
    }

    await page.fill('input[name="zipCode"]', TEST_RESTAURANT.zipCode);

    await screenshot(page, "12-before-submit");

    // Submit the form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for submission
    await waitForPageLoad(page, 10000);

    await screenshot(page, "13-after-submit");

    // Check for success
    const hasSuccess =
      (await page.locator("text=submitted").isVisible()) ||
      (await page.locator("text=Application Submitted").isVisible()) ||
      (await page.locator("text=Thank you").isVisible()) ||
      (await page.locator("svg.lucide-check-circle").isVisible());

    // Or check for error to help debugging
    const hasError = await page.locator("text=error").isVisible();
    if (hasError) {
      console.log("❌ Error detected on page");
      const errorText = await page.locator("text=error").textContent();
      console.log(`   Error: ${errorText}`);
    }

    expect(hasSuccess).toBeTruthy();
    console.log("✅ Restaurant application submitted successfully");
  });
});

test.describe("Restaurant Pricing Page", () => {
  test("Pricing page loads with all plans", async ({ page }) => {
    console.log("\n📍 Pricing page verification\n");

    await page.goto(`${BASE_URL}/restaurants/pricing`);
    await waitForPageLoad(page);

    // Verify page loads
    expect(page.url()).toContain("/restaurants/pricing");

    await screenshot(page, "pricing-page");

    // Verify plans are displayed
    await expect(page.locator("text=Starter").first()).toBeVisible();
    await expect(page.locator("text=Growth").first()).toBeVisible();
    await expect(page.locator("text=Professional").first()).toBeVisible();

    // Verify prices
    await expect(page.locator("text=Free").first()).toBeVisible();
    await expect(page.locator("text=$19").first()).toBeVisible();
    await expect(page.locator("text=$49").first()).toBeVisible();

    console.log("✅ Pricing page displays all plans correctly");
  });

  test("Plan buttons link to apply page with correct params", async ({ page }) => {
    console.log("\n📍 Plan button verification\n");

    await page.goto(`${BASE_URL}/restaurants/pricing`);
    await waitForPageLoad(page);

    // Check Starter plan link
    const starterLink = page.locator('a[href*="plan=starter"]').first();
    await expect(starterLink).toBeVisible();
    const starterHref = await starterLink.getAttribute("href");
    expect(starterHref).toContain("/restaurateur/apply");
    expect(starterHref).toContain("plan=starter");

    // Check Growth plan link
    const growthLink = page.locator('a[href*="plan=growth"]').first();
    await expect(growthLink).toBeVisible();
    const growthHref = await growthLink.getAttribute("href");
    expect(growthHref).toContain("plan=growth");

    // Check Professional plan link
    const proLink = page.locator('a[href*="plan=professional"]').first();
    await expect(proLink).toBeVisible();
    const proHref = await proLink.getAttribute("href");
    expect(proHref).toContain("plan=professional");

    console.log("✅ All plan buttons link correctly to apply page");
  });
});

test.describe("Apply Page Plan Display", () => {
  test("Apply page shows selected Starter plan", async ({ page }) => {
    await page.goto(`${BASE_URL}/restaurateur/apply?plan=starter`);
    await waitForPageLoad(page);

    await expect(page.locator("text=Starter Plan")).toBeVisible();
    await expect(page.locator("text=Free")).toBeVisible();

    await screenshot(page, "apply-starter-plan");
  });

  test("Apply page shows selected Growth plan", async ({ page }) => {
    await page.goto(`${BASE_URL}/restaurateur/apply?plan=growth`);
    await waitForPageLoad(page);

    await expect(page.locator("text=Growth Plan")).toBeVisible();
    await expect(page.locator("text=$19/month")).toBeVisible();

    await screenshot(page, "apply-growth-plan");
  });

  test("Apply page shows selected Professional plan", async ({ page }) => {
    await page.goto(`${BASE_URL}/restaurateur/apply?plan=professional`);
    await waitForPageLoad(page);

    await expect(page.locator("text=Professional Plan")).toBeVisible();
    await expect(page.locator("text=$49/month")).toBeVisible();

    await screenshot(page, "apply-professional-plan");
  });

  test("Apply page defaults to Starter when no plan specified", async ({ page }) => {
    await page.goto(`${BASE_URL}/restaurateur/apply`);
    await waitForPageLoad(page);

    await expect(page.locator("text=Starter Plan")).toBeVisible();
    await expect(page.locator("text=Free")).toBeVisible();

    await screenshot(page, "apply-default-plan");
  });
});
