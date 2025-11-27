import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { updateUserPreferences } from '@/lib/features'
import { z } from 'zod'

const preferencesSchema = z.object({
  showEvents: z.boolean().optional(),
  showStore: z.boolean().optional(),
  showBlog: z.boolean().optional(),
})

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const preferences = preferencesSchema.parse(body)

    await updateUserPreferences(session.user.id, preferences)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid preferences data' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}
