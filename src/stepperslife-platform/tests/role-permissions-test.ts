import { chromium, type Browser, type Page } from 'playwright'
import { prisma } from '../lib/db/client'

interface TestResult {
  role: string
  email: string
  loginSuccess: boolean
  redirectedTo: string
  profileIconVisible: boolean
  badgeText: string | null
  dropdownOptions: string[]
  dashboardTests: {
    [key: string]: {
      accessible: boolean
      redirectedTo?: string
      error?: string
    }
  }
}

const TEST_ACCOUNTS = [
  { email: 'admin@stepperslife.com', password: 'TestPass123!', role: 'ADMIN', expectedOptions: 5 },
  {
    email: 'organizer@stepperslife.com',
    password: 'TestPass123!',
    role: 'EVENT_ORGANIZER',
    expectedOptions: 3,
  },
  { email: 'vendor@stepperslife.com', password: 'TestPass123!', role: 'VENDOR', expectedOptions: 3 },
  { email: 'user@stepperslife.com', password: 'TestPass123!', role: 'USER', expectedOptions: 2 },
]

async function checkUserExists(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { email: true, password: true },
  })
  return !!user && !!user.password
}

async function testRolePermissions(
  page: Page,
  email: string,
  password: string,
  role: string
): Promise<TestResult> {
  const result: TestResult = {
    role,
    email,
    loginSuccess: false,
    redirectedTo: '',
    profileIconVisible: false,
    badgeText: null,
    dropdownOptions: [],
    dashboardTests: {},
  }

  try {
    console.log(`\n📋 Testing ${role} role (${email})...`)

    // Navigate to signin page
    await page.goto('http://localhost:3000/auth/signin')
    await page.waitForLoadState('networkidle')

    // Fill in credentials using id selectors
    await page.fill('#email', email)
    await page.fill('#password', password)

    // Take screenshot before submitting
    await page.screenshot({ path: `screenshots/before-login-${role}.png` })

    // Click sign in button and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }),
      page.click('button[type="submit"]'),
    ])

    // Wait for navigation after login
    await page.waitForLoadState('networkidle')
    result.redirectedTo = page.url()
    result.loginSuccess = !result.redirectedTo.includes('/auth/signin')

    if (!result.loginSuccess) {
      console.log(`  ❌ Login failed for ${email}`)
      return result
    }

    console.log(`  ✓ Login successful, redirected to: ${result.redirectedTo}`)

    // Check if profile icon is visible
    const profileIcon = page.locator('button:has(svg)').first()
    result.profileIconVisible = await profileIcon.isVisible()
    console.log(`  Profile icon visible: ${result.profileIconVisible}`)

    if (result.profileIconVisible) {
      // Click profile icon to open dropdown
      await profileIcon.click()
      await page.waitForTimeout(500)

      // Get badge text
      const badgeLocator = page.locator('text=/Administrator|Event Organizer|Vendor|User/').first()
      if (await badgeLocator.isVisible()) {
        result.badgeText = await badgeLocator.textContent()
        console.log(`  Badge: "${result.badgeText}"`)
      }

      // Get all dropdown options
      const dropdownLinks = page.locator('a[href^="/"]')
      const linkCount = await dropdownLinks.count()

      for (let i = 0; i < linkCount; i++) {
        const text = await dropdownLinks.nth(i).textContent()
        if (text && !text.includes('Sign Out')) {
          result.dropdownOptions.push(text.trim())
        }
      }

      console.log(`  Dropdown options (${result.dropdownOptions.length}):`, result.dropdownOptions)

      // Test dashboard access
      const dashboardUrls = [
        { name: 'Admin Dashboard', url: '/admin/dashboard' },
        { name: 'Organizer Dashboard', url: '/organizer/dashboard' },
        { name: 'Vendor Dashboard', url: '/vendor/dashboard' },
      ]

      for (const dashboard of dashboardUrls) {
        console.log(`  Testing ${dashboard.name}...`)

        try {
          await page.goto(`http://localhost:3000${dashboard.url}`)
          await page.waitForLoadState('networkidle')

          const currentUrl = page.url()
          const wasRedirected = !currentUrl.includes(dashboard.url)

          result.dashboardTests[dashboard.name] = {
            accessible: !wasRedirected,
            redirectedTo: wasRedirected ? currentUrl : undefined,
          }

          if (wasRedirected) {
            console.log(`    ✗ Blocked - Redirected to: ${currentUrl}`)
          } else {
            console.log(`    ✓ Accessible`)
          }
        } catch (error) {
          result.dashboardTests[dashboard.name] = {
            accessible: false,
            error: (error as Error).message,
          }
          console.log(`    ✗ Error: ${(error as Error).message}`)
        }
      }
    }

    // Sign out
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    const profileIconAgain = page.locator('button:has(svg)').first()
    if (await profileIconAgain.isVisible()) {
      await profileIconAgain.click()
      await page.waitForTimeout(300)
      const signOutButton = page.locator('button:has-text("Sign Out")')
      if (await signOutButton.isVisible()) {
        await signOutButton.click()
        await page.waitForLoadState('networkidle')
        console.log(`  ✓ Signed out successfully`)
      }
    }
  } catch (error) {
    console.error(`  ❌ Error during ${role} test:`, (error as Error).message)
  }

  return result
}

async function generateReport(results: TestResult[]) {
  console.log('\n' + '='.repeat(80))
  console.log('ROLE PERMISSIONS TEST REPORT')
  console.log('='.repeat(80))

  for (const result of results) {
    console.log(`\n## ${result.role} Role - ${result.email}`)
    console.log(`   Login: ${result.loginSuccess ? '✓ SUCCESS' : '❌ FAILED'}`)
    console.log(`   Redirected to: ${result.redirectedTo}`)
    console.log(`   Profile Icon: ${result.profileIconVisible ? '✓ Visible' : '❌ Not Visible'}`)
    console.log(`   Badge Text: "${result.badgeText}"`)
    console.log(`   Dropdown Options (${result.dropdownOptions.length}): ${result.dropdownOptions.join(', ')}`)

    console.log(`   Dashboard Access:`)
    for (const [dashboard, test] of Object.entries(result.dashboardTests)) {
      if (test.accessible) {
        console.log(`     ✓ ${dashboard}: Accessible`)
      } else if (test.redirectedTo) {
        console.log(`     ✗ ${dashboard}: Blocked (→ ${test.redirectedTo})`)
      } else if (test.error) {
        console.log(`     ✗ ${dashboard}: Error - ${test.error}`)
      }
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('EXPECTED VS ACTUAL')
  console.log('='.repeat(80))

  const expectations = {
    ADMIN: {
      dropdownOptions: 5,
      adminDashboard: true,
      organizerDashboard: true,
      vendorDashboard: true,
    },
    EVENT_ORGANIZER: {
      dropdownOptions: 3,
      adminDashboard: false,
      organizerDashboard: true,
      vendorDashboard: false,
    },
    VENDOR: {
      dropdownOptions: 3,
      adminDashboard: false,
      organizerDashboard: false,
      vendorDashboard: true,
    },
    USER: {
      dropdownOptions: 2,
      adminDashboard: false,
      organizerDashboard: false,
      vendorDashboard: false,
    },
  }

  for (const result of results) {
    const expected = expectations[result.role as keyof typeof expectations]
    console.log(`\n${result.role}:`)

    const dropdownMatch = result.dropdownOptions.length === expected.dropdownOptions
    console.log(
      `  Dropdown Options: ${dropdownMatch ? '✓' : '❌'} (Expected: ${expected.dropdownOptions}, Actual: ${result.dropdownOptions.length})`
    )

    const adminMatch = result.dashboardTests['Admin Dashboard']?.accessible === expected.adminDashboard
    console.log(`  Admin Dashboard: ${adminMatch ? '✓' : '❌'} (Expected: ${expected.adminDashboard}, Actual: ${result.dashboardTests['Admin Dashboard']?.accessible})`)

    const organizerMatch = result.dashboardTests['Organizer Dashboard']?.accessible === expected.organizerDashboard
    console.log(`  Organizer Dashboard: ${organizerMatch ? '✓' : '❌'} (Expected: ${expected.organizerDashboard}, Actual: ${result.dashboardTests['Organizer Dashboard']?.accessible})`)

    const vendorMatch = result.dashboardTests['Vendor Dashboard']?.accessible === expected.vendorDashboard
    console.log(`  Vendor Dashboard: ${vendorMatch ? '✓' : '❌'} (Expected: ${expected.vendorDashboard}, Actual: ${result.dashboardTests['Vendor Dashboard']?.accessible})`)
  }

  console.log('\n' + '='.repeat(80))
}

async function main() {
  console.log('🚀 Starting Role-Based Permissions Test Suite\n')

  // Check if test users exist
  console.log('Checking if test users exist in database...')
  for (const account of TEST_ACCOUNTS) {
    const exists = await checkUserExists(account.email)
    console.log(`  ${exists ? '✓' : '❌'} ${account.email} (${account.role})`)

    if (!exists) {
      console.error(`\n❌ Test user ${account.email} not found or has no password!`)
      console.error('Please create test users first.')
      process.exit(1)
    }
  }

  console.log('\n✓ All test users found in database\n')

  // Launch browser
  const browser: Browser = await chromium.launch({
    headless: false, // Set to true for headless mode
    slowMo: 100, // Slow down by 100ms for visibility
  })

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  })

  const page = await context.newPage()

  const results: TestResult[] = []

  // Test each role
  for (const account of TEST_ACCOUNTS) {
    const result = await testRolePermissions(page, account.email, account.password, account.role)
    results.push(result)
  }

  // Close browser
  await browser.close()

  // Generate report
  await generateReport(results)

  // Disconnect from database
  await prisma.$disconnect()

  console.log('\n✅ Test suite completed!\n')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
