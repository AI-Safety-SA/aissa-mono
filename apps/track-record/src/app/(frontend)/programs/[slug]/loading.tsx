import { Skeleton } from '@/components/ui/skeleton'

function ProgramHeaderSkeleton() {
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
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-10 w-64 md:h-12 md:w-96" />
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>

          {/* Right side: Stats */}
          <div className="flex flex-wrap gap-6 border rounded-lg p-6 bg-background shadow-sm">
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-8 w-12" />
              </div>
            </div>
            <div className="border-r" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-8 w-12" />
              </div>
            </div>
            <div className="border-r" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-16" />
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
      <ProgramHeaderSkeleton />

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* About section */}
            <section>
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </section>

            {/* Cohorts section */}
            <section>
              <Skeleton className="h-8 w-32 mb-6" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-6 bg-card">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="flex gap-4">
                        <div className="text-center min-w-[70px]">
                          <Skeleton className="h-3 w-16 mx-auto mb-1" />
                          <Skeleton className="h-6 w-8 mx-auto" />
                        </div>
                        <div className="text-center min-w-[70px]">
                          <Skeleton className="h-3 w-16 mx-auto mb-1" />
                          <Skeleton className="h-6 w-8 mx-auto" />
                        </div>
                      </div>
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
