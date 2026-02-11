import { Card, CardContent } from '@/components/ui/card'
import type { Testimonial } from '@/payload-types'
import { Star, Quote } from 'lucide-react'

interface TestimonialCarouselProps {
  testimonials: Testimonial[]
}

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  if (testimonials.length === 0) {
    return null
  }

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-8">What Participants Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.slice(0, 6).map((testimonial) => {
          const attributionName =
            typeof testimonial.person === 'object' && testimonial.person
              ? testimonial.person.fullName || 'Anonymous'
              : testimonial.attributionName || 'Anonymous'

          const attributionTitle = testimonial.attributionTitle

          return (
            <Card
              key={testimonial.id}
              className="h-full relative overflow-hidden group hover:shadow-lg transition-all duration-300"
            >
              {/* Decorative quote icon */}
              <div className="absolute top-4 right-4 text-primary/10">
                <Quote className="h-8 w-8" />
              </div>

              <CardContent className="pt-6 relative">
                <div className="space-y-4">
                  {testimonial.rating &&
                    (() => {
                      // Convert 1-10 rating scale to 1-5 star display
                      const starCount = Math.max(1, Math.floor((testimonial.rating / 10) * 5))
                      return (
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < starCount
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                      )
                    })()}
                  <p className="text-sm italic leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="pt-2 border-t">
                    <p className="font-semibold text-sm">{attributionName}</p>
                    {attributionTitle && (
                      <p className="text-xs text-muted-foreground">{attributionTitle}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
