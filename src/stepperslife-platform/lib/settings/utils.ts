/**
 * User Preferences Utilities
 * Helper functions for managing user preferences
 */

export interface UserPreferences {
  showEvents: boolean
  showStore: boolean
  vendorEnabled: boolean
  organizerEnabled: boolean
}

export const defaultPreferences: UserPreferences = {
  showEvents: true,
  showStore: true,
  vendorEnabled: false,
  organizerEnabled: false,
}

/**
 * Get user preferences with defaults
 */
export function getUserPreferences(user: any): UserPreferences {
  if (!user?.preferences) {
    return defaultPreferences
  }

  return {
    ...defaultPreferences,
    ...(user.preferences as UserPreferences),
  }
}
