import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Event } from '@/payload-types'
import { format } from 'date-fns'
import { Calendar, MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface EventCardProps {
  event: Event
}

const eventTypeLabels: Record<string, string> = {
  workshop: 'Workshop',
  talk: 'Talk',
  meetup: 'Meetup',
  reading_group: 'Reading Group',
  retreat: 'Retreat',
  panel: 'Panel',
}

export function EventCard({ event }: EventCardProps) {
  const typeLabel = eventTypeLabels[event.type || ''] || event.type

  // Get highlighted image
  const highlightedImage = event.images?.find(
    (img) => img.isHighlighted && img.image && typeof img.image === 'object',
  )
  const imageUrl =
    highlightedImage?.image && typeof highlightedImage.image === 'object'
      ? highlightedImage.image.url
      : null
  const imageAlt =
    highlightedImage?.image && typeof highlightedImage.image === 'object'
      ? highlightedImage.image.alt
      : event.name

  return (
    <Card className="h-full flex flex-col overflow-hidden group hover:shadow-lg transition-all duration-300">
      {/* Image at top */}
      {imageUrl && (
        <div className="relative w-full aspect-video overflow-hidden">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Badge overlay */}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="text-xs shadow-sm">
              {typeLabel}
            </Badge>
          </div>
        </div>
      )}

      <CardContent className="p-4 flex flex-col flex-1">
        {/* Title */}
        <Link href={`/events/${event.slug}`} className="hover:text-primary transition-colors mb-3">
          <h3 className="text-lg font-semibold leading-tight line-clamp-2">{event.name}</h3>
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
