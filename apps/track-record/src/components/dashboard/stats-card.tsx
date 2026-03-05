import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  compact?: boolean
}

export function StatsCard({ title, value, description, icon: Icon, compact = false }: StatsCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden group hover:shadow-lg transition-shadow duration-300',
        compact && 'aspect-square flex flex-col',
      )}
    >
      <CardHeader
        className={cn(
          'flex flex-row items-center justify-between space-y-0',
          compact ? 'pb-1' : 'pb-2',
        )}
      >
        <CardTitle className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>{title}</CardTitle>
        {Icon && <Icon className={cn('text-primary', compact ? 'h-3.5 w-3.5' : 'h-4 w-4')} />}
      </CardHeader>
      <CardContent className={cn(compact && 'pt-0')}>
        <div className={cn('font-bold tracking-tight', compact ? 'text-2xl' : 'text-3xl')}>{value}</div>
        {description && (
          <p className={cn('text-muted-foreground mt-1', compact ? 'text-xs' : 'text-sm')}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
