import { PersonTimeline } from './person-timeline'
import { RichTextRenderer } from './rich-text-renderer'
import { getPersonById, getPersonTimeline } from '@/lib/data'

interface PersonMainContentProps {
  personId: number
}

export async function PersonMainContent({ personId }: PersonMainContentProps) {
  const [person, timeline] = await Promise.all([
    getPersonById(personId),
    getPersonTimeline(personId),
  ])

  if (!person) {
    return null
  }

  return (
    <div className="lg:col-span-2 space-y-12">
      {person.bio && (
        <section>
          <h2 className="text-2xl font-bold mb-6">About</h2>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed text-muted-foreground">{person.bio}</p>
          </div>
        </section>
      )}

      {person.featuredStory && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Featured Story</h2>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <RichTextRenderer content={person.featuredStory} />
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold mb-6">Journey Timeline</h2>
        <PersonTimeline items={timeline} />
      </section>
    </div>
  )
}
