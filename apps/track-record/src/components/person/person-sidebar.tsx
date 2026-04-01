import Link from 'next/link'
import { format } from 'date-fns'
import { Calendar, ExternalLink, Activity } from 'lucide-react'
import { TestimonialItem } from '@/components/dashboard/testimonial-item'
import { Badge } from '@/components/ui/badge'
import { getTestimonialContextBadgeDetails } from '@/lib/context-name'
import type { Person, Testimonial } from '@/payload-types'

interface PersonSidebarProps {
  person: Person
  testimonials: Testimonial[]
}

function getAttribution(testimonial: Testimonial): { title: string | null } {
  const title = testimonial.attributionTitle || null

  return {
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
              const attribution = getAttribution(testimonial)
              const contextBadgeDetails = getTestimonialContextBadgeDetails(testimonial.context)
              const contextBadge = (
                <Badge variant="secondary" className="max-w-full shrink-0 whitespace-normal text-xs">
                  {contextBadgeDetails.label}
                </Badge>
              )

              return (
                <blockquote key={testimonial.id} className="space-y-2 border-l-2 border-primary/20 pl-4">
                  <TestimonialItem quote={testimonial.quote} />
                  <footer className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {contextBadgeDetails.href ? (
                      <Link
                        href={contextBadgeDetails.href}
                        className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {contextBadge}
                      </Link>
                    ) : (
                      contextBadge
                    )}
                    {attribution.title ? <span>{attribution.title}</span> : null}
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
