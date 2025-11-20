import { cache } from 'react'
import { FeatureManager } from './manager'
import { FeatureName } from './types'
import { prisma } from '../db/client'

export const getEnabledFeatures = cache(async () => {
  return await FeatureManager.getEnabledFeatures()
})

export const isFeatureEnabled = cache(async (featureName: FeatureName) => {
  return await FeatureManager.isEnabled(featureName)
})

export const getUserPreferences = cache(async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  })

  if (!user?.preferences) {
    return {
      showEvents: true,
      showStore: true,
      showBlog: false,
    }
  }

  return user.preferences as {
    showEvents: boolean
    showStore: boolean
    showBlog: boolean
  }
})

export async function updateUserPreferences(
  userId: string,
  preferences: Partial<{
    showEvents: boolean
    showStore: boolean
    showBlog: boolean
  }>
): Promise<void> {
  const currentPrefs = await getUserPreferences(userId)

  await prisma.user.update({
    where: { id: userId },
    data: {
      preferences: {
        ...currentPrefs,
        ...preferences,
      },
    },
  })
}
