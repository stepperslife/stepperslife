'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { becomeVendor } from '@/lib/settings/actions'
import { Label } from '@/components/ui/label'

interface BecomeVendorFormProps {
  userEmail: string
  userName: string
}

export function BecomeVendorForm({ userEmail, userName }: BecomeVendorFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await becomeVendor(formData)

      if (result.error) {
        setError(result.error)
      } else if (result.storeSlug) {
        // Redirect to vendor dashboard
        router.push('/vendor/dashboard')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border p-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="storeName">Store Name *</Label>
          <input
            id="storeName"
            name="storeName"
            type="text"
            required
            disabled={isPending}
            defaultValue={`${userName}'s Store`}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="My Awesome Store"
          />
          <p className="text-xs text-muted-foreground">
            This will be the name displayed to customers
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Store Contact Email *</Label>
          <input
            id="email"
            name="email"
            type="email"
            required
            disabled={isPending}
            defaultValue={userEmail}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="store@example.com"
          />
          <p className="text-xs text-muted-foreground">
            Customers will use this email to contact you
          </p>
        </div>
      </div>

      <div className="rounded-md bg-muted p-4 text-sm">
        <h4 className="font-medium mb-2">What happens next:</h4>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Your account will be upgraded to Vendor</li>
          <li>• You'll get access to the Vendor Dashboard</li>
          <li>• You can start adding products immediately</li>
          <li>• Your store will be visible once you publish products</li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      >
        {isPending ? 'Creating Store...' : 'Open My Store'}
      </button>
    </form>
  )
}
