import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  CheckCircle,
  ExternalLink,
  MapPin,
  Users,
} from "lucide-react";
import {
  Card,
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

function ImageHeader({
  image,
  logo,
  logoHref,
  title,
}: {
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
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden bg-card/88 shadow-card transition-all hover:-translate-y-1 hover:border-brand-coral/45 hover:shadow-card-hover",
        className,
      )}
    >
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
            {program.totalCompletions ? (
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                {program.totalCompletions.toLocaleString()} completions
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
    </Card>
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
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden bg-card/88 shadow-card transition-all hover:-translate-y-1 hover:border-brand-coral/45 hover:shadow-card-hover",
        className,
      )}
    >
      <ImageHeader image={event.image} title={event.name} />
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <Badge variant="signal">{titleCase(event.type)}</Badge>
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
    </Card>
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
    <Card
      className={cn(
        "flex h-full flex-col gap-3 bg-card/88 shadow-card transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-card-hover",
        className,
      )}
    >
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
    </Card>
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
    <Card
      className={cn(
        "flex h-full flex-col gap-4 bg-testimonial-card p-5 shadow-card",
        className,
      )}
    >
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
    </Card>
  );
}
