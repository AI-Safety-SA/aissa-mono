import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { BackButton } from '@/components/ui/back-button'
import { GraduationCap, Calendar, Users, LayoutGrid } from 'lucide-react'
import type { Program, Cohort } from '@/payload-types'

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

  // Get cohorts for this program
  const cohortsResult = await payload.find({
    collection: 'cohorts',
    where: {
      program: { equals: program.id },
      isPublished: { equals: true },
    },
    sort: '-startDate',
  })

  const cohorts = cohortsResult.docs as Cohort[]
  const totalParticipants = cohorts.reduce((sum, c) => sum + (c.acceptedCount || 0), 0)

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
            <div className="flex gap-8 border rounded-lg p-6 bg-background shadow-sm">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Participants</span>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {totalParticipants}
                </div>
              </div>
              <div className="border-r" />
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Cohorts</span>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <LayoutGrid className="h-5 w-5 text-primary" />
                  {cohorts.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold mb-6">About the Program</h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                {/* Rich text would go here */}
                <p className="text-lg leading-relaxed text-muted-foreground">
                  This program focuses on building core competencies and community within AI safety
                  in South Africa. Participants engage with cutting-edge research and collaborate
                  on projects that address global challenges through a local lens.
                </p>
              </div>
            </section>

            {cohorts.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6">Cohorts</h2>
                <div className="space-y-4">
                  {cohorts.map((cohort) => (
                    <div
                      key={cohort.id}
                      className="border rounded-lg p-6 bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-bold text-lg">{cohort.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(cohort.startDate), 'MMM d, yyyy')}
                            {cohort.endDate ? ` - ${format(new Date(cohort.endDate), 'MMM d, yyyy')}` : ''}
                          </p>
                        </div>
                        <div className="flex gap-6">
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Applicants</div>
                            <div className="font-bold">{cohort.applicationCount || 0}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Completed</div>
                            <div className="font-bold">{cohort.completionCount || 0}</div>
                          </div>
                          {cohort.averageRating && (
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">Rating</div>
                              <div className="font-bold">{cohort.averageRating}/10</div>
                            </div>
                          )}
                        </div>
                      </div>
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
