'use server'

/**
 * User Settings - Server Actions
 *
 * Handles user preferences and feature toggles:
 * - Feature visibility (events, store)
 * - Role enablement (become vendor, become organizer)
 * - Profile updates
 */

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { UserPreferences, defaultPreferences } from './utils'

// ============================================================================
// Feature Toggle Actions
// ============================================================================

/**
 * Update user feature visibility preferences
 */
export async function updateFeatureToggles(formData: FormData) {
  try {
    const user = await requireAuth()

    const showEvents = formData.get('showEvents') === 'true'
    const showStore = formData.get('showStore') === 'true'

    // Get current preferences
    const currentPrefs = (user.preferences as UserPreferences) || defaultPreferences

    // Update preferences
    const newPreferences: UserPreferences = {
      ...currentPrefs,
      showEvents,
      showStore,
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        preferences: newPreferences,
      },
    })

    revalidatePath('/settings')
    revalidatePath('/')

    return { success: true }
  } catch (error) {
    console.error('Update feature toggles error:', error)
    return { error: 'Failed to update preferences. Please try again.' }
  }
}

/**
 * Open a vendor store - creates first store and promotes user to VENDOR
 */
export async function becomeVendor(formData: FormData) {
  try {
    const user = await requireAuth()

    // Check if user already has a store
    const existingStore = await prisma.vendorStore.findFirst({
      where: { userId: user.id },
    })

    if (existingStore) {
      return { error: 'You already have a vendor store' }
    }

    // Validate store name
    const storeName = formData.get('storeName') as string
    if (!storeName || storeName.length < 2) {
      return { error: 'Store name must be at least 2 characters' }
    }

    const email = formData.get('email') as string
    if (!email) {
      return { error: 'Email is required' }
    }

    // Generate unique slug
    const baseSlug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    let slug = baseSlug
    let counter = 1

    while (await prisma.vendorStore.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Create store and promote user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create vendor store
      const store = await tx.vendorStore.create({
        data: {
          storeId: `store_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          slug,
          name: storeName,
          email,
          isActive: true,
        },
      })

      // Promote user to VENDOR
      await tx.user.update({
        where: { id: user.id },
        data: {
          role: UserRole.VENDOR,
          preferences: {
            ...((user.preferences as UserPreferences) || defaultPreferences),
            vendorEnabled: true,
            showStore: true,
          },
        },
      })

      return store
    })

    revalidatePath('/settings')
    revalidatePath('/vendor/dashboard')
    revalidatePath('/')

    return { success: true, storeSlug: result.slug }
  } catch (error) {
    console.error('Become vendor error:', error)
    return { error: 'Failed to create store. Please try again.' }
  }
}

/**
 * Enable event organizer features - promotes user to EVENT_ORGANIZER
 */
export async function becomeEventOrganizer() {
  try {
    const user = await requireAuth()

    // Check if already an organizer
    if (user.role === UserRole.EVENT_ORGANIZER || user.role === UserRole.ADMIN) {
      return { success: true } // Already enabled
    }

    // Promote user to EVENT_ORGANIZER
    await prisma.user.update({
      where: { id: user.id },
      data: {
        role: UserRole.EVENT_ORGANIZER,
        preferences: {
          ...((user.preferences as UserPreferences) || defaultPreferences),
          organizerEnabled: true,
          showEvents: true,
        },
      },
    })

    revalidatePath('/settings')
    revalidatePath('/organizer/dashboard')
    revalidatePath('/')

    return { success: true }
  } catch (error) {
    console.error('Become event organizer error:', error)
    return { error: 'Failed to enable organizer features. Please try again.' }
  }
}

/**
 * Update user profile information
 */
export async function updateProfile(formData: FormData) {
  try {
    const user = await requireAuth()

    const name = formData.get('name') as string
    const email = formData.get('email') as string

    if (!name || name.length < 2) {
      return { error: 'Name must be at least 2 characters' }
    }

    if (!email || !email.includes('@')) {
      return { error: 'Valid email is required' }
    }

    // Check if email is already taken
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: user.id },
      },
    })

    if (existingUser) {
      return { error: 'Email is already in use' }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        email,
      },
    })

    revalidatePath('/settings')

    return { success: true }
  } catch (error) {
    console.error('Update profile error:', error)
    return { error: 'Failed to update profile. Please try again.' }
  }
}
