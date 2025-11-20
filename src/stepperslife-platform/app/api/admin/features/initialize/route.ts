import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { FeatureManager } from '@/lib/features'

const ADMIN_EMAILS = ['iradwatkins@gmail.com', 'bobbygwatkins@gmail.com']

export async function POST() {
  try {
    const session = await getServerSession()

    if (!ADMIN_EMAILS.includes(session?.user?.email ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await FeatureManager.initializeFeatures()

    return NextResponse.json({
      success: true,
      message: 'Features initialized successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to initialize features' },
      { status: 500 }
    )
  }
}
