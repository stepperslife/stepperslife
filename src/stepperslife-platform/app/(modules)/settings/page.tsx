import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { getUserPreferences } from '@/lib/settings/utils'
import { userHasVendorStore } from '@/lib/store'
import { Separator } from '@/components/ui/separator'
import { FeatureToggles } from '@/components/settings/feature-toggles'
import { BecomeVendorForm } from '@/components/settings/become-vendor-form'
import { BecomeOrganizerButton } from '@/components/settings/become-organizer-button'
import { ProfileForm } from '@/components/settings/profile-form'
import { UserRole } from '@prisma/client'

export const metadata: Metadata = {
  title: 'Settings | SteppersLife',
  description: 'Manage your account settings and preferences',
}

export default async function SettingsPage() {
  const user = await requireAuth()
  const preferences = getUserPreferences(user)
  const hasVendorStore = await userHasVendorStore(user.id)

  // Determine user capabilities
  const canBecomeVendor = user.role === UserRole.USER || user.role === UserRole.EVENT_ORGANIZER
  const canBecomeOrganizer = user.role === UserRole.USER || user.role === UserRole.VENDOR
  const isVendor = user.role === UserRole.VENDOR || user.role === UserRole.ADMIN
  const isOrganizer = user.role === UserRole.EVENT_ORGANIZER || user.role === UserRole.ADMIN

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Separator />

        {/* Profile Settings */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Update your personal information
          </p>
          <ProfileForm user={user} />
        </section>

        <Separator />

        {/* Feature Toggles */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Features</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Control which features you see in your navigation. Toggle off features you don't use to keep your experience simple.
          </p>
          <FeatureToggles preferences={preferences} />
        </section>

        <Separator />

        {/* Become a Vendor */}
        {!isVendor && !hasVendorStore && canBecomeVendor && (
          <>
            <section>
              <h2 className="text-xl font-semibold mb-4">Open a Store</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Would you like to sell your products on SteppersLife? Open your own vendor store and start selling today.
              </p>
              <BecomeVendorForm userEmail={user.email} userName={user.name || ''} />
            </section>
            <Separator />
          </>
        )}

        {/* Vendor Store Active */}
        {(isVendor || hasVendorStore) && (
          <>
            <section>
              <h2 className="text-xl font-semibold mb-4">Vendor Store</h2>
              <div className="rounded-lg border bg-muted/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Vendor Store Active</h3>
                    <p className="text-sm text-muted-foreground">
                      You have a vendor store. Manage it from your vendor dashboard.
                    </p>
                  </div>
                  <a
                    href="/vendor/dashboard"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
                  >
                    Go to Dashboard
                  </a>
                </div>
              </div>
            </section>
            <Separator />
          </>
        )}

        {/* Become an Event Organizer */}
        {!isOrganizer && canBecomeOrganizer && (
          <>
            <section>
              <h2 className="text-xl font-semibold mb-4">Create Events</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Do you want to create and manage events? Enable event organizer features to get started.
              </p>
              <BecomeOrganizerButton />
            </section>
            <Separator />
          </>
        )}

        {/* Event Organizer Active */}
        {isOrganizer && (
          <>
            <section>
              <h2 className="text-xl font-semibold mb-4">Event Organizer</h2>
              <div className="rounded-lg border bg-muted/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Event Organizer Active</h3>
                    <p className="text-sm text-muted-foreground">
                      You can create and manage events. Access your organizer dashboard.
                    </p>
                  </div>
                  <a
                    href="/organizer/dashboard"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
                  >
                    Go to Dashboard
                  </a>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
