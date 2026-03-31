import Link from 'next/link'
import { format } from 'date-fns'
import { Calendar, ExternalLink, Activity } from 'lucide-react'
import { TestimonialItem } from '@/components/dashboard/testimonial-item'
import type { Person, Testimonial } from '@/payload-types'

interface PersonSidebarProps {
  person: Person
  testimonials: Testimonial[]
}

function getAttribution(
  testimonial: Testimonial,
  currentPerson: Person,
): { href: string | null; name: string; title: string | null } {
  const linkedPerson = typeof testimonial.person === 'object' ? testimonial.person : null
  const name = testimonial.attributionName || linkedPerson?.fullName || currentPerson.fullName
  const title = testimonial.attributionTitle || null
  const canLink =
    linkedPerson &&
    linkedPerson.id !== currentPerson.id &&
    linkedPerson.isPublished &&
    (linkedPerson.highlight || linkedPerson.featuredTier)

  return {
    href: canLink ? `/people/${linkedPerson.id}` : null,
    name,
    title,
  }
}

export function PersonSidebar({ person, testimonials }: PersonSidebarProps) {
  return (
    <aside className="space-y-6">
      <div className="rounded-xl border border-primary/10 bg-linear-to-br from-secondary/40 to-card p-6 shadow-sm">
        <h3 className="font-semibold mb-4 text-foreground">Quick Info</h3>
        <div className="space-y-4">
          {person.joinedAt && (
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-primary/70" />
              <div>
                <div className="text-muted-foreground">Joined</div>
                <div className="font-medium">{format(new Date(person.joinedAt), 'MMMM yyyy')}</div>
              </div>
            </div>
          )}
          {person.firstEngagementDate && (
            <div className="flex items-center gap-3 text-sm">
              <Activity className="h-4 w-4 text-primary/70" />
              <div>
                <div className="text-muted-foreground">First Engagement</div>
                <div className="font-medium">
                  {format(new Date(person.firstEngagementDate), 'MMMM yyyy')}
                </div>
              </div>
            </div>
          )}
          {person.websiteUrl && (
            <div className="flex items-center gap-3 text-sm">
              <ExternalLink className="h-4 w-4 text-primary/70" />
              <div>
                <div className="text-muted-foreground">Website</div>
                <a
                  href={person.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline underline-offset-4"
                >
                  Visit website
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {testimonials.length > 0 ? (
        <div className="rounded-xl border border-primary/10 bg-linear-to-br from-card to-secondary/20 p-6 shadow-sm">
          <h3 className="font-semibold mb-4 text-foreground">Testimonials</h3>
          <div className="space-y-5">
            {testimonials.map((testimonial) => {
              const attribution = getAttribution(testimonial, person)

              return (
                <blockquote key={testimonial.id} className="space-y-2 border-l-2 border-primary/20 pl-4">
                  <TestimonialItem quote={testimonial.quote} />
                  <footer className="text-xs text-muted-foreground">
                    {attribution.href ? (
                      <Link
                        href={attribution.href}
                        className="font-medium text-foreground hover:text-primary hover:underline underline-offset-4"
                      >
                        {attribution.name}
                      </Link>
                    ) : (
                      <span className="font-medium text-foreground">{attribution.name}</span>
                    )}
                    {attribution.title ? `, ${attribution.title}` : ''}
                  </footer>
                </blockquote>
              )
            })}
          </div>
        </div>
      ) : null}
    </aside>
  )
}
