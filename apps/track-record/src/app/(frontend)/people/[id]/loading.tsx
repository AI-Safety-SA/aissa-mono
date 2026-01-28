import { PersonHeaderSkeleton } from '@/components/skeletons/person-header-skeleton'
import { TimelineSkeleton } from '@/components/skeletons/timeline-skeleton'
import { PersonSidebarSkeleton } from '@/components/skeletons/person-sidebar-skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <PersonHeaderSkeleton />

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <TimelineSkeleton />
          <PersonSidebarSkeleton />
        </div>
      </main>
    </div>
  )
}
