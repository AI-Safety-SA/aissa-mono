import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Event, Media } from '@/payload-types'
import { getHighlightedImage } from '@/lib/default-images'
import { getMediaPublicUrl } from '@/utilities/media-url'
import { format } from 'date-fns'
import { BookOpen, Calendar, MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface EventCardProps {
  event: Event
  defaultImage?: Media | null
}

const eventTypeLabels: Record<string, string> = {
  workshop: 'Workshop',
  talk: 'Talk',
  meetup: 'Meetup',
  reading_group: 'Reading Group',
  retreat: 'Retreat',
  panel: 'Panel',
  other: 'Other',
}

export function EventCard({ event, defaultImage = null }: EventCardProps) {
  const typeLabel = eventTypeLabels[event.type || ''] || event.type

  const cardImage = getHighlightedImage(event.images) ?? defaultImage
  const imageUrl = getMediaPublicUrl(cardImage)
  const imageAlt = cardImage?.alt || event.name

  return (
    <Card className="h-full flex flex-col overflow-hidden group hover:shadow-lg transition-all duration-300">
      {/* Image at top */}
      <div className="relative w-full aspect-video overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-muted via-muted/80 to-muted-foreground/10" />
        )}
        {/* Badge overlay */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="text-xs shadow-sm">
            {typeLabel}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-1">
        {/* Title */}
        <Link href={`/events/${event.slug}`} className="hover:text-primary transition-colors mb-3">
          <h3 className="text-lg font-semibold leading-tight line-clamp-2 flex items-start gap-2">
            {event.type === 'reading_group' && (
              <BookOpen className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            )}
            {event.name}
          </h3>
        </Link>

        {/* Event details */}
        <ul className="space-y-2 text-sm text-muted-foreground">
          {event.eventDate && (
            <li className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <span>{format(new Date(event.eventDate), 'MMM d, yyyy')}</span>
            </li>
          )}
          {event.location && (
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">{event.location}</span>
            </li>
          )}
          {event.attendanceCount && (
            <li className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary shrink-0" />
              <span>{event.attendanceCount} attendees</span>
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  )
}
