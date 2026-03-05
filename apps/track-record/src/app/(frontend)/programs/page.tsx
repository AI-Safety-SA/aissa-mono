import { getProgramsWithStats } from '@/lib/data'
import { ProgramCard } from '@/components/dashboard/program-card'
import { PageHeader } from '@/components/ui/page-header'

export const metadata = {
  title: 'Programs | AISSA Track Record',
  description: "AISSA's programs: fellowships, courses, and more.",
}

// Force dynamic rendering to prevent static generation during build
export const dynamic = 'force-dynamic'

export default async function ProgramsPage() {
  const programs = await getProgramsWithStats()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        title="Programs"
        description="Fellowships, courses, and other initiatives building capacity for safe AI in South Africa."
        size="compact"
        leftClassName="max-w-3xl"
      />

      <section className="py-12">
        <div className="container mx-auto px-4">
          {programs.length === 0 ? (
            <p className="text-muted-foreground">No programs to display yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  cohortCount={program.cohortCount}
                  totalParticipants={program.totalParticipants}
                  totalCompletions={program.totalCompletions}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
