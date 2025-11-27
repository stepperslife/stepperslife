#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function initializeFeatures() {
  console.log('Initializing feature flags...')

  const features = [
    {
      name: 'events',
      enabled: true,
      description: 'Create and manage events, sell tickets, and track attendees',
      routes: [
        '/events',
        '/events/create',
        '/events/[id]',
        '/organizer',
        '/organizer/dashboard',
        '/organizer/events',
        '/my-tickets',
      ],
      permissions: ['view:events'],
    },
    {
      name: 'store',
      enabled: true,
      description: 'Browse products, create stores, and manage orders',
      routes: [
        '/store',
        '/stores',
        '/store/products',
        '/store/[slug]',
        '/stores/[slug]',
        '/vendor',
        '/vendor/dashboard',
        '/vendor/products',
        '/vendor/orders',
        '/cart',
        '/checkout',
      ],
      permissions: ['view:store'],
    },
    {
      name: 'blog',
      enabled: false,
      description: 'Read and publish articles about the community',
      routes: ['/blog', '/blog/[slug]', '/blog/write'],
      permissions: ['view:blog'],
    },
  ]

  for (const feature of features) {
    const existing = await prisma.featureFlag.findUnique({
      where: { name: feature.name },
    })

    if (existing) {
      console.log(`✓ Feature "${feature.name}" already exists (enabled: ${existing.enabled})`)
    } else {
      await prisma.featureFlag.create({
        data: feature,
      })
      console.log(`✓ Created feature "${feature.name}" (enabled: ${feature.enabled})`)
    }
  }

  console.log('\nFeature flags initialized successfully!')
}

initializeFeatures()
  .catch((error) => {
    console.error('Error initializing features:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
