import { Card, CardContent } from '@/components/ui/card'
import type { Testimonial } from '@/payload-types'
import { Star } from 'lucide-react'

interface TestimonialCarouselProps {
  testimonials: Testimonial[]
}

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  if (testimonials.length === 0) {
    return null
  }

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-6">What Participants Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.slice(0, 6).map((testimonial) => {
          const attributionName =
            typeof testimonial.person === 'object' && testimonial.person
              ? testimonial.person.fullName || 'Anonymous'
              : testimonial.attributionName || 'Anonymous'

          const attributionTitle = testimonial.attributionTitle

          return (
            <Card key={testimonial.id} className="h-full">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {testimonial.rating &&
                    (() => {
                      // Convert 1-10 rating scale to 1-5 star display
                      // Using Math.floor to avoid upward bias for mid-range ratings
                      // This ensures rating 5 (50%) shows 2 stars (40%) instead of 3 stars (60%)
                      // Formula: floor((rating / 10) * 5) ensures accurate linear mapping
                      // Rating 1 → 0.5 → floor = 0, but we want at least 1 star for any rating
                      // Rating 5 → 2.5 → floor = 2 stars (accurate)
                      // Rating 10 → 5 → floor = 5 stars (accurate)
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
                  <p className="text-sm italic">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="text-xs text-muted-foreground">
                    <p className="font-semibold">{attributionName}</p>
                    {attributionTitle && <p>{attributionTitle}</p>}
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
