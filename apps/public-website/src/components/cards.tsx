import Image from "next/image";
import Link from "next/link";
import { Calendar, ExternalLink, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import type {
  PublicEvent,
  PublicProgram,
  PublicResearch,
  PublicTestimonial,
} from "@/lib/types";
import { extractPlainText, titleCase } from "@/lib/text";

function ImageHeader({
  image,
  title,
}: {
  image?: { url: string | null; alt: string | null } | null;
  title: string;
}) {
  return (
    <div className="relative aspect-video overflow-hidden bg-muted">
      {image?.url ? (
        <Image
          src={image.url}
          alt={image.alt || title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-muted via-muted/80 to-muted-foreground/10" />
      )}
    </div>
  );
}

export function ProgramCard({ program }: { program: PublicProgram }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-lg">
      <ImageHeader image={program.image} title={program.name} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">
          {titleCase(program.type)}
        </p>
        <Link
          href={`/programs/${program.slug}`}
          className="text-xl font-semibold hover:text-primary"
        >
          {program.name}
        </Link>
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
          {extractPlainText(program.description)}
        </p>
        <div className="mt-auto flex flex-wrap gap-2 text-sm text-muted-foreground">
          {program.totalParticipants ? (
            <span>
              {program.totalParticipants.toLocaleString()} participants
            </span>
          ) : null}
          {program.totalCompletions ? (
            <span>{program.totalCompletions.toLocaleString()} completions</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function EventCard({ event }: { event: PublicEvent }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-lg">
      <ImageHeader image={event.image} title={event.name} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">
          {titleCase(event.type)}
        </p>
        <Link
          href={`/events/${event.slug}`}
          className="text-xl font-semibold hover:text-primary"
        >
          {event.name}
        </Link>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {event.eventDate ? (
            <li className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              {format(new Date(event.eventDate), "MMM d, yyyy")}
            </li>
          ) : null}
          {event.location ? (
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {event.location}
            </li>
          ) : null}
          {event.attendanceCount ? (
            <li className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              {event.attendanceCount} attendees
            </li>
          ) : null}
        </ul>
      </div>
    </article>
  );
}

export function ResearchCard({ research }: { research: PublicResearch }) {
  const url =
    research.arxivLink ||
    (research.doi ? `https://doi.org/${research.doi}` : null);
  return (
    <article className="flex h-full flex-col gap-3 rounded-lg border bg-card p-5 shadow-sm transition-all hover:shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">
        {titleCase(research.status)}
      </p>
      <h3 className="text-lg font-semibold">{research.title}</h3>
      <p className="text-sm text-muted-foreground">
        {research.authors
          ?.map((author) => author.authorName)
          .filter(Boolean)
          .join(", ")}
      </p>
      <div className="mt-auto flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>{research.acceptedVenue || titleCase(research.venueType)}</span>
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary"
          >
            <ExternalLink className="h-4 w-4" />
            Open
          </a>
        ) : null}
      </div>
    </article>
  );
}

export function TestimonialCard({
  testimonial,
}: {
  testimonial: PublicTestimonial;
}) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-lg border bg-card p-5 shadow-sm">
      <blockquote className="line-clamp-5 text-sm leading-7 text-card-foreground">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <div className="mt-auto border-t border-border pt-4">
        <p className="text-sm font-semibold">{testimonial.attributionName}</p>
        {testimonial.attributionTitle ? (
          <p className="text-xs text-muted-foreground">
            {testimonial.attributionTitle}
          </p>
        ) : null}
        {testimonial.contextKind ? (
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">
            {titleCase(testimonial.contextKind)}
          </p>
        ) : null}
      </div>
    </article>
  );
}
