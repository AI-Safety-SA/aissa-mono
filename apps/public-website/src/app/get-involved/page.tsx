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

type SocialLink =
  | {
      kind: "image";
      href: string;
      label: string;
      iconSrc: string;
    }
  | {
      kind: "icon";
      href: string;
      label: string;
      icon: LucideIcon;
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

const socialLinks: SocialLink[] = [
  {
    kind: "image",
    href: "https://aisafetysouthafrica.substack.com/",
    label: "Substack",
    iconSrc: "/images/social/substack.svg",
  },
  {
    kind: "image",
    href: "https://lu.ma/calendar/cal-p3BboQFpGbi3ioe",
    label: "Luma",
    iconSrc: "/images/social/luma.svg",
  },
  {
    kind: "image",
    href: "https://www.linkedin.com/company/ai-safety-south-africa/",
    label: "LinkedIn",
    iconSrc: "/images/social/linkedin.svg",
  },
  {
    kind: "image",
    href: "https://x.com/AI_Safety_SA",
    label: "X.com",
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
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                Get involved
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
    <Card className="bg-card/90 p-5 shadow-card md:p-6">
      <h3 className="text-2xl font-semibold">Get to know our track record</h3>
      <p className="mt-4 text-sm leading-6 text-muted-foreground md:text-base">
        Familiarise yourself with our work by exploring our past programs,
        research and events.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
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
    <Card className="bg-card/90 p-5 shadow-card md:p-6">
      <h3 className="text-2xl font-semibold">
        Keep up to date with us on socials
      </h3>
      <div className="mt-4 space-y-4">
        <div className="flex items-start gap-3">
          <ExternalSocialLink
            socialLink={{
              kind: "image",
              href: "https://aisafetysouthafrica.substack.com/",
              label: "Newsletter",
              iconSrc: "/images/social/substack.svg",
            }}
            iconOnly
          />
          <p className="pt-1 text-sm leading-6 text-muted-foreground">
            Sign up for our mailing list to hear about upcoming courses and
            fellowships.
          </p>
        </div>
        {socialLinks.map((socialLink) => (
          <div key={socialLink.href} className="flex items-start gap-3">
            <ExternalSocialLink socialLink={socialLink} iconOnly />
            <p className="pt-1 text-sm leading-6 text-muted-foreground">
              {socialDescriptions[socialLink.label]}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ExternalSocialLink({
  socialLink,
  iconOnly = false,
}: {
  socialLink: SocialLink;
  iconOnly?: boolean;
}) {
  return (
    <a
      href={socialLink.href}
      target="_blank"
      rel="noreferrer"
      aria-label={socialLink.label}
      className={iconOnly ? iconOnlyLinkClassName : linkRowClassName}
    >
      <span className={socialLinkIconClassName}>
        <SocialLinkIcon socialLink={socialLink} />
      </span>
      {!iconOnly ? (
        <>
          <span className="whitespace-nowrap">{socialLink.label}</span>
          <ExternalLink className="size-4 shrink-0 text-primary" />
        </>
      ) : null}
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
    <Link href={trackRecordLink.href} className={linkRowClassName}>
      <span className={linkIconClassName}>
        <Icon className="size-5 shrink-0 text-primary" />
      </span>
      <span className="whitespace-nowrap">{trackRecordLink.label}</span>
      <ArrowRight className="size-4 shrink-0 text-primary" />
    </Link>
  );
}

function SocialLinkIcon({ socialLink }: { socialLink: SocialLink }) {
  if (socialLink.kind === "image") {
    return (
      <Image
        src={socialLink.iconSrc}
        alt=""
        width={24}
        height={24}
        className="size-5 shrink-0 object-contain"
      />
    );
  }

  const Icon = socialLink.icon;

  return <Icon className="size-5 shrink-0 text-primary" />;
}

const linkRowClassName =
  "group inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/45 hover:bg-background hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const linkIconClassName =
  "grid size-7 shrink-0 place-items-center rounded-full border border-border bg-muted/60 transition group-hover:border-primary/35 group-hover:bg-primary/5 [&_img]:size-4 [&_svg]:size-4";

const socialLinkIconClassName =
  "grid size-7 shrink-0 place-items-center rounded-full border border-border bg-white transition group-hover:border-primary/35 group-hover:bg-white dark:bg-white dark:group-hover:bg-white [&_img]:size-4 [&_svg]:size-4";

const iconOnlyLinkClassName =
  "group grid size-9 shrink-0 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const socialDescriptions: Record<string, string> = {
  Substack:
    "Subscribe to our Substack newsletter where we unpack the latest developments in AI safety.",
  Luma: "Follow us on Luma to register for our community events such as hackathons and reading groups.",
  LinkedIn: "Connect with us on LinkedIn.",
  "X.com": "Connect with us on X.",
};
