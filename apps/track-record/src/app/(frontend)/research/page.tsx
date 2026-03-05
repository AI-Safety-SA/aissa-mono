import { getPublishedResearch } from '@/lib/data'
import { ResearchCard } from '@/components/dashboard/research-card'
import { BackButton } from '@/components/ui/back-button'

export const metadata = {
  title: 'Research | AISSA Track Record',
  description: 'Research publications from the AI Safety South Africa community.',
}

export const dynamic = 'force-dynamic'

export default async function ResearchPage() {
  const research = await getPublishedResearch()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <BackButton className="mb-8" />
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">Research</h1>
            <p className="text-lg text-muted-foreground">
              Publications and papers from the AI safety research community in South Africa.
            </p>
          </div>
        </div>
      </section>

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
