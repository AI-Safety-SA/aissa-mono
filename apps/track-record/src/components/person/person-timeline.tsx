import type { TimelineItem } from '@/lib/types'
import { TimelineCard } from './timeline-card'

interface PersonTimelineProps {
  items: TimelineItem[]
}

export function PersonTimeline({ items }: PersonTimelineProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No timeline entries yet.
      </div>
    )
  }

  return (
    <div className="relative">
      {items.map((item, index) => (
        <TimelineCard key={`${item.type}-${index}`} item={item} />
      ))}
    </div>
  )
}
