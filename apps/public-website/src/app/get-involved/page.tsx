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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
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
    title: "Co-working",
    description: "Apply to join our co-working space.",
    href: "https://tally.so/r/obO5q1",
    label: "Apply for co-working",
    icon: MapPin,
  },
  {
    title: "Donate",
    description:
      "Support AISSA financially through the public donation page when direct contribution is the best fit.",
    href: "https://www.every.org/ai-safety-cape-town?utm_campaign=donate-link#/donate",
    label: "Donate",
    icon: HeartHandshake,
  },
];

export default function GetInvolvedPage() {
  return (
    <main className="min-h-screen">
      <section className="border-b py-16 md:py-20">
        <div className="container mx-auto px-4">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
            Get involved
          </p>
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
              Help build AI safety capacity in South Africa.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              AISSA has several entry points to learn, contribute, attend,
              collaborate, or support our work. Pick the path that matches your
              current skills and experience.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto grid grid-cols-1 gap-5 px-4 md:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => (
            <Card
              key={action.title}
              className="flex min-h-48 flex-col shadow-card transition-shadow hover:shadow-card-hover"
            >
              <CardHeader className="p-4 pb-3">
                <div className="flex items-center gap-3">
                  <action.icon className="h-6 w-6 shrink-0 text-primary" />
                  <h2 className="text-xl font-semibold">{action.title}</h2>
                </div>
              </CardHeader>
              <CardContent className="flex-1 px-4 pb-4 pt-0">
                <p className="text-sm leading-6 text-muted-foreground">
                  {action.description}
                </p>
              </CardContent>
              <CardFooter className="px-4 pb-4 pt-0">
                <a
                  href={action.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  {action.label}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t bg-muted/25 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <h2 className="max-w-xl text-3xl font-semibold leading-tight md:text-4xl">
                Follow us on Socials
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                Follow us for updates, event announcements, newsletters, and new
                opportunities to contribute.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {socialLinks.map((socialLink) => (
                  <ExternalSocialLink
                    key={socialLink.href}
                    socialLink={socialLink}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                Explore the track record
              </p>
              <h2 className="max-w-xl text-3xl font-semibold leading-tight md:text-4xl">
                Not sure how to contribute yet?
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                View our past programs, research, and events before choosing
                your path to impact.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {trackRecordLinks.map((trackRecordLink) => (
                  <InternalTrackRecordLink
                    key={trackRecordLink.href}
                    trackRecordLink={trackRecordLink}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ExternalSocialLink({ socialLink }: { socialLink: SocialLink }) {
  return (
    <a
      href={socialLink.href}
      target="_blank"
      rel="noreferrer"
      className={linkRowClassName}
    >
      <span className={socialLinkIconClassName}>
        <SocialLinkIcon socialLink={socialLink} />
      </span>
      <span className="whitespace-nowrap">{socialLink.label}</span>
      <ExternalLink className="size-4 shrink-0 text-primary" />
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
