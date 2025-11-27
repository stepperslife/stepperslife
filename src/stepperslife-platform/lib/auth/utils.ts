import { auth } from './config'
import { redirect } from 'next/navigation'

export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

export async function requireAuth() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return session.user
}

export async function requireAdmin() {
  const user = await requireAuth()

  if (user.role !== 'ADMIN') {
    redirect('/')
  }

  return user
}

export async function requireEventOrganizer() {
  const user = await requireAuth()

  if (user.role !== 'ADMIN' && user.role !== 'EVENT_ORGANIZER') {
    redirect('/')
  }

  return user
}

export async function requireVendor() {
  const user = await requireAuth()

  if (user.role !== 'ADMIN' && user.role !== 'VENDOR') {
    redirect('/')
  }

  return user
}

export function isAdmin(role?: string): boolean {
  return role === 'ADMIN'
}

export function isEventOrganizer(role?: string): boolean {
  return role === 'ADMIN' || role === 'EVENT_ORGANIZER'
}

export function isVendor(role?: string): boolean {
  return role === 'ADMIN' || role === 'VENDOR'
}
