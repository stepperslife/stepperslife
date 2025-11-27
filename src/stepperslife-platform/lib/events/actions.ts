'use server'

import { prisma } from '@/lib/db/client'
import { requireAuth, requireEventOrganizer } from '@/lib/auth'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { saveUploadedFile } from '@/lib/uploads/utils'

const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  startDate: z.string(),
  endDate: z.string(),
  location: z.string().min(3, 'Location is required'),
  eventType: z.enum(['SAVE_THE_DATE', 'FREE_EVENT', 'TICKETED_EVENT', 'SEATED_EVENT']),
  capacity: z.number().int().positive().optional(),
})

const createTicketTypeSchema = z.object({
  eventId: z.string(),
  name: z.string().min(1, 'Ticket name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be 0 or greater'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
})

export async function createEvent(data: FormData) {
  try {
    const user = await requireAuth()

    // Auto-promote to EVENT_ORGANIZER if creating first event
    if (user.role === 'USER') {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'EVENT_ORGANIZER' },
      })
    }

    // Handle image upload
    let imageUrl: string | null = null
    const imageFile = data.get('image') as File | null

    if (imageFile && imageFile.size > 0) {
      try {
        imageUrl = await saveUploadedFile(imageFile)
      } catch (uploadError) {
        return { error: uploadError instanceof Error ? uploadError.message : 'Failed to upload image' }
      }
    }

    const rawData = {
      title: data.get('title'),
      description: data.get('description'),
      startDate: data.get('startDate'),
      endDate: data.get('endDate'),
      location: data.get('location'),
      eventType: data.get('eventType'),
      capacity: data.get('capacity') ? Number(data.get('capacity')) : undefined,
    }

    const validatedData = createEventSchema.parse(rawData)

    // Generate slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const event = await prisma.event.create({
      data: {
        title: validatedData.title,
        slug: `${slug}-${Date.now()}`,
        description: validatedData.description,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        location: validatedData.location,
        imageUrl,
        eventType: validatedData.eventType,
        capacity: validatedData.capacity,
        organizerId: user.id,
        status: 'DRAFT',
      },
    })

    revalidatePath('/organizer/events')
    revalidatePath('/events')

    return { success: true, eventId: event.id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }

    return { error: 'Failed to create event' }
  }
}

export async function updateEvent(eventId: string, data: FormData) {
  try {
    const user = await requireEventOrganizer()

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true },
    })

    if (!event) {
      return { error: 'Event not found' }
    }

    if (event.organizerId !== user.id && user.role !== 'ADMIN') {
      return { error: 'Unauthorized' }
    }

    const rawData = {
      title: data.get('title'),
      description: data.get('description'),
      startDate: data.get('startDate'),
      endDate: data.get('endDate'),
      location: data.get('location'),
      imageUrl: data.get('imageUrl'),
      eventType: data.get('eventType'),
      capacity: data.get('capacity') ? Number(data.get('capacity')) : undefined,
    }

    const validatedData = createEventSchema.parse(rawData)

    await prisma.event.update({
      where: { id: eventId },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        location: validatedData.location,
        imageUrl: validatedData.imageUrl || null,
        eventType: validatedData.eventType,
        capacity: validatedData.capacity,
      },
    })

    revalidatePath(`/events/${eventId}`)
    revalidatePath('/organizer/events')

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }

    return { error: 'Failed to update event' }
  }
}

export async function publishEvent(eventId: string) {
  try {
    const user = await requireEventOrganizer()

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true },
    })

    if (!event) {
      return { error: 'Event not found' }
    }

    if (event.organizerId !== user.id && user.role !== 'ADMIN') {
      return { error: 'Unauthorized' }
    }

    await prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'PUBLISHED',
        isPublished: true,
      },
    })

    revalidatePath(`/events/${eventId}`)
    revalidatePath('/events')
    revalidatePath('/organizer/events')

    return { success: true }
  } catch (error) {
    return { error: 'Failed to publish event' }
  }
}

export async function createTicketType(data: FormData) {
  try {
    const user = await requireEventOrganizer()

    const rawData = {
      eventId: data.get('eventId'),
      name: data.get('name'),
      description: data.get('description'),
      price: Number(data.get('price')),
      quantity: Number(data.get('quantity')),
    }

    const validatedData = createTicketTypeSchema.parse(rawData)

    // Verify user owns event
    const event = await prisma.event.findUnique({
      where: { id: validatedData.eventId },
      select: { organizerId: true },
    })

    if (!event) {
      return { error: 'Event not found' }
    }

    if (event.organizerId !== user.id && user.role !== 'ADMIN') {
      return { error: 'Unauthorized' }
    }

    await prisma.ticketType.create({
      data: {
        eventId: validatedData.eventId,
        name: validatedData.name,
        description: validatedData.description || null,
        price: validatedData.price,
        quantity: validatedData.quantity,
        sold: 0,
        isActive: true,
      },
    })

    revalidatePath(`/events/${validatedData.eventId}`)
    revalidatePath(`/organizer/events/${validatedData.eventId}`)

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }

    return { error: 'Failed to create ticket type' }
  }
}

export async function deleteEvent(eventId: string) {
  try {
    const user = await requireEventOrganizer()

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true },
    })

    if (!event) {
      return { error: 'Event not found' }
    }

    if (event.organizerId !== user.id && user.role !== 'ADMIN') {
      return { error: 'Unauthorized' }
    }

    await prisma.event.delete({
      where: { id: eventId },
    })

    revalidatePath('/organizer/events')
    revalidatePath('/events')

    return { success: true }
  } catch (error) {
    return { error: 'Failed to delete event' }
  }
}
