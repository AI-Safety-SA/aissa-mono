import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { BackButton } from '@/components/ui/back-button'
import { RichTextRenderer } from '@/components/person/rich-text-renderer'
import {
  GraduationCap,
  Calendar,
  Users,
  LayoutGrid,
  FileText,
  ClipboardList,
  CheckCircle,
  UserCheck,
  Percent,
} from 'lucide-react'
import type { Program, Cohort, Media } from '@/payload-types'
import Link from 'next/link'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

interface ProgramPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ProgramPage({ params }: ProgramPageProps) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'programs',
    where: {
      slug: { equals: slug },
      isPublished: { equals: true },
    },
    limit: 1,
    depth: 1,
  })

  if (!result.docs.length) {
    notFound()
  }

  const program = result.docs[0] as Program

  // Parallelize cohorts and projects queries
  const [cohortsResult, projectsResult] = await Promise.all([
    payload.find({
      collection: 'cohorts',
      where: {
        program: { equals: program.id },
        isPublished: { equals: true },
      },
      sort: '-startDate',
      depth: 1, // Populate images
    }),
    payload.find({
      collection: 'projects',
      where: {
        program: { equals: program.id },
        isPublished: { equals: true },
      },
      limit: 0, // Just count
    }),
  ])

  const cohorts = cohortsResult.docs as Cohort[]
  const totalParticipants = cohorts.reduce((sum, c) => sum + (c.acceptedCount || 0), 0)
  const totalCompletions = cohorts.reduce((sum, c) => sum + (c.completionCount || 0), 0)
  const projectCount = projectsResult.totalDocs

  // Collect all images from program and cohorts
  const allImages: { image: Media; caption?: string | null; source: string }[] = []

  // Add program images
  if (program.images?.length) {
    program.images.forEach((img) => {
      if (img.image && typeof img.image === 'object' && img.image.url) {
        allImages.push({
          image: img.image,
          caption: img.caption,
          source: program.name,
        })
      }
    })
  }

  // Add cohort images
  cohorts.forEach((cohort) => {
    if (cohort.images?.length) {
      cohort.images.forEach((img) => {
        if (img.image && typeof img.image === 'object' && img.image.url) {
          allImages.push({
            image: img.image,
            caption: img.caption,
            source: cohort.name,
          })
        }
      })
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <BackButton className="mb-6" />
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Program Details
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{program.name}</h1>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <Badge variant="secondary" className="text-sm">
                  {program.type}
                </Badge>
                {program.startDate && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(program.startDate), 'MMM yyyy')}
                      {program.endDate ? ` - ${format(new Date(program.endDate), 'MMM yyyy')}` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-6 border rounded-lg p-6 bg-background shadow-sm">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Registered</span>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {totalParticipants}
                </div>
              </div>
              <div className="border-r hidden sm:block" />
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Completed</span>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  {totalCompletions}
                </div>
              </div>
              <div className="border-r hidden sm:block" />
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Cohorts</span>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <LayoutGrid className="h-5 w-5 text-primary" />
                  {cohorts.length}
                </div>
              </div>
              {projectCount > 0 && (
                <>
                  <div className="border-r hidden sm:block" />
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Projects</span>
                    <div className="text-2xl font-bold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      {projectCount}
                    </div>
                  </div>
                </>
              )}
              {program.applicationCount && (
                <>
                  <div className="border-r hidden sm:block" />
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Applications</span>
                    <div className="text-2xl font-bold flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-primary" />
                      {program.applicationCount}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {program.description && (
              <section>
                <h2 className="text-2xl font-bold mb-6">About the Program</h2>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <RichTextRenderer
                    content={program.description}
                    className="text-lg leading-relaxed text-muted-foreground"
                  />
                </div>
              </section>
            )}

            {cohorts.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6">Cohorts</h2>
                <div className="space-y-4">
                  {cohorts.map((cohort) => (
                    <div
                      key={cohort.id}
                      className="border rounded-lg p-6 bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-bold text-lg">{cohort.name}</h3>
                          <Link
                            href={`/programs/${program.slug}/cohorts/${cohort.slug}`}
                            className="text-primary text-sm hover:underline underline-offset-4"
                          >
                            View cohort details
                          </Link>
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(cohort.startDate), 'MMM d, yyyy')}
                            {cohort.endDate
                              ? ` - ${format(new Date(cohort.endDate), 'MMM d, yyyy')}`
                              : ''}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-4 sm:gap-6">
                          {cohort.acceptedCount != null && (
                            <div className="text-center min-w-[70px]">
                              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                <Users className="h-3 w-3" />
                                Registered
                              </div>
                              <div className="font-bold text-lg">{cohort.acceptedCount}</div>
                            </div>
                          )}
                          {cohort.completionCount != null && (
                            <div className="text-center min-w-[70px]">
                              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                <UserCheck className="h-3 w-3" />
                                Completed
                              </div>
                              <div className="font-bold text-lg text-green-600">
                                {cohort.completionCount}
                              </div>
                            </div>
                          )}
                          {cohort.completionRate != null && (
                            <div className="text-center min-w-[70px]">
                              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                <Percent className="h-3 w-3" />
                                Rate
                              </div>
                              <div className="font-bold text-lg">{cohort.completionRate}%</div>
                            </div>
                          )}
                          {cohort.averageRating != null && (
                            <div className="text-center min-w-[70px]">
                              <div className="text-xs text-muted-foreground">Rating</div>
                              <div className="font-bold text-lg">{cohort.averageRating}/10</div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Suspense fallback={<CohortSectionLoading label="testimonials" />}>
                          <CohortTestimonialsSection cohortId={cohort.id} />
                        </Suspense>
                        <Suspense fallback={<CohortSectionLoading label="projects" />}>
                          <CohortProjectsSection cohortId={cohort.id} />
                        </Suspense>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {allImages.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6">Photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {allImages.map((item, index) => (
                    <div key={`${item.image.id}-${index}`} className="group relative">
                      <div className="aspect-[4/3] relative overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={item.image.url!}
                          alt={item.image.alt || item.caption || `Photo from ${item.source}`}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                      </div>
                      {item.caption && (
                        <p className="mt-2 text-sm text-muted-foreground">{item.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function CohortSectionLoading({ label }: { label: string }) {
  return (
    <div className="rounded-md border bg-background p-4">
      <p className="text-sm text-muted-foreground">Loading {label}...</p>
    </div>
  )
}

async function CohortTestimonialsSection({ cohortId }: { cohortId: number }) {
  const payload = await getPayload({ config })
  const testimonialsResult = await payload.find({
    collection: 'testimonials',
    where: {
      and: [{ contextKind: { equals: 'cohort' } }, { isPublished: { equals: true } }],
    },
    limit: 0,
    sort: '-contextDate',
    depth: 1,
  })

  const cohortTestimonials = testimonialsResult.docs
    .filter((testimonial) => {
      if (!testimonial.context || testimonial.context.relationTo !== 'cohorts') {
        return false
      }
      const contextValue =
        typeof testimonial.context.value === 'object'
          ? testimonial.context.value.id
          : testimonial.context.value
      return contextValue === cohortId
    })
    .slice(0, 3)

  return (
    <div className="rounded-md border bg-background p-4 space-y-3">
      <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
        Testimonials
      </h4>
      {cohortTestimonials.length === 0 ? (
        <p className="text-sm text-muted-foreground">No testimonials yet.</p>
      ) : (
        <div className="space-y-3">
          {cohortTestimonials.map((testimonial) => (
            <blockquote key={testimonial.id} className="border-l-2 pl-3 text-sm">
              <p className="italic">"{testimonial.quote}"</p>
              {(testimonial.attributionName || testimonial.attributionTitle) && (
                <footer className="mt-1 text-xs text-muted-foreground">
                  {testimonial.attributionName || 'Anonymous'}
                  {testimonial.attributionTitle ? `, ${testimonial.attributionTitle}` : ''}
                </footer>
              )}
            </blockquote>
          ))}
        </div>
      )}
    </div>
  )
}

async function CohortProjectsSection({ cohortId }: { cohortId: number }) {
  const payload = await getPayload({ config })
  const engagementsResult = await payload.find({
    collection: 'engagements',
    where: {
      contextKind: { equals: 'cohort' },
    },
    limit: 0,
    depth: 0,
  })

  const participantIds = Array.from(
    new Set(
      engagementsResult.docs
        .filter((engagement) => {
          if (engagement.context.relationTo !== 'cohorts') return false
          const contextValue =
            typeof engagement.context.value === 'object'
              ? engagement.context.value.id
              : engagement.context.value
          return contextValue === cohortId
        })
        .map((engagement) =>
          typeof engagement.person === 'object' ? engagement.person.id : engagement.person,
        ),
    ),
  )

  if (participantIds.length === 0) {
    return (
      <div className="rounded-md border bg-background p-4">
        <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
          Projects
        </h4>
        <p className="text-sm text-muted-foreground">No projects yet.</p>
      </div>
    )
  }

  const contributorsResult = await payload.find({
    collection: 'project-contributors',
    where: {
      person: { in: participantIds },
    },
    limit: 0,
    depth: 1,
  })

  const projectsById = new Map<number, { id: number; slug: string; title: string }>()
  contributorsResult.docs.forEach((contributor) => {
    const project = typeof contributor.project === 'object' ? contributor.project : null
    if (!project?.isPublished) return
    projectsById.set(project.id, { id: project.id, slug: project.slug, title: project.title })
  })

  const projects = Array.from(projectsById.values()).slice(0, 5)

  return (
    <div className="rounded-md border bg-background p-4">
      <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
        Projects
      </h4>
      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">No projects yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {projects.map((project) => (
            <li key={project.id}>
              <Link href={`/projects/${project.slug}`} className="text-sm text-primary hover:underline">
                {project.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
