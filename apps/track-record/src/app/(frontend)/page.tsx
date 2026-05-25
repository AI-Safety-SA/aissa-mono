import {
  getImpactStats,
  getProgramsWithStats,
  getRecentEvents,
  getFeaturedResearch,
  getTestimonials,
  getGroupedFeaturedPeople,
  FEATURED_EVENT_COUNT,
  splitHighlightedEvents,
} from '@/lib/data'
import { isProgramLargeCard } from '@/lib/content-flags'
import {
  getDefaultImages,
  getEventDefaultImage,
  getProgramDefaultImage,
} from '@/lib/default-images'
import { FEATURED_TIER_CONTENT, FEATURED_TIER_ORDER } from '@/lib/featured-people'
import { StatsCard } from '@/components/dashboard/stats-card'
import { ProgramCard } from '@/components/dashboard/program-card'
import { EventCard } from '@/components/dashboard/event-card'
import { ResearchCard } from '@/components/dashboard/research-card'
import { PersonCard } from '@/components/dashboard/person-card'
import { TestimonialList } from '@/components/dashboard/testimonial-list'
import Link from 'next/link'
import { Users, Calendar, GraduationCap, HandCoins, Newspaper } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import config from '@/payload.config'
import { getPayload } from 'payload'
import { getCurrentFrontendViewer } from '@/utilities/frontend-gate-server'

// Force dynamic rendering to prevent static generation during build
export const dynamic = 'force-dynamic'

const impactCardConfig = [
  {
    title: 'Recorded Participations',
    description: 'Across programs and events',
    icon: Users,
    href: undefined,
  },
  {
    title: 'Events Held',
    description: 'Workshops, talks, and meetups',
    icon: Calendar,
    href: '/events',
  },
  {
    title: 'Programs Completed',
    description: 'Fellowships, courses, and more',
    icon: GraduationCap,
    href: '/programs',
  },
  {
    title: 'Significant Research Outputs',
    description: 'Papers and publications',
    icon: Newspaper,
    href: '/research',
  },
  {
    title: 'Total Funding',
    icon: HandCoins,
    href: '/grants',
  },
] as const

export default async function HomePage() {
  const { canViewCommunityHighlights, canViewFundingDetails } = await getCurrentFrontendViewer()
  const payload = await getPayload({ config })
  const [stats, programs, events, research, testimonials, defaultImages, featuredPeople] =
    await Promise.all([
      getImpactStats(),
      getProgramsWithStats(6),
      getRecentEvents(0),
      getFeaturedResearch(6),
      getTestimonials(0),
      getDefaultImages(payload),
      canViewCommunityHighlights ? getGroupedFeaturedPeople() : Promise.resolve(null),
    ])
  const { featuredEvents } = splitHighlightedEvents(events, FEATURED_EVENT_COUNT)
  const amountFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
  const totalFundingLabel =
    stats.totalFundingDollars > 0 ? `$${amountFormatter.format(stats.totalFundingDollars)}` : 'N/A'
  const fundedGrantDescription =
    stats.totalFundedGrants === 1 ? 'From 1 grant' : `From ${stats.totalFundedGrants} grants`
  const impactCards = [
    {
      ...impactCardConfig[0],
      value: stats.totalParticipants.toLocaleString(),
    },
    {
      ...impactCardConfig[1],
      value: stats.totalEvents,
    },
    {
      ...impactCardConfig[2],
      value: stats.totalPrograms,
    },
    {
      ...impactCardConfig[3],
      value: stats.totalResearch,
    },
  ]
  const visibleImpactCards = canViewFundingDetails
    ? [
        ...impactCards,
        {
          ...impactCardConfig[4],
          value: totalFundingLabel,
          description: fundedGrantDescription,
        },
      ]
    : impactCards
  const impactGridClassName = visibleImpactCards.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-5'

  return (
    <div className="min-h-screen bg-background">
      {/* Commented out as a test of a more compact hero section - can re-enable if we want to bring it back in the future */}
      {/* <section className="relative overflow-hidden border-b border-primary/10 bg-background">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-0 top-10 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="container relative mx-auto px-4 py-10 md:py-14">
          <div className="grid gap-8 rounded-4xl border border-primary/10 bg-card/80 px-6 py-8 shadow-sm backdrop-blur-sm md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:items-end md:px-8 md:py-10">
            <div className="space-y-5">
              <div className="inline-flex items-center rounded-full border border-primary/10 bg-primary/10 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-primary">
                South African AI safety community
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  AISSA Track Record
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                  A live view of the programs, events, research, grants, and people shaping AI
                  safety work in South Africa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      <section className="border-b py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Our Impact</h2>
          <div className={cn('grid grid-cols-1 gap-6 md:grid-cols-2', impactGridClassName)}>
            {visibleImpactCards.map((card) => (
              <StatsCard
                key={card.title}
                title={card.title}
                value={card.value}
                description={card.description}
                icon={card.icon}
                href={card.href}
              />
            ))}
          </div>
        </div>
      </section>

      {featuredPeople && FEATURED_TIER_ORDER.some((tier) => featuredPeople[tier].length > 0) && (
        <section id="featured-community" className="scroll-mt-24 border-b py-12">
          <div className="container mx-auto px-4">
            <div className="mb-8 max-w-2xl space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/70">
                Featured Community
              </p>
              <h2 className="text-3xl font-bold">People Building the AISSA Track Record</h2>
            </div>

            <div className="space-y-10">
              {FEATURED_TIER_ORDER.map((tier) => {
                const people = featuredPeople[tier]
                if (people.length === 0) return null

                const content = FEATURED_TIER_CONTENT[tier]

                return (
                  <div key={tier} className="space-y-4">
                    <div className="flex flex-col gap-2 border-b border-border/70 pb-4 md:flex-row md:items-end md:justify-between">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-semibold tracking-tight">{content.title}</h3>
                      </div>
                      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                        {content.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {people.map((person) => (
                        <PersonCard key={person.id} person={person} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="border-b py-12">
          <div className="container mx-auto px-4">
            <TestimonialList testimonials={testimonials} initialVisibleCount={6} revealCount={6} />
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-6">
              {programs.map((program) => (
                <div
                  key={program.id}
                  className={
                    isProgramLargeCard(program) ? 'md:col-span-2 lg:col-span-6' : 'lg:col-span-2'
                  }
                >
                  <ProgramCard
                    program={program}
                    defaultImage={getProgramDefaultImage(defaultImages, program.type)}
                    cohortCount={program.cohortCount}
                    totalParticipants={program.totalParticipants}
                    totalCompletions={program.totalCompletions}
                  />
                </div>
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

      {featuredEvents.length > 0 && (
        <section className="border-b py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between gap-4 mb-8">
              <h2 className="text-3xl font-bold">Events</h2>
              <Link
                href="/events"
                className={cn(buttonVariants({ variant: 'link' }), 'h-auto p-0')}
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  defaultImage={getEventDefaultImage(defaultImages, event.type)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
