import { Skeleton } from '@/components/ui/skeleton'

export function PersonSidebarSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <Skeleton className="h-6 w-24" />

      <div className="space-y-4">
        {/* Joined date */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-4" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* First engagement */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-4" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Website */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-4" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}
