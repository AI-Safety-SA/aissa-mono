import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Program } from '@/payload-types'
import { format } from 'date-fns'

interface ProgramCardProps {
  program: Program
}

const programTypeLabels: Record<string, string> = {
  fellowship: 'Fellowship',
  course: 'Course',
  coworking: 'Coworking',
  volunteer_program: 'Volunteer Program',
}

export function ProgramCard({ program }: ProgramCardProps) {
  const typeLabel = programTypeLabels[program.type || ''] || program.type

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{program.name}</CardTitle>
            <CardDescription>
              {program.startDate && program.endDate
                ? `${format(new Date(program.startDate), 'MMM yyyy')} - ${format(new Date(program.endDate), 'MMM yyyy')}`
                : program.startDate
                  ? `Started ${format(new Date(program.startDate), 'MMM yyyy')}`
                  : 'Date TBD'}
            </CardDescription>
          </div>
          <Badge variant="secondary">{typeLabel}</Badge>
        </div>
      </CardHeader>
      {program.description && typeof program.description === 'object' && (
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {/* Rich text content - for now just show a placeholder */}
            Program details available
          </p>
        </CardContent>
      )}
    </Card>
  )
}

