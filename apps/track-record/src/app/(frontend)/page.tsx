import { getImpactStats, getFeaturedPrograms, getRecentEvents, getFeaturedProjects, getTestimonials } from '@/lib/data'
import { StatsCard } from '@/components/dashboard/stats-card'
import { ProgramCard } from '@/components/dashboard/program-card'
import { EventCard } from '@/components/dashboard/event-card'
import { ProjectCard } from '@/components/dashboard/project-card'
import { TestimonialCarousel } from '@/components/dashboard/testimonial-carousel'
import Link from 'next/link'
import { Users, Calendar, GraduationCap, FolderKanban } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function HomePage() {
  const [stats, programs, events, projects, testimonials] = await Promise.all([
    getImpactStats(),
    getFeaturedPrograms(6),
    getRecentEvents(6),
    getFeaturedProjects(6),
    getTestimonials(6),
  ])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
              AI Safety South Africa
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Building a community dedicated to the safe development and deployment of artificial
              intelligence in South Africa.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/programs" className={cn(buttonVariants({ variant: 'default' }))}>
                Explore Programs
              </Link>
              <Link href="/events" className={cn(buttonVariants({ variant: 'secondary' }))}>
                Browse Events
              </Link>
              <Link href="/projects" className={cn(buttonVariants({ variant: 'outline' }))}>
                View Projects
              </Link>
            </div>
          </div>
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
                <ProgramCard key={program.id} program={program} />
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
