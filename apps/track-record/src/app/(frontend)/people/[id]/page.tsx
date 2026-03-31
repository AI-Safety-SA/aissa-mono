import { notFound } from 'next/navigation'
import { PersonHeader } from '@/components/person/person-header'
import { PersonSidebar } from '@/components/person/person-sidebar'
import { PersonMainContent } from '@/components/person/person-main-content'
import { getPersonDetailsPageData } from '@/lib/data'
import { PersonTimelineExplorer } from '@/components/person/person-timeline-explorer'

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

  const { person, majorImpacts, fullTimelineRows, testimonials } = await getPersonDetailsPageData(personId)

  if (!person || !person.isPublished || (!person.highlight && !person.featuredTier)) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <PersonHeader person={person} />

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <PersonMainContent person={person} majorImpacts={majorImpacts} />

          <PersonSidebar person={person} testimonials={testimonials} />

          <PersonTimelineExplorer rows={fullTimelineRows} />
        </div>
      </main>
    </div>
  )
}
