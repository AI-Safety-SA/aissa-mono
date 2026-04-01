'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Testimonial } from '@/payload-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { TestimonialItem } from '@/components/dashboard/testimonial-item'
import { getTestimonialContextBadgeDetails } from '@/lib/context-name'

interface TestimonialListProps {
  testimonials: Testimonial[]
  initialVisibleCount?: number
  revealCount?: number
}

export function TestimonialList({
  testimonials,
  initialVisibleCount,
  revealCount,
}: TestimonialListProps) {
  const sorted = [...testimonials].sort((a, b) => {
    const aScore = a.priorityScore ?? 0
    const bScore = b.priorityScore ?? 0
    return bScore - aScore
  })
  const hasIncrementalReveal =
    typeof initialVisibleCount === 'number' &&
    initialVisibleCount > 0 &&
    typeof revealCount === 'number' &&
    revealCount > 0
  const [visibleCount, setVisibleCount] = useState(
    hasIncrementalReveal ? initialVisibleCount : sorted.length,
  )

  useEffect(() => {
    setVisibleCount(hasIncrementalReveal ? initialVisibleCount : sorted.length)
  }, [hasIncrementalReveal, initialVisibleCount, sorted.length])

  if (testimonials.length === 0) {
    return null
  }

  const visibleTestimonials = sorted.slice(0, visibleCount)
  const hasMore = hasIncrementalReveal && visibleCount < sorted.length

  return (
    <div className="w-full">
      <h2 className="mb-8 text-3xl font-bold">What Participants Say</h2>

      <div className="space-y-3">
        {visibleTestimonials.map((testimonial) => {
          const linkedPerson =
            typeof testimonial.person === 'object' && testimonial.person ? testimonial.person : null
          const attributionName =
            linkedPerson?.fullName || testimonial.attributionName || 'Anonymous'

          const attributionTitle = testimonial.attributionTitle
          const contextBadgeDetails = getTestimonialContextBadgeDetails(testimonial.context)
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
                  {linkedPerson ? (
                    <Link
                      href={`/people/${linkedPerson.id}`}
                      className="text-sm font-semibold text-card-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {attributionName}
                    </Link>
                  ) : (
                    <p className="text-sm font-semibold text-card-foreground">{attributionName}</p>
                  )}
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

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={() => setVisibleCount((count) => count + (revealCount ?? 0))}
          >
            Show 6 more
          </Button>
        </div>
      )}
    </div>
  )
}
