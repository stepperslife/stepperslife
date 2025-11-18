/**
 * Debug: Track "My Events" Link Click
 * Specifically test clicking the My Events link from the dashboard sidebar
 */

import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3004';
const DEBUG_DIR = path.join(__dirname, 'debug-logs');

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

test('Click My Events link and track behavior', async ({ page }) => {
  let screenshotCounter = 0;

  async function captureScreenshot(label: string) {
    screenshotCounter++;
    const filename = `click-${screenshotCounter.toString().padStart(2, '0')}-${label}.png`;
    await page.screenshot({
      path: path.join(DEBUG_DIR, filename),
      fullPage: true
    });
    log(`📸 Screenshot: ${filename}`);
  }

  // Monitor all navigation
  let navigationCount = 0;
  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) {
      navigationCount++;
      log(`🔄 NAVIGATION #${navigationCount}: ${frame.url()}`);
    }
  });

  // Monitor console for auth/role issues
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('role') || text.includes('auth') || text.includes('redirect') || text.includes('unauthorized')) {
      log(`⚠️  CONSOLE [${msg.type()}]: ${text}`);
    }
  });

  // Monitor API calls
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/auth/') || url.includes('getCurrentUser') || url.includes('getUser')) {
      log(`📡 API ${response.status()}: ${url}`);

      if (url.includes('getCurrentUser') || url.includes('/me')) {
        try {
          const body = await response.json();
          log(`   User Data: role=${body.role}, email=${body.email}`);
        } catch (e) {
          log(`   Could not parse response`);
        }
      }
    }
  });

  log('========================================');
  log('TEST: Click My Events Link');
  log('========================================');

  // Step 1: Login
  log('\nSTEP 1: Login as organizer');
  await page.goto(`${BASE_URL}/login`);
  await page.waitForSelector('button:has-text("Sign in with password")');
  await page.click('button:has-text("Sign in with password")');
  await page.waitForTimeout(500);

  await page.fill('input[id="email"]', 'organizer-test@stepperslife.com');
  await page.fill('input[id="password"]', 'OrganizerTest123!');
  await captureScreenshot('01-login-ready');

  await page.click('button[type="submit"]:has-text("Sign In")');
  await page.waitForTimeout(3000);

  log(`✅ Logged in, current URL: ${page.url()}`);
  await captureScreenshot('02-after-login');

  // Step 2: Navigate to dashboard
  log('\nSTEP 2: Navigate to dashboard');
  await page.goto(`${BASE_URL}/organizer/dashboard`);
  await page.waitForTimeout(2000);

  log(`✅ On dashboard: ${page.url()}`);
  await captureScreenshot('03-on-dashboard');

  // Step 3: Find and click My Events link
  log('\nSTEP 3: Finding "My Events" link');

  // Look for the My Events link in the sidebar
  const myEventsSelectors = [
    'text="My Events"',
    'a:has-text("My Events")',
    '[href*="/events"]',
    'nav a:has-text("My Events")'
  ];

  let myEventsLink = null;
  for (const selector of myEventsSelectors) {
    const element = await page.$(selector);
    if (element) {
      log(`✅ Found My Events using selector: ${selector}`);
      myEventsLink = element;
      break;
    }
  }

  if (!myEventsLink) {
    log('❌ Could not find My Events link!');
    log('Available links on page:');
    const links = await page.$$eval('a', links => links.map(l => l.textContent));
    links.forEach(link => log(`  - ${link}`));
    await captureScreenshot('04-my-events-not-found');
  } else {
    // Step 4: Click the link
    log('\nSTEP 4: Clicking "My Events" link');
    const urlBefore = page.url();
    log(`URL before click: ${urlBefore}`);

    await page.click('text="My Events"');
    log('✅ Clicked "My Events"');

    // Wait and track
    await page.waitForTimeout(500);
    await captureScreenshot('05-immediately-after-click');

    log(`URL 500ms after click: ${page.url()}`);

    // Wait more and check for redirects
    for (let i = 1; i <= 5; i++) {
      await page.waitForTimeout(1000);
      const currentUrl = page.url();
      log(`URL after ${i}s: ${currentUrl}`);

      if (i === 2) {
        await captureScreenshot('06-after-2-seconds');
      }

      if (currentUrl !== urlBefore && !currentUrl.includes('/events')) {
        log(`⚠️  REDIRECT DETECTED! From ${urlBefore} to ${currentUrl}`);
      }
    }

    await captureScreenshot('07-final-state');

    const finalUrl = page.url();
    log(`\n📍 Final URL: ${finalUrl}`);
    log(`📍 Expected URL pattern: /organizer/events`);
    log(`📍 Was redirected: ${!finalUrl.includes('/events')}`);
  }

  // Step 5: Check user data
  log('\nSTEP 5: Checking user authentication state');
  try {
    const userData = await page.evaluate(async () => {
      const response = await fetch('/api/auth/me');
      return await response.json();
    });
    log(`User data: ${JSON.stringify(userData, null, 2)}`);
  } catch (e) {
    log(`❌ Failed to get user data: ${e}`);
  }

  // Save log
  log('\n========================================');
  log('TEST COMPLETE');
  log(`Total navigations: ${navigationCount}`);
  log('========================================');

  const logPath = path.join(DEBUG_DIR, 'my-events-click-debug.log');
  fs.writeFileSync(logPath, debugLog.join('\n'));

  console.log(`\n📋 Debug log saved to: ${logPath}`);
  console.log(`📸 Screenshots saved to: ${DEBUG_DIR}/click-*.png\n`);
});
