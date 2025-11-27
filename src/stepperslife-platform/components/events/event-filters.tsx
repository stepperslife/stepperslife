'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, Filter, Grid3x3, List, LayoutGrid } from 'lucide-react'
import { useState, useTransition } from 'react'

// Existing categories from old SteppersLife system
const EVENT_CATEGORIES = [
  'Set',
  'Workshop',
  'Save the Date',
  'Cruise',
  'Outdoors Steppin',
  'Holiday Event',
  'Weekend Event',
]

type ViewMode = 'grid' | 'list' | 'masonry'

interface EventFiltersProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function EventFilters({ viewMode, onViewModeChange }: EventFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [showFilters, setShowFilters] = useState(false)

  const currentSearch = searchParams.get('search') || ''
  const currentLocation = searchParams.get('location') || ''
  const currentType = searchParams.get('type') || ''
  const currentCategory = searchParams.get('category') || ''
  const currentAvailability = searchParams.get('availability') || ''

  function updateFilters(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    startTransition(() => {
      router.push(`/events?${params.toString()}`)
    })
  }

  function clearFilters() {
    startTransition(() => {
      router.push('/events')
    })
  }

  const hasActiveFilters = currentSearch || currentLocation || currentType || currentCategory || currentAvailability

  return (
    <div className="space-y-4">
      {/* Top Bar: Search + View Mode Toggle */}
      <div className="flex gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search events..."
          defaultValue={currentSearch}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {currentSearch && (
          <button
            onClick={() => updateFilters({ search: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 rounded-lg bg-muted p-1">
          <button
            onClick={() => onViewModeChange('masonry')}
            className={`rounded p-2 transition-colors ${
              viewMode === 'masonry'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Masonry view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`rounded p-2 transition-colors ${
              viewMode === 'grid'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Grid view"
          >
            <Grid3x3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`rounded p-2 transition-colors ${
              viewMode === 'list'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter Toggle Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="flex h-2 w-2 rounded-full bg-primary" />
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <X className="h-4 w-4" />
            Clear all
          </button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <select
              value={currentCategory}
              onChange={(e) => updateFilters({ category: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">All Categories</option>
              {EVENT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <input
              type="text"
              placeholder="Enter location..."
              defaultValue={currentLocation}
              onChange={(e) => updateFilters({ location: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {/* Event Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Event Type</label>
            <select
              value={currentType}
              onChange={(e) => updateFilters({ type: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">All Types</option>
              <option value="TICKETED_EVENT">Ticketed Events</option>
              <option value="FREE_EVENT">Free Events</option>
              <option value="SAVE_THE_DATE">Save the Date</option>
            </select>
          </div>

          {/* Availability Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Availability</label>
            <select
              value={currentAvailability}
              onChange={(e) => updateFilters({ availability: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">All Events</option>
              <option value="available">Tickets Available</option>
              <option value="sold-out">Sold Out</option>
            </select>
          </div>
        </div>
      )}

      {isPending && (
        <div className="text-sm text-muted-foreground">Updating results...</div>
      )}
    </div>
  )
}
