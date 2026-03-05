import { getPublishedGrants } from '@/lib/data'
import { GrantCard } from '@/components/dashboard/grant-card'
import { PageHeader } from '@/components/ui/page-header'

export const metadata = {
  title: 'Grants | AISSA Track Record',
  description: 'Grant funding received by AI Safety South Africa.',
}

export const dynamic = 'force-dynamic'

export default async function GrantsPage() {
  const grants = await getPublishedGrants()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        title="Grants"
        description="Funding supporting AI safety research and capacity building in South Africa."
        size="compact"
        leftClassName="max-w-3xl"
      />

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
