import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import type { MajorImpactCard } from '@/lib/types'

interface PersonMajorImpactsProps {
  items: MajorImpactCard[]
}

export function PersonMajorImpacts({ items }: PersonMajorImpactsProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-8 text-center text-sm text-muted-foreground">
        No major impacts have been recorded yet.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((impact, index) => (
        <article
          key={impact.id}
          className={`relative overflow-hidden rounded-2xl border bg-linear-to-br p-5 shadow-sm transition-shadow hover:shadow-md${impact.isPinned ? ' border-primary/30 from-card to-secondary/30' : ' border-border/70 from-card to-secondary/10'}`}
        >
          <div className={`absolute inset-y-0 left-0 w-1 rounded-l-2xl${impact.isPinned ? ' bg-primary' : ' bg-border/60'}`} />
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant={impact.isPinned ? 'default' : 'outline'}>
              {impact.isPinned ? `Pinned Impact ${index + 1}` : 'Major Impact'}
            </Badge>
            <Badge variant="secondary">{impact.typeLabel}</Badge>
            {impact.isVerified ? <Badge variant="secondary" className="border border-primary/20 text-primary">Verified</Badge> : null}
          </div>

          <p className="text-base font-medium leading-7 text-foreground">{impact.summary}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{format(new Date(impact.date), 'MMM yyyy')}</span>
            {impact.actionCategoryLabel ? <span>{impact.actionCategoryLabel}</span> : null}
            {impact.evidenceUrl ? (
              <a
                href={impact.evidenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline underline-offset-4"
              >
                View evidence
              </a>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  )
}
