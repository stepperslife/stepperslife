/**
 * Verify the current database state
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyDatabaseState() {
  console.log('='.repeat(70))
  console.log('DATABASE STATE VERIFICATION')
  console.log('='.repeat(70))
  console.log()

  const users = await prisma.user.count()
  const events = await prisma.event.count()
  const eventStaff = await prisma.eventStaff.count()
  const ticketTypes = await prisma.ticketType.count()
  const tickets = await prisma.ticket.count()

  console.log('📊 COUNTS:')
  console.log(`   Users: ${users}`)
  console.log(`   Events: ${events}`)
  console.log(`   Event Staff: ${eventStaff}`)
  console.log(`   Ticket Types: ${ticketTypes}`)
  console.log(`   Tickets: ${tickets}`)
  console.log()

  // Get event details
  const eventDetails = await prisma.event.findMany({
    include: {
      _count: {
        select: {
          tickets: true,
          ticketTypes: true,
          staff: true,
        },
      },
      organizer: {
        select: {
          email: true,
          name: true,
        },
      },
    },
    orderBy: { startDate: 'asc' },
  })

  console.log('📅 EVENTS:')
  for (const event of eventDetails) {
    console.log()
    console.log(`   ${event.title}`)
    console.log(`   Status: ${event.status}`)
    console.log(`   Organizer: ${event.organizer.name} (${event.organizer.email})`)
    console.log(`   Date: ${event.startDate.toLocaleDateString()}`)
    console.log(`   Ticket Types: ${event._count.ticketTypes}`)
    console.log(`   Tickets Sold: ${event._count.tickets}`)
    console.log(`   Staff Assigned: ${event._count.staff}`)
  }

  console.log()
  console.log('='.repeat(70))

  await prisma.$disconnect()
}

verifyDatabaseState()
