/**
 * Reset database - clear all users and events
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetDatabase() {
  console.log('='.repeat(70))
  console.log('RESETTING DATABASE')
  console.log('='.repeat(70))
  console.log()

  // Delete all data in the correct order (respecting foreign keys)
  console.log('Deleting all tickets...')
  await prisma.ticket.deleteMany()
  console.log('✅ Tickets deleted')

  console.log('Deleting all event staff...')
  await prisma.eventStaff.deleteMany()
  console.log('✅ Event staff deleted')

  console.log('Deleting all events...')
  await prisma.event.deleteMany()
  console.log('✅ Events deleted')

  console.log('Deleting all accounts...')
  await prisma.account.deleteMany()
  console.log('✅ Accounts deleted')

  console.log('Deleting all sessions...')
  await prisma.session.deleteMany()
  console.log('✅ Sessions deleted')

  console.log('Deleting all users...')
  await prisma.user.deleteMany()
  console.log('✅ Users deleted')

  console.log()
  console.log('Creating fresh admin user...')
  console.log()

  const password = 'admin123'
  const hashedPassword = await bcrypt.hash(password, 12)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@stepperslife.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date()
    }
  })

  console.log('✅ Admin user created!')
  console.log()
  console.log('='.repeat(70))
  console.log('DATABASE RESET COMPLETE!')
  console.log('='.repeat(70))
  console.log()
  console.log('LOGIN CREDENTIALS:')
  console.log('-'.repeat(70))
  console.log()
  console.log('  Email:    admin@stepperslife.com')
  console.log('  Password: admin123')
  console.log()
  console.log('='.repeat(70))
  console.log()

  await prisma.$disconnect()
}

resetDatabase()
