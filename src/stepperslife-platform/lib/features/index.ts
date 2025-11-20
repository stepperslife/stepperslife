export { FeatureManager } from './manager'
export { FeatureProvider, useFeatures, useFeature } from './hooks'
export { checkFeatureAccess, getEnabledRoutes } from './middleware'
export {
  getEnabledFeatures,
  isFeatureEnabled,
  getUserPreferences,
  updateUserPreferences,
} from './server'
export { AVAILABLE_FEATURES, DEFAULT_USER_PREFERENCES } from './constants'
export type { FeatureName, Feature, FeatureFlag, UserFeaturePreferences } from './types'
