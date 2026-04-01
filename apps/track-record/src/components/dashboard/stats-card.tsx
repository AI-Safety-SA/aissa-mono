import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  compact?: boolean
  href?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  compact = false,
  href,
}: StatsCardProps) {
  const card = (
    <Card
      className={cn(
        'relative h-full overflow-hidden transition-shadow duration-300',
        href && 'hover:shadow-lg',
        compact && 'flex flex-col',
      )}
    >
      <CardHeader
        className={cn(
          'flex flex-row items-center justify-between space-y-0',
          compact ? 'pb-1' : 'pb-2',
        )}
      >
        <CardTitle className={cn('font-medium', 'text-sm')}>{title}</CardTitle>
        {Icon && <Icon className={cn('text-primary', compact ? 'h-4 w-4' : 'h-5 w-5')} />}
      </CardHeader>
      <CardContent className={cn(compact && 'pt-0')}>
        <div className={cn('font-bold tracking-tight', compact ? 'text-2xl' : 'text-3xl')}>
          {value}
        </div>
        {description && (
          <p className={cn('text-muted-foreground mt-1', compact ? 'text-xs' : 'text-sm')}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )

  if (!href) {
    return card
  }

  return (
    <Link
      href={href}
      className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {card}
    </Link>
  )
}
