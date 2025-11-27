import { Feature } from './types'

export const AVAILABLE_FEATURES: Record<string, Feature> = {
  events: {
    name: 'events',
    displayName: 'Events & Ticketing',
    description: 'Create and manage events, sell tickets, and track attendees',
    icon: 'calendar',
    routes: [
      '/events',
      '/events/create',
      '/events/[id]',
      '/organizer',
      '/organizer/dashboard',
      '/organizer/events',
      '/my-tickets',
    ],
    requiredPermissions: ['view:events'],
    defaultEnabled: true,
  },
  store: {
    name: 'store',
    displayName: 'Marketplace & Store',
    description: 'Browse products, create stores, and manage orders',
    icon: 'shopping-bag',
    routes: [
      '/store',
      '/store/products',
      '/store/[slug]',
      '/vendor',
      '/vendor/dashboard',
      '/vendor/products',
      '/vendor/orders',
      '/cart',
      '/checkout',
    ],
    requiredPermissions: ['view:store'],
    defaultEnabled: true,
  },
  blog: {
    name: 'blog',
    displayName: 'Blog & Articles',
    description: 'Read and publish articles about the community',
    icon: 'book-open',
    routes: ['/blog', '/blog/[slug]', '/blog/write'],
    requiredPermissions: ['view:blog'],
    defaultEnabled: false,
  },
}

export const DEFAULT_USER_PREFERENCES = {
  showEvents: true,
  showStore: true,
  showBlog: false,
}
