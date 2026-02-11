import { Skeleton } from '@/components/ui/skeleton'

export function TimelineSkeleton() {
  return (
    <div className="relative">
      {[1, 2, 3].map((i) => (
        <div key={i} className="relative pl-8 pb-8 last:pb-0">
          {/* Icon placeholder */}
          <Skeleton className="absolute left-0 top-0 h-6 w-6 rounded-full" />

          {/* Timeline line */}
          {i < 3 && <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-muted" />}

          {/* Card content */}
          <div className="rounded-lg border bg-card p-4 space-y-3">
            {/* Badge and date row */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>

            {/* Title/content */}
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
