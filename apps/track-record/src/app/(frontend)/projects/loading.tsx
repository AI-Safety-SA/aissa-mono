import { Skeleton } from '@/components/ui/skeleton'
import { CardSkeleton } from '@/components/skeletons/card-skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-9 w-24 mb-6" />
          <Skeleton className="h-12 w-56 md:h-14 md:w-72" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between gap-4 mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-16" />
        </div>
        <CardSkeleton count={6} />
      </main>
    </div>
  )
}
