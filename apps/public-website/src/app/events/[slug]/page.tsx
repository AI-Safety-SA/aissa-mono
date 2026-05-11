import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Mic2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getEvent, isPublicTrackRecordNotFound } from "@/lib/api";
import { formatPublicDate } from "@/lib/dates";
import type { PublicImage, PublicPersonSummary } from "@/lib/types";
import { extractPlainText, titleCase } from "@/lib/text";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEvent(slug).catch((error: unknown) => {
    if (isPublicTrackRecordNotFound(error)) return null;
    throw error;
  });
  if (!event) notFound();

  const body = extractPlainText(event.description, 2200);
  const people = uniquePeople([event.organiser, ...(event.hosts ?? [])]);
  const gallery = (event.gallery ?? []).filter((image) => image.url);
  const dateLabel = formatPublicDate(event.eventDate, "MMMM d, yyyy");

  return (
    <article className="overflow-hidden">
      <header className="relative isolate border-b border-border/70 bg-brand-dark-surface text-primary-foreground">
        {event.image?.url ? (
          <Image
            src={event.image.url}
            alt={event.image.alt || event.name}
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 -z-20 object-cover"
          />
        ) : null}
        <div className="absolute inset-0 -z-10 bg-hero-overlay" />
        <div className="container mx-auto grid min-h-[500px] gap-8 px-4 py-16 md:grid-cols-[minmax(0,1fr)_320px] md:items-end lg:py-20">
          <div className="max-w-4xl">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <Badge className="border-white/20 bg-white/90 text-brand-dark-surface">
                {titleCase(event.type)}
              </Badge>
              {dateLabel ? (
                <span className="inline-flex items-center gap-2 text-sm font-medium text-white/80">
                  <Calendar className="h-4 w-4" />
                  {dateLabel}
                </span>
              ) : null}
              {event.location ? (
                <span className="inline-flex items-center gap-2 text-sm font-medium text-white/80">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </span>
              ) : null}
            </div>
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
              <Mic2 className="h-5 w-5" />
              Event
            </p>
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-balance text-white md:text-6xl">
              {event.name}
            </h1>
            {body ? (
              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/82">
                {body}
              </p>
            ) : null}
          </div>
          {event.attendanceCount ? (
            <div className="rounded-lg border border-white/18 bg-white/12 p-5 shadow-cta backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/64">
                <Users className="h-4 w-4" />
                Attendance
              </div>
              <div className="mt-3 text-5xl font-bold text-white">
                {event.attendanceCount.toLocaleString()}
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <main className="container mx-auto grid gap-10 px-4 py-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-12">
          {people.length ? <PeopleSection people={people} /> : null}
          {gallery.length ? (
            <Gallery images={gallery} title={event.name} />
          ) : null}
        </div>

        <aside className="space-y-6 lg:pt-1">
          <div className="rounded-lg border bg-card/88 p-6 shadow-card">
            <h2 className="text-lg font-bold">Event Snapshot</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <InfoRow label="Type" value={titleCase(event.type)} />
              <InfoRow label="Date" value={dateLabel} />
              <InfoRow label="Location" value={event.location} />
              <InfoRow
                label="Attendance"
                value={event.attendanceCount?.toLocaleString()}
              />
            </dl>
          </div>
          {event.organiser ? (
            <div className="rounded-lg border bg-card/88 p-6 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Organiser
              </p>
              <Person person={event.organiser} compact />
            </div>
          ) : null}
        </aside>
      </main>
    </article>
  );
}

function PeopleSection({ people }: { people: PublicPersonSummary[] }) {
  return (
    <section>
      <h2 className="text-2xl font-bold">People</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {people.map((person) => (
          <div
            key={person.id}
            className="rounded-lg border bg-card/88 p-5 shadow-card"
          >
            <Person person={person} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Person({
  compact = false,
  person,
}: {
  compact?: boolean;
  person: PublicPersonSummary;
}) {
  return (
    <div className={compact ? "mt-4 flex gap-3" : "flex gap-4"}>
      {person.headshot?.url ? (
        <Image
          src={person.headshot.url}
          alt={person.headshot.alt || person.fullName}
          width={compact ? 48 : 64}
          height={compact ? 48 : 64}
          className="h-12 w-12 rounded-full object-cover sm:h-16 sm:w-16"
        />
      ) : (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary sm:h-16 sm:w-16">
          {person.fullName.charAt(0)}
        </span>
      )}
      <div>
        <h3 className="font-semibold leading-6">{person.fullName}</h3>
        <p className="text-sm text-muted-foreground">
          {person.personTag || person.organisation || "AISSA community"}
        </p>
        {!compact && person.bio ? (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {person.bio}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Gallery({ images, title }: { images: PublicImage[]; title: string }) {
  return (
    <section>
      <h2 className="text-2xl font-bold">Photos</h2>
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
        {images.slice(0, 6).map((image, index) => (
          <figure key={`${image.url}-${index}`}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
              <Image
                src={image.url!}
                alt={image.alt || image.caption || `Photo from ${title}`}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
            {image.caption ? (
              <figcaption className="mt-2 text-xs leading-5 text-muted-foreground">
                {image.caption}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 border-b border-border/70 pb-3 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function uniquePeople(
  people: Array<PublicPersonSummary | null | undefined>,
): PublicPersonSummary[] {
  const seen = new Set<number>();
  return people.filter((person): person is PublicPersonSummary => {
    if (!person || seen.has(person.id)) return false;
    seen.add(person.id);
    return true;
  });
}
