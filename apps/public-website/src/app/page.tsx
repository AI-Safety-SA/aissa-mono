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
} from "@/components/home/home-sections";
import { PartnerLogoBanner } from "@/components/home/partner-logo-banner";
import { CardSurface } from "@/components/card-surface";
import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import { SectionSurface } from "@/components/section-surface";
import { getHome } from "@/lib/api";
import { withBasePath } from "@/lib/base-path";
import type { PublicStats } from "@/lib/types";

const statConfig = [
  ["Recorded Participations", Users, "totalParticipants", "+"],
  ["Events Held", Calendar, "totalEvents", "+"],
  ["Programs Offered", GraduationCap, "totalPrograms", "+"],
  ["Research Outputs", Newspaper, "totalResearch", ""],
] as const;

function HeroSection({ stats }: { stats: PublicStats }) {
  return (
    <section className="relative overflow-hidden border-b border-brand-sandstone/50 bg-brand-dark-surface text-white">
      <div className="relative aspect-4/3 w-full md:absolute md:inset-0 md:aspect-auto">
        <Image
          src={withBasePath("/images/aissa-landing-map.webp")}
          alt="Heat-map illustration of South Africa's provinces"
          fill
          priority
          className="object-cover object-[80%_38%] md:object-center"
          sizes="100vw"
        />
      </div>
      <div className="container relative mx-auto grid min-h-0 content-center px-4 pb-16 pt-8 md:min-h-[68vh] md:pb-16 md:pt-24">
        <div className="max-w-5xl">
          <h1 className="max-w-4xl text-5xl font-semibold leading-[0.94] md:max-w-[calc(50vw-6rem)] md:text-7xl">
            Building networks for an empowered future.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82 md:text-xl">
            AI Safety South Africa (AISSA) is a national network of talent and
            professionals dedicated to steering technological progress to be
            differentially beneficial. AISSA connects members across South
            Africa, with its primary member base in Cape Town, Johannesburg,
            and Pretoria. AISSA&rsquo;s operational hub is the{" "}
            <a
              href="https://www.cisai.co"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-white"
            >
              Cape Institute for Safe AI
            </a>{" "}
            (CISAI).
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="font-bold bg-brand-sandstone text-brand-dark-surface hover:bg-brand-sandstone/90"
            >
              <Link href="/get-involved">
                Get involved
                <ArrowRight strokeWidth={3} className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="container relative mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statConfig.map(([label, Icon, key, suffix]) => (
            <CardSurface key={label} variant="stat">
              <div className="flex items-center gap-3">
                <Icon className="h-6 w-6 shrink-0 text-primary" />
                <p className="text-3xl font-bold">
                  {stats[key].toLocaleString()}
                  {suffix}
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

function TransitionOverlay() {
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="absolute inset-0">
        <Image
          src={withBasePath("/images/aissa-landing-map.webp")}
          alt="Heat-map illustration of South Africa's provinces"
          fill
          priority
          className="object-cover object-[80%_38%] md:object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>
      <div className="relative flex min-h-full items-center justify-center px-4 py-12">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center text-white">
          <Image
            src={withBasePath("/images/aissa-to-cisai-transition.png")}
            alt="AI Safety South Africa transitioning to the Cape Institute for Safe AI"
            width={768}
            height={284}
            priority
            className="h-auto w-[36rem] max-w-full md:w-[42rem]"
          />
          <div className="mt-8 flex flex-col gap-4 text-lg leading-8 text-white/90 md:text-xl">
            <p>
              AI Safety South Africa is rebranding to the{" "}
              <a
                href="https://www.cisai.co"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-white"
              >
                Cape Institute for Safe AI
              </a>
              .
            </p>
            <p>
              We still believe that creating AI safety groups across South
              Africa is valuable, and if you&rsquo;d like to join as a local
              group organiser, please{" "}
              <a
                href="https://tally.so/r/w4gD7b"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-white"
              >
                apply to volunteer here
              </a>
              .
            </p>
            <p>
              We also maintain a national discussion group, which you can{" "}
              <a
                href="https://tally.so/r/EkRKDN"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-white"
              >
                apply to join here
              </a>
              .
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="mt-8 font-bold bg-brand-sandstone text-brand-dark-surface hover:bg-brand-sandstone/90"
          >
            <a href="https://www.cisai.co" target="_blank" rel="noreferrer">
              Visit the Cape Institute for Safe AI
              <ArrowRight strokeWidth={3} className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
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
          className="mt-7 font-bold bg-brand-sandstone text-brand-dark-surface hover:bg-brand-sandstone/90"
        >
          <Link href="/get-involved">
            Get involved
            <ArrowRight strokeWidth={3} className="h-4 w-4" />
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
      <TransitionOverlay />

      <div aria-hidden="true">
        <HeroSection stats={data.stats} />

        <ProgramsSection programs={data.programs} />
        <ResearchSection research={data.research} />

        <PartnerLogoBanner />

        <EventsSection events={data.events} />

        <FinalCtaSection />
      </div>
    </div>
  );
}
