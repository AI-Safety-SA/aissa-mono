import { getPayload } from 'payload'
import config from '@/payload.config'
import { EventCard } from '@/components/dashboard/event-card'
import { PageHeader } from '@/components/ui/page-header'
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
      <PageHeader
        title="Events"
        description="Workshops, talks, meetups, reading groups, and other community gatherings."
        size="compact"
        leftClassName="max-w-3xl"
      />

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

