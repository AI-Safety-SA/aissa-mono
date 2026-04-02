import { PersonMajorImpacts } from './person-major-impacts'
import { RichTextRenderer } from './rich-text-renderer'
import type { Person } from '@/payload-types'
import type { MajorImpactCard } from '@/lib/types'

interface PersonMainContentProps {
  majorImpacts: MajorImpactCard[]
  person: Person
}

export function PersonMainContent({ person, majorImpacts }: PersonMainContentProps) {
  return (
    <div className="lg:col-span-2 space-y-12">
      {person.bio && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-7 bg-primary rounded-full shrink-0" />
            <h2 className="text-2xl font-bold">About</h2>
          </div>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed text-muted-foreground">{person.bio}</p>
          </div>
        </section>
      )}

      {person.featuredStory && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-7 bg-primary rounded-full shrink-0" />
            <h2 className="text-2xl font-bold">Featured Story</h2>
          </div>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <RichTextRenderer content={person.featuredStory} />
          </div>
        </section>
      )}

      {(person.totalImpacts ?? 0) > 0 || majorImpacts.length > 0 ? (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-7 bg-primary rounded-full shrink-0" />
            <h2 className="text-2xl font-bold">Major Impacts</h2>
          </div>
          <PersonMajorImpacts items={majorImpacts} />
        </section>
      ) : null}
    </div>
  )
}
