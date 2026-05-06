import { notFound } from "next/navigation";
import { getEvent } from "@/lib/api";
import { extractPlainText, titleCase } from "@/lib/text";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEvent(slug).catch(() => null);
  if (!event) notFound();
  return (
    <article className="container mx-auto max-w-3xl px-4 py-12">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-primary/70">
        {titleCase(event.type)}
      </p>
      <h1 className="text-4xl font-bold">{event.name}</h1>
      {event.location ? (
        <p className="mt-3 text-muted-foreground">{event.location}</p>
      ) : null}
      <p className="mt-6 text-lg leading-8 text-muted-foreground">
        {extractPlainText(event.description, 2000)}
      </p>
    </article>
  );
}
