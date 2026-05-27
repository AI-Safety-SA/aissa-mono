import Image from "next/image";
import { Calendar, ExternalLink, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { CardSurface, tableSurfaceClassNames } from "@/components/card-surface";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPublicDate } from "@/lib/dates";
import type {
  PublicEvent,
  PublicProgram,
  PublicResearch,
  PublicTestimonial,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { extractPlainText, titleCase } from "@/lib/text";

const eventFallbackImage = {
  alt: "Default logo",
  testId: "event-fallback-image",
  src: "/images/aissa-logo-square.png",
};

function ImageHeader({
  fallbackImage,
  image,
  logo,
  logoHref,
  title,
}: {
  fallbackImage?: { alt: string; src: string; testId?: string };
  image?: { url: string | null; alt: string | null } | null;
  logo?: { alt: string; src: string };
  logoHref?: string;
  title: string;
}) {
  const logoContent = logo ? (
    <Image
      src={logo.src}
      alt={logo.alt}
      fill
      className="object-contain p-2"
      sizes="176px"
    />
  ) : null;

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
      ) : fallbackImage ? (
        <div className="absolute inset-0 bg-card">
          <Image
            src={fallbackImage.src}
            alt={fallbackImage.alt}
            data-testid={fallbackImage.testId}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-muted via-muted/80 to-muted-foreground/10" />
      )}
      {logo ? (
        logoHref ? (
          <a
            href={logoHref}
            target="_blank"
            rel="noreferrer"
            className="absolute right-3 top-3 h-12 w-44 rounded-md border bg-white/30 p-2 shadow-sm backdrop-blur-lg"
          >
            {logoContent}
          </a>
        ) : (
          <div className="absolute right-3 top-3 h-12 w-44 rounded-md border bg-white/30 p-2 shadow-sm backdrop-blur-lg">
            {logoContent}
          </div>
        )
      ) : null}
    </div>
  );
}

export function ProgramCard({
  descriptionClassName,
  descriptionMaxLength = 220,
  externalHref,
  program,
  programLogo,
  className,
}: {
  descriptionClassName?: string;
  descriptionMaxLength?: number;
  externalHref?: string;
  program: PublicProgram;
  programLogo?: { alt: string; src: string };
  className?: string;
}) {
  const description = extractPlainText(
    program.description,
    descriptionMaxLength,
  );
  const shouldShowDescription =
    description.length > 0 && description.toLowerCase() !== "blank description";

  return (
    <CardSurface variant="mediaInteractive" className={className}>
      <ImageHeader
        image={program.image}
        logo={programLogo}
        logoHref={externalHref}
        title={program.name}
      />
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <Badge variant="signal">{titleCase(program.type)}</Badge>
        <Link
          href={`/programs/${program.slug}`}
          data-program-title
          className="text-xl font-semibold hover:text-primary"
        >
          {program.name}
        </Link>
        {shouldShowDescription ? (
          <p
            data-program-description
            className={cn(
              "line-clamp-3 text-sm leading-6 text-muted-foreground",
              descriptionClassName,
            )}
          >
            {description}
          </p>
        ) : null}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {program.totalParticipants ? (
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                {program.totalParticipants.toLocaleString()} participants
              </span>
            ) : null}
          </div>
          {externalHref ? (
            <Button asChild size="sm" className="w-fit">
              <a href={externalHref} target="_blank" rel="noreferrer">
                Visit website
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </CardSurface>
  );
}

export function EventCard({
  event,
  className,
}: {
  event: PublicEvent;
  className?: string;
}) {
  const eventName = event.lumaPublicUrl ? (
    <a
      href={event.lumaPublicUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 hover:text-primary"
    >
      {event.name}
      <ExternalLink className="h-4 w-4 shrink-0" />
    </a>
  ) : (
    event.name
  );

  return (
    <CardSurface variant="mediaInteractive" className={className}>
      <ImageHeader
        fallbackImage={eventFallbackImage}
        image={event.image}
        title={event.name}
      />
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <Badge variant="signal">{titleCase(event.type)}</Badge>
        <h3 className="text-xl font-semibold leading-7 text-foreground">
          {eventName}
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {event.eventDate ? (
            <li className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              {formatPublicDate(event.eventDate, "MMM d, yyyy")}
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
      </CardContent>
    </CardSurface>
  );
}

export function EventTable({ events }: { events: PublicEvent[] }) {
  if (events.length === 0) {
    return null;
  }

  return (
    <div className={tableSurfaceClassNames.shell}>
      <table className="min-w-[700px] text-sm">
        <thead>
          <tr className={tableSurfaceClassNames.headRow}>
            <th className="px-4 py-3 font-semibold">Event</th>
            <th className="px-4 py-3 font-semibold">Type</th>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Location</th>
            <th className="px-4 py-3 text-right font-semibold">Attendance</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => {
            const eventName = event.lumaPublicUrl ? (
              <a
                href={event.lumaPublicUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-foreground hover:text-primary"
              >
                {event.name}
                <ExternalLink className="h-4 w-4 shrink-0" />
              </a>
            ) : (
              event.name
            );

            return (
              <tr key={event.id} className={tableSurfaceClassNames.bodyRow}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                      {event.image?.url ? (
                        <Image
                          src={event.image.url}
                          alt={event.image.alt || `${event.name} thumbnail`}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-card">
                          <Image
                            src={eventFallbackImage.src}
                            alt={eventFallbackImage.alt}
                            data-testid={eventFallbackImage.testId}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-foreground">
                      {eventName}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Badge variant="signal">{titleCase(event.type)}</Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {event.eventDate
                    ? formatPublicDate(event.eventDate, "MMM d, yyyy")
                    : "TBD"}
                </td>
                <td className="px-4 py-3">{event.location || "TBD"}</td>
                <td className="px-4 py-3 text-right">
                  {typeof event.attendanceCount === "number"
                    ? event.attendanceCount.toLocaleString()
                    : "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function getResearchUrl(research: PublicResearch): string | null {
  return (
    research.arxivLink ||
    (research.doi ? `https://doi.org/${research.doi}` : null)
  );
}

function getResearchAuthors(research: PublicResearch): string {
  return (
    research.authors
      ?.map((author) => author.authorName)
      .filter(Boolean)
      .join(", ") || ""
  );
}

function getResearchVenue(research: PublicResearch): string {
  return research.acceptedVenue || titleCase(research.venueType) || "-";
}

export function ResearchTable({ research }: { research: PublicResearch[] }) {
  if (research.length === 0) {
    return null;
  }

  return (
    <div className={tableSurfaceClassNames.shell}>
      <table className="min-w-[760px] text-sm">
        <thead>
          <tr className={tableSurfaceClassNames.headRow}>
            <th className="px-4 py-3 font-semibold">Research</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Authors</th>
            <th className="px-4 py-3 font-semibold">Venue</th>
            <th className="px-4 py-3 text-right font-semibold">Link</th>
          </tr>
        </thead>
        <tbody>
          {research.map((item) => {
            const url = getResearchUrl(item);
            const authors = getResearchAuthors(item);

            return (
              <tr key={item.id} className={tableSurfaceClassNames.bodyRow}>
                <td className="px-4 py-3">
                  <span className="font-medium text-foreground">
                    {item.title}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Badge variant="signal">{titleCase(item.status)}</Badge>
                </td>
                <td className="px-4 py-3">{authors || "-"}</td>
                <td className="px-4 py-3">{getResearchVenue(item)}</td>
                <td className="px-4 py-3 text-right">
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary"
                    >
                      Open
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ResearchCard({
  research,
  className,
}: {
  research: PublicResearch;
  className?: string;
}) {
  const url = getResearchUrl(research);
  const authors = getResearchAuthors(research);

  return (
    <CardSurface variant="textInteractive" className={className}>
      <CardHeader>
        <Badge>{titleCase(research.status)}</Badge>
        <CardTitle className="pt-2 text-lg leading-7">
          {research.title}
        </CardTitle>
      </CardHeader>
      {authors ? (
        <CardContent className="text-sm text-muted-foreground">
          {authors}
        </CardContent>
      ) : null}
      <CardFooter className="mt-auto justify-between gap-3 text-sm text-muted-foreground">
        <span>{getResearchVenue(research)}</span>
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
      </CardFooter>
    </CardSurface>
  );
}

export function TestimonialCard({
  testimonial,
  className,
}: {
  testimonial: PublicTestimonial;
  className?: string;
}) {
  return (
    <CardSurface variant="testimonial" className={className}>
      <blockquote className="line-clamp-5 text-sm leading-7 text-card-foreground md:text-base">
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
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {titleCase(testimonial.contextKind)}
          </p>
        ) : null}
      </div>
    </CardSurface>
  );
}
