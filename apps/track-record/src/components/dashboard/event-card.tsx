import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Event } from '@/payload-types'
import { format } from 'date-fns'
import { Calendar, MapPin, Users } from 'lucide-react'
import Link from 'next/link'

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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <Link href={`/events/${event.slug}`} className="hover:underline underline-offset-4">
              <CardTitle className="text-lg">{event.name}</CardTitle>
            </Link>
            <CardDescription className="flex items-center gap-4 flex-wrap">
              {event.eventDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(event.eventDate), 'MMM d, yyyy')}
                </span>
              )}
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </span>
              )}
            </CardDescription>
          </div>
          <Badge variant="secondary">{typeLabel}</Badge>
        </div>
      </CardHeader>
      {event.attendanceCount && (
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{event.attendanceCount} attendees</span>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

