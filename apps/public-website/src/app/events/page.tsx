import type { ReactElement } from "react";
import { EventCard, EventTable } from "@/components/cards";
import { SectionSurface } from "@/components/section-surface";
import { getEvents } from "@/lib/api";

export const dynamic = "force-dynamic";

const FEATURED_EVENT_COUNT = 3;

export default async function EventsPage(): Promise<ReactElement> {
  const events = await getEvents();
  const featuredEvents = events.slice(0, FEATURED_EVENT_COUNT);
  const remainingEvents = events.slice(FEATURED_EVENT_COUNT);

  return (
    <>
      <SectionSurface spacing="compact">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            We regularly host events that create community cohesion, raise
            awareness of AI safety, and engage national AI stakeholders. We host
            weekly reading groups and meetups at our co-working space in Cape
            Town. This is a core pillar of our community. Outside of these
            regular events, we often run workshops at national AI conferences
            and host talks featuring world-class AI safety researchers.
          </p>
        </div>
      </SectionSurface>

      <SectionSurface surface="alternate">
        {events.length === 0 ? (
          <p className="text-muted-foreground">No events to display yet.</p>
        ) : (
          <div className="space-y-12">
            {featuredEvents.length > 0 ? (
              <section
                aria-labelledby="highlighted-events-heading"
                className="space-y-6"
              >
                <h2
                  id="highlighted-events-heading"
                  className="text-3xl font-semibold"
                >
                  Highlighted Events
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {featuredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            ) : null}

            <EventTable events={remainingEvents} />
          </div>
        )}
      </SectionSurface>
    </>
  );
}
