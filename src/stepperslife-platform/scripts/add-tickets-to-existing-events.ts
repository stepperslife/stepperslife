/**
 * Add ticket types and tickets to existing events
 * - Creates ticket types for each event
 * - Creates ticket sales for those ticket types
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addTicketsToExistingEvents() {
  console.log('='.repeat(70))
  console.log('ADDING TICKETS TO EXISTING EVENTS')
  console.log('='.repeat(70))
  console.log()

  // Get existing events
  const events = await prisma.event.findMany({
    orderBy: { startDate: 'asc' },
  })

  if (events.length === 0) {
    console.log('❌ No events found in database!')
    await prisma.$disconnect()
    return
  }

  console.log(`Found ${events.length} events`)
  console.log()

  // Get buyer users
  const buyers = await prisma.user.findMany({
    where: {
      email: {
        startsWith: 'buyer',
      },
    },
  })

  console.log(`Found ${buyers.length} buyer users`)
  console.log()

  const event1 = events[0] // Oldest event (ended)
  const event2 = events[1] // Middle event (active)
  const event3 = events[2] // Newest event (active)

  // Get event dates for proper ticket status
  const endedDate = event1.startDate

  // 1. Create Ticket Types for Events
  console.log('1. Creating Ticket Types...')

  // Event 1 Ticket Types
  const event1VIP = await prisma.ticketType.create({
    data: {
      eventId: event1.id,
      name: 'VIP',
      description: 'VIP access with premium seating',
      price: 150.0,
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
      price: 75.0,
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
      price: 50.0,
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
      price: 250.0,
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
      price: 150.0,
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
      price: 125.0,
      quantity: 150,
      sold: 80,
      isActive: true,
    },
  })

  console.log(`✅ Created 1 ticket type for: ${event3.title}`)
  console.log()

  // 2. Create Ticket Sales
  console.log('2. Creating Ticket Sales...')

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
        ticketNumber: `TICKET-E2-${event2.id.substring(0, 6)}-${String(i + 1).padStart(4, '0')}`,
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
        ticketNumber: `TICKET-E2-${event2.id.substring(0, 6)}-${String(i + 62 + 1).padStart(4, '0')}`,
        eventId: event2.id,
        ticketTypeId: event2General.id,
        userId: buyer.id,
        status: 'VALID',
      },
    })
  }
  console.log(`✅ Created 250 tickets sold`)

  // Event 3 (ACTIVE): 80 tickets sold
  console.log(`\n📋 Event 3: ${event3.title} (ACTIVE)`)
  for (let i = 0; i < 80; i++) {
    const buyer = buyers[i % buyers.length]
    await prisma.ticket.create({
      data: {
        ticketNumber: `TICKET-E3-${event3.id.substring(0, 6)}-${String(i + 1).padStart(4, '0')}`,
        eventId: event3.id,
        ticketTypeId: event3General.id,
        userId: buyer.id,
        status: 'VALID',
      },
    })
  }
  console.log(`✅ Created 80 tickets sold`)
  console.log()

  // Summary
  console.log('='.repeat(70))
  console.log('TICKET CREATION COMPLETE!')
  console.log('='.repeat(70))
  console.log()
  console.log('📊 SUMMARY:')
  console.log('-'.repeat(70))
  console.log()
  console.log(`✅ Created 6 ticket types across 3 events`)
  console.log(`✅ Created 430 tickets total:`)
  console.log(`   • Event 1: 100 tickets (ALL SCANNED)`)
  console.log(`   • Event 2: 250 tickets (VALID)`)
  console.log(`   • Event 3: 80 tickets (VALID)`)
  console.log()
  console.log('='.repeat(70))

  await prisma.$disconnect()
}

addTicketsToExistingEvents()
