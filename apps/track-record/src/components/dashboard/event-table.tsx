import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getEventDefaultImage, getHighlightedImage } from '@/lib/default-images'
import { getEventTypeLabel } from '@/lib/types'
import { getMediaPublicUrl } from '@/utilities/media-url'
import type { DefaultImage, Event } from '@/payload-types'

interface EventTableProps {
  defaultImages: DefaultImage | null | undefined
  events: Event[]
}

export function EventTable({ defaultImages, events }: EventTableProps) {
  if (events.length === 0) {
    return null
  }

  return (
    <Table className="min-w-[700px]">
      <TableHeader>
        <TableRow>
          <TableHead>Event</TableHead>
          <TableHead className="whitespace-nowrap">Type</TableHead>
          <TableHead className="whitespace-nowrap">Date</TableHead>
          <TableHead>Location</TableHead>
          <TableHead className="whitespace-nowrap text-right">Attendance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => {
          const cardImage =
            getHighlightedImage(event.images) ?? getEventDefaultImage(defaultImages, event.type)
          const imageUrl = getMediaPublicUrl(cardImage)
          const imageAlt = cardImage?.alt || `${event.name} thumbnail`

          return (
            <TableRow key={event.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={imageAlt}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-linear-to-br from-muted via-muted/80 to-muted-foreground/10" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/events/${event.slug}`}
                      className="font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {event.name}
                    </Link>
                  </div>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <Badge variant="secondary" className="whitespace-nowrap px-3">
                  {getEventTypeLabel(event)}
                </Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {event.eventDate ? format(new Date(event.eventDate), 'MMM d, yyyy') : 'TBD'}
              </TableCell>
              <TableCell>{event.location || 'TBD'}</TableCell>
              <TableCell className="text-right">
                {typeof event.attendanceCount === 'number' ? event.attendanceCount : '—'}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
