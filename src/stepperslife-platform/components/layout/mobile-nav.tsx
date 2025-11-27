'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Calendar, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileNavProps {
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

export function MobileNav({ preferences, user }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
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
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed left-0 right-0 top-16 z-50 border-b bg-background p-6 shadow-lg">
            <nav className="flex flex-col space-y-4">
              {visibleItems.map((item) => {
                const Icon = item.icon
                const isActive =
                  pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 text-sm font-medium transition-colors',
                      isActive ? 'text-foreground' : 'text-muted-foreground hover:text-primary'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </>
      )}
    </div>
  )
}
