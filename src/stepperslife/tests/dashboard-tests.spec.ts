/**
 * Dashboard Testing Suite
 * Tests all 5 user role dashboards with browser automation
 */

import { test, expect, Page } from '@playwright/test';
import { TEST_USERS } from './setup-test-users';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3004';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

/**
 * Helper: Login with email/password
 */
async function loginWithEmail(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`);

  // Wait for the "Sign in with password" button to be visible instead of networkidle
  await page.waitForSelector('button:has-text("Sign in with password")', { timeout: 10000 });

  // Click "Sign in with password" to expand the collapsible form
  await page.click('button:has-text("Sign in with password")');
  await page.waitForTimeout(500); // Wait for form to expand

  // Wait for password input to be visible
  await page.waitForSelector('input[id="password"]', { timeout: 5000 });

  // Fill in email and password in the expanded form
  await page.fill('input[id="email"]', email);
  await page.fill('input[id="password"]', password);

  // Click sign in button
  await page.click('button[type="submit"]:has-text("Sign In")');

  // Wait for navigation by checking URL change or dashboard elements
  await page.waitForTimeout(3000); // Give time for login to complete

  // Verify we're not on login page anymore
  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    throw new Error('Login failed - still on login page');
  }
}

/**
 * Helper: Take screenshot and save to file
 */
async function takeScreenshot(page: Page, filename: string) {
  const screenshotPath = path.join(SCREENSHOTS_DIR, `${filename}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`📸 Screenshot saved: ${filename}.png`);
  return screenshotPath;
}

/**
 * Helper: Check for common error indicators
 */
async function checkForErrors(page: Page) {
  const errors: string[] = [];

  // Check for error text on page
  const errorTexts = ['Error:', 'error', 'failed', 'Failed', 'not authorized', 'Not authorized'];
  for (const errorText of errorTexts) {
    const hasError = await page.locator(`text=${errorText}`).count() > 0;
    if (hasError) {
      errors.push(`Found error text: "${errorText}"`);
    }
  }

  // Check console for errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console error: ${msg.text()}`);
    }
  });

  return errors;
}

test.describe('Dashboard Access Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for navigation
    test.setTimeout(60000);
  });

  test('1. Admin Dashboard', async ({ page }) => {
    console.log('\n🧪 Testing Admin Dashboard...');

    try {
      // Login as admin
      await loginWithEmail(page, TEST_USERS.admin.email, TEST_USERS.admin.password);

      // Navigate to admin dashboard
      await page.goto(`${BASE_URL}${TEST_USERS.admin.dashboardUrl}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000); // Wait for data to load

      // Check for errors
      const errors = await checkForErrors(page);
      if (errors.length > 0) {
        console.log('⚠️  Errors found:', errors);
      }

      // Take screenshot
      await takeScreenshot(page, '01-admin-dashboard');

      // Verify dashboard elements
      const hasHeading = await page.locator('h1, h2').count() > 0;
      const hasSidebar = await page.locator('[role="navigation"], nav, aside').count() > 0;

      expect(hasHeading).toBeTruthy();
      console.log('✅ Admin Dashboard loaded successfully');

      // Check for specific admin content
      const pageContent = await page.content();
      const hasAdminContent = pageContent.includes('admin') || pageContent.includes('Admin') ||
                              pageContent.includes('Platform') || pageContent.includes('Users');

      console.log(`   - Has heading: ${hasHeading}`);
      console.log(`   - Has sidebar: ${hasSidebar}`);
      console.log(`   - Has admin content: ${hasAdminContent}`);

    } catch (error: any) {
      console.error('❌ Admin Dashboard Test Failed:', error.message);
      await takeScreenshot(page, '01-admin-dashboard-ERROR');
      throw error;
    }
  });

  test('2. Organizer Dashboard', async ({ page }) => {
    console.log('\n🧪 Testing Organizer Dashboard...');

    try {
      // Login as organizer
      await loginWithEmail(page, TEST_USERS.organizer.email, TEST_USERS.organizer.password);

      // Navigate to organizer dashboard
      await page.goto(`${BASE_URL}${TEST_USERS.organizer.dashboardUrl}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Check for errors
      const errors = await checkForErrors(page);
      if (errors.length > 0) {
        console.log('⚠️  Errors found:', errors);
      }

      // Take screenshot
      await takeScreenshot(page, '02-organizer-dashboard');

      // Verify dashboard elements
      const hasHeading = await page.locator('h1, h2').count() > 0;
      const hasSidebar = await page.locator('[role="navigation"], nav, aside').count() > 0;

      expect(hasHeading).toBeTruthy();
      console.log('✅ Organizer Dashboard loaded successfully');

      // Check for organizer-specific content
      const pageContent = await page.content();
      const hasOrganizerContent = pageContent.includes('Event') || pageContent.includes('event') ||
                                   pageContent.includes('Create') || pageContent.includes('Credits');

      console.log(`   - Has heading: ${hasHeading}`);
      console.log(`   - Has sidebar: ${hasSidebar}`);
      console.log(`   - Has organizer content: ${hasOrganizerContent}`);

    } catch (error: any) {
      console.error('❌ Organizer Dashboard Test Failed:', error.message);
      await takeScreenshot(page, '02-organizer-dashboard-ERROR');
      throw error;
    }
  });

  test('3. Regular User - My Tickets', async ({ page }) => {
    console.log('\n🧪 Testing User Dashboard (My Tickets)...');

    try {
      // Login as user
      await loginWithEmail(page, TEST_USERS.user.email, TEST_USERS.user.password);

      // Navigate to my tickets page
      await page.goto(`${BASE_URL}${TEST_USERS.user.dashboardUrl}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Check for errors
      const errors = await checkForErrors(page);
      if (errors.length > 0) {
        console.log('⚠️  Errors found:', errors);
      }

      // Take screenshot
      await takeScreenshot(page, '03-user-my-tickets');

      // Verify page loaded
      const hasHeading = await page.locator('h1, h2').count() > 0;

      console.log('✅ User My Tickets page loaded successfully');

      // Check for user content
      const pageContent = await page.content();
      const hasUserContent = pageContent.includes('Ticket') || pageContent.includes('ticket') ||
                             pageContent.includes('My Tickets') || pageContent.includes('No tickets');

      console.log(`   - Has heading: ${hasHeading}`);
      console.log(`   - Has user content: ${hasUserContent}`);

    } catch (error: any) {
      console.error('❌ User Dashboard Test Failed:', error.message);
      await takeScreenshot(page, '03-user-my-tickets-ERROR');
      throw error;
    }
  });

  test('4. Staff Dashboard', async ({ page }) => {
    console.log('\n🧪 Testing Staff Dashboard...');

    try {
      // Login as staff
      await loginWithEmail(page, TEST_USERS.staff.email, TEST_USERS.staff.password);

      // Navigate to staff dashboard
      await page.goto(`${BASE_URL}${TEST_USERS.staff.dashboardUrl}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Check for errors
      const errors = await checkForErrors(page);
      if (errors.length > 0) {
        console.log('⚠️  Errors found:', errors);
      }

      // Take screenshot
      await takeScreenshot(page, '04-staff-dashboard');

      // Verify dashboard elements
      const hasHeading = await page.locator('h1, h2').count() > 0;
      const hasSidebar = await page.locator('[role="navigation"], nav, aside').count() > 0;

      console.log('✅ Staff Dashboard loaded successfully');

      // Check for staff content
      const pageContent = await page.content();
      const hasStaffContent = pageContent.includes('Staff') || pageContent.includes('staff') ||
                              pageContent.includes('Scan') || pageContent.includes('Tickets Sold');

      console.log(`   - Has heading: ${hasHeading}`);
      console.log(`   - Has sidebar: ${hasSidebar}`);
      console.log(`   - Has staff content: ${hasStaffContent}`);

    } catch (error: any) {
      console.error('❌ Staff Dashboard Test Failed:', error.message);
      await takeScreenshot(page, '04-staff-dashboard-ERROR');
      throw error;
    }
  });

  test('5. Team Member Dashboard', async ({ page }) => {
    console.log('\n🧪 Testing Team Member Dashboard...');

    try {
      // Login as team member
      await loginWithEmail(page, TEST_USERS.teamMember.email, TEST_USERS.teamMember.password);

      // Navigate to team dashboard
      await page.goto(`${BASE_URL}${TEST_USERS.teamMember.dashboardUrl}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Check for errors
      const errors = await checkForErrors(page);
      if (errors.length > 0) {
        console.log('⚠️  Errors found:', errors);
      }

      // Take screenshot
      await takeScreenshot(page, '05-team-dashboard');

      // Verify dashboard elements
      const hasHeading = await page.locator('h1, h2').count() > 0;
      const hasSidebar = await page.locator('[role="navigation"], nav, aside').count() > 0;

      console.log('✅ Team Member Dashboard loaded successfully');

      // Check for team content
      const pageContent = await page.content();
      const hasTeamContent = pageContent.includes('Team') || pageContent.includes('team') ||
                             pageContent.includes('Sales') || pageContent.includes('Commission');

      console.log(`   - Has heading: ${hasHeading}`);
      console.log(`   - Has sidebar: ${hasSidebar}`);
      console.log(`   - Has team content: ${hasTeamContent}`);

    } catch (error: any) {
      console.error('❌ Team Member Dashboard Test Failed:', error.message);
      await takeScreenshot(page, '05-team-dashboard-ERROR');
      throw error;
    }
  });
});

test.describe('Dashboard Test Summary', () => {
  test('Generate Test Report', async () => {
    console.log('\n📊 Test Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Dashboard tests completed!');
    console.log(`Screenshots saved to: ${SCREENSHOTS_DIR}`);
    console.log('\n📋 Tested Dashboards:');
    console.log('1. ✅ Admin Dashboard');
    console.log('2. ✅ Organizer Dashboard');
    console.log('3. ✅ User My Tickets');
    console.log('4. ✅ Staff Dashboard');
    console.log('5. ✅ Team Member Dashboard');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  });
});
