import Link from 'next/link'
import type { Cohort, Event, Program, Testimonial } from '@/payload-types'
import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { TestimonialItem } from '@/components/dashboard/testimonial-item'

interface TestimonialListProps {
  testimonials: Testimonial[]
}

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
  // Convert 1-10 scale to 1-5 stars.
  const starCount = Math.max(1, Math.round((rating / 10) * 5))

  return (
    <div className="flex gap-0.5" aria-label={`${starCount} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={
            index < starCount
              ? 'h-3.5 w-3.5 fill-primary text-primary'
              : 'h-3.5 w-3.5 fill-transparent text-muted-foreground'
          }
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
      <h2 className="mb-8 text-3xl font-bold">What Participants Say</h2>

      <div className="space-y-3">
        {sorted.map((testimonial) => {
          const attributionName =
            typeof testimonial.person === 'object' && testimonial.person
              ? testimonial.person.fullName || 'Anonymous'
              : testimonial.attributionName || 'Anonymous'

          const attributionTitle = testimonial.attributionTitle
          const context = getContextDetails(testimonial)
          const contextBadge = (
            <Badge variant="secondary" className="shrink-0 text-xs">
              {context?.label}
            </Badge>
          )

          return (
            <Card
              key={testimonial.id}
              className="border-border bg-card text-card-foreground transition-shadow duration-200 hover:shadow-md"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-card-foreground">{attributionName}</p>
                    {attributionTitle && (
                      <p className="text-xs text-muted-foreground">{attributionTitle}</p>
                    )}
                  </div>
                  {context &&
                    (context.href ? (
                      <Link
                        href={context.href}
                        className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {contextBadge}
                      </Link>
                    ) : (
                      contextBadge
                    ))}
                </div>
              </CardHeader>

              <CardContent>
                <TestimonialItem quote={testimonial.quote} />
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
