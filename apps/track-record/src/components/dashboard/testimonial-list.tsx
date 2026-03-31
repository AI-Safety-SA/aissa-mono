import Link from 'next/link'
import type { Cohort, Event, Program, Testimonial } from '@/payload-types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { TestimonialItem } from '@/components/dashboard/testimonial-item'
import { getContextHref } from '@/lib/context-name'

interface TestimonialListProps {
  testimonials: Testimonial[]
}

function getContextName(context: Testimonial['context']): string | null {
  if (!context) return null

  const { relationTo, value } = context

  if (!value || typeof value === 'number') return null

  if (relationTo === 'events') {
    const event = value as Event
    return event.name
  }

  if (relationTo === 'programs') {
    const program = value as Program
    return program.name
  }

  if (relationTo === 'cohorts') {
    const cohort = value as Cohort
    const programName =
      typeof cohort.program === 'object' ? (cohort.program as Program).name : null
    return programName ? `${cohort.name} · ${programName}` : cohort.name
  }

  return null
}

function getFallbackContextName(context: Testimonial['context']): string | null {
  if (!context) return null

  if (context.relationTo === 'events') return 'Event'
  if (context.relationTo === 'programs') return 'Program'
  if (context.relationTo === 'cohorts') return 'Cohort'
  return null
}

function getContextBadgeDetails(testimonial: Testimonial): { label: string; href?: string } {
  const contextName =
    getContextName(testimonial.context) ?? getFallbackContextName(testimonial.context)
  const label = contextName ? `${contextName} — Testimonial` : 'General Testimonial'
  const href = getContextHref(testimonial.context) ?? undefined

  return { label, href }
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
          const contextBadgeDetails = getContextBadgeDetails(testimonial)
          const contextBadge = (
            <Badge variant="secondary" className="max-w-full shrink-0 whitespace-normal text-xs">
              {contextBadgeDetails.label}
            </Badge>
          )

          return (
            <Card
              key={testimonial.id}
              className="border-border bg-card text-card-foreground transition-shadow duration-200 hover:shadow-md"
            >
              <CardHeader className="pb-2">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-card-foreground">{attributionName}</p>
                  {attributionTitle && (
                    <p className="text-xs text-muted-foreground">{attributionTitle}</p>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <TestimonialItem quote={testimonial.quote} />
              </CardContent>

              <CardFooter>
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
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
