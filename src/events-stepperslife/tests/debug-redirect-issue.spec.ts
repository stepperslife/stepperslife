/**
 * Debug Script: Track Redirects and Role Changes
 * This script monitors what happens when logging in and navigating to My Events
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3004';
const DEBUG_DIR = path.join(__dirname, 'debug-logs');

// Ensure debug directory exists
if (!fs.existsSync(DEBUG_DIR)) {
  fs.mkdirSync(DEBUG_DIR, { recursive: true });
}

const debugLog: string[] = [];

function log(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  debugLog.push(logMessage);
}

test.describe('Debug Redirect Issue', () => {
  test('Track login and My Events redirect', async ({ page }) => {
    let screenshotCounter = 0;

    // Function to take timestamped screenshot
    async function captureScreenshot(label: string) {
      screenshotCounter++;
      const filename = `${screenshotCounter.toString().padStart(2, '0')}-${label}.png`;
      await page.screenshot({
        path: path.join(DEBUG_DIR, filename),
        fullPage: true
      });
      log(`📸 Screenshot: ${filename}`);
    }

    // Monitor all console messages
    page.on('console', msg => {
      log(`CONSOLE [${msg.type()}]: ${msg.text()}`);
    });

    // Monitor all page errors
    page.on('pageerror', error => {
      log(`PAGE ERROR: ${error.message}`);
    });

    // Monitor all network requests
    page.on('request', request => {
      if (request.url().includes('/api/') || request.url().includes('convex')) {
        log(`REQUEST: ${request.method()} ${request.url()}`);
      }
    });

    // Monitor all network responses
    page.on('response', async response => {
      if (response.url().includes('/api/') || response.url().includes('convex')) {
        log(`RESPONSE: ${response.status()} ${response.url()}`);

        // Log response body for auth-related requests
        if (response.url().includes('/auth/') || response.url().includes('getCurrentUser')) {
          try {
            const body = await response.text();
            log(`RESPONSE BODY: ${body.substring(0, 200)}...`);
          } catch (e) {
            log(`Could not read response body`);
          }
        }
      }
    });

    // Monitor navigation
    page.on('framenavigated', frame => {
      if (frame === page.mainFrame()) {
        log(`NAVIGATED TO: ${frame.url()}`);
      }
    });

    log('========================================');
    log('Starting Debug Session');
    log('========================================');

    // Step 1: Go to homepage
    log('STEP 1: Navigate to homepage');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await captureScreenshot('01-homepage');
    await page.waitForTimeout(1000);

    // Step 2: Go to login page
    log('STEP 2: Navigate to login page');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await captureScreenshot('02-login-page');
    await page.waitForTimeout(1000);

    // Step 3: Expand password login
    log('STEP 3: Click "Sign in with password"');
    await page.waitForSelector('button:has-text("Sign in with password")');
    await page.click('button:has-text("Sign in with password")');
    await page.waitForTimeout(500);
    await captureScreenshot('03-password-form-expanded');

    // Step 4: Fill in credentials
    log('STEP 4: Fill in credentials (organizer-test@stepperslife.com)');
    await page.fill('input[id="email"]', 'organizer-test@stepperslife.com');
    await page.fill('input[id="password"]', 'OrganizerTest123!');
    await captureScreenshot('04-credentials-filled');

    // Step 5: Submit login
    log('STEP 5: Submit login form');
    await page.click('button[type="submit"]:has-text("Sign In")');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    log(`Current URL after login: ${currentUrl}`);
    await captureScreenshot('05-after-login');

    // Step 6: Check user role via API
    log('STEP 6: Checking current user data');
    try {
      const userData = await page.evaluate(() => {
        return fetch('/api/auth/me').then(r => r.json()).catch(e => ({ error: e.message }));
      });
      log(`USER DATA: ${JSON.stringify(userData, null, 2)}`);
    } catch (e) {
      log(`Failed to get user data: ${e}`);
    }

    // Step 7: Navigate to My Events
    log('STEP 7: Navigate to /organizer/events');
    await page.goto(`${BASE_URL}/organizer/events`);
    await page.waitForTimeout(1000);
    await captureScreenshot('06-my-events-initial');

    log(`URL immediately after navigation: ${page.url()}`);

    // Step 8: Wait and watch for redirects
    log('STEP 8: Watching for redirects (5 seconds)');
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(1000);
      const url = page.url();
      log(`After ${i + 1}s: ${url}`);

      if (i === 2) {
        await captureScreenshot(`07-after-${i + 1}-seconds`);
      }
    }

    await captureScreenshot('08-final-state');

    // Step 9: Check user role again
    log('STEP 9: Checking user data after redirect');
    try {
      const userData = await page.evaluate(() => {
        return fetch('/api/auth/me').then(r => r.json()).catch(e => ({ error: e.message }));
      });
      log(`USER DATA AFTER: ${JSON.stringify(userData, null, 2)}`);
    } catch (e) {
      log(`Failed to get user data: ${e}`);
    }

    // Step 10: Check for auth check logic in page
    log('STEP 10: Checking page for auth/role checks');
    const pageContent = await page.content();
    log(`Page contains "not authorized": ${pageContent.includes('not authorized')}`);
    log(`Page contains "organizer": ${pageContent.includes('organizer')}`);
    log(`Page contains "redirect": ${pageContent.includes('redirect')}`);

    // Save debug log to file
    log('========================================');
    log('Debug Session Complete');
    log('========================================');

    const logPath = path.join(DEBUG_DIR, 'debug-session.log');
    fs.writeFileSync(logPath, debugLog.join('\n'));

    console.log('\n📋 Debug Summary:');
    console.log(`  - Logs saved to: ${logPath}`);
    console.log(`  - Screenshots saved to: ${DEBUG_DIR}`);
    console.log(`  - Final URL: ${page.url()}`);
    console.log('\n');
  });

  test('Track organizer dashboard access', async ({ page }) => {
    log('\n========================================');
    log('Testing Direct Dashboard Access');
    log('========================================\n');

    // Monitor console and errors
    page.on('console', msg => log(`CONSOLE: ${msg.text()}`));
    page.on('pageerror', error => log(`ERROR: ${error.message}`));

    // Step 1: Login first
    log('STEP 1: Login as organizer');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('button:has-text("Sign in with password")');
    await page.click('button:has-text("Sign in with password")');
    await page.waitForTimeout(500);
    await page.fill('input[id="email"]', 'organizer-test@stepperslife.com');
    await page.fill('input[id="password"]', 'OrganizerTest123!');
    await page.click('button[type="submit"]:has-text("Sign In")');
    await page.waitForTimeout(3000);

    // Step 2: Try accessing dashboard
    log('STEP 2: Accessing /organizer/dashboard');
    await page.goto(`${BASE_URL}/organizer/dashboard`);
    await page.waitForTimeout(2000);

    log(`Final URL: ${page.url()}`);
    log(`Expected: ${BASE_URL}/organizer/dashboard`);
    log(`Redirected: ${page.url() !== `${BASE_URL}/organizer/dashboard`}`);

    const screenshot = path.join(DEBUG_DIR, 'organizer-dashboard-attempt.png');
    await page.screenshot({ path: screenshot, fullPage: true });
    log(`Screenshot: ${screenshot}`);
  });
});
