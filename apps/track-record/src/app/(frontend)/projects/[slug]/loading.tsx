import { Skeleton } from '@/components/ui/skeleton'

function ProjectHeaderSkeleton() {
  return (
    <header className="border-b bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Back button placeholder */}
        <Skeleton className="h-9 w-24 mb-6" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          {/* Left side: Title and info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="h-10 w-64 md:h-12 md:w-96" />
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>

          {/* Right side: Stats */}
          <div className="flex gap-6 border rounded-lg p-6 bg-background shadow-sm">
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-8 w-12" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <ProjectHeaderSkeleton />

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Description section */}
            <section>
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </section>

            {/* Contributors section */}
            <section>
              <Skeleton className="h-8 w-40 mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 border rounded-lg p-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
