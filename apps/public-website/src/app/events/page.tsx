import { EventCard } from "@/components/cards";
import { getEvents } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await getEvents();
  return (
    <section className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Events</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
