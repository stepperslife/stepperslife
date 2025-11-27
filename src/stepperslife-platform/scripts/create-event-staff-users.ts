import { prisma } from '../lib/db/client'
import bcrypt from 'bcryptjs'

// 9 Event Staff Test Users
const STAFF_MEMBERS = [
  {
    email: 'staff1@stepperslife.com',
    password: 'TestPass123!',
    name: 'Marcus Johnson (STAFF)',
    eventRole: 'STAFF' as const,
    canScan: true,
    commissionPercent: 5.0,
  },
  {
    email: 'staff2@stepperslife.com',
    password: 'TestPass123!',
    name: 'Lisa Martinez (STAFF)',
    eventRole: 'STAFF' as const,
    canScan: true,
    commissionPercent: 7.5,
  },
  {
    email: 'staff3@stepperslife.com',
    password: 'TestPass123!',
    name: 'James Williams (STAFF)',
    eventRole: 'STAFF' as const,
    canScan: true,
    commissionPercent: 5.0,
  },
]

const TEAM_MEMBERS = [
  {
    email: 'team1@stepperslife.com',
    password: 'TestPass123!',
    name: 'Sarah Anderson (TEAM)',
    eventRole: 'TEAM_MEMBER' as const,
    canScan: true,
    commissionPercent: null, // No commission
  },
  {
    email: 'team2@stepperslife.com',
    password: 'TestPass123!',
    name: 'David Chen (TEAM)',
    eventRole: 'TEAM_MEMBER' as const,
    canScan: true,
    commissionPercent: null,
  },
  {
    email: 'team3@stepperslife.com',
    password: 'TestPass123!',
    name: 'Emily Rodriguez (TEAM)',
    eventRole: 'TEAM_MEMBER' as const,
    canScan: false, // This one cannot scan
    commissionPercent: null,
  },
]

const ASSOCIATES = [
  {
    email: 'associate1@stepperslife.com',
    password: 'TestPass123!',
    name: 'Kevin Brown (ASSOCIATE)',
    eventRole: 'ASSOCIATE' as const,
    canScan: false, // Associates cannot scan
    commissionPercent: 15.0, // Higher affiliate commission
    referralCode: 'KEVIN2025',
  },
  {
    email: 'associate2@stepperslife.com',
    password: 'TestPass123!',
    name: 'Michelle Taylor (ASSOCIATE)',
    eventRole: 'ASSOCIATE' as const,
    canScan: false,
    commissionPercent: 12.0,
    referralCode: 'MICHELLE25',
  },
  {
    email: 'associate3@stepperslife.com',
    password: 'TestPass123!',
    name: 'Robert Garcia (ASSOCIATE)',
    eventRole: 'ASSOCIATE' as const,
    canScan: false,
    commissionPercent: 10.0,
    referralCode: 'ROBERT2025',
  },
]

async function main() {
  console.log('🚀 Creating Event Staff Test Users\n')
  console.log('=' .repeat(80))

  // Step 1: Find an event to assign staff to
  console.log('\n📋 Step 1: Finding test event...')
  const organizer = await prisma.user.findUnique({
    where: { email: 'organizer@stepperslife.com' },
    select: { id: true, email: true },
  })

  if (!organizer) {
    console.error('❌ Organizer user not found! Please create organizer@stepperslife.com first.')
    process.exit(1)
  }

  console.log(`✓ Found organizer: ${organizer.email}`)

  // Find an event created by this organizer
  const event = await prisma.event.findFirst({
    where: {
      organizerId: organizer.id,
      status: 'PUBLISHED',
    },
    select: {
      id: true,
      title: true,
      slug: true,
    },
  })

  if (!event) {
    console.error('❌ No published events found for organizer!')
    console.error('Please create a test event first as organizer@stepperslife.com')
    process.exit(1)
  }

  console.log(`✓ Found test event: "${event.title}" (${event.slug})`)

  // Step 2: Create all 9 users
  console.log('\n📋 Step 2: Creating 9 event staff users...')
  console.log('=' .repeat(80))

  const allUsers = [...STAFF_MEMBERS, ...TEAM_MEMBERS, ...ASSOCIATES]
  const createdUsers = []

  for (const userData of allUsers) {
    try {
      // Check if user already exists
      const existing = await prisma.user.findUnique({
        where: { email: userData.email },
      })

      if (existing) {
        console.log(`⚠️  User ${userData.email} already exists, deleting...`)
        // Delete EventStaff assignments first
        await prisma.eventStaff.deleteMany({
          where: { userId: existing.id },
        })
        // Then delete user
        await prisma.user.delete({ where: { email: userData.email } })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10)

      // Create user with platform role 'USER'
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          role: 'USER', // Platform role (not event role)
          preferences: {
            showEvents: true,
            showStore: true,
            showBlog: false,
          },
        },
      })

      console.log(`✓ Created USER: ${userData.email}`)
      createdUsers.push({ ...userData, userId: user.id })
    } catch (error) {
      console.error(`❌ Error creating ${userData.email}:`, error)
    }
  }

  // Step 3: Assign users to event as EventStaff
  console.log('\n📋 Step 3: Assigning staff to event...')
  console.log('=' .repeat(80))

  for (const userData of createdUsers) {
    try {
      const permissions: Record<string, any> = {}

      // Add referral code to permissions for associates
      if ('referralCode' in userData && userData.referralCode) {
        permissions.referralCode = userData.referralCode
        permissions.canViewReferralStats = true
        permissions.canGeneratePromoCodes = true
      }

      // Create EventStaff assignment
      await prisma.eventStaff.create({
        data: {
          eventId: event.id,
          userId: userData.userId,
          role: userData.eventRole,
          canScan: userData.canScan,
          commissionPercent: userData.commissionPercent,
          permissions: Object.keys(permissions).length > 0 ? permissions : undefined,
          isActive: true,
        },
      })

      console.log(
        `✓ Assigned ${userData.email} as ${userData.eventRole} to "${event.title}"`
      )
      console.log(
        `  - Can Scan: ${userData.canScan ? 'Yes' : 'No'} | Commission: ${userData.commissionPercent ? userData.commissionPercent + '%' : 'None'}`
      )
    } catch (error) {
      console.error(`❌ Error assigning ${userData.email} to event:`, error)
    }
  }

  // Step 4: Verify assignments
  console.log('\n📋 Step 4: Verifying EventStaff assignments...')
  console.log('=' .repeat(80))

  const staffCount = await prisma.eventStaff.count({
    where: {
      eventId: event.id,
      isActive: true,
    },
  })

  console.log(`✓ Total active staff for "${event.title}": ${staffCount}`)

  const staffByRole = await prisma.eventStaff.groupBy({
    by: ['role'],
    where: {
      eventId: event.id,
      isActive: true,
    },
    _count: true,
  })

  console.log('\nStaff breakdown by role:')
  for (const group of staffByRole) {
    console.log(`  - ${group.role}: ${group._count} members`)
  }

  // Print summary
  console.log('\n' + '=' .repeat(80))
  console.log('✅ EVENT STAFF TEST USERS CREATED SUCCESSFULLY!')
  console.log('=' .repeat(80))

  console.log('\n📝 Test Credentials Summary:')
  console.log('=' .repeat(80))

  console.log('\n🔹 STAFF MEMBERS (Can scan, earn commission):')
  STAFF_MEMBERS.forEach((u) => {
    console.log(`   ${u.email} / ${u.password}`)
    console.log(`   └─ ${u.name} | ${u.commissionPercent}% commission`)
  })

  console.log('\n🔹 TEAM MEMBERS (Can scan, no commission):')
  TEAM_MEMBERS.forEach((u) => {
    console.log(`   ${u.email} / ${u.password}`)
    console.log(`   └─ ${u.name} | Can Scan: ${u.canScan ? 'Yes' : 'No'}`)
  })

  console.log('\n🔹 ASSOCIATES (Cannot scan, high commission):')
  ASSOCIATES.forEach((u) => {
    console.log(`   ${u.email} / ${u.password}`)
    console.log(`   └─ ${u.name} | ${u.commissionPercent}% | Ref: ${u.referralCode}`)
  })

  console.log('\n🎯 All 9 users assigned to event: ' + event.title)
  console.log('   Event ID: ' + event.id)
  console.log('   Event URL: /events/' + event.slug)

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
