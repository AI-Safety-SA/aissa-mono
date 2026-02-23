import {
  getImpactStats,
  getProgramsWithStats,
  getRecentEvents,
  getFeaturedProjects,
  getTestimonials,
  getFeaturedPeople,
} from '@/lib/data'
import { StatsCard } from '@/components/dashboard/stats-card'
import { ProgramCard } from '@/components/dashboard/program-card'
import { EventCard } from '@/components/dashboard/event-card'
import { ProjectCard } from '@/components/dashboard/project-card'
import { PersonCard } from '@/components/dashboard/person-card'
import { TestimonialCarousel } from '@/components/dashboard/testimonial-carousel'
import Link from 'next/link'
import { Users, Calendar, GraduationCap, FolderKanban } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Force dynamic rendering to prevent static generation during build
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [stats, programs, events, projects, testimonials, featuredPeople] = await Promise.all([
    getImpactStats(),
    getProgramsWithStats(6),
    getRecentEvents(6),
    getFeaturedProjects(6),
    getTestimonials(9),
    getFeaturedPeople(6),
  ])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Compact */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">
            AI Safety South Africa
          </h1>
          <p className="text-lg text-muted-foreground">
            Building a community dedicated to the safe development and deployment of artificial
            intelligence in South Africa.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          </div>
        </div>
      </section>

      {/* Featured People Section */}
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

      {/* Programs Section */}
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

      {/* Events Section */}
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

      {/* Projects Section */}
      {projects.length > 0 && (
        <section className="border-b py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between gap-4 mb-8">
              <h2 className="text-3xl font-bold">Featured Projects</h2>
              <Link
                href="/projects"
                className={cn(buttonVariants({ variant: 'link' }), 'h-auto p-0')}
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
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
