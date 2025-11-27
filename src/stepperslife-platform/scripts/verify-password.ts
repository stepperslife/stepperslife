/**
 * Verify password for admin user
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function verifyPassword() {
  console.log('Verifying password for admin@stepperslife.com...\n')

  const user = await prisma.user.findUnique({
    where: { email: 'admin@stepperslife.com' },
    select: {
      id: true,
      email: true,
      name: true,
      password: true
    }
  })

  if (!user) {
    console.log('❌ User not found!')
    await prisma.$disconnect()
    return
  }

  console.log(`✅ User found: ${user.name} (${user.email})`)
  console.log(`   Password hash: ${user.password?.substring(0, 20)}...`)
  console.log()

  if (!user.password) {
    console.log('❌ User has no password set!')
    await prisma.$disconnect()
    return
  }

  // Test the password
  const testPassword = 'password123'
  const isValid = await bcrypt.compare(testPassword, user.password)

  console.log(`Testing password: "${testPassword}"`)
  console.log(`Result: ${isValid ? '✅ VALID' : '❌ INVALID'}`)
  console.log()

  if (!isValid) {
    console.log('Password does not match. Setting new password...')
    const hashedPassword = await bcrypt.hash(testPassword, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    console.log('✅ Password updated!')
    console.log()

    // Verify again
    const updatedUser = await prisma.user.findUnique({
      where: { email: 'admin@stepperslife.com' },
      select: { password: true }
    })

    const isValidNow = await bcrypt.compare(testPassword, updatedUser!.password!)
    console.log(`Verification: ${isValidNow ? '✅ Password works now!' : '❌ Still not working'}`)
  }

  await prisma.$disconnect()
}

verifyPassword()
