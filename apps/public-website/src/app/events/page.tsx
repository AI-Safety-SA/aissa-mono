import { EventCard, EventTable } from "@/components/cards";
import { SectionSurface } from "@/components/section-surface";
import { getEvents } from "@/lib/api";

export const dynamic = "force-dynamic";

const FEATURED_EVENT_COUNT = 3;

export default async function EventsPage() {
  const events = await getEvents();
  const featuredEvents = events.slice(0, FEATURED_EVENT_COUNT);
  const remainingEvents = events.slice(FEATURED_EVENT_COUNT);

  return (
    <>
      <SectionSurface spacing="compact">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Workshops, talks, meetups, reading groups, and other community
            gatherings.
          </p>
        </div>
      </SectionSurface>

      <SectionSurface surface="alternate">
        {events.length === 0 ? (
          <p className="text-muted-foreground">No events to display yet.</p>
        ) : (
          <div className="space-y-12">
            {featuredEvents.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featuredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : null}

            <EventTable events={remainingEvents} />
          </div>
        )}
      </SectionSurface>
    </>
  );
}
