import type { ComponentProps } from "react";
import Image from "next/image";
import Link from "next/link";
import { EventCard, ProgramCard, ResearchCard } from "@/components/cards";
import { SectionSurface } from "@/components/section-surface";
import { Button } from "@/components/ui/button";
import { withBasePath } from "@/lib/base-path";
import { cn } from "@/lib/utils";

type Program = ComponentProps<typeof ProgramCard>["program"];
type Event = ComponentProps<typeof EventCard>["event"];
type Research = ComponentProps<typeof ResearchCard>["research"];

const researchImages = [
  {
    alt: "Claude standing beside Cooperative AI Research Fellowship posters",
    src: withBasePath("/images/Claude-cairf-posters.jpg"),
  },
];

const featuredProgramExternalHref = "https://www.cai-research-fellowship.com/";
const featuredProgramLogo = {
  alt: "Cooperative AI Research Fellowship logo",
  src: withBasePath("/images/cairf-logo.webp"),
};
const featuredProgramSlug = "cooperative-ai-research-fellowship";
// Keep in sync with PUBLIC_HOME_PROGRAM_LIMIT in the track-record public API.
const homeProgramLimit = 4;

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

export function ProgramsSection({ programs }: { programs: Program[] }) {
  if (programs.length === 0) {
    return null;
  }

  const homepagePrograms = programs.slice(0, homeProgramLimit);
  const featured = homepagePrograms[0];
  const rest = homepagePrograms.slice(1);

  if (!featured) {
    return null;
  }
  const isCairfFeatured = featured.slug === featuredProgramSlug;

  return (
    <SectionSurface surface="raised">
      <SectionHeader title="Programs" href="/programs" />
      <div
        className={cn(
          "grid grid-cols-1 gap-6 lg:items-stretch",
          rest.length > 0 ? "lg:grid-cols-[1.18fr_0.82fr]" : "lg:grid-cols-1",
        )}
      >
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
          className={cn(
            "lg:min-h-[620px] [&_[data-program-description]]:lg:text-base [&_[data-program-title]]:lg:text-3xl [&_[data-slot=card-content]]:lg:p-8",
            rest.length === 0 && "lg:min-h-0",
          )}
        />
        {rest.length > 0 ? (
          <div
            className={cn(
              "grid gap-6 md:grid-cols-2 lg:h-full lg:grid-cols-1",
              rest.length === 1
                ? "lg:grid-rows-1"
                : rest.length === 2
                  ? "lg:grid-rows-2"
                  : "lg:grid-rows-3",
            )}
          >
            {rest.map((program) => (
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
        ) : null}
      </div>
    </SectionSurface>
  );
}

export function EventsSection({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return null;
  }

  return (
    <SectionSurface surface="alternate" className="overflow-hidden">
      <SectionHeader title="Events" href="/events" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-center">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </SectionSurface>
  );
}

export function ResearchSection({ research }: { research: Research[] }) {
  if (research.length === 0) {
    return null;
  }

  return (
    <SectionSurface>
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
            <ResearchCard key={item.id} research={item} compact />
          ))}
        </div>
      </div>
    </SectionSurface>
  );
}
