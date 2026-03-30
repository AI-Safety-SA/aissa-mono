import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Media, Program } from '@/payload-types'
import { getHighlightedImage } from '@/lib/default-images'
import { getMediaPublicUrl } from '@/utilities/media-url'
import Link from 'next/link'
import { Users, LayoutGrid } from 'lucide-react'
import Image from 'next/image'

interface ProgramCardProps {
  program: Program
  defaultImage?: Media | null
  cohortCount?: number
  totalParticipants?: number
  totalCompletions?: number
}

const programTypeLabels: Record<string, string> = {
  fellowship: 'Fellowship',
  course: 'Course',
  hackathon: 'Hackathon',
  coworking: 'Coworking',
  volunteer_program: 'Volunteer Program',
  other: 'Other',
}

export function ProgramCard({
  program,
  defaultImage = null,
  cohortCount,
  totalParticipants,
  totalCompletions,
}: ProgramCardProps) {
  const typeLabel = programTypeLabels[program.type || ''] || program.type

  const cardImage = getHighlightedImage(program.images) ?? defaultImage
  const imageUrl = getMediaPublicUrl(cardImage)
  const imageAlt = cardImage?.alt || program.name

  return (
    <Card className="h-full flex flex-col overflow-hidden group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-0 flex flex-col h-full">
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
            <Badge variant="secondary" className="shadow-sm">
              {typeLabel}
            </Badge>
          </div>
        </div>

        {/* Content section */}
        <div className="p-4 flex flex-col flex-1">
          <Link
            href={`/programs/${program.slug}`}
            className="hover:text-primary transition-colors mb-3"
          >
            <h3 className="text-lg font-semibold leading-tight line-clamp-2">{program.name}</h3>
          </Link>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-auto">
            {program.type === 'course' && cohortCount !== undefined && (
              <div className="flex items-center gap-1.5">
                <LayoutGrid className="h-4 w-4 text-primary" />
                <span>
                  {cohortCount} {cohortCount === 1 ? 'cohort' : 'cohorts'}
                </span>
              </div>
            )}
            {totalParticipants !== undefined && (
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                <span>{totalParticipants} participants</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
