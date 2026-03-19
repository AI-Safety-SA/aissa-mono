import { Skeleton } from '@/components/ui/skeleton'
import { CardSkeleton } from '@/components/skeletons/card-skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section Skeleton */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl space-y-6">
            <Skeleton className="h-12 w-3/4 md:h-16" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
            <div className="flex flex-wrap gap-3 pt-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section Skeleton */}
      <section className="border-b py-12">
        <div className="container mx-auto px-4">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border rounded-lg p-6 bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-8 w-8" />
                </div>
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured People Section Skeleton */}
      <section className="border-b py-12">
        <div className="container mx-auto px-4">
          <Skeleton className="mb-3 h-4 w-40" />
          <Skeleton className="mb-3 h-10 w-72" />
          <Skeleton className="mb-8 h-5 w-full max-w-2xl" />

          <div className="space-y-10">
            {[1, 2, 3].map((tier) => (
              <div key={tier} className="space-y-4">
                <div className="border-b pb-4">
                  <Skeleton className="mb-2 h-3 w-28" />
                  <Skeleton className="mb-2 h-8 w-52" />
                  <Skeleton className="h-4 w-full max-w-xl" />
                </div>
                <CardSkeleton count={3} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section Skeleton */}
      <section className="border-b py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 mb-8">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-6 w-16" />
          </div>
          <CardSkeleton count={3} />
        </div>
      </section>

      {/* Events Section Skeleton */}
      <section className="border-b py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 mb-8">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-6 w-16" />
          </div>
          <CardSkeleton count={3} />
        </div>
      </section>

      {/* Projects Section Skeleton */}
      <section className="border-b py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 mb-8">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-6 w-16" />
          </div>
          <CardSkeleton count={3} />
        </div>
      </section>
    </div>
  )
}
