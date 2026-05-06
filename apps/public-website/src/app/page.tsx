import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Calendar,
  GraduationCap,
  HeartHandshake,
  Newspaper,
  Users,
} from "lucide-react";
import { EventCard, ProgramCard, ResearchCard } from "@/components/cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getHome } from "@/lib/api";
import type { PublicTeamPerson } from "@/lib/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statConfig = [
  ["Total Participants", Users, "totalParticipants"],
  ["Events Held", Calendar, "totalEvents"],
  ["Programs Completed", GraduationCap, "totalPrograms"],
  ["Research Outputs", Newspaper, "totalResearch"],
] as const;

export default async function HomePage() {
  const data = await getHome();

  return (
    <div className="min-h-screen bg-transparent">
      <section className="relative overflow-hidden border-b border-[hsl(var(--brand-sandstone))]/50 bg-[hsl(var(--brand-dark-surface))] text-white">
        <Image
          src="/images/table-mountain.png"
          alt="Table Mountain above Cape Town"
          fill
          priority
          className="object-cover opacity-70"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,hsl(var(--brand-dark-shadow))_0%,hsl(var(--brand-dark-surface))/.92_34%,hsl(var(--brand-dark-surface))/.54_64%,transparent_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-linear-to-t from-[hsl(var(--background))] via-[hsl(var(--background))]/54 to-transparent" />
        <div className="container relative mx-auto grid min-h-[82vh] content-center px-4 pb-16 pt-24 md:min-h-[78vh] md:pb-24">
          <div className="max-w-5xl">
            <Badge className="mb-5 border-white/20 bg-white/10 text-white backdrop-blur">
              AI Safety South Africa
            </Badge>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[0.94] md:text-7xl">
              Building South Africa&apos;s AI safety community.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82 md:text-xl">
              AISSA connects researchers, builders, students, and institutions
              working to make advanced AI systems safer and more beneficial.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-[hsl(var(--brand-sandstone))] text-[hsl(var(--brand-dark-surface))] hover:bg-[hsl(var(--brand-sandstone))]/90"
              >
                <Link href="/get-involved">
                  Get involved
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/35 bg-white/8 text-white hover:bg-white/14 hover:text-white"
              >
                <Link href="/programs">Explore programs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-10 pb-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statConfig.map(([label, Icon, key]) => (
              <Card
                key={label}
                className="bg-card/90 p-6 shadow-[0_18px_60px_rgba(36,30,28,0.14)] backdrop-blur"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-6 w-6 shrink-0 text-primary" />
                  <p className="text-3xl font-bold">
                    {data.stats[key].toLocaleString()}
                  </p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/70 bg-[hsl(var(--card-raised))]/60 py-16">
        <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <Badge variant="outline" className="mb-4">
              Mission
            </Badge>
            <h2 className="text-3xl font-semibold md:text-4xl">
              A grounded hub for AI safety work in South Africa.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-muted-foreground">
            <p>
              AISSA supports people moving from curiosity to serious
              contribution: learning the field, finding collaborators, doing
              research, attending events, and connecting with global AI safety
              efforts.
            </p>
            <p>
              We focus on credible public programs, research activity, and
              events.
            </p>
          </div>
        </div>
      </section>

      <ProgramsSection programs={data.programs} />
      <EventsSection events={data.events} />
      <ResearchSection research={data.research} />
      {data.team.length > 0 ? (
        <section className="border-b border-border/70 bg-[hsl(var(--card-raised))]/45 py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 max-w-3xl">
              <Badge variant="outline" className="mb-4">
                Team
              </Badge>
              <h2 className="text-3xl font-semibold md:text-4xl">
                People stewarding AISSA.
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {data.team.map((person) => (
                <TeamCard key={person.id} person={person} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="overflow-hidden border-[hsl(var(--brand-coral))]/25 bg-[linear-gradient(135deg,hsl(var(--brand-dark-surface))_0%,hsl(var(--brand-mountain))_74%,hsl(var(--brand-coral))_160%)] p-8 text-white shadow-[0_26px_90px_rgba(36,30,28,0.24)] md:p-10">
            <HeartHandshake className="mb-5 h-8 w-8 text-white/80" />
            <h2 className="max-w-2xl text-3xl font-semibold md:text-4xl">
              Find the contribution path that fits you.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/75">
              Volunteer, apply to programs, subscribe, attend events, use the
              co-working space, follow AISSA, or support the work financially.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-7 bg-[hsl(var(--brand-sandstone))] text-[hsl(var(--brand-dark-surface))] hover:bg-[hsl(var(--brand-sandstone))]/90"
            >
              <Link href="/get-involved">
                Get involved
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
}

function TeamCard({ person }: { person: PublicTeamPerson }) {
  return (
    <Card className="flex h-full gap-4 bg-card/88 p-5 shadow-[0_18px_50px_rgba(36,30,28,0.08)]">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
        {person.headshot?.url ? (
          <Image
            src={person.headshot.url}
            alt={person.headshot.alt || person.fullName}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : null}
      </div>
      <div>
        <h3 className="font-semibold">{person.fullName}</h3>
        <p className="text-sm text-primary">
          {person.personTag || person.organisation}
        </p>
        {person.bio ? (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {person.bio}
          </p>
        ) : null}
      </div>
    </Card>
  );
}

function SectionHeader({
  title,
  href,
  align = "left",
}: {
  title: string;
  href: string;
  align?: "left" | "center";
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

function ProgramsSection({
  programs,
}: {
  programs: React.ComponentProps<typeof ProgramCard>["program"][];
}) {
  if (programs.length === 0) {
    return null;
  }

  const featured = programs[0];
  const rest = programs.slice(1);

  if (!featured) {
    return null;
  }

  return (
    <section className="border-b border-border/70 py-16">
      <div className="container mx-auto px-4">
        <SectionHeader title="Programs" href="/programs" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.18fr_0.82fr] lg:items-start">
          <ProgramCard
            program={featured}
            className="lg:min-h-[620px] [&_[data-slot=card-content]]:lg:p-8 [&_a]:lg:text-3xl [&_p]:lg:text-base"
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            {rest.slice(0, 3).map((program, index) => (
              <ProgramCard
                key={program.id}
                program={program}
                className={cn(
                  "lg:grid lg:grid-cols-[0.42fr_0.58fr]",
                  "[&_.relative]:lg:aspect-auto [&_.relative]:lg:min-h-full",
                  index === 1 && "lg:translate-x-8",
                )}
              />
            ))}
          </div>
        </div>
        {rest.length > 3 ? (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.slice(3).map((program, index) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function EventsSection({
  events,
}: {
  events: React.ComponentProps<typeof EventCard>["event"][];
}) {
  if (events.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden border-b border-border/70 bg-[hsl(var(--card-raised))]/42 py-16">
      <div className="container mx-auto px-4">
        <SectionHeader title="Events" href="/events" align="center" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-center">
          {events.map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              className={cn(
                index === 0 && "lg:-rotate-1",
                index === 1 && "lg:translate-y-10 lg:scale-[1.04]",
                index === 2 && "lg:rotate-1",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ResearchSection({
  research,
}: {
  research: React.ComponentProps<typeof ResearchCard>["research"][];
}) {
  if (research.length === 0) {
    return null;
  }

  return (
    <section className="border-b border-border/70 py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-[0.34fr_0.66fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <Badge variant="outline" className="mb-4">
              Research
            </Badge>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Work moving from local inquiry to global signal.
            </h2>
            <Button asChild variant="ghost" size="sm" className="mt-5 px-0">
              <Link href="/research">View all</Link>
            </Button>
          </div>
          <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-5 lg:ml-auto lg:mr-0">
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
