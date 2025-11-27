import { prisma } from '../db/client'
import { AVAILABLE_FEATURES } from './constants'
import { FeatureName, FeatureFlag } from './types'

export class FeatureManager {
  private static cache: Map<string, FeatureFlag> = new Map()
  private static cacheExpiry: number = 0
  private static CACHE_TTL = 60000 // 1 minute

  private static async refreshCache(): Promise<void> {
    const now = Date.now()
    if (now < this.cacheExpiry && this.cache.size > 0) {
      return
    }

    const flags = await prisma.featureFlag.findMany()
    this.cache.clear()

    flags.forEach((flag) => {
      this.cache.set(flag.name, {
        ...flag,
        routes: flag.routes ? (flag.routes as string[]) : null,
        permissions: flag.permissions ? (flag.permissions as string[]) : null,
        config: flag.config ? (flag.config as Record<string, unknown>) : null,
      })
    })

    this.cacheExpiry = now + this.CACHE_TTL
  }

  static async isEnabled(featureName: FeatureName): Promise<boolean> {
    await this.refreshCache()

    const flag = this.cache.get(featureName)
    if (!flag) {
      const feature = AVAILABLE_FEATURES[featureName]
      return feature?.defaultEnabled ?? false
    }

    return flag.enabled
  }

  static async enableFeature(featureName: FeatureName): Promise<void> {
    const feature = AVAILABLE_FEATURES[featureName]
    if (!feature) {
      throw new Error(`Unknown feature: ${featureName}`)
    }

    await prisma.featureFlag.upsert({
      where: { name: featureName },
      update: { enabled: true },
      create: {
        name: featureName,
        enabled: true,
        description: feature.description,
        routes: feature.routes,
        permissions: feature.requiredPermissions,
      },
    })

    this.cache.delete(featureName)
    this.cacheExpiry = 0
  }

  static async disableFeature(featureName: FeatureName): Promise<void> {
    await prisma.featureFlag.update({
      where: { name: featureName },
      data: { enabled: false },
    })

    this.cache.delete(featureName)
    this.cacheExpiry = 0
  }

  static async getEnabledFeatures(): Promise<FeatureFlag[]> {
    await this.refreshCache()

    return Array.from(this.cache.values()).filter((flag) => flag.enabled)
  }

  static async getAllFeatures(): Promise<FeatureFlag[]> {
    await this.refreshCache()

    return Array.from(this.cache.values())
  }

  static async getFeatureRoutes(featureName: FeatureName): Promise<string[]> {
    await this.refreshCache()

    const flag = this.cache.get(featureName)
    if (!flag) {
      const feature = AVAILABLE_FEATURES[featureName]
      return feature?.routes ?? []
    }

    return flag.routes ?? []
  }

  static async initializeFeatures(): Promise<void> {
    for (const [name, feature] of Object.entries(AVAILABLE_FEATURES)) {
      const existing = await prisma.featureFlag.findUnique({
        where: { name },
      })

      if (!existing) {
        await prisma.featureFlag.create({
          data: {
            name,
            enabled: feature.defaultEnabled,
            description: feature.description,
            routes: feature.routes,
            permissions: feature.requiredPermissions,
          },
        })
      }
    }

    this.cacheExpiry = 0
  }

  static async updateFeatureConfig(
    featureName: FeatureName,
    config: Record<string, unknown>
  ): Promise<void> {
    await prisma.featureFlag.update({
      where: { name: featureName },
      data: { config },
    })

    this.cache.delete(featureName)
    this.cacheExpiry = 0
  }

  static async getFeatureConfig(featureName: FeatureName): Promise<Record<string, unknown> | null> {
    await this.refreshCache()

    const flag = this.cache.get(featureName)
    return flag?.config ?? null
  }

  static clearCache(): void {
    this.cache.clear()
    this.cacheExpiry = 0
  }
}
