import { Badge } from '@/components/ui/badge'
import { getEventTypeLabel } from '@/lib/types'
import type { TimelineItem } from '@/lib/types'
import {
  engagementTypeLabels,
  impactTypeLabels,
  projectRoleLabels,
} from '@/lib/types'
import { format } from 'date-fns'
import Link from 'next/link'
import {
  Users,
  Star,
  FolderKanban,
  Mic,
  CalendarCheck,
} from 'lucide-react'
import type {
  Engagement,
  EngagementImpact,
  ProjectContributor,
  EventHost,
  Event,
  Program,
  Cohort,
} from '@/payload-types'

interface TimelineCardProps {
  item: TimelineItem
}

const typeIcons = {
  engagement: Users,
  impact: Star,
  project_contribution: FolderKanban,
  event_host: Mic,
  event_organisation: CalendarCheck,
}

const typeLabels = {
  engagement: 'Engagement',
  impact: 'Impact',
  project_contribution: 'Project',
  event_host: 'Event Host',
  event_organisation: 'Event Organiser',
}

function getContextLink(
  context:
    | { relationTo: 'events'; value: number | Event }
    | { relationTo: 'programs'; value: number | Program }
    | { relationTo: 'cohorts'; value: number | Cohort }
): { href: string; label: string } | null {
  if (!context) return null

  const value = context.value
  if (typeof value === 'number') return null

  switch (context.relationTo) {
    case 'events':
      return { href: `/events/${value.slug}`, label: value.name }
    case 'programs':
      return { href: `/programs/${value.slug}`, label: value.name }
    case 'cohorts': {
      const cohort = value as Cohort
      const programSlug = typeof cohort.program === 'object' ? cohort.program.slug : ''
      return { href: `/programs/${programSlug}`, label: cohort.name }
    }
    default:
      return null
  }
}

export function TimelineCard({ item }: TimelineCardProps) {
  const Icon = typeIcons[item.type]
  const formattedDate = format(new Date(item.date), 'MMM d, yyyy')

  return (
    <div className="relative pl-8 pb-8 last:pb-0">
      <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-border last:hidden" />

      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="outline">{typeLabels[item.type]}</Badge>
          <span className="text-sm text-muted-foreground">{formattedDate}</span>
        </div>

        {item.type === 'engagement' && <EngagementContent data={item.data} />}
        {item.type === 'impact' && <ImpactContent data={item.data} />}
        {item.type === 'project_contribution' && <ProjectContributionContent data={item.data} />}
        {item.type === 'event_host' && <EventHostContent data={item.data} />}
        {item.type === 'event_organisation' && <EventOrganisationContent data={item.data} />}
      </div>
    </div>
  )
}

function EngagementContent({ data }: { data: Engagement }) {
  const contextLink = data.context ? getContextLink(data.context) : null

  return (
    <div className="space-y-1">
      <p className="font-medium">
        {data.title ?? (engagementTypeLabels[data.type] || data.type)}
      </p>
      {contextLink && (
        <Link
          href={contextLink.href}
          className="text-sm text-primary hover:underline underline-offset-4"
        >
          {contextLink.label}
        </Link>
      )}
      {data.engagement_status && (
        <Badge variant="secondary" className="mt-2">
          {data.engagement_status.replace(/_/g, ' ')}
        </Badge>
      )}
    </div>
  )
}

function ImpactContent({ data }: { data: EngagementImpact }) {
  const typeLabel = impactTypeLabels[data.type] || data.type

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{typeLabel}</Badge>
        {data.isVerified && <Badge variant="default">Verified</Badge>}
      </div>
      <p className="text-sm text-muted-foreground">{data.summary}</p>
      {data.evidenceUrl && (
        <a
          href={data.evidenceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline underline-offset-4"
        >
          View evidence
        </a>
      )}
    </div>
  )
}

function ProjectContributionContent({ data }: { data: ProjectContributor }) {
  const roleLabel = projectRoleLabels[data.role] || data.role
  const project = typeof data.project === 'object' ? data.project : null

  return (
    <div className="space-y-1">
      <p className="font-medium">{roleLabel}</p>
      {project && (
        <Link
          href={`/projects/${project.slug}`}
          className="text-sm text-primary hover:underline underline-offset-4"
        >
          {project.title}
        </Link>
      )}
    </div>
  )
}

function EventHostContent({ data }: { data: EventHost }) {
  const event = typeof data.event === 'object' ? data.event : null
  const eventTypeLabel = event ? getEventTypeLabel(event) : null

  return (
    <div className="space-y-1">
      <p className="font-medium">Hosted{eventTypeLabel ? ` ${eventTypeLabel}` : ' Event'}</p>
      {event && (
        <Link
          href={`/events/${event.slug}`}
          className="text-sm text-primary hover:underline underline-offset-4"
        >
          {event.name}
        </Link>
      )}
    </div>
  )
}

function EventOrganisationContent({ data }: { data: Event }) {
  const typeLabel = getEventTypeLabel(data)

  return (
    <div className="space-y-1">
      <p className="font-medium">Organised {typeLabel}</p>
      <Link
        href={`/events/${data.slug}`}
        className="text-sm text-primary hover:underline underline-offset-4"
      >
        {data.name}
      </Link>
      {data.attendanceCount && (
        <p className="text-sm text-muted-foreground">{data.attendanceCount} attendees</p>
      )}
    </div>
  )
}
