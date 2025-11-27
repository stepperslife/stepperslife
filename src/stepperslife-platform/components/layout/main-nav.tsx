'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MainNavProps {
  preferences?: {
    showEvents: boolean
    showStore: boolean
  }
  user?: any
}

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export function MainNav({ preferences, user }: MainNavProps) {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      name: 'Events',
      href: '/events',
      icon: Calendar,
    },
    {
      name: 'Marketplace',
      href: '/stores',
      icon: ShoppingBag,
    },
  ]

  // Show all navigation items to everyone
  const visibleItems = navItems

  return (
    <nav className="hidden md:flex items-center space-x-6">
      {visibleItems.map((item) => {
        const Icon = item.icon
        const isActive =
          pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
              isActive ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}
