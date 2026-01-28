import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { BackButton } from '@/components/ui/back-button'
import { PersonTimeline } from '@/components/person/person-timeline'
import { RichTextRenderer } from '@/components/person/rich-text-renderer'
import { getPersonById, getPersonTimeline } from '@/lib/data'
import { impactStageLabels } from '@/lib/types'
import { User, Calendar, ExternalLink, Activity, Star } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PersonPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { id } = await params
  const personId = parseInt(id, 10)

  if (isNaN(personId)) {
    notFound()
  }

  const person = await getPersonById(personId)

  if (!person || !person.isPublished) {
    notFound()
  }

  const timeline = await getPersonTimeline(personId)

  const displayName = person.preferredName || person.fullName
  const headshot =
    person.headshot && typeof person.headshot === 'object' ? person.headshot : null
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const impactStage = person.current_impact_stage
    ? impactStageLabels[person.current_impact_stage]
    : null

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <BackButton className="mb-6" />
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-muted md:h-32 md:w-32">
                {headshot?.url ? (
                  <Image
                    src={headshot.url}
                    alt={headshot.alt || displayName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 96px, 128px"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-muted-foreground md:text-4xl">
                    {initials}
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    Community Member
                  </span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  {displayName}
                </h1>
                {impactStage && (
                  <Badge variant="secondary" className="text-sm">
                    {impactStage} Stage
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-8 border rounded-lg p-6 bg-background shadow-sm">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Engagements</span>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  {person.totalEngagements || 0}
                </div>
              </div>
              <div className="border-r" />
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Impacts</span>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  {person.totalImpacts || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {person.bio && (
              <section>
                <h2 className="text-2xl font-bold mb-6">About</h2>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    {person.bio}
                  </p>
                </div>
              </section>
            )}

            {person.featuredStory && (
              <section>
                <h2 className="text-2xl font-bold mb-6">Featured Story</h2>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <RichTextRenderer content={person.featuredStory} />
                </div>
              </section>
            )}

            <section>
              <h2 className="text-2xl font-bold mb-6">Journey Timeline</h2>
              <PersonTimeline items={timeline} />
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-4">Quick Info</h3>
              <div className="space-y-4">
                {person.joinedAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-muted-foreground">Joined</div>
                      <div className="font-medium">
                        {format(new Date(person.joinedAt), 'MMMM yyyy')}
                      </div>
                    </div>
                  </div>
                )}
                {person.firstEngagementDate && (
                  <div className="flex items-center gap-3 text-sm">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-muted-foreground">First Engagement</div>
                      <div className="font-medium">
                        {format(new Date(person.firstEngagementDate), 'MMMM yyyy')}
                      </div>
                    </div>
                  </div>
                )}
                {person.websiteUrl && (
                  <div className="flex items-center gap-3 text-sm">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-muted-foreground">Website</div>
                      <a
                        href={person.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline underline-offset-4"
                      >
                        Visit website
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
