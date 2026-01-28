import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Program } from '@/payload-types'
import { format } from 'date-fns'
import Link from 'next/link'
import { Users, LayoutGrid } from 'lucide-react'
import Image from 'next/image'

interface ProgramCardProps {
  program: Program
  cohortCount?: number
  totalParticipants?: number
  totalCompletions?: number
}

const programTypeLabels: Record<string, string> = {
  fellowship: 'Fellowship',
  course: 'Course',
  coworking: 'Coworking',
  volunteer_program: 'Volunteer Program',
}

export function ProgramCard({
  program,
  cohortCount,
  totalParticipants,
  totalCompletions,
}: ProgramCardProps) {
  const typeLabel = programTypeLabels[program.type || ''] || program.type
  
  // Get highlighted image
  const highlightedImage = program.images?.find(img => img.isHighlighted && img.image && typeof img.image === 'object')
  const imageUrl = highlightedImage?.image && typeof highlightedImage.image === 'object' 
    ? highlightedImage.image.url 
    : null
  const imageAlt = highlightedImage?.image && typeof highlightedImage.image === 'object'
    ? highlightedImage.image.alt
    : program.name

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Top section with title and badge */}
        <div className="flex items-start justify-between gap-2 p-4 pb-2">
          <Link href={`/programs/${program.slug}`} className="hover:underline underline-offset-4 flex-1">
            <h3 className="text-lg font-semibold leading-tight">{program.name}</h3>
          </Link>
          <Badge variant="secondary" className="shrink-0">
            {typeLabel}
          </Badge>
        </div>
        
        {/* Large image in middle */}
        {imageUrl && (
          <div className="relative w-full aspect-video overflow-hidden">
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        
        {/* Bottom section with icons and text */}
        <div className="p-4 pt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
          {cohortCount !== undefined && (
            <div className="flex items-center gap-1.5">
              <LayoutGrid className="h-4 w-4" />
              <span>
                {cohortCount} {cohortCount === 1 ? 'cohort' : 'cohorts'}
              </span>
            </div>
          )}
          {totalParticipants !== undefined && (
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{totalParticipants} participants</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
