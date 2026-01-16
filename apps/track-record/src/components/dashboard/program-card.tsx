import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Program } from '@/payload-types'
import { format } from 'date-fns'
import Link from 'next/link'
import { Users, LayoutGrid } from 'lucide-react'

interface ProgramCardProps {
  program: Program
  cohortCount?: number
  totalParticipants?: number
}

const programTypeLabels: Record<string, string> = {
  fellowship: 'Fellowship',
  course: 'Course',
  coworking: 'Coworking',
  volunteer_program: 'Volunteer Program',
}

export function ProgramCard({ program, cohortCount, totalParticipants }: ProgramCardProps) {
  const typeLabel = programTypeLabels[program.type || ''] || program.type

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <Link href={`/programs/${program.slug}`} className="hover:underline underline-offset-4">
              <CardTitle className="text-lg">{program.name}</CardTitle>
            </Link>
            <CardDescription>
              {program.startDate && program.endDate
                ? `${format(new Date(program.startDate), 'MMM yyyy')} - ${format(new Date(program.endDate), 'MMM yyyy')}`
                : program.startDate
                  ? `Started ${format(new Date(program.startDate), 'MMM yyyy')}`
                  : 'Date TBD'}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {typeLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {program.description && typeof program.description === 'object' && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            Program details available
          </p>
        )}
      </CardContent>
      {(cohortCount !== undefined || totalParticipants !== undefined) && (
        <CardFooter className="border-t pt-4 flex gap-4 text-sm text-muted-foreground">
          {cohortCount !== undefined && (
            <div className="flex items-center gap-1.5">
              <LayoutGrid className="h-4 w-4" />
              <span>{cohortCount} {cohortCount === 1 ? 'cohort' : 'cohorts'}</span>
            </div>
          )}
          {totalParticipants !== undefined && (
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{totalParticipants} participants</span>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  )
}

