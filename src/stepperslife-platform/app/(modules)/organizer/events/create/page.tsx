import { Metadata } from 'next'
import { requireEventOrganizer } from '@/lib/auth'
import { CreateEventForm } from '@/components/events/create-event-form'

export const metadata: Metadata = {
  title: 'Create Event | SteppersLife',
  description: 'Create a new event',
}

export default async function CreateEventPage() {
  await requireEventOrganizer()

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create Event</h1>
          <p className="mt-2 text-muted-foreground">
            Fill in the details to create your event
          </p>
        </div>

        <CreateEventForm />
      </div>
    </div>
  )
}
