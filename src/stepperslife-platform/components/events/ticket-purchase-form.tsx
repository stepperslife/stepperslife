'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface TicketType {
  id: string
  name: string
  description: string | null
  price: number
  quantity: number
  sold: number
  isActive: boolean
}

interface Event {
  id: string
  title: string
  slug: string
  ticketTypes: TicketType[]
}

interface User {
  id: string
  email: string
  name?: string | null
}

interface TicketPurchaseFormProps {
  event: Event
  user: User | null
}

export function TicketPurchaseForm({ event, user }: TicketPurchaseFormProps) {
  const router = useRouter()
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({})
  const [isProcessing, setIsProcessing] = useState(false)

  const totalAmount = Object.entries(selectedTickets).reduce((sum, [ticketTypeId, quantity]) => {
    const ticketType = event.ticketTypes.find(tt => tt.id === ticketTypeId)
    if (!ticketType) return sum
    return sum + (Number(ticketType.price) * quantity)
  }, 0)

  const totalQuantity = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0)

  async function handlePurchase() {
    if (!user) {
      router.push('/auth/signin?redirect=' + encodeURIComponent(`/events/${event.slug}`))
      return
    }

    if (totalQuantity === 0) {
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch('/api/events/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          tickets: selectedTickets,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Purchase failed')
      }

      router.push(`/my-tickets?success=true`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Purchase failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="mt-6 space-y-4">
      {event.ticketTypes.map((ticketType) => {
        const available = ticketType.quantity - ticketType.sold
        const selected = selectedTickets[ticketType.id] || 0

        return (
          <div key={ticketType.id} className="flex items-center justify-between border-b pb-4">
            <div className="flex-1">
              <h3 className="font-medium">{ticketType.name}</h3>
              {ticketType.description && (
                <p className="text-sm text-muted-foreground">{ticketType.description}</p>
              )}
              <p className="mt-1 text-sm font-medium">
                ${(Number(ticketType.price) / 100).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                {available} available
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (selected > 0) {
                    setSelectedTickets({
                      ...selectedTickets,
                      [ticketType.id]: selected - 1,
                    })
                  }
                }}
                disabled={selected === 0}
                className="flex h-8 w-8 items-center justify-center rounded border bg-background text-lg font-medium disabled:opacity-50"
              >
                -
              </button>

              <span className="w-8 text-center font-medium">{selected}</span>

              <button
                type="button"
                onClick={() => {
                  if (selected < available) {
                    setSelectedTickets({
                      ...selectedTickets,
                      [ticketType.id]: selected + 1,
                    })
                  }
                }}
                disabled={selected >= available || available === 0}
                className="flex h-8 w-8 items-center justify-center rounded border bg-background text-lg font-medium disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>
        )
      })}

      {totalQuantity > 0 && (
        <div className="mt-6 space-y-4 border-t pt-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total ({totalQuantity} {totalQuantity === 1 ? 'ticket' : 'tickets'})</span>
            <span>${(totalAmount / 100).toFixed(2)}</span>
          </div>

          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Purchase Tickets'}
          </button>
        </div>
      )}
    </div>
  )
}
