import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import { Calendar, MapPin, Users, Info } from 'lucide-react'
import { getDefaultImages, getEventDefaultImage, getHighlightedImage } from '@/lib/default-images'
import type { Event, Person } from '@/payload-types'
import { getMediaPublicUrl } from '@/utilities/media-url'

export const dynamic = 'force-dynamic'

interface EventPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'events',
    where: {
      slug: { equals: slug },
      isPublished: { equals: true },
    },
    limit: 1,
    depth: 1,
  })

  if (!result.docs.length) {
    notFound()
  }

  const event = result.docs[0] as Event
  const organiser = event.organiser as Person
  const defaultImages = await getDefaultImages(payload)
  const heroImage = getHighlightedImage(event.images) ?? getEventDefaultImage(defaultImages, event.type)
  const heroImageUrl = getMediaPublicUrl(heroImage)
  const heroImageAlt = heroImage?.alt || event.name

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        as="header"
        size="default"
        muted
        title={event.name}
        eyebrow={
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Event Details
            </span>
          </div>
        }
        meta={
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <Badge variant="secondary" className="text-sm">
              {event.type}
            </Badge>
            <div className="flex items-center gap-1.5 text-sm">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(event.eventDate), 'MMMM d, yyyy')}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-1.5 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
        }
        actions={
          event.attendanceCount ? (
            <div className="flex gap-8 border rounded-lg p-6 bg-background shadow-sm">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Attendance</span>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {event.attendanceCount}
                </div>
              </div>
            </div>
          ) : null
        }
      />
      {heroImageUrl && (
        <section className="border-b bg-muted/20">
          <div className="container mx-auto px-4 py-6">
            <div className="relative aspect-[16/7] overflow-hidden rounded-2xl border bg-muted">
              <Image
                src={heroImageUrl}
                alt={heroImageAlt}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            </div>
          </div>
        </section>
      )}

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section className="bg-muted/10 p-8 rounded-2xl border">
              <div className="flex items-start gap-4">
                <Info className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">About the Event</h2>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    This {event.type} brings together community members interested in AI safety. 
                    Organized by {organiser.fullName}, the session aims to foster deep 
                    technical understanding and collaboration.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6">Organiser</h2>
              <div className="flex items-center gap-4 border rounded-xl p-6 bg-card">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {organiser.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{organiser.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{organiser.bio || 'AISSA Community Organiser'}</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
