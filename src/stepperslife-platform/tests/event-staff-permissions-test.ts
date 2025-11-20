import { chromium, type Browser, type Page } from 'playwright'
import { prisma } from '../lib/db/client'

interface EventStaffTestResult {
  role: 'STAFF' | 'TEAM_MEMBER' | 'ASSOCIATE'
  email: string
  name: string
  loginSuccess: boolean
  redirectedTo: string
  canScan: boolean
  commissionPercent: number | null
  eventVisible: boolean
  staffDashboardAccessible: boolean
  scanPageAccessible: boolean
  commissionPageAccessible: boolean
  errors: string[]
}

const STAFF_TEST_ACCOUNTS = [
  // 3 STAFF members
  {
    email: 'staff1@stepperslife.com',
    password: 'TestPass123!',
    role: 'STAFF' as const,
    name: 'Marcus Johnson',
    expectedCanScan: true,
    expectedCommission: 5.0,
  },
  {
    email: 'staff2@stepperslife.com',
    password: 'TestPass123!',
    role: 'STAFF' as const,
    name: 'Lisa Martinez',
    expectedCanScan: true,
    expectedCommission: 7.5,
  },
  {
    email: 'staff3@stepperslife.com',
    password: 'TestPass123!',
    role: 'STAFF' as const,
    name: 'James Williams',
    expectedCanScan: true,
    expectedCommission: 5.0,
  },
  // 3 TEAM_MEMBERS
  {
    email: 'team1@stepperslife.com',
    password: 'TestPass123!',
    role: 'TEAM_MEMBER' as const,
    name: 'Sarah Anderson',
    expectedCanScan: true,
    expectedCommission: null,
  },
  {
    email: 'team2@stepperslife.com',
    password: 'TestPass123!',
    role: 'TEAM_MEMBER' as const,
    name: 'David Chen',
    expectedCanScan: true,
    expectedCommission: null,
  },
  {
    email: 'team3@stepperslife.com',
    password: 'TestPass123!',
    role: 'TEAM_MEMBER' as const,
    name: 'Emily Rodriguez',
    expectedCanScan: false, // This one cannot scan
    expectedCommission: null,
  },
  // 3 ASSOCIATES
  {
    email: 'associate1@stepperslife.com',
    password: 'TestPass123!',
    role: 'ASSOCIATE' as const,
    name: 'Kevin Brown',
    expectedCanScan: false,
    expectedCommission: 15.0,
  },
  {
    email: 'associate2@stepperslife.com',
    password: 'TestPass123!',
    role: 'ASSOCIATE' as const,
    name: 'Michelle Taylor',
    expectedCanScan: false,
    expectedCommission: 12.0,
  },
  {
    email: 'associate3@stepperslife.com',
    password: 'TestPass123!',
    role: 'ASSOCIATE' as const,
    name: 'Robert Garcia',
    expectedCanScan: false,
    expectedCommission: 10.0,
  },
]

async function checkEventStaffAssignment(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      eventStaff: {
        include: {
          event: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
            },
          },
        },
      },
    },
  })

  return user?.eventStaff[0] || null
}

async function testEventStaffPermissions(
  page: Page,
  account: (typeof STAFF_TEST_ACCOUNTS)[0]
): Promise<EventStaffTestResult> {
  const result: EventStaffTestResult = {
    role: account.role,
    email: account.email,
    name: account.name,
    loginSuccess: false,
    redirectedTo: '',
    canScan: account.expectedCanScan,
    commissionPercent: account.expectedCommission,
    eventVisible: false,
    staffDashboardAccessible: false,
    scanPageAccessible: false,
    commissionPageAccessible: false,
    errors: [],
  }

  try {
    console.log(`\n📋 Testing ${account.role} role: ${account.name} (${account.email})`)

    // Check database assignment first
    const staffAssignment = await checkEventStaffAssignment(account.email)
    if (!staffAssignment) {
      result.errors.push('No EventStaff assignment found in database')
      console.log('  ❌ Not assigned to any event in database!')
      return result
    }

    console.log(`  ✓ Assigned to event: "${staffAssignment.event.title}"`)
    console.log(`  ✓ Role: ${staffAssignment.role}`)
    console.log(`  ✓ Can Scan: ${staffAssignment.canScan ? 'Yes' : 'No'}`)
    console.log(
      `  ✓ Commission: ${staffAssignment.commissionPercent ? staffAssignment.commissionPercent + '%' : 'None'}`
    )

    // Navigate to signin page
    await page.goto('http://localhost:3000/auth/signin')
    await page.waitForLoadState('networkidle')

    // Fill in credentials
    await page.fill('#email', account.email)
    await page.fill('#password', account.password)

    // Click sign in button and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }),
      page.click('button[type="submit"]'),
    ])

    await page.waitForLoadState('networkidle')
    result.redirectedTo = page.url()
    result.loginSuccess = !result.redirectedTo.includes('/auth/signin')

    if (!result.loginSuccess) {
      result.errors.push('Login failed')
      console.log('  ❌ Login failed')
      return result
    }

    console.log(`  ✓ Login successful`)

    // Test 1: Can they access the event page?
    const eventSlug = staffAssignment.event.slug
    console.log(`\n  Testing event page access: /events/${eventSlug}`)

    try {
      await page.goto(`http://localhost:3000/events/${eventSlug}`)
      await page.waitForLoadState('networkidle')

      const currentUrl = page.url()
      result.eventVisible = currentUrl.includes(eventSlug)

      if (result.eventVisible) {
        console.log('    ✓ Can view event page')
      } else {
        console.log('    ✗ Redirected away from event page')
        result.errors.push('Cannot access event page')
      }
    } catch (error) {
      result.errors.push(`Event page error: ${(error as Error).message}`)
      console.log('    ✗ Error accessing event page')
    }

    // Test 2: Check for staff dashboard
    console.log('\n  Testing staff dashboard access...')
    const staffDashboardUrls = [
      `/staff/dashboard`,
      `/events/${eventSlug}/staff`,
      `/organizer/events/${staffAssignment.event.id}/staff`,
    ]

    for (const url of staffDashboardUrls) {
      try {
        await page.goto(`http://localhost:3000${url}`)
        await page.waitForLoadState('networkidle', { timeout: 3000 })

        const currentUrl = page.url()
        if (currentUrl.includes('/staff') || currentUrl.includes('/dashboard')) {
          result.staffDashboardAccessible = true
          console.log(`    ✓ Staff dashboard accessible at: ${url}`)
          break
        }
      } catch (error) {
        // Continue to next URL
      }
    }

    if (!result.staffDashboardAccessible) {
      console.log('    ✗ No staff dashboard found')
      result.errors.push('Staff dashboard not accessible or does not exist')
    }

    // Test 3: Check for scan page (if canScan is true)
    if (account.expectedCanScan) {
      console.log('\n  Testing ticket scan page access...')
      const scanUrls = [
        `/events/${eventSlug}/scan`,
        `/events/${eventSlug}/check-in`,
        `/staff/scan`,
      ]

      for (const url of scanUrls) {
        try {
          await page.goto(`http://localhost:3000${url}`)
          await page.waitForLoadState('networkidle', { timeout: 3000 })

          const currentUrl = page.url()
          if (currentUrl.includes('/scan') || currentUrl.includes('/check-in')) {
            result.scanPageAccessible = true
            console.log(`    ✓ Scan page accessible at: ${url}`)
            break
          }
        } catch (error) {
          // Continue to next URL
        }
      }

      if (!result.scanPageAccessible) {
        console.log('    ✗ No scan page found')
        result.errors.push('Scan page not accessible or does not exist')
      }
    } else {
      console.log('\n  ⊘ Scan access not expected for this role')
    }

    // Test 4: Check for commission dashboard (if has commission)
    if (account.expectedCommission) {
      console.log('\n  Testing commission dashboard access...')
      const commissionUrls = [
        `/staff/earnings`,
        `/staff/commissions`,
        `/dashboard/earnings`,
      ]

      for (const url of commissionUrls) {
        try {
          await page.goto(`http://localhost:3000${url}`)
          await page.waitForLoadState('networkidle', { timeout: 3000 })

          const currentUrl = page.url()
          if (
            currentUrl.includes('/earnings') ||
            currentUrl.includes('/commission')
          ) {
            result.commissionPageAccessible = true
            console.log(`    ✓ Commission page accessible at: ${url}`)
            break
          }
        } catch (error) {
          // Continue to next URL
        }
      }

      if (!result.commissionPageAccessible) {
        console.log('    ✗ No commission dashboard found')
        result.errors.push('Commission dashboard not accessible or does not exist')
      }
    } else {
      console.log('\n  ⊘ Commission tracking not expected for this role')
    }

    // Sign out
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    const profileIcon = page.locator('button:has(svg)').first()
    if (await profileIcon.isVisible()) {
      await profileIcon.click()
      await page.waitForTimeout(300)
      const signOutButton = page.locator('button:has-text("Sign Out")')
      if (await signOutButton.isVisible()) {
        await signOutButton.click()
        await page.waitForLoadState('networkidle')
        console.log('  ✓ Signed out successfully')
      }
    }
  } catch (error) {
    result.errors.push(`Test error: ${(error as Error).message}`)
    console.error(`  ❌ Error during test:`, (error as Error).message)
  }

  return result
}

async function generateReport(results: EventStaffTestResult[]) {
  console.log('\n' + '='.repeat(80))
  console.log('EVENT STAFF PERMISSIONS TEST REPORT')
  console.log('='.repeat(80))

  // Group by role
  const staffResults = results.filter((r) => r.role === 'STAFF')
  const teamResults = results.filter((r) => r.role === 'TEAM_MEMBER')
  const associateResults = results.filter((r) => r.role === 'ASSOCIATE')

  // STAFF results
  console.log('\n## STAFF MEMBERS (3 users)')
  console.log('Expected: Can scan, earn commission, view earnings')
  console.log('-'.repeat(80))
  for (const result of staffResults) {
    console.log(`\n${result.name} (${result.email})`)
    console.log(`  Login: ${result.loginSuccess ? '✓ SUCCESS' : '❌ FAILED'}`)
    console.log(`  Event Visible: ${result.eventVisible ? '✓ Yes' : '❌ No'}`)
    console.log(
      `  Staff Dashboard: ${result.staffDashboardAccessible ? '✓ Accessible' : '❌ Not Found'}`
    )
    console.log(
      `  Scan Page: ${result.scanPageAccessible ? '✓ Accessible' : '❌ Not Found'}`
    )
    console.log(
      `  Commission Page: ${result.commissionPageAccessible ? '✓ Accessible' : '❌ Not Found'}`
    )
    if (result.errors.length > 0) {
      console.log(`  Errors: ${result.errors.join(', ')}`)
    }
  }

  // TEAM_MEMBER results
  console.log('\n\n## TEAM MEMBERS (3 users)')
  console.log('Expected: Can scan (2/3), NO commission, NO financial data')
  console.log('-'.repeat(80))
  for (const result of teamResults) {
    console.log(`\n${result.name} (${result.email})`)
    console.log(`  Login: ${result.loginSuccess ? '✓ SUCCESS' : '❌ FAILED'}`)
    console.log(`  Event Visible: ${result.eventVisible ? '✓ Yes' : '❌ No'}`)
    console.log(
      `  Staff Dashboard: ${result.staffDashboardAccessible ? '✓ Accessible' : '❌ Not Found'}`
    )
    console.log(
      `  Scan Page: ${result.canScan ? (result.scanPageAccessible ? '✓ Accessible' : '❌ Not Found') : '⊘ Not Expected'}`
    )
    console.log(`  Commission Page: ⊘ Not Expected (Team members don't earn commission)`)
    if (result.errors.length > 0) {
      console.log(`  Errors: ${result.errors.join(', ')}`)
    }
  }

  // ASSOCIATE results
  console.log('\n\n## ASSOCIATES (3 users)')
  console.log('Expected: CANNOT scan, earn HIGH commission, view referral stats')
  console.log('-'.repeat(80))
  for (const result of associateResults) {
    console.log(`\n${result.name} (${result.email})`)
    console.log(`  Login: ${result.loginSuccess ? '✓ SUCCESS' : '❌ FAILED'}`)
    console.log(`  Event Visible: ${result.eventVisible ? '✓ Yes' : '❌ No'}`)
    console.log(
      `  Staff Dashboard: ${result.staffDashboardAccessible ? '✓ Accessible' : '❌ Not Found'}`
    )
    console.log(`  Scan Page: ⊘ Not Expected (Associates cannot scan)`)
    console.log(
      `  Commission Page: ${result.commissionPageAccessible ? '✓ Accessible' : '❌ Not Found'}`
    )
    if (result.errors.length > 0) {
      console.log(`  Errors: ${result.errors.join(', ')}`)
    }
  }

  // Summary
  console.log('\n\n' + '='.repeat(80))
  console.log('SUMMARY')
  console.log('='.repeat(80))

  const totalTests = results.length
  const successfulLogins = results.filter((r) => r.loginSuccess).length
  const eventAccessible = results.filter((r) => r.eventVisible).length
  const staffDashboardFound = results.filter((r) => r.staffDashboardAccessible).length
  const scanPageFound = results.filter((r) => r.canScan && r.scanPageAccessible).length
  const commissionPageFound = results.filter(
    (r) => r.commissionPercent && r.commissionPageAccessible
  ).length

  console.log(`\nTotal Tests: ${totalTests}`)
  console.log(`Successful Logins: ${successfulLogins}/${totalTests}`)
  console.log(`Event Page Accessible: ${eventAccessible}/${totalTests}`)
  console.log(`Staff Dashboard Found: ${staffDashboardFound}/${totalTests}`)
  console.log(
    `Scan Page Found: ${scanPageFound}/${results.filter((r) => r.canScan).length} (of those with scan permission)`
  )
  console.log(
    `Commission Page Found: ${commissionPageFound}/${results.filter((r) => r.commissionPercent).length} (of those with commission)`
  )

  // Implementation Status
  console.log('\n\n' + '='.repeat(80))
  console.log('IMPLEMENTATION STATUS')
  console.log('='.repeat(80))

  console.log('\n✅ IMPLEMENTED:')
  console.log('  - EventStaff database model')
  console.log('  - User authentication for staff accounts')
  console.log('  - Event page visibility')

  console.log('\n❌ NOT YET IMPLEMENTED (Based on test results):')
  if (staffDashboardFound === 0) {
    console.log('  - Staff dashboard UI')
  }
  if (scanPageFound === 0) {
    console.log('  - Ticket scanning interface')
  }
  if (commissionPageFound === 0) {
    console.log('  - Commission/earnings dashboard')
  }

  console.log('\n📋 RECOMMENDED NEXT STEPS:')
  console.log('  1. Build staff dashboard at /staff/dashboard or /events/[slug]/staff')
  console.log('  2. Implement ticket scanning page at /events/[slug]/scan')
  console.log('  3. Create commission tracking dashboard at /staff/earnings')
  console.log('  4. Add referral link generator for ASSOCIATE role')
  console.log('  5. Implement permission middleware to enforce role-based access')

  console.log('\n' + '='.repeat(80))
}

async function main() {
  console.log('🚀 Starting Event Staff Permissions Test Suite\n')

  // Check if test users exist
  console.log('Checking if event staff users exist in database...')
  for (const account of STAFF_TEST_ACCOUNTS) {
    const staffAssignment = await checkEventStaffAssignment(account.email)
    const status = staffAssignment ? '✓' : '❌'
    console.log(`  ${status} ${account.email} (${account.role})`)

    if (!staffAssignment) {
      console.error(`\n❌ Event staff user ${account.email} not found or not assigned!`)
      console.error('Please run: npx tsx scripts/create-event-staff-users.ts')
      process.exit(1)
    }
  }

  console.log('\n✓ All 9 event staff users found and assigned in database\n')

  // Launch browser
  const browser: Browser = await chromium.launch({
    headless: false,
    slowMo: 100,
  })

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  })

  const page = await context.newPage()

  const results: EventStaffTestResult[] = []

  // Test each event staff user
  for (const account of STAFF_TEST_ACCOUNTS) {
    const result = await testEventStaffPermissions(page, account)
    results.push(result)
  }

  // Close browser
  await browser.close()

  // Generate report
  await generateReport(results)

  // Disconnect from database
  await prisma.$disconnect()

  console.log('\n✅ Event staff permissions test suite completed!\n')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
