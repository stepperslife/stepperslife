import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Event categories from the system
const CATEGORIES = [
  'Set',
  'Workshop',
  'Save the Date',
  'Cruise',
  'Outdoors Steppin',
  'Holiday Event',
  'Weekend Event',
]

// Helper to generate future dates
const futureDate = (daysFromNow: number, hour: number = 18) => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  date.setHours(hour, 0, 0, 0)
  return date
}

// Helper to generate slug
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function main() {
  console.log('🌱 Starting seed process...')

  // Get or create an admin/organizer user
  let organizer = await prisma.user.findFirst({
    where: {
      OR: [{ role: 'ADMIN' }, { role: 'EVENT_ORGANIZER' }],
    },
  })

  if (!organizer) {
    console.log('Creating organizer user...')
    organizer = await prisma.user.create({
      data: {
        email: 'organizer@stepperslife.com',
        name: 'Event Organizer',
        role: 'EVENT_ORGANIZER',
      },
    })
  }

  console.log(`Using organizer: ${organizer.name} (${organizer.id})`)

  // 15 Ticketed Events
  const ticketedEvents = [
    {
      title: 'Summer Steppers Festival 2025',
      description:
        'Join us for the biggest steppers event of the summer! Three days of non-stop dancing, live DJs, and amazing performances from top steppers across the nation.',
      location: 'Grant Park, Chicago, IL',
      categories: ['Set', 'Weekend Event'],
      imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3',
      capacity: 2000,
      tickets: [
        { name: 'General Admission - Single Day', price: 4500, quantity: 800 },
        { name: 'Weekend Pass', price: 10000, quantity: 600 },
        { name: 'VIP Weekend Pass', price: 20000, quantity: 200 },
      ],
    },
    {
      title: 'Midwest Steppers Showcase',
      description:
        'Experience the best steppers talent from across the Midwest. Features competitions, workshops, and social dancing all night long.',
      location: 'Navy Pier, Chicago, IL',
      categories: ['Set', 'Workshop'],
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
      capacity: 800,
      tickets: [
        { name: 'Early Bird', price: 3500, quantity: 200 },
        { name: 'Regular Admission', price: 4500, quantity: 400 },
        { name: 'VIP Package', price: 8500, quantity: 100 },
      ],
    },
    {
      title: 'Steppers Boat Party Cruise',
      description:
        'Set sail on Lake Michigan for an unforgettable night of steppin. Three levels of entertainment, full bar, and breathtaking views.',
      location: 'Chicago Riverwalk, Chicago, IL',
      categories: ['Cruise', 'Set'],
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
      capacity: 500,
      tickets: [
        { name: 'Main Deck', price: 7500, quantity: 300 },
        { name: 'Upper Deck VIP', price: 12000, quantity: 150 },
      ],
    },
    {
      title: 'Advanced Steppers Workshop Series',
      description:
        'Four-week intensive workshop covering advanced techniques, styling, and musicality. Led by nationally recognized instructors.',
      location: 'Dance Studio 360, Detroit, MI',
      categories: ['Workshop'],
      imageUrl: 'https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff',
      capacity: 50,
      tickets: [
        { name: '4-Week Series Pass', price: 15000, quantity: 40 },
        { name: 'Single Class Drop-In', price: 4500, quantity: 10 },
      ],
    },
    {
      title: 'Outdoor Summer Steppin Under the Stars',
      description:
        'Dance under the stars at our outdoor venue. Bring your blankets and lawn chairs for this family-friendly steppin event.',
      location: 'Millennium Park, Chicago, IL',
      categories: ['Outdoors Steppin', 'Set'],
      imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3',
      capacity: 1500,
      tickets: [
        { name: 'Individual Ticket', price: 2500, quantity: 1000 },
        { name: 'Family Pack (4 tickets)', price: 8000, quantity: 125 },
      ],
    },
    {
      title: 'Holiday Steppers Gala',
      description:
        'Celebrate the season in style at our annual Holiday Gala. Formal attire, gourmet dinner, and all-night steppin.',
      location: 'Hilton Chicago, Chicago, IL',
      categories: ['Holiday Event', 'Set'],
      imageUrl: 'https://images.unsplash.com/photo-1482575832494-771f74bf6857',
      capacity: 400,
      tickets: [
        { name: 'Individual Ticket', price: 15000, quantity: 200 },
        { name: 'Couples Package', price: 27500, quantity: 100 },
      ],
    },
    {
      title: "Valentine's Day Steppers Romance",
      description:
        "Celebrate love and steppin at our Valentine's special. Champagne toast, roses, and romantic music all night.",
      location: 'The Drake Hotel, Chicago, IL',
      categories: ['Holiday Event', 'Set'],
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23',
      capacity: 300,
      tickets: [
        { name: 'Couples Only', price: 20000, quantity: 150 },
      ],
    },
    {
      title: 'Spring Break Steppers Marathon',
      description:
        '12 hours of non-stop steppin! Multiple rooms, various DJs, and food trucks. This is the ultimate steppers endurance challenge.',
      location: 'McCormick Place, Chicago, IL',
      categories: ['Set', 'Weekend Event'],
      imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14',
      capacity: 1200,
      tickets: [
        { name: 'Full Marathon Pass', price: 6500, quantity: 800 },
        { name: 'Half Day (6 hours)', price: 4000, quantity: 400 },
      ],
    },
    {
      title: 'Beginner Steppers Bootcamp',
      description:
        'Never stepped before? Perfect! Our comprehensive bootcamp teaches you everything from basic steps to social dancing.',
      location: 'Community Center, Milwaukee, WI',
      categories: ['Workshop'],
      imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a',
      capacity: 80,
      tickets: [
        { name: '3-Day Bootcamp', price: 12000, quantity: 60 },
        { name: 'Single Day', price: 5000, quantity: 20 },
      ],
    },
    {
      title: 'Steppers Beach Party',
      description:
        'Take your steppin to the beach! Outdoor dancing, beach volleyball, BBQ, and sunset views.',
      location: 'North Avenue Beach, Chicago, IL',
      categories: ['Outdoors Steppin', 'Set'],
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
      capacity: 600,
      tickets: [
        { name: 'Beach Party Access', price: 3500, quantity: 500 },
        { name: 'VIP Cabana (up to 6)', price: 30000, quantity: 20 },
      ],
    },
    {
      title: 'Memorial Day Weekend Steppers Fest',
      description:
        'Kick off summer with three days of steppin, food, and fun. Featuring guest DJs and special performances.',
      location: 'Soldier Field, Chicago, IL',
      categories: ['Weekend Event', 'Set'],
      imageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec',
      capacity: 3000,
      tickets: [
        { name: 'Single Day Pass', price: 5500, quantity: 1200 },
        { name: '3-Day Festival Pass', price: 13500, quantity: 900 },
        { name: 'VIP All Access', price: 25000, quantity: 300 },
      ],
    },
    {
      title: 'Rooftop Steppers Sunset Session',
      description:
        'Dance on our exclusive rooftop venue with panoramic city views. Limited capacity for an intimate experience.',
      location: 'Rooftop Lounge, Chicago, IL',
      categories: ['Set'],
      imageUrl: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1',
      capacity: 150,
      tickets: [
        { name: 'Rooftop Access', price: 8500, quantity: 120 },
        { name: 'VIP Table Service', price: 50000, quantity: 6 },
      ],
    },
    {
      title: 'Labor Day Steppers Send-Off',
      description:
        'End the summer with a bang! Final outdoor event of the season featuring top DJs and special guest performers.',
      location: 'Promontory Point, Chicago, IL',
      categories: ['Outdoors Steppin', 'Weekend Event', 'Set'],
      imageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec',
      capacity: 2500,
      tickets: [
        { name: 'General Admission', price: 4500, quantity: 2000 },
        { name: 'VIP Front Stage', price: 9500, quantity: 500 },
      ],
    },
    {
      title: 'Steppers Style & Fashion Workshop',
      description:
        'Learn the art of dressing for steppin. Workshop covers fashion history, styling tips, and includes a fashion show.',
      location: 'Fashion District, Chicago, IL',
      categories: ['Workshop'],
      imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea53f7ad',
      capacity: 100,
      tickets: [
        { name: 'Workshop + Fashion Show', price: 7500, quantity: 80 },
      ],
    },
    {
      title: "New Year's Eve Steppers Countdown",
      description:
        "Ring in the new year with Chicago's premier steppers celebration. Champagne toast at midnight, party favors, and dancing until dawn.",
      location: 'Hyatt Regency Chicago, Chicago, IL',
      categories: ['Holiday Event', 'Set'],
      imageUrl: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9',
      capacity: 800,
      tickets: [
        { name: 'Individual Ticket', price: 17500, quantity: 400 },
        { name: 'Couples Package', price: 32500, quantity: 200 },
      ],
    },
  ]

  // 2 Save the Date Events (FREE_EVENT type, informational)
  const saveTheDateEvents = [
    {
      title: 'Annual Steppers Convention 2026 - Save the Date',
      description:
        'Mark your calendars! The 2026 Annual Steppers Convention will feature 5 days of workshops, competitions, and social dancing. Hotel packages and early bird tickets coming soon.',
      location: 'Las Vegas Convention Center, Las Vegas, NV',
      categories: ['Save the Date', 'Weekend Event'],
      imageUrl: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25',
      eventType: 'SAVE_THE_DATE' as const,
      capacity: null,
    },
    {
      title: 'International Steppers Championship 2026',
      description:
        "The world's premier steppers competition returns! Dancers from around the globe will compete. Registration details and venue information coming in Spring 2025.",
      location: 'To Be Announced',
      categories: ['Save the Date'],
      imageUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4',
      eventType: 'SAVE_THE_DATE' as const,
      capacity: null,
    },
  ]

  // 3 Pay at the Door Events (FREE_EVENT type in system, but described as pay at door)
  const payAtDoorEvents = [
    {
      title: 'Weekly Wednesday Steppers Social',
      description:
        'Every Wednesday night steppers social. $15 cash at the door. No advance tickets needed. All levels welcome, free beginner lesson at 7pm.',
      location: 'Steppers Paradise, Chicago, IL',
      categories: ['Set'],
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7',
      eventType: 'FREE_EVENT' as const,
      capacity: 300,
    },
    {
      title: 'Friday Night Steppers Party',
      description:
        'TGIF Steppers edition! $20 at the door, ladies free before 10pm. Three rooms of music, full bar, complimentary appetizers.',
      location: 'The Steppers Lounge, Chicago, IL',
      categories: ['Set'],
      imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063',
      eventType: 'FREE_EVENT' as const,
      capacity: 500,
    },
    {
      title: 'Sunday Afternoon Steppers Session',
      description:
        'Perfect way to end your weekend. Mature crowd, classic steppers music. $10 at the door, cash only. Doors open at 5pm.',
      location: 'South Side Social Club, Chicago, IL',
      categories: ['Set'],
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865',
      eventType: 'FREE_EVENT' as const,
      capacity: 200,
    },
  ]

  // Create ticketed events
  console.log('\n📝 Creating 15 ticketed events...')
  for (const [index, eventData] of ticketedEvents.entries()) {
    const startDate = futureDate(15 + index * 14, 19) // Events every 2 weeks
    const endDate = new Date(startDate)
    endDate.setHours(startDate.getHours() + 6) // 6 hour events

    const event = await prisma.event.create({
      data: {
        title: eventData.title,
        slug: generateSlug(eventData.title),
        description: eventData.description,
        startDate,
        endDate,
        location: eventData.location,
        imageUrl: eventData.imageUrl,
        categories: eventData.categories,
        eventType: 'TICKETED_EVENT',
        capacity: eventData.capacity,
        organizerId: organizer.id,
        status: 'PUBLISHED',
        isPublished: true,
        isFeatured: index < 3, // Feature first 3 events
      },
    })

    // Create ticket types for this event
    for (const ticket of eventData.tickets) {
      await prisma.ticketType.create({
        data: {
          eventId: event.id,
          name: ticket.name,
          description: `Access to ${eventData.title}`,
          price: ticket.price,
          quantity: ticket.quantity,
          isActive: true,
        },
      })
    }

    console.log(`✅ Created: ${event.title}`)
  }

  // Create save the date events
  console.log('\n📅 Creating 2 Save the Date events...')
  for (const [index, eventData] of saveTheDateEvents.entries()) {
    const startDate = futureDate(180 + index * 30, 9) // 6+ months out
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 3) // Multi-day events

    const event = await prisma.event.create({
      data: {
        title: eventData.title,
        slug: generateSlug(eventData.title),
        description: eventData.description,
        startDate,
        endDate,
        location: eventData.location,
        imageUrl: eventData.imageUrl,
        categories: eventData.categories,
        eventType: eventData.eventType,
        capacity: eventData.capacity,
        organizerId: organizer.id,
        status: 'PUBLISHED',
        isPublished: true,
      },
    })

    console.log(`✅ Created: ${event.title}`)
  }

  // Create pay at door events
  console.log('\n💵 Creating 3 Pay at the Door events...')
  for (const [index, eventData] of payAtDoorEvents.entries()) {
    const startDate = futureDate(7 + index * 7, 20) // Next few weeks
    const endDate = new Date(startDate)
    endDate.setHours(startDate.getHours() + 5) // 5 hour events

    const event = await prisma.event.create({
      data: {
        title: eventData.title,
        slug: generateSlug(eventData.title),
        description: eventData.description,
        startDate,
        endDate,
        location: eventData.location,
        imageUrl: eventData.imageUrl,
        categories: eventData.categories,
        eventType: eventData.eventType,
        capacity: eventData.capacity,
        organizerId: organizer.id,
        status: 'PUBLISHED',
        isPublished: true,
      },
    })

    console.log(`✅ Created: ${event.title}`)
  }

  console.log('\n🎉 Seed complete!')
  console.log(`\n📊 Summary:`)
  console.log(`   • 15 Ticketed Events created`)
  console.log(`   • 2 Save the Date Events created`)
  console.log(`   • 3 Pay at the Door Events created`)
  console.log(`   • Total: 20 events\n`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
