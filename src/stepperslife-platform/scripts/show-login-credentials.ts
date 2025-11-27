/**
 * Display available login credentials for testing
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function showCredentials() {
  console.log('='.repeat(70))
  console.log('AVAILABLE LOGIN CREDENTIALS')
  console.log('='.repeat(70))
  console.log()

  // Get all users with their emails and roles
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    },
    orderBy: {
      role: 'asc'
    }
  })

  console.log(`Found ${users.length} users in database:\n`)

  // Group by role
  const adminUsers = users.filter(u => u.role === 'ADMIN')
  const organizerUsers = users.filter(u => u.role === 'EVENT_ORGANIZER')
  const vendorUsers = users.filter(u => u.role === 'VENDOR')
  const regularUsers = users.filter(u => u.role === 'USER')
  const staffUsers = users.filter(u => u.role === 'STAFF')

  if (adminUsers.length > 0) {
    console.log('ADMIN USERS:')
    console.log('-'.repeat(70))
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No name'}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ADMIN`)
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`)
      console.log()
    })
  }

  if (organizerUsers.length > 0) {
    console.log('EVENT ORGANIZER USERS:')
    console.log('-'.repeat(70))
    organizerUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No name'}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: EVENT_ORGANIZER`)
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`)
      console.log()
    })
  }

  if (vendorUsers.length > 0) {
    console.log('VENDOR USERS:')
    console.log('-'.repeat(70))
    vendorUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No name'}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: VENDOR`)
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`)
      console.log()
    })
  }

  if (staffUsers.length > 0) {
    console.log('STAFF USERS:')
    console.log('-'.repeat(70))
    staffUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No name'}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: STAFF`)
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`)
      console.log()
    })
  }

  if (regularUsers.length > 0) {
    console.log('REGULAR USERS:')
    console.log('-'.repeat(70))
    regularUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No name'}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: USER`)
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`)
      console.log()
    })
  }

  console.log('='.repeat(70))
  console.log('GOOGLE OAUTH LOGIN INFORMATION')
  console.log('='.repeat(70))
  console.log()
  console.log('The application uses Google OAuth for authentication.')
  console.log()
  console.log('Authorized Redirect URIs configured:')
  console.log('  • http://localhost:3004/api/auth/callback/google')
  console.log()
  console.log('To login:')
  console.log('  1. Click "Login / Register" button on homepage')
  console.log('  2. Click "Sign in with Google"')
  console.log('  3. Use one of your Google accounts')
  console.log()
  console.log('Current Google OAuth Client ID:')
  console.log('  325543338490-brk0cmodprdeto2sg19prjjlsc9dikrv.apps.googleusercontent.com')
  console.log()
  console.log('If you need to sign in as a specific user above, make sure that')
  console.log('Google account email matches one of the emails listed.')
  console.log()

  await prisma.$disconnect()
}

showCredentials()
