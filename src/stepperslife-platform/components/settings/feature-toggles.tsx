'use client'

import { useState, useTransition } from 'react'
import { updateFeatureToggles } from '@/lib/settings/actions'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface FeatureTogglesProps {
  preferences: {
    showEvents: boolean
    showStore: boolean
    vendorEnabled: boolean
    organizerEnabled: boolean
  }
}

export function FeatureToggles({ preferences }: FeatureTogglesProps) {
  const [showEvents, setShowEvents] = useState(preferences.showEvents)
  const [showStore, setShowStore] = useState(preferences.showStore)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleToggle(field: 'showEvents' | 'showStore', value: boolean) {
    const formData = new FormData()

    if (field === 'showEvents') {
      setShowEvents(value)
      formData.set('showEvents', String(value))
      formData.set('showStore', String(showStore))
    } else {
      setShowStore(value)
      formData.set('showEvents', String(showEvents))
      formData.set('showStore', String(value))
    }

    startTransition(async () => {
      const result = await updateFeatureToggles(formData)

      if (result.error) {
        setMessage({ type: 'error', text: result.error })
        // Revert on error
        if (field === 'showEvents') setShowEvents(!value)
        else setShowStore(!value)
      } else {
        setMessage({ type: 'success', text: 'Preferences updated' })
        setTimeout(() => setMessage(null), 3000)
      }
    })
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-destructive/10 text-destructive'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {/* Events Toggle */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="show-events" className="text-base">
              Show Events
            </Label>
            <p className="text-sm text-muted-foreground">
              Display events, my tickets, and event-related features in navigation
            </p>
          </div>
          <Switch
            id="show-events"
            checked={showEvents}
            onCheckedChange={(checked) => handleToggle('showEvents', checked)}
            disabled={isPending}
          />
        </div>

        {/* Store Toggle */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="show-store" className="text-base">
              Show Store
            </Label>
            <p className="text-sm text-muted-foreground">
              Display stores, products, and shopping features in navigation
            </p>
          </div>
          <Switch
            id="show-store"
            checked={showStore}
            onCheckedChange={(checked) => handleToggle('showStore', checked)}
            disabled={isPending}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        These settings only affect what you see. Toggling off a feature won't affect your existing data or subscriptions.
      </p>
    </div>
  )
}
