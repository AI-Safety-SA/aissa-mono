import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Grant } from '@/payload-types'
import { Calendar, Building2, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

interface GrantCardProps {
  grant: Grant
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  applied: 'Applied',
  awarded: 'Awarded',
  active: 'Active',
  completed: 'Completed',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
  draft: 'secondary',
  applied: 'outline',
  awarded: 'default',
  active: 'default',
  completed: 'secondary',
}

function formatGrantPeriod(start?: string | null, end?: string | null): string | null {
  if (!start && !end) return null
  const fmt = (d: string) => format(new Date(d), 'MMM yyyy')
  if (start && end) return `${fmt(start)} - ${fmt(end)}`
  if (start) return `From ${fmt(start)}`
  return `Until ${fmt(end!)}`
}

export function GrantCard({ grant }: GrantCardProps) {
  const statusLabel = statusLabels[grant.status || ''] || grant.status
  const statusVariant = statusVariants[grant.status || ''] || 'secondary'
  const period = formatGrantPeriod(grant.grantPeriodStart, grant.grantPeriodEnd)
  const amountFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(grant.dollarAmount)

  return (
    <Card className="h-full flex flex-col group hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2">{grant.title}</CardTitle>
            {grant.funder && (
              <CardDescription className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                {grant.funder}
              </CardDescription>
            )}
          </div>
          {grant.status && (
            <Badge variant={statusVariant} className="shrink-0">
              {statusLabel}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 mt-auto space-y-2">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
          <DollarSign className="h-4 w-4" />
          {amountFormatted}
        </div>
        {period && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {period}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
