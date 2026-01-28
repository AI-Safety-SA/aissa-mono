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
  const highlightedImage = event.images?.find(img => img.isHighlighted && img.image && typeof img.image === 'object')
  const imageUrl = highlightedImage?.image && typeof highlightedImage.image === 'object' 
    ? highlightedImage.image.url 
    : null
  const imageAlt = highlightedImage?.image && typeof highlightedImage.image === 'object'
    ? highlightedImage.image.alt
    : event.name

  return (
    <Card className="h-full flex flex-col overflow-hidden relative">
      {/* Badge in top-right corner */}
      <div className="absolute top-2 right-2 z-10">
        <Badge variant="secondary" className="text-xs">
          {typeLabel}
        </Badge>
      </div>
      
      <CardContent className="p-0 flex flex-row h-full">
        {/* Left column - half width */}
        <div className="flex flex-col p-4 w-1/2 min-w-0 pr-2">
          {/* Title */}
          <Link href={`/events/${event.slug}`} className="hover:underline underline-offset-4 mb-3">
            <h3 className="text-lg font-semibold leading-tight">{event.name}</h3>
          </Link>
          
          {/* Divider */}
          <div className="border-t mb-3" />
          
          {/* Three bullet points */}
          <ul className="space-y-2 text-sm text-muted-foreground flex-1">
            {event.eventDate && (
              <li className="flex items-center gap-2">
                <Calendar className="h-3 w-3 shrink-0" />
                <span>{format(new Date(event.eventDate), 'MMM d, yyyy')}</span>
              </li>
            )}
            {event.location && (
              <li className="flex items-center gap-2">
                <MapPin className="h-3 w-3 shrink-0" />
                <span>{event.location}</span>
              </li>
            )}
            {event.attendanceCount && (
              <li className="flex items-center gap-2">
                <Users className="h-3 w-3 shrink-0" />
                <span>{event.attendanceCount} attendees</span>
              </li>
            )}
          </ul>
        </div>
        
        {/* Right column - half width with image */}
        <div className="flex flex-col w-1/2 relative">
          {imageUrl && (
            <div className="relative w-full h-full min-h-[200px]">
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

