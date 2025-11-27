/**
 * Set simple passwords for all test users
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Simple password for all test accounts
const SIMPLE_PASSWORD = 'password123'

async function setPasswords() {
  console.log('='.repeat(70))
  console.log('SETTING PASSWORDS FOR ALL TEST USERS')
  console.log('='.repeat(70))
  console.log()

  console.log(`Setting password to: ${SIMPLE_PASSWORD}`)
  console.log()

  const hashedPassword = await bcrypt.hash(SIMPLE_PASSWORD, 12)

  // Get all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true
    }
  })

  console.log(`Found ${users.length} users. Updating passwords...\n`)

  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    console.log(`✅ ${user.email} - Password set`)
  }

  console.log()
  console.log('='.repeat(70))
  console.log('ALL PASSWORDS SET!')
  console.log('='.repeat(70))
  console.log()
  console.log(`You can now login with ANY email and password: ${SIMPLE_PASSWORD}`)
  console.log()
  console.log('QUICK LOGIN CREDENTIALS:')
  console.log('-'.repeat(70))
  console.log()
  console.log('ADMIN:')
  console.log(`  Email: admin@stepperslife.com`)
  console.log(`  Password: ${SIMPLE_PASSWORD}`)
  console.log()
  console.log('YOUR PERSONAL ADMIN:')
  console.log(`  Email: iradwatkins@gmail.com`)
  console.log(`  Password: ${SIMPLE_PASSWORD}`)
  console.log()
  console.log('EVENT ORGANIZER:')
  console.log(`  Email: organizer@stepperslife.com`)
  console.log(`  Password: ${SIMPLE_PASSWORD}`)
  console.log()
  console.log('VENDOR:')
  console.log(`  Email: vendor@stepperslife.com`)
  console.log(`  Password: ${SIMPLE_PASSWORD}`)
  console.log()
  console.log('REGULAR USER:')
  console.log(`  Email: user@stepperslife.com`)
  console.log(`  Password: ${SIMPLE_PASSWORD}`)
  console.log()

  await prisma.$disconnect()
}

setPasswords()
