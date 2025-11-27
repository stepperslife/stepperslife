import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db/client'
import { z } from 'zod'

const purchaseSchema = z.object({
  eventId: z.string(),
  tickets: z.record(z.number().int().positive()),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { eventId, tickets } = purchaseSchema.parse(body)

    // Get event and ticket types
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        ticketTypes: true,
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Calculate total and validate availability
    let totalCents = 0
    const ticketUpdates: Array<{ id: string; quantity: number; price: number }> = []

    for (const [ticketTypeId, quantity] of Object.entries(tickets)) {
      if (quantity === 0) continue

      const ticketType = event.ticketTypes.find((tt) => tt.id === ticketTypeId)

      if (!ticketType) {
        return NextResponse.json(
          { error: `Ticket type ${ticketTypeId} not found` },
          { status: 400 }
        )
      }

      if (!ticketType.isActive) {
        return NextResponse.json(
          { error: `Ticket type ${ticketType.name} is not available` },
          { status: 400 }
        )
      }

      const available = ticketType.quantity - ticketType.sold

      if (quantity > available) {
        return NextResponse.json(
          { error: `Only ${available} ${ticketType.name} tickets available` },
          { status: 400 }
        )
      }

      totalCents += Number(ticketType.price) * quantity
      ticketUpdates.push({
        id: ticketType.id,
        quantity,
        price: Number(ticketType.price),
      })
    }

    // Create order and tickets in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.eventOrder.create({
        data: {
          orderNumber: `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          eventId,
          userId: session.user.id,
          buyerName: session.user.name || session.user.email,
          buyerEmail: session.user.email,
          subtotalCents: totalCents,
          platformFeeCents: 0,
          processingFeeCents: 0,
          totalCents,
          status: 'COMPLETED', // For now, mark as completed (no payment processing)
          paymentMethod: 'FREE',
          paidAt: new Date(),
        },
      })

      // Create tickets and update sold count
      for (const update of ticketUpdates) {
        // Update sold count
        await tx.ticketType.update({
          where: { id: update.id },
          data: {
            sold: {
              increment: update.quantity,
            },
          },
        })

        // Create ticket instances
        for (let i = 0; i < update.quantity; i++) {
          await tx.ticket.create({
            data: {
              ticketNumber: `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
              eventId,
              ticketTypeId: update.id,
              orderId: order.id,
              userId: session.user.id,
              attendeeEmail: session.user.email,
              attendeeName: session.user.name || session.user.email,
              status: 'VALID',
            },
          })
        }
      }

      return order
    })

    return NextResponse.json({
      success: true,
      orderId: result.id,
      orderNumber: result.orderNumber,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 })
  }
}
