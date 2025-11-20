import { cache } from 'react'
import { prisma } from '@/lib/db/client'
import { EventStatus, EventType } from '@prisma/client'

export const getPublishedEvents = cache(
  async (filters?: {
    search?: string
    location?: string
    type?: EventType
    category?: string
    availability?: string
  }) => {
    return await prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        isPublished: true,
        startDate: {
          gte: new Date(),
        },
        // Search filter - search in title and description
        ...(filters?.search && {
          OR: [
            {
              title: {
                contains: filters.search,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: filters.search,
                mode: 'insensitive',
              },
            },
          ],
        }),
        // Location filter
        ...(filters?.location && {
          location: {
            contains: filters.location,
            mode: 'insensitive',
          },
        }),
        // Event type filter
        ...(filters?.type && {
          eventType: filters.type,
        }),
        // Category filter - check if the category is in the categories array
        ...(filters?.category && {
          categories: {
            has: filters.category,
          },
        }),
      },
      include: {
        organizer: {
          select: {
            name: true,
            email: true,
          },
        },
        ticketTypes: {
          where: {
            isActive: true,
          },
        },
        _count: {
          select: {
            tickets: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    })
  }
)

export const getEventBySlug = cache(async (slug: string) => {
  return await prisma.event.findUnique({
    where: { slug },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      ticketTypes: {
        where: {
          isActive: true,
        },
        orderBy: {
          price: 'asc',
        },
      },
      _count: {
        select: {
          tickets: true,
        },
      },
    },
  })
})

export const getEventById = cache(async (id: string) => {
  return await prisma.event.findUnique({
    where: { id },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      ticketTypes: {
        orderBy: {
          price: 'asc',
        },
      },
      _count: {
        select: {
          tickets: true,
          orders: true,
        },
      },
    },
  })
})

export const getOrganizerEvents = cache(async (userId: string) => {
  return await prisma.event.findMany({
    where: {
      organizerId: userId,
    },
    include: {
      ticketTypes: {
        select: {
          id: true,
          name: true,
          price: true,
          quantity: true,
          sold: true,
        },
      },
      _count: {
        select: {
          tickets: true,
          orders: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
})

export const getUserTickets = cache(async (userId: string) => {
  return await prisma.ticket.findMany({
    where: {
      userId,
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          slug: true,
          startDate: true,
          endDate: true,
          location: true,
          imageUrl: true,
        },
      },
      ticketType: {
        select: {
          name: true,
          price: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
})

export const getEventOrders = cache(async (eventId: string) => {
  return await prisma.eventOrder.findMany({
    where: {
      eventId,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      tickets: {
        select: {
          id: true,
          ticketNumber: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
})

export const getEventStats = cache(async (eventId: string) => {
  const [ticketStats, orderStats] = await Promise.all([
    prisma.ticket.groupBy({
      by: ['status'],
      where: { eventId },
      _count: true,
    }),
    prisma.eventOrder.groupBy({
      by: ['status'],
      where: { eventId },
      _count: true,
      _sum: {
        totalCents: true,
      },
    }),
  ])

  return {
    tickets: ticketStats,
    orders: orderStats,
  }
})
