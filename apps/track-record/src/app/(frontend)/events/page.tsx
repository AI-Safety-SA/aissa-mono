import { getPayload } from 'payload'
import config from '@/payload.config'
import { EventCard } from '@/components/dashboard/event-card'
import { BackButton } from '@/components/ui/back-button'
import type { Event } from '@/payload-types'

export const metadata = {
  title: 'Events | AISSA Track Record',
  description: "AISSA's workshops, talks, meetups, and more.",
}

// Force dynamic rendering to prevent static generation during build
export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const payload = await getPayload({ config })

  const events = await payload.find({
    collection: 'events',
    where: {
      isPublished: { equals: true },
    },
    limit: 0,
    sort: '-eventDate',
    depth: 1,
  })

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <BackButton className="mb-8" />
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">Events</h1>
            <p className="text-lg text-muted-foreground">
              Workshops, talks, meetups, reading groups, and other community gatherings.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {events.totalDocs === 0 ? (
            <p className="text-muted-foreground">No events to display yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.docs.map((event) => (
                <EventCard key={(event as Event).id} event={event as Event} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}


