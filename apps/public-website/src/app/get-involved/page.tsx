import type { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  ExternalLink,
  HandHeart,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Newspaper,
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
    "Volunteer, apply, subscribe, attend events, co-work, follow, or donate to AI Safety South Africa.",
};

const actions = [
  {
    title: "Volunteer",
    description:
      "Support research, events, operations, and community-building work with a commitment that fits your skills and schedule.",
    href: "https://tally.so/r/w4gD7b",
    label: "Apply to volunteer",
    icon: HandHeart,
  },
  {
    title: "Apply",
    description:
      "Join AISSA programs and fellowships when applications are open, including research-focused opportunities with experienced mentors.",
    href: "https://www.cai-research-fellowship.com/",
    label: "View current application",
    icon: Users,
  },
  {
    title: "Subscribe",
    description:
      "Receive AISSA updates, opportunities, and community notes through the newsletter.",
    href: "https://aisafetysouthafrica.substack.com/",
    label: "Subscribe on Substack",
    icon: Newspaper,
  },
  {
    title: "Attend events",
    description:
      "Join in-person events in Cape Town and online talks as they are announced.",
    href: "https://lu.ma/calendar/cal-p3BboQFpGbi3ioe",
    label: "Open events calendar",
    icon: Calendar,
  },
  {
    title: "Co-working",
    description:
      "Apply to use the AISSA co-working space for focused AI safety research and community work.",
    href: "https://airtable.com/appR0NwXFE9nxfdKA/pagIQJbgF9MMX1SMu/form",
    label: "Apply for co-working",
    icon: MapPin,
  },
  {
    title: "Follow",
    description:
      "Follow AISSA on LinkedIn for public announcements, events, and community updates.",
    href: "https://www.linkedin.com/company/ai-safety-south-africa/",
    label: "Follow on LinkedIn",
    icon: MessageCircle,
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
              AISSA has several entry points for people who want to learn,
              contribute, attend, collaborate, or support the work. Pick the
              path that matches your current context.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto grid grid-cols-1 gap-5 px-4 md:grid-cols-2 lg:grid-cols-3">
          {actions.map(({ description, href, icon: Icon, label, title }) => (
            <Card
              key={title}
              className="flex min-h-64 flex-col shadow-card transition-shadow hover:shadow-card-hover"
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Icon className="h-7 w-7 shrink-0 text-primary" />
                  <h2 className="text-xl font-semibold">{title}</h2>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm leading-7 text-muted-foreground">
                  {description}
                </p>
              </CardContent>
              <CardFooter>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  {label}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t py-12">
        <div className="container mx-auto px-4">
          <Card className="p-6 md:p-8">
            <h2 className="text-2xl font-semibold">
              Start with the public track record.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
              Browse current public programs, events, and research outputs to
              understand where AISSA is active before you choose a contribution
              path.
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
