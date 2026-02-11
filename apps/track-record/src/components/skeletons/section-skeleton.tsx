import { Skeleton } from '@/components/ui/skeleton'

interface SectionSkeletonProps {
  itemCount?: number
}

export function SectionSkeleton({ itemCount = 3 }: SectionSkeletonProps) {
  return (
    <div className="space-y-4">
      {[...Array(itemCount)].map((_, i) => (
        <div key={i} className="border rounded-lg p-6 bg-card space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  )
}
