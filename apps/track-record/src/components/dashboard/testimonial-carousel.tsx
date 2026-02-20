import type { Testimonial, Event, Program, Cohort } from '@/payload-types'
import { Star } from 'lucide-react'

interface TestimonialCarouselProps {
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
  // Convert 1–10 scale to 1–5 stars
  const starCount = Math.max(1, Math.round((rating / 10) * 5))
  return (
    <div className="flex gap-0.5" aria-label={`${starCount} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < starCount ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  )
}

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  if (testimonials.length === 0) {
    return null
  }

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-8">What Participants Say</h2>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-0">
        {testimonials.map((testimonial) => {
          const attributionName =
            typeof testimonial.person === 'object' && testimonial.person
              ? testimonial.person.fullName || 'Anonymous'
              : testimonial.attributionName || 'Anonymous'

          const attributionTitle = testimonial.attributionTitle
          const context = getContextDetails(testimonial)

          return (
            <div
              key={testimonial.id}
              className="break-inside-avoid mb-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col"
            >
              {/* Accent line at top derived from context kind */}
              <div
                className={`h-0.5 w-full ${
                  testimonial.contextKind === 'event'
                    ? 'bg-blue-400'
                    : testimonial.contextKind === 'program'
                      ? 'bg-emerald-400'
                      : testimonial.contextKind === 'cohort'
                        ? 'bg-violet-400'
                        : 'bg-primary/30'
                }`}
              />

              <div className="p-5 flex flex-col gap-3 flex-1">
                {/* Opening quote mark — decorative */}
                <div
                  className="text-5xl font-serif leading-none text-primary/15 select-none -mb-2"
                  aria-hidden="true"
                >
                  &ldquo;
                </div>

                {/* Quote text */}
                <p className="text-sm leading-relaxed text-foreground/90 italic">
                  {testimonial.quote}
                </p>

                {/* Star rating */}
                {testimonial.rating != null && (
                  <StarRating rating={testimonial.rating} />
                )}

                {/* Divider */}
                <div className="border-t pt-3 mt-auto space-y-1">
                  {/* Attribution */}
                  <p className="font-semibold text-sm">{attributionName}</p>
                  {attributionTitle && (
                    <p className="text-xs text-muted-foreground">{attributionTitle}</p>
                  )}

                  {/* Context provenance */}
                  {context && (
                    <p className="text-xs text-muted-foreground/70 flex items-center gap-1 pt-0.5">
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                          testimonial.contextKind === 'event'
                            ? 'bg-blue-400'
                            : testimonial.contextKind === 'program'
                              ? 'bg-emerald-400'
                              : 'bg-violet-400'
                        }`}
                      />
                      {context.href ? (
                        <a
                          href={context.href}
                          className="hover:text-foreground/80 transition-colors underline underline-offset-2 decoration-dotted line-clamp-1"
                        >
                          {context.label}
                        </a>
                      ) : (
                        <span className="line-clamp-1">{context.label}</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
