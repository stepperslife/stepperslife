/**
 * Create comprehensive event organizer test data
 * - 1 Event Organizer
 * - 9 Staff members (3 STAFF, 3 TEAM_MEMBERS, 3 ASSOCIATES)
 * - 3 Events: 1 ended, 2 active with ticket sales
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const SIMPLE_PASSWORD = 'password123'

async function createOrganizerTestData() {
  console.log('='.repeat(70))
  console.log('CREATING EVENT ORGANIZER TEST DATA')
  console.log('='.repeat(70))
  console.log()

  const hashedPassword = await bcrypt.hash(SIMPLE_PASSWORD, 12)

  // 1. Create Event Organizer
  console.log('1. Creating Event Organizer...')
  const organizer = await prisma.user.create({
    data: {
      email: 'organizer@stepperslife.com',
      name: 'Sarah Johnson',
      password: hashedPassword,
      role: 'EVENT_ORGANIZER',
      emailVerified: new Date(),
      preferences: {
        showEvents: true,
        showStore: true,
        vendorEnabled: false,
        organizerEnabled: true,
      },
    },
  })
  console.log(`✅ Created organizer: ${organizer.name} (${organizer.email})`)
  console.log()

  // 2. Create Staff Members
  console.log('2. Creating Staff Members...')

  const staffMembers = []

  // 3 STAFF
  for (let i = 1; i <= 3; i++) {
    const staff = await prisma.user.create({
      data: {
        email: `staff${i}@stepperslife.com`,
        name: `Staff Member ${i}`,
        password: hashedPassword,
        role: 'USER',
        emailVerified: new Date(),
      },
    })
    staffMembers.push({ ...staff, staffRole: 'STAFF' })
    console.log(`✅ Created STAFF: ${staff.name} (${staff.email})`)
  }

  // 3 TEAM_MEMBERS
  for (let i = 1; i <= 3; i++) {
    const teamMember = await prisma.user.create({
      data: {
        email: `team${i}@stepperslife.com`,
        name: `Team Member ${i}`,
        password: hashedPassword,
        role: 'USER',
        emailVerified: new Date(),
      },
    })
    staffMembers.push({ ...teamMember, staffRole: 'TEAM_MEMBER' })
    console.log(`✅ Created TEAM_MEMBER: ${teamMember.name} (${teamMember.email})`)
  }

  // 3 ASSOCIATES
  for (let i = 1; i <= 3; i++) {
    const associate = await prisma.user.create({
      data: {
        email: `associate${i}@stepperslife.com`,
        name: `Associate ${i}`,
        password: hashedPassword,
        role: 'USER',
        emailVerified: new Date(),
      },
    })
    staffMembers.push({ ...associate, staffRole: 'ASSOCIATE' })
    console.log(`✅ Created ASSOCIATE: ${associate.name} (${associate.email})`)
  }
  console.log()

  // 3. Create Regular Users for ticket purchases
  console.log('3. Creating Regular Users for ticket purchases...')
  const buyers = []
  for (let i = 1; i <= 10; i++) {
    const buyer = await prisma.user.create({
      data: {
        email: `buyer${i}@stepperslife.com`,
        name: `Buyer ${i}`,
        password: hashedPassword,
        role: 'USER',
        emailVerified: new Date(),
      },
    })
    buyers.push(buyer)
  }
  console.log(`✅ Created 10 regular users for ticket purchases`)
  console.log()

  // 4. Create Events
  console.log('4. Creating Events...')

  // Event 1: ENDED - "Summer Steppers Gala 2024" (ended last month)
  const endedDate = new Date()
  endedDate.setMonth(endedDate.getMonth() - 1)
  endedDate.setDate(15)

  const event1 = await prisma.event.create({
    data: {
      title: 'Summer Steppers Gala 2024',
      slug: 'summer-steppers-gala-2024',
      description: 'A spectacular summer celebration featuring the best steppers from around the country. Great music, amazing dancers, and unforgettable memories!',
      startDate: endedDate,
      endDate: new Date(endedDate.getTime() + 6 * 60 * 60 * 1000), // 6 hours later
      location: 'Grand Ballroom, Chicago Convention Center',
      imageUrl: '/logos/steppers-logo.png',
      eventType: 'TICKETED_EVENT',
      categories: ['Steppers', 'Gala', 'Social'],
      organizerId: organizer.id,
      status: 'COMPLETED',
      isPublished: true,
      isFeatured: false,
      capacity: 500,
      allowWaitlist: false,
      allowTransfers: true,
    },
  })
  console.log(`✅ Created ENDED event: ${event1.title}`)

  // Event 2: ACTIVE - "New Year's Eve Steppers Ball" (upcoming next month)
  const futureDate1 = new Date()
  futureDate1.setMonth(futureDate1.getMonth() + 1)
  futureDate1.setDate(31)

  const event2 = await prisma.event.create({
    data: {
      title: "New Year's Eve Steppers Ball",
      slug: 'new-years-eve-steppers-ball',
      description: 'Ring in the New Year with style! Join us for an elegant evening of stepping, live music, and celebration. Dress code: Black Tie.',
      startDate: futureDate1,
      endDate: new Date(futureDate1.getTime() + 8 * 60 * 60 * 1000), // 8 hours later
      location: 'The Ritz Carlton Ballroom, Atlanta',
      imageUrl: '/logos/steppers-logo.png',
      eventType: 'TICKETED_EVENT',
      categories: ['Steppers', 'New Years', 'Black Tie'],
      organizerId: organizer.id,
      status: 'PUBLISHED',
      isPublished: true,
      isFeatured: true,
      capacity: 800,
      allowWaitlist: true,
      allowTransfers: true,
    },
  })
  console.log(`✅ Created ACTIVE event: ${event2.title}`)

  // Event 3: ACTIVE - "Spring Steppers Workshop Series" (upcoming in 2 weeks)
  const futureDate2 = new Date()
  futureDate2.setDate(futureDate2.getDate() + 14)

  const event3 = await prisma.event.create({
    data: {
      title: 'Spring Steppers Workshop Series',
      slug: 'spring-steppers-workshop-series',
      description: 'Perfect your stepping technique with our expert instructors! This 4-week workshop series covers fundamentals, styling, and advanced moves.',
      startDate: futureDate2,
      endDate: new Date(futureDate2.getTime() + 4 * 60 * 60 * 1000), // 4 hours
      location: 'Steppers Academy, Detroit',
      imageUrl: '/logos/steppers-logo.png',
      eventType: 'TICKETED_EVENT',
      categories: ['Steppers', 'Workshop', 'Education'],
      organizerId: organizer.id,
      status: 'PUBLISHED',
      isPublished: true,
      isFeatured: true,
      capacity: 150,
      allowWaitlist: true,
      allowTransfers: false,
    },
  })
  console.log(`✅ Created ACTIVE event: ${event3.title}`)
  console.log()

  // 5. Assign Staff to Events
  console.log('5. Assigning Staff to Events...')

  const events = [event1, event2, event3]

  for (const event of events) {
    // Assign 3 staff members to each event (one of each type)
    const staff = staffMembers.slice(0, 3) // First staff of each type
    const teamMember = staffMembers.slice(3, 6)[0] // First team member
    const associate = staffMembers.slice(6, 9)[0] // First associate

    const assignedStaff = [
      { member: staff[0], role: 'STAFF', permissions: ['CHECK_IN', 'VIEW_ATTENDEES'] },
      { member: staff[1], role: 'STAFF', permissions: ['CHECK_IN', 'VIEW_ATTENDEES', 'MANAGE_TICKETS'] },
      { member: teamMember, role: 'TEAM_MEMBER', permissions: ['CHECK_IN', 'VIEW_ATTENDEES', 'MANAGE_TICKETS', 'EDIT_EVENT'] },
    ]

    for (const { member, role, permissions } of assignedStaff) {
      await prisma.eventStaff.create({
        data: {
          eventId: event.id,
          userId: member.id,
          role: role as any,
          permissions,
        },
      })
    }

    console.log(`✅ Assigned 3 staff members to: ${event.title}`)
  }
  console.log()

  // 6. Create Ticket Types for Events
  console.log('6. Creating Ticket Types...')

  // Event 1 Ticket Types
  const event1VIP = await prisma.ticketType.create({
    data: {
      eventId: event1.id,
      name: 'VIP',
      description: 'VIP access with premium seating',
      price: 150.00,
      quantity: 50,
      sold: 34,
      isActive: true,
    },
  })

  const event1General = await prisma.ticketType.create({
    data: {
      eventId: event1.id,
      name: 'General Admission',
      description: 'Standard admission ticket',
      price: 75.00,
      quantity: 200,
      sold: 33,
      isActive: true,
    },
  })

  const event1EarlyBird = await prisma.ticketType.create({
    data: {
      eventId: event1.id,
      name: 'Early Bird',
      description: 'Early bird special pricing',
      price: 50.00,
      quantity: 250,
      sold: 33,
      isActive: true,
    },
  })

  console.log(`✅ Created 3 ticket types for: ${event1.title}`)

  // Event 2 Ticket Types
  const event2VIP = await prisma.ticketType.create({
    data: {
      eventId: event2.id,
      name: 'VIP',
      description: 'VIP New Years experience',
      price: 250.00,
      quantity: 200,
      sold: 62,
      isActive: true,
    },
  })

  const event2General = await prisma.ticketType.create({
    data: {
      eventId: event2.id,
      name: 'General Admission',
      description: 'Standard admission ticket',
      price: 150.00,
      quantity: 600,
      sold: 188,
      isActive: true,
    },
  })

  console.log(`✅ Created 2 ticket types for: ${event2.title}`)

  // Event 3 Ticket Types
  const event3General = await prisma.ticketType.create({
    data: {
      eventId: event3.id,
      name: 'Workshop Series Pass',
      description: 'Full 4-week workshop series',
      price: 125.00,
      quantity: 150,
      sold: 80,
      isActive: true,
    },
  })

  console.log(`✅ Created 1 ticket type for: ${event3.title}`)
  console.log()

  // 7. Create Ticket Sales
  console.log('7. Creating Ticket Sales...')

  // Event 1 (ENDED): 100 tickets sold (34 VIP, 33 General, 33 Early Bird)
  console.log(`\n📋 Event 1: ${event1.title} (ENDED)`)

  // 34 VIP tickets
  for (let i = 0; i < 34; i++) {
    const buyer = buyers[i % buyers.length]
    await prisma.ticket.create({
      data: {
        ticketNumber: `TICKET-${event1.id.substring(0, 8)}-${String(i + 1).padStart(4, '0')}`,
        eventId: event1.id,
        ticketTypeId: event1VIP.id,
        userId: buyer.id,
        status: 'SCANNED',
        scannedAt: endedDate,
      },
    })
  }

  // 33 General tickets
  for (let i = 0; i < 33; i++) {
    const buyer = buyers[i % buyers.length]
    await prisma.ticket.create({
      data: {
        ticketNumber: `TICKET-${event1.id.substring(0, 8)}-${String(i + 34 + 1).padStart(4, '0')}`,
        eventId: event1.id,
        ticketTypeId: event1General.id,
        userId: buyer.id,
        status: 'SCANNED',
        scannedAt: endedDate,
      },
    })
  }

  // 33 Early Bird tickets
  for (let i = 0; i < 33; i++) {
    const buyer = buyers[i % buyers.length]
    await prisma.ticket.create({
      data: {
        ticketNumber: `TICKET-${event1.id.substring(0, 8)}-${String(i + 67 + 1).padStart(4, '0')}`,
        eventId: event1.id,
        ticketTypeId: event1EarlyBird.id,
        userId: buyer.id,
        status: 'SCANNED',
        scannedAt: endedDate,
      },
    })
  }
  console.log(`✅ Created 100 tickets (ALL SCANNED)`)

  // Event 2 (ACTIVE): 250 tickets sold (62 VIP, 188 General)
  console.log(`\n📋 Event 2: ${event2.title} (ACTIVE)`)

  // 62 VIP tickets
  for (let i = 0; i < 62; i++) {
    const buyer = buyers[i % buyers.length]
    await prisma.ticket.create({
      data: {
        ticketNumber: `TICKET-${event2.id.substring(0, 8)}-${String(i + 1).padStart(4, '0')}`,
        eventId: event2.id,
        ticketTypeId: event2VIP.id,
        userId: buyer.id,
        status: 'VALID',
      },
    })
  }

  // 188 General tickets
  for (let i = 0; i < 188; i++) {
    const buyer = buyers[i % buyers.length]
    await prisma.ticket.create({
      data: {
        ticketNumber: `TICKET-${event2.id.substring(0, 8)}-${String(i + 62 + 1).padStart(4, '0')}`,
        eventId: event2.id,
        ticketTypeId: event2General.id,
        userId: buyer.id,
        status: 'VALID',
      },
    })
  }
  console.log(`✅ Created 250 tickets sold (550 remaining capacity)`)

  // Event 3 (ACTIVE): 80 tickets sold, 70 remaining
  console.log(`\n📋 Event 3: ${event3.title} (ACTIVE)`)
  for (let i = 0; i < 80; i++) {
    const buyer = buyers[i % buyers.length]
    await prisma.ticket.create({
      data: {
        ticketNumber: `TICKET-${event3.id.substring(0, 8)}-${String(i + 1).padStart(4, '0')}`,
        eventId: event3.id,
        ticketTypeId: event3General.id,
        userId: buyer.id,
        status: 'VALID',
      },
    })
  }
  console.log(`✅ Created 80 tickets sold (70 remaining capacity)`)
  console.log()

  // Summary
  console.log('='.repeat(70))
  console.log('TEST DATA CREATION COMPLETE!')
  console.log('='.repeat(70))
  console.log()
  console.log('📊 SUMMARY:')
  console.log('-'.repeat(70))
  console.log()
  console.log('👤 USERS:')
  console.log(`   • 1 Event Organizer: ${organizer.email}`)
  console.log(`   • 3 STAFF members`)
  console.log(`   • 3 TEAM_MEMBER members`)
  console.log(`   • 3 ASSOCIATE members`)
  console.log(`   • 10 Regular users (ticket buyers)`)
  console.log()
  console.log('📅 EVENTS:')
  console.log()
  console.log(`   1. ${event1.title}`)
  console.log(`      Status: ENDED (${endedDate.toLocaleDateString()})`)
  console.log(`      Tickets: 100/500 SOLD (ALL CHECKED IN)`)
  console.log(`      Revenue: $8,500.00`)
  console.log(`      Staff: 3 assigned`)
  console.log()
  console.log(`   2. ${event2.title}`)
  console.log(`      Status: ACTIVE (${futureDate1.toLocaleDateString()})`)
  console.log(`      Tickets: 250/800 SOLD`)
  console.log(`      Revenue: $41,250.00`)
  console.log(`      Staff: 3 assigned`)
  console.log()
  console.log(`   3. ${event3.title}`)
  console.log(`      Status: ACTIVE (${futureDate2.toLocaleDateString()})`)
  console.log(`      Tickets: 80/150 SOLD`)
  console.log(`      Revenue: $10,000.00`)
  console.log(`      Staff: 3 assigned`)
  console.log()
  console.log('💰 TOTAL REVENUE: $59,750.00')
  console.log()
  console.log('🔑 LOGIN CREDENTIALS:')
  console.log('-'.repeat(70))
  console.log()
  console.log('EVENT ORGANIZER:')
  console.log(`   Email: ${organizer.email}`)
  console.log(`   Password: ${SIMPLE_PASSWORD}`)
  console.log()
  console.log('STAFF LOGINS (all use same password):')
  console.log(`   • staff1@stepperslife.com - staff3@stepperslife.com`)
  console.log(`   • team1@stepperslife.com - team3@stepperslife.com`)
  console.log(`   • associate1@stepperslife.com - associate3@stepperslife.com`)
  console.log(`   Password: ${SIMPLE_PASSWORD}`)
  console.log()
  console.log('='.repeat(70))

  await prisma.$disconnect()
}

createOrganizerTestData()
