import Link from "next/link";
import { Calendar, GraduationCap, Newspaper, Users } from "lucide-react";
import {
  EventCard,
  ProgramCard,
  ResearchCard,
  TestimonialCard,
} from "@/components/cards";
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
    <div className="min-h-screen bg-background">
      <section className="border-b py-12">
        <div className="container mx-auto px-4">
          <h1 className="mb-8 text-3xl font-bold">Our Impact</h1>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {statConfig.map(([label, Icon, key]) => (
              <div
                key={label}
                className="rounded-lg border bg-card p-6 shadow-sm"
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
    </div>
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
