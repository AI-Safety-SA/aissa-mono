import type { Testimonial, Event, Program, Cohort } from '@/payload-types'
import { Star } from 'lucide-react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TestimonialListProps {
  testimonials: Testimonial[]
}

const EXPAND_THRESHOLD = 200

function getContextDetails(testimonial: Testimonial): { label: string; href?: string } | null {
  if (!testimonial.context) return null

  const { relationTo, value } = testimonial.context

  if (!value || typeof value === 'number') return null

  if (relationTo === 'events') {
    const event = value as Event
    return {
      label: event.name,
      href: `/events/${event.slug}`,
    }
  }

  if (relationTo === 'programs') {
    const program = value as Program
    return {
      label: program.name,
      href: `/programs/${program.slug}`,
    }
  }

  if (relationTo === 'cohorts') {
    const cohort = value as Cohort
    const programName =
      typeof cohort.program === 'object' ? (cohort.program as Program).name : null
    return {
      label: programName ? `${cohort.name} · ${programName}` : cohort.name,
    }
  }

  return null
}

function StarRating({ rating }: { rating: number }) {
  // Convert 1–10 scale to 1–5 stars
  const starCount = Math.max(1, Math.round((rating / 10) * 5))
  return (
    <div className="flex gap-0.5" aria-label={`${starCount} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < starCount ? 'fill-primary text-primary' : 'fill-muted text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  )
}

export function TestimonialList({ testimonials }: TestimonialListProps) {
  if (testimonials.length === 0) {
    return null
  }

  const sorted = [...testimonials].sort((a, b) => {
    const aScore = a.priorityScore ?? 0
    const bScore = b.priorityScore ?? 0
    return bScore - aScore
  })

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-8">What Participants Say</h2>

      <div className="space-y-3">
        {sorted.map((testimonial) => {
          const attributionName =
            typeof testimonial.person === 'object' && testimonial.person
              ? testimonial.person.fullName || 'Anonymous'
              : testimonial.attributionName || 'Anonymous'

          const attributionTitle = testimonial.attributionTitle
          const context = getContextDetails(testimonial)
          const isLong = testimonial.quote.length > EXPAND_THRESHOLD

          return (
            <Card
              key={testimonial.id}
              className="hover:shadow-md transition-shadow duration-200"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-sm">{attributionName}</p>
                    {attributionTitle && (
                      <p className="text-xs text-muted-foreground">{attributionTitle}</p>
                    )}
                  </div>
                  {context && (
                    <Badge variant="secondary" className="shrink-0 text-[0.65rem]">
                      {context.label}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {isLong ? (
                  <>
                    <p className="line-clamp-3 text-sm leading-relaxed italic">
                      {testimonial.quote}
                    </p>
                    <details className="group">
                      <summary className="mt-2 cursor-pointer list-none text-xs font-medium text-primary hover:underline group-open:hidden">
                        Read more
                      </summary>
                      <p className="mt-2 text-sm leading-relaxed italic text-foreground/90">
                        {testimonial.quote}
                      </p>
                      <details open>
                        <summary className="mt-2 cursor-pointer list-none text-xs font-medium text-primary hover:underline">
                          Collapse
                        </summary>
                      </details>
                    </details>
                  </>
                ) : (
                  <p className="text-sm leading-relaxed italic">{testimonial.quote}</p>
                )}
              </CardContent>

              {testimonial.rating != null && (
                <CardFooter>
                  <StarRating rating={testimonial.rating} />
                </CardFooter>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
