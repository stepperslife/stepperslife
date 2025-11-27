export type FeatureName = 'events' | 'store' | 'blog'

export interface Feature {
  name: FeatureName
  displayName: string
  description: string
  icon: string
  routes: string[]
  requiredPermissions?: string[]
  defaultEnabled: boolean
}

export interface FeatureFlag {
  id: string
  name: string
  enabled: boolean
  description: string | null
  routes: string[] | null
  permissions: string[] | null
  config: Record<string, unknown> | null
  createdAt: Date
  updatedAt: Date
}

export interface UserFeaturePreferences {
  showEvents: boolean
  showStore: boolean
  showBlog: boolean
}
