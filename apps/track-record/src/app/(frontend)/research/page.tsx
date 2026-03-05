import { getPublishedResearch } from '@/lib/data'
import { ResearchCard } from '@/components/dashboard/research-card'
import { PageHeader } from '@/components/ui/page-header'

export const metadata = {
  title: 'Research | AISSA Track Record',
  description: 'Research publications from the AI Safety South Africa community.',
}

export const dynamic = 'force-dynamic'

export default async function ResearchPage() {
  const research = await getPublishedResearch()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        title="Research"
        description="Publications and papers from the AI safety research community in South Africa."
        size="compact"
        leftClassName="max-w-3xl"
      />

      <section className="py-12">
        <div className="container mx-auto px-4">
          {research.length === 0 ? (
            <p className="text-muted-foreground">No research publications to display yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {research.map((item) => (
                <ResearchCard key={item.id} research={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
