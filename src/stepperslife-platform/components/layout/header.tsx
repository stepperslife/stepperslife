import Link from 'next/link'
import { MainNav } from './main-nav'
import { UserNav } from './user-nav'
import { MobileNav } from './mobile-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { getCurrentUser } from '@/lib/auth'
import { getUserPreferences } from '@/lib/settings/utils'

export async function Header() {
  const user = await getCurrentUser()

  // Get user preferences if logged in
  const preferences = user ? getUserPreferences(user) : {
    showEvents: true,
    showStore: true,
    vendorEnabled: false,
    organizerEnabled: false,
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center">
          <img
            src="/logos/stepperslife-logo-dark.svg"
            alt="SteppersLife"
            className="h-8 dark:hidden"
          />
          <img
            src="/logos/stepperslife-logo-light.svg"
            alt="SteppersLife"
            className="hidden h-8 dark:block"
          />
        </Link>

        {/* Right Side - Menu bar shifted to right */}
        <div className="ml-auto flex items-center gap-2">
          {/* Desktop Navigation - Now on right side */}
          <MainNav preferences={preferences} user={user} />
          <ThemeToggle />
          {user ? (
            <>
              <UserNav user={user} preferences={preferences} />
              <MobileNav preferences={preferences} user={user} />
            </>
          ) : (
            <>
              <MobileNav preferences={preferences} user={user} />
              <Link
                href="/auth"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
              >
                Login / Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
