import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ExternalLink,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export const metadata: Metadata = {
  title: "Get Involved | AI Safety South Africa",
  description:
    "Volunteer, apply, co-work, follow, or donate to AI Safety South Africa.",
};

type SocialResource = {
  title: string;
  description: string;
  href: string;
  iconSrc: string;
};

type LinkAction = {
  title: string;
  description: string;
  href: string;
  label: string;
  icon: LucideIcon;
};

type TrackRecordLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const socialResources: SocialResource[] = [
  {
    title: "Subscribe to AISSA on Substack",
    description:
      "Read updates, opportunities, and longer-form notes from the AISSA team.",
    href: "https://aisafetysouthafrica.substack.com/",
    iconSrc: "/images/social/substack.svg",
  },
  {
    title: "Follow our events on Luma",
    description:
      "Keep track of upcoming reading groups, workshops, and community events.",
    href: "https://lu.ma/calendar/cal-p3BboQFpGbi3ioe",
    iconSrc: "/images/social/luma.svg",
  },
  {
    title: "Follow us on LinkedIn",
    description:
      "Connect with AISSA for organisational updates and professional network posts.",
    href: "https://www.linkedin.com/company/ai-safety-south-africa/",
    iconSrc: "/images/social/linkedin.svg",
  },
  {
    title: "Follow us on X.com",
    description:
      "Get shorter updates, announcements, and links from the AISSA account.",
    href: "https://x.com/AI_Safety_SA",
    iconSrc: "/images/social/x.svg",
  },
];

const trackRecordLinks: TrackRecordLink[] = [
  {
    href: "/programs",
    label: "Programs",
    icon: GraduationCap,
  },
  {
    href: "/events",
    label: "Events",
    icon: Calendar,
  },
  {
    href: "/research",
    label: "Research",
    icon: BookOpen,
  },
];

const actions: LinkAction[] = [
  {
    title: "Volunteer",
    description:
      "Support research, events, operations, and community-building work with a commitment that fits your skills and schedule.",
    href: "https://tally.so/r/w4gD7b",
    label: "Apply to volunteer",
    icon: HandHeart,
  },
  // {
  //   title: "Apply",
  //   description:
  //     "Express your interest in joining AISSA programs and fellowships when applications open, including research-focused opportunities with experienced mentors.",
  //   href: "",
  //   label: "Express interest",
  //   icon: Users,
  // },
  {
    title: "Co-work with us",
    description: "Apply to join our beautiful co-working space.",
    href: "https://tally.so/r/obO5q1",
    label: "Apply for co-working",
    icon: MapPin,
  },
  {
    title: "Donate",
    description: "Support our work financially. Donations are tax deductible.",
    href: "https://www.every.org/ai-safety-cape-town?utm_campaign=donate-link#/donate",
    label: "Donate",
    icon: HeartHandshake,
  },
];

export default function GetInvolvedPage() {
  return (
    <main className="min-h-screen">
      <section className="border-b border-border/70 py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid gap-8 xl:grid-cols-[1fr_0.92fr] xl:items-stretch">
            <div>
              <p className="mb-3 text-md font-semibold uppercase tracking-widest text-primary/70">
                Get Involved
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
                Help build AI safety capacity in South Africa.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
                AISSA has several entry points to learn, contribute, attend,
                collaborate, or support our work. Pick the path that matches
                your current skills and experience.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-7 bg-brand-sandstone text-brand-dark-surface hover:bg-brand-sandstone/90"
              >
                <a
                  href="https://aisafetysouthafrica.substack.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Subscribe to our newsletter
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
            <div className="relative min-h-[240px] overflow-hidden rounded-lg border border-border/80 bg-card shadow-card md:min-h-[320px] xl:min-h-0">
              <Image
                src="/images/get-involved-image.jpeg"
                alt="AISSA community members attending an AI safety event"
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 42vw, 100vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card-raised/90 py-10 md:py-14">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {actions.map((action) => (
              <ActionCard key={action.title} action={action} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/70 py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
            Not sure how to contribute yet?
          </h2>

          <div className="mt-8 grid gap-5 xl:grid-cols-[1fr_1fr]">
            <TrackRecordCard />
            <SocialsCard />
          </div>
        </div>
      </section>
    </main>
  );
}

function ActionCard({ action }: { action: LinkAction }) {
  const Icon = action.icon;

  return (
    <a
      href={action.href}
      target="_blank"
      rel="noreferrer"
      aria-label={action.label}
      className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <Card className="flex min-h-[170px] flex-col border-[hsl(var(--partner-logo-divider))] bg-[hsl(var(--partner-logo-surface))] text-brand-dark-surface shadow-card transition group-hover:-translate-y-0.5 group-hover:border-primary/35 group-hover:shadow-card-hover">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center">
                <Icon className="size-5 shrink-0 text-brand-dark-surface" />
              </span>
              <h2 className="text-xl font-semibold">{action.title}</h2>
            </div>
            <ExternalLink className="size-4 shrink-0 text-brand-dark-surface/75 transition group-hover:translate-x-0.5" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 px-5 pb-5 pt-0">
          <p className="text-sm leading-6 text-brand-dark-surface/75">
            {action.description}
          </p>
        </CardContent>
      </Card>
    </a>
  );
}

function TrackRecordCard() {
  return (
    <Card className="flex flex-col border-[hsl(var(--partner-logo-divider))] bg-[hsl(var(--partner-logo-surface))] p-5 text-brand-dark-surface shadow-card md:p-6">
      <div className="gap-3">
        <h3 className="text-2xl font-semibold">Get to know our track record</h3>
        <p className="mt-4 text-sm leading-6 text-muted-foreground md:text-base">
          Familiarise yourself with our work by exploring our past programs,
          research and events.
        </p>
      </div>
      <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-md border border-[hsl(var(--partner-logo-divider))] bg-background/70 xl:aspect-auto xl:min-h-[210px] xl:flex-1">
        <Image
          src="/images/stellies_ai_safety_workshop.jpeg"
          alt="Participants at the Stellenbosch AI safety workshop"
          fill
          className="object-cover object-[center_76%]"
          sizes="(min-width: 1280px) 45vw, (min-width: 640px) 90vw, 100vw"
        />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {trackRecordLinks.map((trackRecordLink) => (
          <InternalTrackRecordLink
            key={trackRecordLink.href}
            trackRecordLink={trackRecordLink}
          />
        ))}
      </div>
    </Card>
  );
}

function SocialsCard() {
  return (
    <Card className="p-5 border-[hsl(var(--partner-logo-divider))] bg-[hsl(var(--partner-logo-surface))] text-brand-dark-surface shadow-card md:p-6">
      <h3 className="text-2xl font-semibold">
        Keep up to date with us on socials
      </h3>
      <p className="mt-4 text-sm leading-6 text-brand-dark-surface/70 md:text-base">
        Choose the channel that fits how you want to hear from AISSA.
      </p>
      <ul
        aria-label="AISSA social resources"
        className="mt-6 divide-y divide-[hsl(var(--partner-logo-divider))]"
      >
        {socialResources.map((resource) => (
          <li key={resource.href}>
            <SocialResourceLink resource={resource} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

function SocialResourceLink({ resource }: { resource: SocialResource }) {
  return (
    <a
      href={resource.href}
      target="_blank"
      rel="noreferrer"
      className="group grid grid-cols-[1.75rem_minmax(0,1fr)_1rem] items-center gap-3 py-4 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:gap-4"
    >
      <span className={socialLinkIconClassName}>
        <Image
          src={resource.iconSrc}
          alt=""
          width={24}
          height={24}
          className="size-5 shrink-0 object-contain"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-sm font-semibold leading-6 text-brand-dark-surface underline-offset-4 group-hover:underline md:text-base">
          {resource.title}
        </span>
        <span className="mt-1 block text-sm leading-6 text-brand-dark-surface/70">
          {resource.description}
        </span>
      </span>
      <ExternalLink className="size-4 shrink-0 text-brand-dark-surface/45 transition group-hover:translate-x-0.5 group-hover:text-brand-dark-surface" />
    </a>
  );
}

function InternalTrackRecordLink({
  trackRecordLink,
}: {
  trackRecordLink: TrackRecordLink;
}) {
  const Icon = trackRecordLink.icon;

  return (
    <Link href={trackRecordLink.href} className={trackRecordLinkRowClassName}>
      <span className={linkIconClassName}>
        <Icon className="size-5 shrink-0 text-primary" />
      </span>
      <span className="whitespace-nowrap">{trackRecordLink.label}</span>
    </Link>
  );
}

const trackRecordLinkRowClassName =
  "group flex min-h-16 w-full items-center justify-center gap-2 rounded-md border border-border bg-background/80 px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/45 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-24 sm:flex-col";

const linkIconClassName =
  "grid size-7 shrink-0 place-items-center rounded transition group-hover:border-primary/35 [&_img]:size-4 [&_svg]:size-4";

const socialLinkIconClassName =
  "grid size-7 shrink-0 place-items-center transition group-hover:border-primary/35 [&_img]:size-4 [&_svg]:size-4";
