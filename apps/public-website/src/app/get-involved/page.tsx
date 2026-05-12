import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  ExternalLink,
  HandHeart,
  HeartHandshake,
  MapPin,
  Users,
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
  kind: "link";
  title: string;
  description: string;
  href: string;
  label: string;
  icon: LucideIcon;
  socialLinks?: never;
};

type SocialAction = {
  kind: "social";
  title: string;
  description: string;
  socialLinks: SocialLink[];
  icon: LucideIcon;
  href?: never;
  label?: never;
};

const socialLinks: SocialLink[] = [
  {
    kind: "image",
    href: "https://aisafetysouthafrica.substack.com/",
    label: "Substack",
    iconSrc: "/images/social/substack.svg",
  },
  {
    kind: "icon",
    href: "https://lu.ma/calendar/cal-p3BboQFpGbi3ioe",
    label: "Luma",
    icon: Calendar,
  },
  {
    kind: "image",
    href: "https://www.linkedin.com/company/ai-safety-south-africa/",
    label: "LinkedIn",
    iconSrc: "/images/social/linkedin.png",
  },
  {
    kind: "image",
    href: "https://x.com/AI_Safety_SA",
    label: "X.com",
    iconSrc: "/images/social/x.svg",
  },
];

const actions: Array<LinkAction | SocialAction> = [
  {
    kind: "link",
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
    kind: "link",
    title: "Co-working",
    description: "Apply to join our co-working space.",
    href: "https://tally.so/r/obO5q1",
    label: "Apply for co-working",
    icon: MapPin,
  },
  {
    kind: "social",
    title: "Follow us on socials",
    description: "Get AISSA updates, event announcements, and community notes.",
    socialLinks,
    icon: Users,
  },
  {
    kind: "link",
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
              className="flex min-h-64 flex-col shadow-card transition-shadow hover:shadow-card-hover"
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <action.icon className="h-7 w-7 shrink-0 text-primary" />
                  <h2 className="text-xl font-semibold">{action.title}</h2>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm leading-7 text-muted-foreground">
                  {action.description}
                </p>
                {action.kind === "social" ? (
                  <div className="mt-5 grid gap-2">
                    {action.socialLinks.map((socialLink) => (
                      <a
                        key={socialLink.href}
                        href={socialLink.href}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/45 hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <SocialLinkIcon socialLink={socialLink} />
                          <span>{socialLink.label}</span>
                        </span>
                        <ExternalLink className="size-4 shrink-0 text-primary" />
                      </a>
                    ))}
                  </div>
                ) : null}
              </CardContent>
              {action.kind === "link" ? (
                <CardFooter>
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
              ) : null}
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t py-12">
        <div className="container mx-auto px-4">
          <Card className="p-6 md:p-8">
            <h2 className="text-2xl font-semibold">Not sure where to start?</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
              View our track record before choosing your path to impact.
            </p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold text-primary">
              <Link href="/programs">Programs</Link>
              <Link href="/events">Events</Link>
              <Link href="/research">Research</Link>
            </div>
          </Card>
        </div>
      </section>
    </main>
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
