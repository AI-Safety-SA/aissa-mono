import { getAllPeople } from '@/lib/data'
import { CommunityPersonCard } from '@/components/dashboard/community-person-card'
import type { Person } from '@/payload-types'

export const metadata = {
  title: 'Community | AISSA Track Record',
  description: 'Meet the AI Safety South Africa community members.',
}

// Force dynamic rendering to prevent static generation during build
export const dynamic = 'force-dynamic'

export default async function PeoplePage() {
  const people = await getAllPeople()

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">Community</h1>
            <p className="text-lg text-muted-foreground">
              Meet the people who make up the AI Safety South Africa community, sorted by their
              weighted community score.
            </p>
          </div>
        </div>
      </section>

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
