import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { PersonHeader } from '@/components/person/person-header'
import { PersonSidebar } from '@/components/person/person-sidebar'
import { PersonMainContent } from '@/components/person/person-main-content'
import { PersonHeaderSkeleton } from '@/components/skeletons/person-header-skeleton'
import { TimelineSkeleton } from '@/components/skeletons/timeline-skeleton'
import { PersonSidebarSkeleton } from '@/components/skeletons/person-sidebar-skeleton'

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

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<PersonHeaderSkeleton />}>
        <PersonHeader personId={personId} />
      </Suspense>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <Suspense fallback={<TimelineSkeleton />}>
            <PersonMainContent personId={personId} />
          </Suspense>

          <Suspense fallback={<PersonSidebarSkeleton />}>
            <PersonSidebar personId={personId} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
