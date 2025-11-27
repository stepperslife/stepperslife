import { prisma } from '../lib/db/client'
import bcrypt from 'bcryptjs'

const TEST_USERS = [
  { email: 'admin@stepperslife.com', password: 'TestPass123!', role: 'ADMIN' as const, name: 'Admin User' },
  {
    email: 'organizer@stepperslife.com',
    password: 'TestPass123!',
    role: 'EVENT_ORGANIZER' as const,
    name: 'Event Organizer',
  },
  { email: 'vendor@stepperslife.com', password: 'TestPass123!', role: 'VENDOR' as const, name: 'Vendor User' },
  { email: 'user@stepperslife.com', password: 'TestPass123!', role: 'USER' as const, name: 'Regular User' },
]

async function main() {
  console.log('Creating test users...\n')

  for (const userData of TEST_USERS) {
    try {
      // Check if user already exists
      const existing = await prisma.user.findUnique({
        where: { email: userData.email },
      })

      if (existing) {
        console.log(`⚠️  User ${userData.email} already exists, deleting...`)
        await prisma.user.delete({ where: { email: userData.email } })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10)

      // Create user
      await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          role: userData.role,
          preferences: {
            showEvents: true,
            showStore: true,
            showBlog: false,
          },
        },
      })

      console.log(`✓ Created ${userData.role} user: ${userData.email}`)
    } catch (error) {
      console.error(`❌ Error creating ${userData.email}:`, error)
    }
  }

  console.log('\n✅ All test users created successfully!')
  console.log('\nTest Credentials:')
  console.log('==================')
  TEST_USERS.forEach((u) => {
    console.log(`${u.role.padEnd(20)} - ${u.email} / ${u.password}`)
  })

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
