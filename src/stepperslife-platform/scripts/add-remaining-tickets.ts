/**
 * Add only the remaining tickets for events 2 and 3
 * Event 1 already has 100 tickets created
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addRemainingTickets() {
  console.log('='.repeat(70))
  console.log('ADDING REMAINING TICKETS')
  console.log('='.repeat(70))
  console.log()

  // Get existing events (ordered by startDate)
  const events = await prisma.event.findMany({
    orderBy: { startDate: 'asc' },
  })

  // Get existing ticket types
  const ticketTypes = await prisma.ticketType.findMany()

  console.log(`Found ${events.length} events`)
  console.log(`Found ${ticketTypes.length} ticket types`)
  console.log()

  const event2 = events[1] // Middle event (Spring Steppers Workshop Series)
  const event3 = events[2] // Newest event (New Year's Eve Steppers Ball)

  // Get ticket types for events 2 and 3
  const event2TicketTypes = ticketTypes.filter((tt) => tt.eventId === event2.id)
  const event3TicketTypes = ticketTypes.filter((tt) => tt.eventId === event3.id)

  console.log(`Event 2 (${event2.title}): ${event2TicketTypes.length} ticket types`)
  console.log(`Event 3 (${event3.title}): ${event3TicketTypes.length} ticket types`)
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

  // Event 2: VIP and General
  const event2VIP = event2TicketTypes.find((tt) => tt.name === 'VIP')!
  const event2General = event2TicketTypes.find((tt) => tt.name === 'General Admission')!

  // Event 3: Workshop Pass
  const event3General = event3TicketTypes[0]

  // Create tickets for Event 2
  console.log(`Creating tickets for Event 2: ${event2.title}`)

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
  console.log(`✅ Created 62 VIP tickets`)

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
  console.log(`✅ Created 188 General tickets`)
  console.log()

  // Create tickets for Event 3
  console.log(`Creating tickets for Event 3: ${event3.title}`)

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
  console.log(`✅ Created 80 Workshop tickets`)
  console.log()

  console.log('='.repeat(70))
  console.log('TICKET CREATION COMPLETE!')
  console.log('='.repeat(70))
  console.log()
  console.log(`✅ Created 330 tickets total:`)
  console.log(`   • Event 2: 250 tickets (VALID)`)
  console.log(`   • Event 3: 80 tickets (VALID)`)
  console.log()
  console.log('='.repeat(70))

  await prisma.$disconnect()
}

addRemainingTickets()
