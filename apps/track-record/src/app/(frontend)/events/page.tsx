import { EventCard } from '@/components/dashboard/event-card'
import { EventTable } from '@/components/dashboard/event-table'
import { PageHeader } from '@/components/ui/page-header'
import { getDefaultImages, getEventDefaultImage } from '@/lib/default-images'
import { FEATURED_EVENT_COUNT, getRecentEvents, splitHighlightedEvents } from '@/lib/data'
import config from '@/payload.config'
import { getPayload } from 'payload'

export const metadata = {
  title: 'Events | AISSA Track Record',
  description: "AISSA's workshops, talks, meetups, and more.",
}

// Force dynamic rendering to prevent static generation during build
export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const payload = await getPayload({ config })
  const [events, defaultImages] = await Promise.all([getRecentEvents(0), getDefaultImages(payload)])
  const { featuredEvents, remainingEvents } = splitHighlightedEvents(events, FEATURED_EVENT_COUNT)

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
          {events.length === 0 ? (
            <p className="text-muted-foreground">No events to display yet.</p>
          ) : (
            <div className="space-y-12">
              {featuredEvents.length > 0 && (
                <section>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {featuredEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        defaultImage={getEventDefaultImage(defaultImages, event.type)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {remainingEvents.length > 0 && (
                <section>
                  <EventTable defaultImages={defaultImages} events={remainingEvents} />
                </section>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
