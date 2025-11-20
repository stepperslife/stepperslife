import { NextRequest, NextResponse } from 'next/server'
import { FeatureManager } from './manager'
import { AVAILABLE_FEATURES } from './constants'
import { FeatureName } from './types'

export async function checkFeatureAccess(
  request: NextRequest,
  pathname: string
): Promise<NextResponse | null> {
  for (const [featureName, feature] of Object.entries(AVAILABLE_FEATURES)) {
    const isFeatureRoute = feature.routes.some((route) => {
      const routePattern = route.replace(/\[.*?\]/g, '[^/]+')
      const regex = new RegExp(`^${routePattern}(/.*)?$`)
      return regex.test(pathname)
    })

    if (isFeatureRoute) {
      const isEnabled = await FeatureManager.isEnabled(featureName as FeatureName)

      if (!isEnabled) {
        return NextResponse.redirect(new URL('/feature-disabled', request.url))
      }

      return null
    }
  }

  return null
}

export async function getEnabledRoutes(): Promise<string[]> {
  const enabledFeatures = await FeatureManager.getEnabledFeatures()
  const routes: string[] = []

  for (const flag of enabledFeatures) {
    if (flag.routes) {
      routes.push(...flag.routes)
    }
  }

  return routes
}
