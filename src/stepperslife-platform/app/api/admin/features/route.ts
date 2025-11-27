import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { FeatureManager } from '@/lib/features'
import { z } from 'zod'

const ADMIN_EMAILS = ['iradwatkins@gmail.com', 'bobbygwatkins@gmail.com']

async function isAdmin(): Promise<boolean> {
  const session = await getServerSession()
  return ADMIN_EMAILS.includes(session?.user?.email ?? '')
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const features = await FeatureManager.getAllFeatures()
    return NextResponse.json({ features })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch features' }, { status: 500 })
  }
}

const updateFeatureSchema = z.object({
  name: z.enum(['events', 'store', 'blog']),
  enabled: z.boolean(),
})

export async function PATCH(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, enabled } = updateFeatureSchema.parse(body)

    if (enabled) {
      await FeatureManager.enableFeature(name)
    } else {
      await FeatureManager.disableFeature(name)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid feature data' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to update feature' }, { status: 500 })
  }
}
