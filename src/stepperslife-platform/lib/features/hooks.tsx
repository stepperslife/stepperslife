'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { FeatureName, UserFeaturePreferences } from './types'
import { DEFAULT_USER_PREFERENCES } from './constants'

interface FeatureContextValue {
  enabledFeatures: Set<FeatureName>
  userPreferences: UserFeaturePreferences
  isFeatureEnabled: (featureName: FeatureName) => boolean
  isFeatureVisible: (featureName: FeatureName) => boolean
  updatePreference: (featureName: FeatureName, visible: boolean) => Promise<void>
  loading: boolean
}

const FeatureContext = createContext<FeatureContextValue | undefined>(undefined)

interface FeatureProviderProps {
  children: ReactNode
  initialFeatures: FeatureName[]
  userPreferences?: UserFeaturePreferences
}

export function FeatureProvider({
  children,
  initialFeatures,
  userPreferences: initialPreferences
}: FeatureProviderProps) {
  const [enabledFeatures, setEnabledFeatures] = useState<Set<FeatureName>>(
    new Set(initialFeatures)
  )
  const [userPreferences, setUserPreferences] = useState<UserFeaturePreferences>(
    initialPreferences ?? DEFAULT_USER_PREFERENCES
  )
  const [loading, setLoading] = useState(false)

  const isFeatureEnabled = (featureName: FeatureName): boolean => {
    return enabledFeatures.has(featureName)
  }

  const isFeatureVisible = (featureName: FeatureName): boolean => {
    if (!isFeatureEnabled(featureName)) return false

    switch (featureName) {
      case 'events':
        return userPreferences.showEvents
      case 'store':
        return userPreferences.showStore
      case 'blog':
        return userPreferences.showBlog
      default:
        return false
    }
  }

  const updatePreference = async (
    featureName: FeatureName,
    visible: boolean
  ): Promise<void> => {
    setLoading(true)

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [`show${featureName.charAt(0).toUpperCase()}${featureName.slice(1)}`]: visible,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update preferences')
      }

      setUserPreferences((prev) => ({
        ...prev,
        [`show${featureName.charAt(0).toUpperCase()}${featureName.slice(1)}`]: visible,
      }))
    } finally {
      setLoading(false)
    }
  }

  const value: FeatureContextValue = {
    enabledFeatures,
    userPreferences,
    isFeatureEnabled,
    isFeatureVisible,
    updatePreference,
    loading,
  }

  return <FeatureContext.Provider value={value}>{children}</FeatureContext.Provider>
}

export function useFeatures(): FeatureContextValue {
  const context = useContext(FeatureContext)
  if (!context) {
    throw new Error('useFeatures must be used within a FeatureProvider')
  }
  return context
}

export function useFeature(featureName: FeatureName): {
  isEnabled: boolean
  isVisible: boolean
  toggleVisibility: (visible: boolean) => Promise<void>
  loading: boolean
} {
  const { isFeatureEnabled, isFeatureVisible, updatePreference, loading } = useFeatures()

  return {
    isEnabled: isFeatureEnabled(featureName),
    isVisible: isFeatureVisible(featureName),
    toggleVisibility: (visible: boolean) => updatePreference(featureName, visible),
    loading,
  }
}
