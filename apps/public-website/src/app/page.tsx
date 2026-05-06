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
import {
  EventCard,
  ProgramCard,
  ResearchCard,
  TestimonialCard,
} from "@/components/cards";
import { getHome } from "@/lib/api";
import type { PublicTeamPerson } from "@/lib/types";

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
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b bg-[hsl(var(--brand-dark-surface))] text-white">
        <Image
          src="/images/table-mountain.png"
          alt="Table Mountain above Cape Town"
          fill
          priority
          className="object-cover opacity-55"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-linear-to-r from-[hsl(var(--brand-dark-surface))] via-[hsl(var(--brand-dark-surface))]/80 to-[hsl(var(--brand-dark-surface))]/35" />
        <div className="container relative mx-auto grid min-h-[76vh] content-end px-4 pb-14 pt-24 md:min-h-[72vh] md:pb-20">
          <div className="max-w-4xl">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.28em] text-white/70">
              AI Safety South Africa
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.96] md:text-7xl">
              Building South Africa&apos;s AI safety community.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82 md:text-xl">
              AISSA connects researchers, builders, students, and institutions
              working to make advanced AI systems safer and more beneficial.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/get-involved"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[hsl(var(--brand-dark-surface))] transition hover:bg-white/90"
              >
                Get involved
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 rounded-lg border border-white/35 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Explore programs
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-card/70 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statConfig.map(([label, Icon, key]) => (
              <div
                key={label}
                className="rounded-lg border bg-background p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-6 w-6 shrink-0 text-primary" />
                  <p className="text-3xl font-bold">
                    {data.stats[key].toLocaleString()}
                  </p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b py-16">
        <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
              Mission
            </p>
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
              We focus on credible public programs, research activity, events,
              and testimonials for launch. Detailed operational reporting and
              private community records stay in Track Record.
            </p>
          </div>
        </div>
      </section>

      <Section title="Programs" href="/programs">
        {data.programs.map((program) => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </Section>
      <Section title="Events" href="/events">
        {data.events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </Section>
      <Section title="Research" href="/research">
        {data.research.map((research) => (
          <ResearchCard key={research.id} research={research} />
        ))}
      </Section>
      {data.testimonials.length > 0 ? (
        <Section title="Testimonials" href="/testimonials">
          {data.testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
            />
          ))}
        </Section>
      ) : null}
      {data.team.length > 0 ? (
        <section className="border-b py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 max-w-3xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                Team
              </p>
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
          <div className="rounded-lg border bg-[hsl(var(--brand-dark-surface))] p-8 text-white shadow-sm md:p-10">
            <HeartHandshake className="mb-5 h-8 w-8 text-white/80" />
            <h2 className="max-w-2xl text-3xl font-semibold md:text-4xl">
              Find the contribution path that fits you.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/75">
              Volunteer, apply to programs, subscribe, attend events, use the
              co-working space, follow AISSA, or support the work financially.
            </p>
            <Link
              href="/get-involved"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[hsl(var(--brand-dark-surface))] transition hover:bg-white/90"
            >
              Get involved
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function TeamCard({ person }: { person: PublicTeamPerson }) {
  return (
    <article className="flex h-full gap-4 rounded-lg border bg-card p-5 shadow-sm">
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
    </article>
  );
}

function Section({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-3xl font-bold">{title}</h2>
          <Link href={href} className="text-sm font-medium text-primary">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {children}
        </div>
      </div>
    </section>
  );
}
