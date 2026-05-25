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
  alt: "",
  testId: "event-fallback-image",
  src: "/icon.png",
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
        <div className="absolute inset-0 flex items-center justify-center bg-card">
          <Image
            src={fallbackImage.src}
            alt={fallbackImage.alt}
            data-testid={fallbackImage.testId}
            width={88}
            height={88}
            className="h-20 w-20 object-contain sm:h-[88px] sm:w-[88px]"
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
          {event.name}
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
          {events.map((event) => (
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
                      <div className="absolute inset-0 flex items-center justify-center bg-card">
                        <Image
                          src={eventFallbackImage.src}
                          alt={eventFallbackImage.alt}
                          data-testid={eventFallbackImage.testId}
                          width={32}
                          height={32}
                          className="h-8 w-8 object-contain"
                        />
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-foreground">
                    {event.name}
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
          ))}
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
  const url =
    research.arxivLink ||
    (research.doi ? `https://doi.org/${research.doi}` : null);
  return (
    <CardSurface variant="textInteractive" className={className}>
      <CardHeader>
        <Badge>{titleCase(research.status)}</Badge>
        <CardTitle className="pt-2 text-lg leading-7">
          {research.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {research.authors
          ?.map((author) => author.authorName)
          .filter(Boolean)
          .join(", ")}
      </CardContent>
      <CardFooter className="mt-auto justify-between gap-3 text-sm text-muted-foreground">
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
