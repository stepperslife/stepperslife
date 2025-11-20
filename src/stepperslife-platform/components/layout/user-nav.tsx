'use client'

import { signOutAction } from '@/lib/auth'
import { User, LogOut, Settings, LayoutDashboard, Calendar, Store, Ticket } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface UserNavProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role: string
  }
  preferences: {
    showEvents: boolean
    showStore: boolean
    vendorEnabled: boolean
    organizerEnabled: boolean
  }
}

export function UserNav({ user, preferences }: UserNavProps) {
  async function handleSignOut() {
    await signOutAction()
  }

  const isAdmin = user.role === 'ADMIN'
  const isVendor = user.role === 'VENDOR' || isAdmin
  const isOrganizer = user.role === 'EVENT_ORGANIZER' || isAdmin

  // Generate initials for avatar fallback
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0]?.toUpperCase() || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="relative h-10 w-10 rounded-full" variant="ghost">
          <Avatar>
            <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            <p className="mt-1 text-xs font-medium text-primary">
              {user.role === 'ADMIN' && 'Administrator'}
              {user.role === 'EVENT_ORGANIZER' && 'Event Organizer'}
              {user.role === 'VENDOR' && 'Vendor'}
              {user.role === 'USER' && 'User'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Admin Dashboard */}
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin/dashboard">
              <LayoutDashboard />
              Admin Dashboard
            </Link>
          </DropdownMenuItem>
        )}

        {/* Organizer Dashboard - Only show if events are visible */}
        {isOrganizer && preferences.showEvents && (
          <DropdownMenuItem asChild>
            <Link href="/organizer/dashboard">
              <Calendar />
              Organizer Dashboard
            </Link>
          </DropdownMenuItem>
        )}

        {/* Vendor Dashboard - Only show if store is visible */}
        {isVendor && preferences.showStore && (
          <DropdownMenuItem asChild>
            <Link href="/vendor/dashboard">
              <Store />
              Vendor Dashboard
            </Link>
          </DropdownMenuItem>
        )}

        {/* My Tickets - Only show if events are visible */}
        {preferences.showEvents && (
          <DropdownMenuItem asChild>
            <Link href="/my-tickets">
              <Ticket />
              My Tickets
            </Link>
          </DropdownMenuItem>
        )}

        {/* Settings - Always show */}
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Sign Out */}
        <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
          <LogOut />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
