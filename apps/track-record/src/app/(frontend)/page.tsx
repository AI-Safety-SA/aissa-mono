import {
  getImpactStats,
  getProgramsWithStats,
  getRecentEvents,
  getFeaturedResearch,
  getTestimonials,
  getFeaturedPeople,
  getCommunityStats,
} from '@/lib/data'
import { StatsCard } from '@/components/dashboard/stats-card'
import { ProgramCard } from '@/components/dashboard/program-card'
import { EventCard } from '@/components/dashboard/event-card'
import { ResearchCard } from '@/components/dashboard/research-card'
import { PersonCard } from '@/components/dashboard/person-card'
import { TestimonialCarousel } from '@/components/dashboard/testimonial-carousel'
import { AissaBrand } from '@/components/aissa-brand'
import Link from 'next/link'
import {
  Users,
  Calendar,
  GraduationCap,
  FolderKanban,
  HandCoins,
  Globe,
  Newspaper,
  MessageCircle,
  Hash,
  Armchair,
  type LucideIcon,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CommunityStat } from '@/payload-types'

// Force dynamic rendering to prevent static generation during build
export const dynamic = 'force-dynamic'

const communityStatConfig: ReadonlyArray<{
  key: keyof Pick<
    CommunityStat,
    | 'linkedinFollowers'
    | 'substackSubscribers'
    | 'lumaSubscribers'
    | 'whatsappCommunitySize'
    | 'slackMembers'
    | 'coworkingSeats'
  >
  title: string
  icon: LucideIcon
}> = [
  { key: 'linkedinFollowers', title: 'LinkedIn Followers', icon: Globe },
  { key: 'substackSubscribers', title: 'Substack Subscribers', icon: Newspaper },
  { key: 'lumaSubscribers', title: 'Luma Subscribers', icon: Calendar },
  { key: 'whatsappCommunitySize', title: 'WhatsApp Community', icon: MessageCircle },
  { key: 'slackMembers', title: 'Slack Members', icon: Hash },
  { key: 'coworkingSeats', title: 'Coworking Seats', icon: Armchair },
]

export default async function HomePage() {
  const [stats, programs, events, research, testimonials, featuredPeople, communityStats] =
    await Promise.all([
      getImpactStats(),
      getProgramsWithStats(6),
      getRecentEvents(6),
      getFeaturedResearch(6),
      getTestimonials(9),
      getFeaturedPeople(3),
      getCommunityStats(),
    ])
  const amountFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
  const totalFundingLabel =
    stats.totalFundingDollars > 0 ? `$${amountFormatter.format(stats.totalFundingDollars)}` : 'N/A'
  const fundedGrantDescription =
    stats.totalFundedGrants === 1 ? 'From 1 grant' : `From ${stats.totalFundedGrants} grants`
  const visibleCommunityStats = communityStatConfig.flatMap(({ key, title, icon }) => {
    const value = communityStats[key]
    if (!value) return []
    return [{ key, title, icon, value }]
  })

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-primary/10 bg-[radial-gradient(circle_at_top_left,rgba(13,42,87,0.14),transparent_42%),linear-gradient(180deg,rgba(255,255,255,1),rgba(247,250,255,0.92))] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.9),rgba(2,6,23,0.98))]">
        <div className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:items-end md:py-14">
          <div className="space-y-5">
            <div className="inline-flex items-center rounded-full border border-primary/10 bg-primary/6 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-primary">
              South African AI safety community
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                AISSA Track Record
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                A live view of the programs, events, research, grants, and people shaping AI safety
                work in South Africa.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-primary/15 bg-[#0b1f46] p-6 text-primary-foreground shadow-[0_32px_100px_-52px_rgba(11,31,70,0.95)]">
            <AissaBrand size="lg" showDescriptor={false} priority />
            <p className="mt-5 max-w-md text-sm leading-7 text-white/78">
              Designed for transparent reporting on community growth, participant outcomes, and the
              institutions AISSA helps build.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.22em] text-white/68">
              <span className="rounded-full border border-white/12 px-3 py-2 text-center">
                Programs
              </span>
              <span className="rounded-full border border-white/12 px-3 py-2 text-center">
                Events
              </span>
              <span className="rounded-full border border-white/12 px-3 py-2 text-center">
                Research
              </span>
              <span className="rounded-full border border-white/12 px-3 py-2 text-center">
                Community
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatsCard
              title="Total Participants"
              value={stats.totalParticipants.toLocaleString()}
              description="Across all programs"
              icon={Users}
            />
            <StatsCard
              title="Events Held"
              value={stats.totalEvents}
              description="Workshops, talks, and meetups"
              icon={Calendar}
            />
            <StatsCard
              title="Programs Completed"
              value={stats.totalPrograms}
              description="Fellowships, courses, and more"
              icon={GraduationCap}
            />
            <StatsCard
              title="Projects Published"
              value={stats.totalProjects}
              description="Research, tools, and submissions"
              icon={FolderKanban}
            />
            <StatsCard
              title="Total Funding"
              value={totalFundingLabel}
              description={fundedGrantDescription}
              icon={HandCoins}
            />
          </div>
        </div>
      </section>

      {visibleCommunityStats.length > 0 && (
        <section className="border-b py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Community Reach</h2>
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-none lg:grid-flow-col lg:auto-cols-fr">
              {visibleCommunityStats.map(({ key, title, icon, value }) => (
                <StatsCard
                  key={key}
                  title={title}
                  value={value.toLocaleString()}
                  icon={icon}
                  compact
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {featuredPeople.length > 0 && (
        <section className="border-b py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between gap-4 mb-8">
              <h2 className="text-3xl font-bold">Featured People</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPeople.map((person) => (
                <PersonCard key={person.id} person={person} />
              ))}
            </div>
          </div>
        </section>
      )}

      {programs.length > 0 && (
        <section className="border-b py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between gap-4 mb-8">
              <h2 className="text-3xl font-bold">Featured Programs</h2>
              <Link
                href="/programs"
                className={cn(buttonVariants({ variant: 'link' }), 'h-auto p-0')}
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  cohortCount={program.cohortCount}
                  totalParticipants={program.totalParticipants}
                  totalCompletions={program.totalCompletions}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {events.length > 0 && (
        <section className="border-b py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between gap-4 mb-8">
              <h2 className="text-3xl font-bold">Recent Events</h2>
              <Link
                href="/events"
                className={cn(buttonVariants({ variant: 'link' }), 'h-auto p-0')}
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {research.length > 0 && (
        <section className="border-b py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between gap-4 mb-8">
              <h2 className="text-3xl font-bold">Featured Research</h2>
              <Link
                href="/research"
                className={cn(buttonVariants({ variant: 'link' }), 'h-auto p-0')}
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {research.map((item) => (
                <ResearchCard key={item.id} research={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <TestimonialCarousel testimonials={testimonials} />
          </div>
        </section>
      )}
    </div>
  )
}
