import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { BackButton } from '@/components/ui/back-button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Calendar, Users, UserCheck, Percent, GraduationCap } from 'lucide-react'
import type { Cohort, Program } from '@/payload-types'

export const dynamic = 'force-dynamic'

interface CohortPageProps {
  params: Promise<{
    slug: string
    cohortSlug: string
  }>
}

export default async function CohortPage({ params }: CohortPageProps) {
  const { slug, cohortSlug } = await params
  const payload = await getPayload({ config })

  const [programResult, cohortResult] = await Promise.all([
    payload.find({
      collection: 'programs',
      where: {
        slug: { equals: slug },
        isPublished: { equals: true },
      },
      limit: 1,
      depth: 0,
    }),
    payload.find({
      collection: 'cohorts',
      where: {
        slug: { equals: cohortSlug },
        isPublished: { equals: true },
      },
      limit: 1,
      depth: 1,
    }),
  ])

  if (!programResult.docs.length || !cohortResult.docs.length) {
    notFound()
  }

  const program = programResult.docs[0] as Program
  const cohort = cohortResult.docs[0] as Cohort
  const cohortProgramId = typeof cohort.program === 'object' ? cohort.program.id : cohort.program

  if (cohortProgramId !== program.id) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <BackButton href={`/programs/${program.slug}`} className="mb-6" />
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <Badge variant="secondary">Cohort Details</Badge>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{cohort.name}</h1>
            <div className="flex flex-wrap gap-4 text-muted-foreground">
              <Link href={`/programs/${program.slug}`} className="text-sm text-primary hover:underline">
                {program.name}
              </Link>
              <div className="flex items-center gap-1.5 text-sm">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(cohort.startDate), 'MMM d, yyyy')}
                  {cohort.endDate ? ` - ${format(new Date(cohort.endDate), 'MMM d, yyyy')}` : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cohort.acceptedCount != null && (
            <div className="rounded-lg border bg-card p-5">
              <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                Registered
              </div>
              <div className="mt-2 text-3xl font-bold">{cohort.acceptedCount}</div>
            </div>
          )}
          {cohort.completionCount != null && (
            <div className="rounded-lg border bg-card p-5">
              <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-primary" />
                Completed
              </div>
              <div className="mt-2 text-3xl font-bold">{cohort.completionCount}</div>
            </div>
          )}
          {cohort.completionRate != null && (
            <div className="rounded-lg border bg-card p-5">
              <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Percent className="h-4 w-4 text-primary" />
                Completion Rate
              </div>
              <div className="mt-2 text-3xl font-bold">{cohort.completionRate}%</div>
            </div>
          )}
          {cohort.averageRating != null && (
            <div className="rounded-lg border bg-card p-5">
              <div className="text-sm text-muted-foreground">Average Rating</div>
              <div className="mt-2 text-3xl font-bold">{cohort.averageRating}/10</div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
