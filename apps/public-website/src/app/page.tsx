import type { ReactElement } from "react";
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
  EventsSection,
  ProgramsSection,
  ResearchSection,
  TeamSection,
} from "@/components/home/home-sections";
import { PartnerLogoBanner } from "@/components/home/partner-logo-banner";
import { CardSurface } from "@/components/card-surface";
import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import { SectionSurface } from "@/components/section-surface";
import { getHome } from "@/lib/api";
import type { PublicStats } from "@/lib/types";

export const dynamic = "force-dynamic";

const statConfig = [
  ["Recorded Participations", Users, "totalParticipants"],
  ["Events Held", Calendar, "totalEvents"],
  ["Programs Offered", GraduationCap, "totalPrograms"],
  ["Research Outputs", Newspaper, "totalResearch"],
] as const;

function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-brand-sandstone/50 bg-brand-dark-surface text-white">
      <Image
        src="/images/table-mountain.png"
        alt="Table Mountain above Cape Town"
        fill
        priority
        className="object-cover opacity-70"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-hero-overlay" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-linear-to-t from-background via-background/54 to-transparent" />
      <div className="container relative mx-auto grid min-h-[82vh] content-center px-4 pb-16 pt-24 md:min-h-[78vh] md:pb-24">
        <div className="max-w-5xl">
          <h1 className="max-w-4xl text-5xl font-semibold leading-[0.94] md:text-7xl">
            A hub for global AI safety work on the African continent
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82 md:text-xl">
            AI Safety South Africa (AISSA) is concerned with the safe and
            beneficial development and deployment of advanced AI systems. We run
            community events, capacity building programs, and a research group
            from our co-working space in Cape Town.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-brand-sandstone text-brand-dark-surface hover:bg-brand-sandstone/90"
            >
              <Link href="/get-involved">
                Get involved
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsShelf({ stats }: { stats: PublicStats }) {
  return (
    <section className="relative z-10 -mt-10 pb-14">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statConfig.map(([label, Icon, key]) => (
            <CardSurface key={label} variant="stat">
              <div className="flex items-center gap-3">
                <Icon className="h-6 w-6 shrink-0 text-primary" />
                <p className="text-3xl font-bold">
                  {stats[key].toLocaleString()}
                </p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </CardSurface>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <SectionSurface surface="cta">
      <CardSurface variant="cta">
        <CardHeader>
          <div className="flex items-center gap-8">
            <HeartHandshake className="h-8 w-8 text-white/80" />
            <h2 className="max-w-2xl text-3xl font-semibold md:text-4xl">
              Explore your path to impact:
            </h2>
          </div>
        </CardHeader>

        <p className="mt-4 text-base leading-8 text-white/75">
          You can make a contribution to AI safety through up-skilling,
          attending events, volunteering, co-working with our community, reading
          our newsletter or supporting us financially.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-7 bg-brand-sandstone text-brand-dark-surface hover:bg-brand-sandstone/90"
        >
          <Link href="/get-involved">
            Get involved
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardSurface>
    </SectionSurface>
  );
}

export default async function HomePage(): Promise<ReactElement> {
  const data = await getHome();

  return (
    <div className="min-h-screen bg-transparent">
      <HeroSection />
      <StatsShelf stats={data.stats} />

      <ProgramsSection programs={data.programs} />
      <ResearchSection research={data.research} />

      <PartnerLogoBanner />

      <EventsSection events={data.events} />

      <TeamSection team={data.team} />

      <FinalCtaSection />
    </div>
  );
}
