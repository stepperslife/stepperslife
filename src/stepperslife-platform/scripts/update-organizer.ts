import { prisma } from '../lib/db/client'
import bcrypt from 'bcryptjs'

async function main() {
  const hashedPassword = await bcrypt.hash('TestPass123!', 10)

  const updated = await prisma.user.upsert({
    where: { email: 'organizer@stepperslife.com' },
    update: {
      password: hashedPassword,
      role: 'EVENT_ORGANIZER',
      name: 'Event Organizer',
      preferences: {
        showEvents: true,
        showStore: true,
        showBlog: false,
      },
    },
    create: {
      email: 'organizer@stepperslife.com',
      password: hashedPassword,
      role: 'EVENT_ORGANIZER',
      name: 'Event Organizer',
      preferences: {
        showEvents: true,
        showStore: true,
        showBlog: false,
      },
    },
  })

  console.log('✓ Created/Updated EVENT_ORGANIZER:', updated.email)
  await prisma.$disconnect()
}

main()
