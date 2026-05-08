import { EventCard } from "@/components/cards";
import { ContentGridPage } from "@/components/content-grid-page";
import { getEvents } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await getEvents();
  return (
    <ContentGridPage title="Events">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </ContentGridPage>
  );
}
