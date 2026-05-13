import type { ComponentProps } from "react";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { EventCard, ProgramCard, ResearchCard } from "@/components/cards";
import { badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PublicTeamPerson } from "@/lib/types";
import { getSafeExternalUrl } from "@/lib/urls";
import { cn } from "@/lib/utils";

type Program = ComponentProps<typeof ProgramCard>["program"];
type Event = ComponentProps<typeof EventCard>["event"];
type Research = ComponentProps<typeof ResearchCard>["research"];

const researchImages = [
  {
    alt: "Claude standing beside Cooperative AI Research Fellowship posters",
    src: "/images/Claude-cairf-posters.jpg",
  },
] as const;

const featuredProgramExternalHref = "https://www.cai-research-fellowship.com/";
const featuredProgramLogo = {
  alt: "Cooperative AI Research Fellowship logo",
  src: "/images/cairf-logo.webp",
};
const featuredProgramSlug = "cooperative-ai-research-fellowship";
const collapsibleTeamBioLength = 160;

function SectionHeader({
  align = "left",
  href,
  title,
}: {
  align?: "left" | "center";
  href: string;
  title: string;
}) {
  return (
    <div
      className={cn(
        "mb-8 flex items-end justify-between gap-4",
        align === "center" &&
          "mx-auto max-w-3xl flex-col items-center text-center",
      )}
    >
      <h2 className="text-3xl font-semibold">{title}</h2>
      <Button asChild variant="ghost" size="lg">
        <Link href={href}>View all</Link>
      </Button>
    </div>
  );
}

function TeamCard({ person }: { person: PublicTeamPerson }) {
  const shouldCollapseBio =
    person.bio && person.bio.length > collapsibleTeamBioLength;
  const websiteUrl = getSafeExternalUrl(person.websiteUrl);

  return (
    <Card className="flex h-full flex-col gap-5 bg-card/88 p-6 shadow-card sm:flex-row sm:p-7">
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-32 sm:w-32">
        {person.headshot?.url ? (
          <Image
            src={person.headshot.url}
            alt={person.headshot.alt || person.fullName}
            fill
            className="object-cover"
            sizes="(min-width: 640px) 128px, 112px"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold leading-tight">
              {person.fullName}
            </h3>
            <p className="mt-1 text-sm text-primary">
              {person.personTag || person.organisation}
            </p>
          </div>
          {websiteUrl ? (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${person.fullName}'s website`}
              className={cn(
                badgeVariants({ variant: "outline" }),
                "px-3 py-1 hover:border-primary/70 hover:text-primary",
              )}
            >
              Website
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ) : null}
        </div>
        {shouldCollapseBio ? (
          <div className="mt-4 [&:has(details[open])_[data-bio-preview]]:hidden">
            <p
              data-bio-preview
              className="line-clamp-4 text-sm leading-6 text-muted-foreground"
            >
              {person.bio}
            </p>
            <details className="group mt-2 open:flex open:flex-col">
              <summary className="cursor-pointer list-none rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group-open:order-2 group-open:mt-3 [&::-webkit-details-marker]:hidden">
                <span className="inline-flex text-sm font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline group-open:hidden">
                  Read more
                </span>
                <span className="hidden text-sm font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline group-open:inline-flex">
                  Show less
                </span>
              </summary>
              <p className="mt-3 text-sm leading-6 text-muted-foreground group-open:order-1 group-open:mt-0">
                {person.bio}
              </p>
            </details>
          </div>
        ) : person.bio ? (
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {person.bio}
          </p>
        ) : null}
      </div>
    </Card>
  );
}

export function ProgramsSection({ programs }: { programs: Program[] }) {
  if (programs.length === 0) {
    return null;
  }

  const featured = programs[0];
  const rest = programs.slice(1);

  if (!featured) {
    return null;
  }
  const isCairfFeatured = featured.slug === featuredProgramSlug;

  return (
    <section className="border-b border-border/70 py-16">
      <div className="container mx-auto px-4">
        <SectionHeader title="Programs" href="/programs" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.18fr_0.82fr] lg:items-stretch">
          <ProgramCard
            program={featured}
            descriptionClassName="lg:line-clamp-[8]"
            descriptionMaxLength={640}
            externalHref={
              isCairfFeatured
                ? featuredProgramExternalHref
                : (featured.websiteUrl ?? undefined)
            }
            programLogo={isCairfFeatured ? featuredProgramLogo : undefined}
            className="lg:min-h-[620px] [&_[data-program-description]]:lg:text-base [&_[data-program-title]]:lg:text-3xl [&_[data-slot=card-content]]:lg:p-8"
          />
          <div className="grid gap-6 md:grid-cols-2 lg:h-full lg:grid-cols-1 lg:grid-rows-3">
            {rest.slice(0, 3).map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                className={cn(
                  "lg:grid lg:min-h-0 lg:grid-cols-[0.42fr_0.58fr]",
                  "[&_.relative]:lg:aspect-auto [&_.relative]:lg:min-h-full",
                  "[&_[data-slot=card-content]]:lg:min-h-0",
                )}
              />
            ))}
          </div>
        </div>
        {rest.length > 3 ? (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.slice(3).map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function EventsSection({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden border-b border-border/70 bg-card-raised/42 py-16">
      <div className="container mx-auto px-4">
        <SectionHeader title="Events" href="/events" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-center">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ResearchSection({ research }: { research: Research[] }) {
  if (research.length === 0) {
    return null;
  }

  return (
    <section className="border-b border-border/70 py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-[0.34fr_0.66fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <h2 className="mb-2 text-3xl font-semibold">
              Research projects and publications
            </h2>
            <div className="mt-6">
              {researchImages.map((image) => (
                <div
                  key={image.src}
                  className="relative aspect-4/5 overflow-hidden rounded-lg bg-muted shadow-sm"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 350px, 45vw"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="mx-auto grid w-full max-w-4xl gap-5 lg:ml-auto lg:mr-0">
            {research.map((item) => (
              <ResearchCard
                key={item.id}
                research={item}
                className="min-h-[190px]"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function TeamSection({ team }: { team: PublicTeamPerson[] }) {
  if (team.length === 0) {
    return null;
  }

  return (
    <section className="border-b border-border/70 bg-card-raised/45 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 max-w-3xl">
          <h2 className="text-3xl font-semibold md:text-4xl">Team</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {team.map((person) => (
            <TeamCard key={person.id} person={person} />
          ))}
        </div>
      </div>
    </section>
  );
}
