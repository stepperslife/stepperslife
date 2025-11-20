'use server'

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from './config'
import { prisma } from '@/lib/db/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { AuthError } from 'next-auth'

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const unifiedAuthSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
})

export async function signUp(data: FormData) {
  try {
    const rawData = {
      name: data.get('name'),
      email: data.get('email'),
      password: data.get('password'),
    }

    const validatedData = signUpSchema.parse(rawData)

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return {
        error: 'User with this email already exists',
      }
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    const ADMIN_EMAILS = ['iradwatkins@gmail.com', 'bobbygwatkins@gmail.com']
    const role = ADMIN_EMAILS.includes(validatedData.email) ? 'ADMIN' : 'USER'

    await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role,
      },
    })

    await nextAuthSignIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    })

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message,
      }
    }

    return {
      error: 'An error occurred during sign up',
    }
  }
}

export async function signInWithCredentials(data: FormData) {
  try {
    const rawData = {
      email: data.get('email'),
      password: data.get('password'),
    }

    const validatedData = signInSchema.parse(rawData)

    await nextAuthSignIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirectTo: '/',
    })

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message,
      }
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            error: 'Invalid email or password',
          }
        default:
          return {
            error: 'An error occurred during sign in',
          }
      }
    }

    throw error
  }
}

export async function authenticateUser(data: FormData) {
  try {
    const rawData = {
      email: data.get('email'),
      password: data.get('password'),
      name: data.get('name'),
    }

    const validatedData = unifiedAuthSchema.parse(rawData)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    // If user exists, sign them in
    if (existingUser) {
      await nextAuthSignIn('credentials', {
        email: validatedData.email,
        password: validatedData.password,
        redirectTo: '/',
      })
      return { success: true, isNewUser: false }
    }

    // If user doesn't exist, register them
    if (!validatedData.name) {
      return {
        error: 'Name is required for new accounts',
        needsName: true,
      }
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    const ADMIN_EMAILS = ['iradwatkins@gmail.com', 'bobbygwatkins@gmail.com']
    const role = ADMIN_EMAILS.includes(validatedData.email) ? 'ADMIN' : 'USER'

    await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role,
      },
    })

    // Auto-signin after registration
    await nextAuthSignIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    })

    return { success: true, isNewUser: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message,
      }
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            error: 'Invalid email or password',
          }
        default:
          return {
            error: 'An error occurred during authentication',
          }
      }
    }

    return {
      error: 'An error occurred during authentication',
    }
  }
}

export async function signInWithGoogle() {
  await nextAuthSignIn('google', { redirectTo: '/' })
}

export async function signOut() {
  await nextAuthSignOut({ redirectTo: '/' })
}

export async function becomeEventOrganizer(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (user?.role === 'ADMIN') {
    return { success: true }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: 'EVENT_ORGANIZER' },
  })

  return { success: true }
}

export async function becomeVendor(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (user?.role === 'ADMIN') {
    return { success: true }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: 'VENDOR' },
  })

  return { success: true }
}
