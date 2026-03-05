import { getPublishedGrants } from '@/lib/data'
import { GrantCard } from '@/components/dashboard/grant-card'
import { BackButton } from '@/components/ui/back-button'

export const metadata = {
  title: 'Grants | AISSA Track Record',
  description: 'Grant funding received by AI Safety South Africa.',
}

export const dynamic = 'force-dynamic'

export default async function GrantsPage() {
  const grants = await getPublishedGrants()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <BackButton className="mb-8" />
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">Grants</h1>
            <p className="text-lg text-muted-foreground">
              Funding supporting AI safety research and capacity building in South Africa.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {grants.length === 0 ? (
            <p className="text-muted-foreground">No grants to display yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {grants.map((grant) => (
                <GrantCard key={grant.id} grant={grant} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
