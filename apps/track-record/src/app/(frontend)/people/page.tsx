import { notFound } from 'next/navigation'
import { getAllPeople } from '@/lib/data'
import { CommunityPersonCard } from '@/components/dashboard/community-person-card'
import { PageHeader } from '@/components/ui/page-header'
import type { Person } from '@/payload-types'

export const metadata = {
  title: 'Community | AISSA Track Record',
  description: 'Meet the AI Safety South Africa community members.',
}

// Force dynamic rendering to prevent static generation during build
export const dynamic = 'force-dynamic'

export default async function PeoplePage() {
  notFound()
  const people = await getAllPeople()

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Community"
        description="Meet the people who make up the AI Safety South Africa community, sorted by their weighted community score."
        size="compact"
        showBackButton={false}
        leftClassName="max-w-3xl"
      />

      <section className="py-12">
        <div className="container mx-auto px-4">
          {people.length === 0 ? (
            <p className="text-muted-foreground">No community members to display yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {people.map((person) => (
                <CommunityPersonCard key={(person as Person).id} person={person as Person} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
