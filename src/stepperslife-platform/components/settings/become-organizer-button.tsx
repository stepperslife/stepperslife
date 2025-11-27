'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { becomeEventOrganizer } from '@/lib/settings/actions'

export function BecomeOrganizerButton() {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [isPending, startTransition] = useTransition()

  async function handleClick() {
    setError('')

    startTransition(async () => {
      const result = await becomeEventOrganizer()

      if (result.error) {
        setError(result.error)
      } else {
        // Redirect to organizer dashboard
        router.push('/organizer/dashboard')
      }
    })
  }

  return (
    <div className="space-y-4 rounded-lg border p-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-md bg-muted p-4 text-sm">
        <h4 className="font-medium mb-2">What happens next:</h4>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Your account will be upgraded to Event Organizer</li>
          <li>• You'll get access to the Organizer Dashboard</li>
          <li>• You can start creating events immediately</li>
          <li>• You can sell tickets and manage attendees</li>
        </ul>
      </div>

      <button
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      >
        {isPending ? 'Enabling...' : 'Enable Event Organizer'}
      </button>
    </div>
  )
}
