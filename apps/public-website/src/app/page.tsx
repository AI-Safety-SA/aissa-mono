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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getHome } from "@/lib/api";

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
                className="bg-brand-sandstone text-brand-dark-surface hover:bg-brand-sandstone/90"
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
                className="bg-card/90 p-6 shadow-stat backdrop-blur"
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

      <PartnerLogoBanner />

      <section className="border-y border-border/70 bg-card-raised/60 py-16">
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
      <TeamSection team={data.team} />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="overflow-hidden border-brand-coral/25 bg-home-cta p-8 text-white shadow-cta md:p-10">
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
              className="mt-7 bg-brand-sandstone text-brand-dark-surface hover:bg-brand-sandstone/90"
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
