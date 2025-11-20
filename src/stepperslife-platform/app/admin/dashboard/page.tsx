import { getCurrentUser } from '@/lib/auth/utils'
import { prisma } from '@/lib/db/client'
import { redirect } from 'next/navigation'
import { Users, Calendar, DollarSign, TrendingUp, Activity } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getAdminStats() {
  // Get platform statistics
  const [
    totalUsers,
    totalEvents,
    totalOrganizers,
    totalVendors,
    publishedEvents,
    draftEvents,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.user.count({ where: { role: 'EVENT_ORGANIZER' } }),
    prisma.user.count({ where: { role: 'VENDOR' } }),
    prisma.event.count({ where: { status: 'PUBLISHED' } }),
    prisma.event.count({ where: { status: 'DRAFT' } }),
  ])

  // Get recent events
  const recentEvents = await prisma.event.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      organizer: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  // Get recent users
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  return {
    totalUsers,
    totalEvents,
    totalOrganizers,
    totalVendors,
    publishedEvents,
    draftEvents,
    recentEvents,
    recentUsers,
  }
}

export default async function AdminDashboardPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  const stats = await getAdminStats()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Total Users */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Total Users
            </p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
            <span className="text-sm text-muted-foreground">users</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.totalOrganizers} organizers, {stats.totalVendors} vendors
          </p>
        </div>

        {/* Total Events */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Total Events
            </p>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{stats.totalEvents}</p>
            <span className="text-sm text-muted-foreground">events</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.publishedEvents} published, {stats.draftEvents} drafts
          </p>
        </div>

        {/* Platform Revenue */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Platform Revenue
            </p>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">$163,905</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Gross transaction volume
          </p>
        </div>

        {/* Platform Fees */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Platform Fees
            </p>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">$11,473</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            7% platform fee collected
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Recent Events */}
        <div className="rounded-lg border bg-card">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Events
            </h2>
          </div>
          <div className="p-6">
            {stats.recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events yet</p>
            ) : (
              <div className="space-y-4">
                {stats.recentEvents.map((event) => (
                  <div key={event.id} className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        by {event.organizer.name || event.organizer.email}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          event.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="rounded-lg border bg-card">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Users
            </h2>
          </div>
          <div className="p-6">
            {stats.recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users yet</p>
            ) : (
              <div className="space-y-4">
                {stats.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <a
            href="/admin/users"
            className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <Users className="h-5 w-5" />
            <div>
              <p className="font-medium">Manage Users</p>
              <p className="text-xs text-muted-foreground">View all platform users</p>
            </div>
          </a>
          <a
            href="/admin/events"
            className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <Calendar className="h-5 w-5" />
            <div>
              <p className="font-medium">Manage Events</p>
              <p className="text-xs text-muted-foreground">Review all events</p>
            </div>
          </a>
          <a
            href="/admin/reports"
            className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
          >
            <TrendingUp className="h-5 w-5" />
            <div>
              <p className="font-medium">Financial Reports</p>
              <p className="text-xs text-muted-foreground">View revenue analytics</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
