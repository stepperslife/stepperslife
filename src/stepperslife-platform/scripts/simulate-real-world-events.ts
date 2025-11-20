import { prisma } from '../lib/db/client'
import bcrypt from 'bcryptjs'

const PASSWORD = 'TestPass123!'

async function main() {
  console.log('🚀 Creating Real-World Event Simulation Data\n')
  console.log('=' .repeat(80))

  // Step 1: Create 2 Organizers
  console.log('\n📋 Step 1: Creating 2 Organizers...')

  const hashedPassword = await bcrypt.hash(PASSWORD, 10)

  const djSarah = await prisma.user.upsert({
    where: { email: 'djsarah@stepperslife.com' },
    update: {},
    create: {
      email: 'djsarah@stepperslife.com',
      name: 'DJ Sarah "SJ" Johnson',
      password: hashedPassword,
      role: 'EVENT_ORGANIZER',
      preferences: {
        showEvents: true,
        showStore: false,
        showBlog: false,
      },
    },
  })
  console.log(`✓ Created: ${djSarah.name}`)

  const coachMike = await prisma.user.upsert({
    where: { email: 'coachmike@stepperslife.com' },
    update: {},
    create: {
      email: 'coachmike@stepperslife.com',
      name: 'Coach Mike Rodriguez',
      password: hashedPassword,
      role: 'EVENT_ORGANIZER',
      preferences: {
        showEvents: true,
        showStore: false,
        showBlog: false,
      },
    },
  })
  console.log(`✓ Created: ${coachMike.name}`)

  // Step 2: Create Staff Members
  console.log('\n📋 Step 2: Creating 7 Staff Members...')

  // DJ Sarah's Team (3 members)
  const marcus = await prisma.user.upsert({
    where: { email: 'marcus@stepperslife.com' },
    update: {},
    create: {
      email: 'marcus@stepperslife.com',
      name: 'Marcus "Box Office" Thompson',
      password: hashedPassword,
      role: 'USER',
    },
  })
  console.log(`✓ Created: ${marcus.name} (DJ Sarah's team)`)

  const keisha = await prisma.user.upsert({
    where: { email: 'keisha@stepperslife.com' },
    update: {},
    create: {
      email: 'keisha@stepperslife.com',
      name: 'Keisha "Door Boss" Williams',
      password: hashedPassword,
      role: 'USER',
    },
  })
  console.log(`✓ Created: ${keisha.name} (DJ Sarah's team)`)

  const tanya = await prisma.user.upsert({
    where: { email: 'tanya@stepperslife.com' },
    update: {},
    create: {
      email: 'tanya@stepperslife.com',
      name: 'Tanya "Volunteer Queen" Davis',
      password: hashedPassword,
      role: 'USER',
    },
  })
  console.log(`✓ Created: ${tanya.name} (DJ Sarah's team - volunteer)`)

  // Coach Mike's Team (4 members)
  const lisaMartinez = await prisma.user.upsert({
    where: { email: 'lisa.martinez@stepperslife.com' },
    update: {},
    create: {
      email: 'lisa.martinez@stepperslife.com',
      name: 'Lisa "Sales Pro" Martinez',
      password: hashedPassword,
      role: 'USER',
    },
  })
  console.log(`✓ Created: ${lisaMartinez.name} (Mike's team)`)

  const jamesChen = await prisma.user.upsert({
    where: { email: 'james.chen@stepperslife.com' },
    update: {},
    create: {
      email: 'james.chen@stepperslife.com',
      name: 'James "Early Bird" Chen',
      password: hashedPassword,
      role: 'USER',
    },
  })
  console.log(`✓ Created: ${jamesChen.name} (Mike's team)`)

  const emilyRodriguez = await prisma.user.upsert({
    where: { email: 'emily.rodriguez@stepperslife.com' },
    update: {},
    create: {
      email: 'emily.rodriguez@stepperslife.com',
      name: 'Emily "Volunteer" Rodriguez',
      password: hashedPassword,
      role: 'USER',
    },
  })
  console.log(`✓ Created: ${emilyRodriguez.name} (Mike's team - volunteer)`)

  const kevinBrown = await prisma.user.upsert({
    where: { email: 'kevin.brown@stepperslife.com' },
    update: {},
    create: {
      email: 'kevin.brown@stepperslife.com',
      name: 'Kevin "Affiliate King" Brown',
      password: hashedPassword,
      role: 'USER',
    },
  })
  console.log(`✓ Created: ${kevinBrown.name} (Mike's team - affiliate)`)

  // Step 3: Create DJ Sarah's 4 Events
  console.log('\n📋 Step 3: Creating DJ Sarah\'s 4 Events...')

  // Event 1: Community Line Dance Night (FREE)
  const event1 = await prisma.event.create({
    data: {
      title: 'Community Line Dance Night',
      slug: 'community-line-dance-night',
      description: 'Free community event! Join us for an evening of line dancing, music, and fun. All levels welcome! Pay-what-you-want donations accepted at the door.',
      startDate: new Date('2025-03-15T19:00:00'),
      endDate: new Date('2025-03-15T23:00:00'),
      location: 'Riverside Community Center',
      imageUrl: '/images/events/line-dance.jpg',
      eventType: 'FREE_EVENT',
      categories: ['Line Dancing', 'Community', 'Beginners Welcome'],
      organizerId: djSarah.id,
      status: 'PUBLISHED',
      isPublished: true,
      isFeatured: true,
      capacity: 1000,
      allowWaitlist: false,
      allowTransfers: true,
      ticketTypes: {
        create: [
          {
            name: 'Free Admission',
            description: 'Free entry - donations welcome at the door',
            price: 0,
            quantity: 1000,
            sold: 847,
            isActive: true,
          },
        ],
      },
    },
  })
  console.log(`✓ Created: ${event1.title} (FREE, 847/1000 tickets)`)

  // Event 2: Spring Steppers Workshop
  const event2 = await prisma.event.create({
    data: {
      title: 'Spring Steppers Workshop',
      slug: 'spring-steppers-workshop-2025',
      description: '6-hour intensive workshop covering footwork, musicality, and partnering skills. Perfect for intermediate dancers!',
      startDate: new Date('2025-04-05T14:00:00'),
      endDate: new Date('2025-04-05T20:00:00'),
      location: 'Downtown Dance Hall',
      imageUrl: '/images/events/spring-workshop.jpg',
      eventType: 'TICKETED_EVENT',
      categories: ['Workshop', 'Steppers', 'Intermediate'],
      organizerId: djSarah.id,
      status: 'PUBLISHED',
      isPublished: true,
      capacity: 500,
      allowWaitlist: true,
      allowTransfers: true,
      ticketTypes: {
        create: [
          {
            name: 'Super Early Bird',
            description: 'Limited first 100 tickets',
            price: 20.00,
            quantity: 100,
            sold: 100,
            isActive: false,
          },
          {
            name: 'Early Bird',
            description: 'Save $10 before March 20',
            price: 25.00,
            quantity: 200,
            sold: 187,
            isActive: false,
          },
          {
            name: 'General Admission',
            description: 'Regular price',
            price: 35.00,
            quantity: 200,
            sold: 142,
            isActive: true,
          },
        ],
      },
    },
  })
  console.log(`✓ Created: ${event2.title} ($11,645 revenue, 429/500 tickets)`)

  // Event 3: Summer Steppers Festival 2025
  const event3 = await prisma.event.create({
    data: {
      title: 'Summer Steppers Festival 2025',
      slug: 'summer-steppers-festival-2025',
      description: 'The biggest steppers event of the year! 3-day festival featuring workshops, social dancing, and special performances.',
      startDate: new Date('2025-06-20T10:00:00'),
      endDate: new Date('2025-06-22T23:00:00'),
      location: 'Convention Center - Grand Ballroom',
      imageUrl: '/images/events/summer-festival.jpg',
      eventType: 'TICKETED_EVENT',
      categories: ['Festival', 'Steppers', 'Multi-Day', 'Featured'],
      organizerId: djSarah.id,
      status: 'PUBLISHED',
      isPublished: true,
      isFeatured: true,
      capacity: 800,
      allowWaitlist: true,
      allowTransfers: true,
      ticketTypes: {
        create: [
          {
            name: 'VIP Weekend Pass',
            description: 'Reserved seating, exclusive workshop, swag bag, meet & greet',
            price: 200.00,
            quantity: 150,
            sold: 142,
            isActive: true,
          },
          {
            name: 'Weekend Pass',
            description: 'Full access to all 3 days',
            price: 120.00,
            quantity: 400,
            sold: 358,
            isActive: true,
          },
          {
            name: 'Saturday Only',
            description: 'Single day pass',
            price: 75.00,
            quantity: 150,
            sold: 108,
            isActive: true,
          },
          {
            name: 'Sunday Only',
            description: 'Single day pass',
            price: 75.00,
            quantity: 100,
            sold: 67,
            isActive: true,
          },
        ],
      },
    },
  })
  console.log(`✓ Created: ${event3.title} ($84,485 revenue, 675/800 tickets) 🌟`)

  // Event 4: Couples Night Out
  const event4 = await prisma.event.create({
    data: {
      title: 'Couples Night Out',
      slug: 'couples-night-out-july',
      description: 'Special couples-only event! Includes couples lesson, social dancing, refreshments, and photo booth.',
      startDate: new Date('2025-07-12T20:00:00'),
      endDate: new Date('2025-07-13T00:00:00'),
      location: 'Waterfront Pavilion',
      imageUrl: '/images/events/couples-night.jpg',
      eventType: 'TICKETED_EVENT',
      categories: ['Couples', 'Social Dancing', 'Special Event'],
      organizerId: djSarah.id,
      status: 'PUBLISHED',
      isPublished: true,
      capacity: 300,
      allowWaitlist: false,
      allowTransfers: true,
      ticketTypes: {
        create: [
          {
            name: 'Early Bird Couples Package',
            description: '2 people - couples lesson + social + refreshments',
            price: 50.00,
            quantity: 75,
            sold: 75,
            isActive: false,
          },
          {
            name: 'Regular Couples Package',
            description: '2 people - couples lesson + social + refreshments',
            price: 70.00,
            quantity: 75,
            sold: 64,
            isActive: true,
          },
        ],
      },
    },
  })
  console.log(`✓ Created: ${event4.title} ($8,230 revenue, 139/150 couples) 💑`)

  // Step 4: Create Coach Mike's 4 Events
  console.log('\n📋 Step 4: Creating Coach Mike\'s 4 Events...')

  // Event 5: Advanced Technique Intensive
  const event5 = await prisma.event.create({
    data: {
      title: 'Advanced Technique Intensive',
      slug: 'advanced-technique-intensive',
      description: 'Elite 2-day intensive for advanced dancers. Includes private coaching, video analysis, and exclusive technique guide.',
      startDate: new Date('2025-04-19T09:00:00'),
      endDate: new Date('2025-04-20T18:00:00'),
      location: "Mike's Dance Studio",
      imageUrl: '/images/events/technique-intensive.jpg',
      eventType: 'TICKETED_EVENT',
      categories: ['Advanced', 'Intensive', 'Technique'],
      organizerId: coachMike.id,
      status: 'PUBLISHED',
      isPublished: true,
      capacity: 80,
      allowWaitlist: true,
      allowTransfers: false,
      ticketTypes: {
        create: [
          {
            name: 'VIP All-Access',
            description: 'Private 1-on-1 coaching, video recording, exclusive guide',
            price: 350.00,
            quantity: 20,
            sold: 18,
            isActive: true,
          },
          {
            name: 'Weekend Pass',
            description: 'Full access to both days',
            price: 220.00,
            quantity: 40,
            sold: 36,
            isActive: true,
          },
          {
            name: 'Saturday Only',
            description: 'Single day pass',
            price: 130.00,
            quantity: 20,
            sold: 17,
            isActive: true,
          },
        ],
      },
    },
  })
  console.log(`✓ Created: ${event5.title} ($16,430 revenue, 71/80 tickets)`)

  // Event 6: Family Dance Day
  const event6 = await prisma.event.create({
    data: {
      title: 'Family Dance Day',
      slug: 'family-dance-day',
      description: 'All-ages family event! Dance lessons, kids activities, family photo session, and lunch included.',
      startDate: new Date('2025-05-10T10:00:00'),
      endDate: new Date('2025-05-10T16:00:00'),
      location: 'Riverside Park Pavilion',
      imageUrl: '/images/events/family-day.jpg',
      eventType: 'TICKETED_EVENT',
      categories: ['Family', 'All Ages', 'Community'],
      organizerId: coachMike.id,
      status: 'PUBLISHED',
      isPublished: true,
      capacity: 400,
      allowWaitlist: false,
      allowTransfers: true,
      ticketTypes: {
        create: [
          {
            name: 'Family Pack (4 people)',
            description: 'Best value for families',
            price: 80.00,
            quantity: 75,
            sold: 68,
            isActive: true,
          },
          {
            name: 'Couple + 1 Kid',
            description: '3 people total',
            price: 55.00,
            quantity: 25,
            sold: 21,
            isActive: true,
          },
        ],
      },
    },
  })
  console.log(`✓ Created: ${event6.title} ($6,595 revenue, 89/100 packages)`)

  // Event 7: Pro Steppers Bootcamp
  const event7 = await prisma.event.create({
    data: {
      title: 'Pro Steppers Bootcamp',
      slug: 'pro-steppers-bootcamp',
      description: '3-day elite training bootcamp. 24 hours of instruction, video analysis, custom training plan, certificate, and meals included.',
      startDate: new Date('2025-06-14T09:00:00'),
      endDate: new Date('2025-06-16T18:00:00'),
      location: "Mike's Dance Studio",
      imageUrl: '/images/events/bootcamp.jpg',
      eventType: 'TICKETED_EVENT',
      categories: ['Bootcamp', 'Elite Training', 'Multi-Day'],
      organizerId: coachMike.id,
      status: 'PUBLISHED',
      isPublished: true,
      capacity: 50,
      allowWaitlist: true,
      allowTransfers: false,
      ticketTypes: {
        create: [
          {
            name: 'Early Bird (before May 1)',
            description: 'Save $100! Limited to first 25',
            price: 400.00,
            quantity: 25,
            sold: 25,
            isActive: false,
          },
          {
            name: 'Regular Price',
            description: 'Full bootcamp access',
            price: 500.00,
            quantity: 25,
            sold: 18,
            isActive: true,
          },
        ],
      },
    },
  })
  console.log(`✓ Created: ${event7.title} ($19,000 revenue, 43/50 tickets)`)

  // Event 8: Summer Couples Getaway
  const event8 = await prisma.event.create({
    data: {
      title: 'Summer Couples Getaway',
      slug: 'summer-couples-getaway',
      description: 'Romantic weekend retreat for couples. 2 days of workshops, social dancing, photoshoot, wine & cheese, and gifts.',
      startDate: new Date('2025-08-02T14:00:00'),
      endDate: new Date('2025-08-03T20:00:00'),
      location: 'Mountain Resort Ballroom',
      imageUrl: '/images/events/couples-getaway.jpg',
      eventType: 'TICKETED_EVENT',
      categories: ['Couples', 'Retreat', 'Premium'],
      organizerId: coachMike.id,
      status: 'PUBLISHED',
      isPublished: true,
      capacity: 120,
      allowWaitlist: false,
      allowTransfers: true,
      ticketTypes: {
        create: [
          {
            name: 'VIP Couples (front row)',
            description: 'Premium seating and extras',
            price: 300.00,
            quantity: 10,
            sold: 9,
            isActive: true,
          },
          {
            name: 'Premium Couples',
            description: 'Great location and full access',
            price: 220.00,
            quantity: 25,
            sold: 23,
            isActive: true,
          },
          {
            name: 'Standard Couples',
            description: 'Full weekend access',
            price: 170.00,
            quantity: 25,
            sold: 21,
            isActive: true,
          },
        ],
      },
    },
  })
  console.log(`✓ Created: ${event8.title} ($11,330 revenue, 53/60 couples)`)

  // Step 5: Assign Staff to Events
  console.log('\n📋 Step 5: Assigning Staff to Events...')

  // DJ Sarah's team to all her events
  for (const event of [event1, event2, event3, event4]) {
    await prisma.eventStaff.createMany({
      data: [
        {
          eventId: event.id,
          userId: marcus.id,
          role: 'STAFF',
          canScan: true,
          commissionPercent: 7.5,
          isActive: true,
        },
        {
          eventId: event.id,
          userId: keisha.id,
          role: 'STAFF',
          canScan: true,
          commissionPercent: 5.0,
          isActive: true,
        },
        {
          eventId: event.id,
          userId: tanya.id,
          role: 'TEAM_MEMBER',
          canScan: true,
          commissionPercent: null,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    })
  }
  console.log(`✓ Assigned DJ Sarah's team (3 members) to 4 events`)

  // Coach Mike's team to all his events
  for (const event of [event5, event6, event7, event8]) {
    await prisma.eventStaff.createMany({
      data: [
        {
          eventId: event.id,
          userId: lisaMartinez.id,
          role: 'STAFF',
          canScan: true,
          commissionPercent: 7.0,
          isActive: true,
        },
        {
          eventId: event.id,
          userId: jamesChen.id,
          role: 'STAFF',
          canScan: true,
          commissionPercent: 6.0,
          isActive: true,
        },
        {
          eventId: event.id,
          userId: emilyRodriguez.id,
          role: 'TEAM_MEMBER',
          canScan: false,
          commissionPercent: null,
          isActive: true,
        },
        {
          eventId: event.id,
          userId: kevinBrown.id,
          role: 'ASSOCIATE',
          canScan: false,
          commissionPercent: 15.0,
          permissions: {
            referralCode: 'COACHKEV',
            canViewReferralStats: true,
            canGeneratePromoCodes: true,
          },
          isActive: true,
        },
      ],
      skipDuplicates: true,
    })
  }
  console.log(`✓ Assigned Coach Mike's team (4 members) to 4 events`)

  // Summary
  console.log('\n' + '='.repeat(80))
  console.log('✅ SIMULATION DATA CREATED SUCCESSFULLY!')
  console.log('='.repeat(80))

  console.log('\n📊 Summary:')
  console.log(`  • 2 Organizers created`)
  console.log(`  • 7 Staff members created`)
  console.log(`  • 8 Events created with ticket types`)
  console.log(`  • Total theoretical revenue: $163,905`)
  console.log(`  • All staff assigned to their events`)

  console.log('\n🔑 Login Credentials (all use password: TestPass123!):')
  console.log('\nOrganizers:')
  console.log(`  • djsarah@stepperslife.com`)
  console.log(`  • coachmike@stepperslife.com`)

  console.log('\nDJ Sarah\'s Team:')
  console.log(`  • marcus@stepperslife.com (STAFF, 7.5% commission)`)
  console.log(`  • keisha@stepperslife.com (STAFF, 5.0% commission)`)
  console.log(`  • tanya@stepperslife.com (TEAM_MEMBER, volunteer)`)

  console.log('\nCoach Mike\'s Team:')
  console.log(`  • lisa.martinez@stepperslife.com (STAFF, 7.0% commission)`)
  console.log(`  • james.chen@stepperslife.com (STAFF, 6.0% commission)`)
  console.log(`  • emily.rodriguez@stepperslife.com (TEAM_MEMBER, volunteer)`)
  console.log(`  • kevin.brown@stepperslife.com (ASSOCIATE, 15.0% commission, ref: COACHKEV)`)

  console.log('\n🌐 View on localhost:')
  console.log(`  • All Events: http://localhost:3000/events`)
  console.log(`  • Login: http://localhost:3000/auth/signin`)

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
