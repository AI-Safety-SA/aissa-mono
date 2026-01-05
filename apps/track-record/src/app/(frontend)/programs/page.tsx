import { getPayloadInstance } from '@/lib/payload'
import { ProgramCard } from '@/components/dashboard/program-card'
import type { Program } from '@/payload-types'

export const metadata = {
  title: 'Programs | AISSA Track Record',
  description: "AISSA's programs: fellowships, courses, and more.",
}

// Force dynamic rendering to prevent static generation during build
export const dynamic = 'force-dynamic'

export default async function ProgramsPage() {
  const payload = await getPayloadInstance()

  const programs = await payload.find({
    collection: 'programs',
    where: {
      isPublished: { equals: true },
    },
    limit: 0,
    sort: '-startDate',
    depth: 1,
  })

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">Programs</h1>
            <p className="text-lg text-muted-foreground">
              Fellowships, courses, and other initiatives building capacity for safe AI in South
              Africa.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {programs.totalDocs === 0 ? (
            <p className="text-muted-foreground">No programs to display yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.docs.map((program) => (
                <ProgramCard key={(program as Program).id} program={program as Program} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
