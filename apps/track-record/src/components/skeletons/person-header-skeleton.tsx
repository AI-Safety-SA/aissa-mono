import { Skeleton } from '@/components/ui/skeleton'

export function PersonHeaderSkeleton() {
  return (
    <header className="border-b bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Back button placeholder */}
        <Skeleton className="h-9 w-24 mb-6" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          {/* Left side: Avatar + Name */}
          <div className="flex items-start gap-6">
            {/* Avatar placeholder */}
            <Skeleton className="h-24 w-24 md:h-32 md:w-32 rounded-full shrink-0" />

            <div className="space-y-3">
              {/* Community Member label */}
              <Skeleton className="h-5 w-32" />

              {/* Name */}
              <Skeleton className="h-10 w-64 md:h-12 md:w-80" />

              {/* Badge */}
              <Skeleton className="h-6 w-28" />
            </div>
          </div>

          {/* Right side: Stats */}
          <div className="flex gap-8 border rounded-lg p-6 bg-background shadow-sm">
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
            <div className="border-r" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-16" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
