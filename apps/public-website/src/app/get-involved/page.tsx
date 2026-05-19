import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Calendar,
  ExternalLink,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  MapPin,
} from "lucide-react";
import { CardSurface, linkSurfaceClassNames } from "@/components/card-surface";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card";
import { SectionSurface } from "@/components/section-surface";
import {
  LumaIcon,
  XIcon,
  type SocialIcon as SocialIconDescriptor,
} from "@/components/social-icons";
export const metadata: Metadata = {
  title: "Get Involved | AI Safety South Africa",
  description:
    "Volunteer, apply, co-work, follow, or donate to AI Safety South Africa.",
};

type SocialResource = {
  title: string;
  description: string;
  href: string;
  icon: SocialIconDescriptor;
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
    icon: { kind: "image", src: "/images/social/substack.svg" },
  },
  {
    title: "Follow our events on Luma",
    description:
      "Keep track of upcoming reading groups, workshops, and community events.",
    href: "https://lu.ma/calendar/cal-p3BboQFpGbi3ioe",
    icon: { kind: "inline", Icon: LumaIcon },
  },
  {
    title: "Follow us on LinkedIn",
    description:
      "Connect with AISSA for organisational updates and professional network posts.",
    href: "https://www.linkedin.com/company/ai-safety-south-africa/",
    icon: { kind: "image", src: "/images/social/linkedin.svg" },
  },
  {
    title: "Follow us on X.com",
    description:
      "Get shorter updates, announcements, and links from the AISSA account.",
    href: "https://x.com/AI_Safety_SA",
    icon: { kind: "inline", Icon: XIcon },
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

const getInvolvedHeroImageFrameClassName =
  "relative min-h-[240px] overflow-hidden rounded-lg border border-border/80 bg-card shadow-card md:min-h-[320px] xl:min-h-0";

const mailchimpSignupAction =
  "https://aisafetysa.us15.list-manage.com/subscribe/post?u=e96c6cb99f3d300aef4b498b8&id=8d5e8c6519&f_id=00158ce0f0";

const mailchimpHoneypotName = "b_e96c6cb99f3d300aef4b498b8_8d5e8c6519";

export default function GetInvolvedPage() {
  return (
    <div className="min-h-screen">
      <SectionSurface surface="cta" spacing="default" width="wide">
        <div className="grid gap-8 xl:grid-cols-[1fr_0.92fr] xl:items-stretch">
          <div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
              Help build AI safety capacity in South Africa.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              Join us as a volunteer, co-worker, donor, or by following our work
              on social media. Subscribing to our mailing list is the best way
              to stay updated on our work and opportunities to get involved.
            </p>
            <MailchimpSignupForm />
          </div>
          <div className={getInvolvedHeroImageFrameClassName}>
            <Image
              src="/images/get-involved-image.jpeg"
              alt="AISSA community members attending an AI safety event"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1280px) 42vw, 100vw"
            />
          </div>
        </div>
      </SectionSurface>

      <SectionSurface surface="cta" spacing="compact" width="wide">
        <div className="grid gap-16 md:grid-cols-2 xl:grid-cols-3">
          {actions.map((action) => (
            <ActionCard key={action.title} action={action} />
          ))}
        </div>
      </SectionSurface>

      <SectionSurface surface="cta" spacing="default" width="wide">
        <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
          Not sure how to contribute yet?
        </h2>

        <div className="mt-8 grid gap-5 xl:grid-cols-[1fr_1fr]">
          <TrackRecordCard />
          <SocialsCard />
        </div>
      </SectionSurface>
    </div>
  );
}

function MailchimpSignupForm() {
  return (
    <div id="mc_embed_signup" className="mt-8 max-w-xl">
      <h2 id="mailchimp-signup-heading" className="text-2xl font-semibold">
        Subscribe to our mailing list
      </h2>
      <p className="mt-2 text-base leading-6 text-muted-foreground">
        For the latest announcements, updates, and opportunities.
      </p>
      <form
        action={mailchimpSignupAction}
        method="post"
        id="mc-embedded-subscribe-form"
        name="mc-embedded-subscribe-form"
        target="_blank"
        rel="noopener noreferrer"
        aria-labelledby="mailchimp-signup-heading"
        className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
      >
        <div className="grid gap-2">
          <label htmlFor="mce-EMAIL" className="text-sm font-medium">
            Email address{" "}
            <span className="text-primary" aria-hidden="true">
              *
            </span>
          </label>
          <input
            type="email"
            name="EMAIL"
            id="mce-EMAIL"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="h-11 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm transition placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <div className="absolute left-[-5000px]" aria-hidden="true">
          <label htmlFor="mce-honeypot">Leave this field empty</label>
          <input
            type="text"
            name={mailchimpHoneypotName}
            id="mce-honeypot"
            tabIndex={-1}
            defaultValue=""
          />
        </div>
        <Button
          type="submit"
          size="lg"
          name="subscribe"
          id="mc-embedded-subscribe"
          value="Subscribe"
          className="bg-brand-sandstone px-5 text-brand-dark-surface hover:bg-brand-sandstone/90"
        >
          Subscribe
        </Button>
      </form>
    </div>
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
      className={linkSurfaceClassNames.blockCard}
    >
      <CardSurface variant="action">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center">
                <Icon className="size-5 shrink-0 text-primary" />
              </span>
              <h2 className="text-xl font-semibold">{action.title}</h2>
            </div>
            <ExternalLink className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 px-5 pb-5 pt-0">
          <p className="text-sm leading-6 text-muted-foreground">
            {action.description}
          </p>
        </CardContent>
      </CardSurface>
    </a>
  );
}

function TrackRecordCard() {
  return (
    <CardSurface variant="staticPanelFlex">
      <div className="gap-3">
        <h3 className="text-2xl font-semibold">Get to know our track record</h3>
        <p className="mt-4 text-sm leading-6 text-muted-foreground md:text-base">
          Familiarise yourself with our work by exploring our past programs,
          research and events.
        </p>
      </div>
      <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-md border border-border/80 bg-muted/50 xl:aspect-auto xl:min-h-[210px] xl:flex-1">
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
    </CardSurface>
  );
}

function SocialsCard() {
  return (
    <CardSurface variant="staticPanel">
      <h3 className="text-2xl font-semibold">
        Keep up to date with us on socials
      </h3>
      <p className="mt-4 text-sm leading-6 text-muted-foreground md:text-base">
        Choose the channel that fits how you want to hear from AISSA.
      </p>
      <ul
        aria-label="AISSA social resources"
        className="mt-6 divide-y divide-border/80"
      >
        {socialResources.map((resource) => (
          <li key={resource.href}>
            <SocialResourceLink resource={resource} />
          </li>
        ))}
      </ul>
    </CardSurface>
  );
}

function SocialResourceLink({ resource }: { resource: SocialResource }) {
  return (
    <a
      href={resource.href}
      target="_blank"
      rel="noreferrer"
      className={linkSurfaceClassNames.listResource}
    >
      <span className={socialLinkIconClassName}>
        <SocialIcon icon={resource.icon} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-sm font-semibold leading-6 text-foreground underline-offset-4 group-hover:text-primary group-hover:underline md:text-base">
          {resource.title}
        </span>
        <span className="mt-1 block text-sm leading-6 text-muted-foreground">
          {resource.description}
        </span>
      </span>
      <ExternalLink className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
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
    <Link
      href={trackRecordLink.href}
      className={linkSurfaceClassNames.trackRecordRow}
    >
      <span className={linkIconClassName}>
        <Icon className="size-5 shrink-0 text-primary" />
      </span>
      <span className="whitespace-nowrap">{trackRecordLink.label}</span>
    </Link>
  );
}

const linkIconClassName =
  "grid size-7 shrink-0 place-items-center rounded transition group-hover:border-primary/35 [&_img]:size-4 [&_svg]:size-4";

const socialLinkIconClassName =
  "grid size-7 shrink-0 place-items-center transition group-hover:border-primary/35 [&_img]:size-4 [&_svg]:size-4";

function SocialIcon({ icon }: { icon: SocialIconDescriptor }) {
  if (icon.kind === "inline") {
    const Icon = icon.Icon;

    return (
      <Icon
        aria-hidden="true"
        className="size-5 text-foreground/80 transition group-hover:text-primary"
      />
    );
  }

  return (
    <Image
      src={icon.src}
      alt=""
      width={24}
      height={24}
      className="size-5 shrink-0 object-contain"
    />
  );
}
