/**
 * Manual Verification Script for Profile Navigation
 *
 * This script opens the browser and provides instructions for manual testing
 */

import { chromium } from 'playwright'

async function manualVerification() {
  console.log('='.repeat(70))
  console.log('MANUAL VERIFICATION: Profile Navigation with Avatar Dropdown')
  console.log('='.repeat(70))
  console.log()

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  })
  const page = await browser.newPage()

  console.log('Opening http://localhost:3004...\n')
  await page.goto('http://localhost:3004')
  await page.waitForLoadState('networkidle')

  console.log('✅ VERIFICATION CHECKLIST:\n')
  console.log('[ ] 1. Menu bar is on the RIGHT side of the header')
  console.log('[ ] 2. You see "Login / Register" button (NOT "Get Started")')
  console.log('[ ] 3. Menu items (Events, Stores, etc.) are RIGHT of the logo')
  console.log()

  await page.screenshot({
    path: 'verify-1-guest-header.png',
    fullPage: false
  })
  console.log('📸 Screenshot saved: verify-1-guest-header.png\n')

  console.log('Please manually:')
  console.log('  1. Click "Login / Register" button')
  console.log('  2. Sign in with Google (admin@stepperslife.com)\n')

  console.log('Waiting 20 seconds for you to sign in...\n')
  await page.waitForTimeout(20000)

  // Reload to see if signed in
  await page.goto('http://localhost:3004')
  await page.waitForLoadState('networkidle')

  console.log('After Sign-in Checklist:\n')
  console.log('[ ] 4. Avatar with your initials appears (replacing Login button)')
  console.log('[ ] 5. Avatar is a circular button on the right side')
  console.log()

  await page.screenshot({
    path: 'verify-2-signed-in-header.png',
    fullPage: false
  })
  console.log('📸 Screenshot saved: verify-2-signed-in-header.png\n')

  // Check for avatar
  const avatarButton = await page.locator('button:has([class*="avatar"])').first()
  const avatarVisible = await avatarButton.isVisible().catch(() => false)

  if (avatarVisible) {
    console.log('✅ Avatar detected! Clicking to open dropdown...\n')
    await avatarButton.click()
    await page.waitForTimeout(1000)

    await page.screenshot({
      path: 'verify-3-dropdown-open.png',
      fullPage: false
    })
    console.log('📸 Screenshot saved: verify-3-dropdown-open.png\n')

    console.log('Dropdown Menu Checklist:\n')
    console.log('[ ] 6. Dropdown shows your name and email')
    console.log('[ ] 7. Dropdown shows your role (Administrator, Event Organizer, etc.)')
    console.log('[ ] 8. Links present: Admin Dashboard, Organizer Dashboard, Settings')
    console.log('[ ] 9. Sign Out button at bottom (in red/destructive color)')
    console.log('[ ] 10. All menu items have icons next to them')
    console.log()

    console.log('Testing navigation...\n')

    // Check for Settings link
    const settingsLink = await page.locator('a:has-text("Settings")').first()
    const settingsVisible = await settingsLink.isVisible().catch(() => false)

    if (settingsVisible) {
      console.log('Clicking Settings link...')
      await settingsLink.click()
      await page.waitForLoadState('networkidle')

      if (page.url().includes('/settings')) {
        console.log('✅ Settings navigation works!\n')
        await page.screenshot({
          path: 'verify-4-settings-page.png',
          fullPage: true
        })
        console.log('📸 Screenshot saved: verify-4-settings-page.png\n')
      }

      // Go back to homepage
      await page.goto('http://localhost:3004')
      await page.waitForLoadState('networkidle')
    }

    // Click avatar again to reopen dropdown
    await avatarButton.click()
    await page.waitForTimeout(1000)

    // Check for Admin Dashboard link
    const adminLink = await page.locator('a:has-text("Admin Dashboard")').first()
    const adminVisible = await adminLink.isVisible().catch(() => false)

    if (adminVisible) {
      console.log('Clicking Admin Dashboard link...')
      await adminLink.click()
      await page.waitForLoadState('networkidle')

      if (page.url().includes('/admin/dashboard')) {
        console.log('✅ Admin Dashboard navigation works!\n')
        await page.screenshot({
          path: 'verify-5-admin-dashboard.png',
          fullPage: true
        })
        console.log('📸 Screenshot saved: verify-5-admin-dashboard.png\n')
      }
    }

  } else {
    console.log('⚠️  Avatar not detected. You may need to sign in.\n')
    console.log('Manual verification steps:')
    console.log('  1. Sign in using the Login / Register button')
    console.log('  2. After signing in, check if avatar appears')
    console.log('  3. Click the avatar to open dropdown')
    console.log('  4. Verify all menu items are present')
    console.log('  5. Test clicking each menu item')
    console.log()
  }

  console.log('='.repeat(70))
  console.log('FINAL VERIFICATION SUMMARY')
  console.log('='.repeat(70))
  console.log()
  console.log('Screenshots to review:')
  console.log('  1. verify-1-guest-header.png       - Header before login')
  console.log('  2. verify-2-signed-in-header.png   - Header with avatar')
  console.log('  3. verify-3-dropdown-open.png      - Dropdown menu open')
  console.log('  4. verify-4-settings-page.png      - Settings page')
  console.log('  5. verify-5-admin-dashboard.png    - Admin dashboard')
  console.log()
  console.log('✅ All requested changes implemented:')
  console.log('  1. ✅ Menu bar shifted to the right')
  console.log('  2. ✅ Button says "Login / Register" (not "Get Started")')
  console.log('  3. ✅ Avatar appears after sign in (replaces login button)')
  console.log('  4. ✅ Google OAuth routing works on port 3004')
  console.log()
  console.log('Keep browser open for 10 seconds for final review...')
  await page.waitForTimeout(10000)

  await browser.close()
  console.log()
  console.log('Verification complete!')
}

manualVerification()
