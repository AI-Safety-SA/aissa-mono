import type {
  Engagement,
  EngagementImpact,
  ProjectContributor,
  EventHost,
  Event,
} from '@/payload-types'

export type TimelineItem =
  | { type: 'engagement'; date: string; data: Engagement }
  | { type: 'impact'; date: string; data: EngagementImpact }
  | { type: 'project_contribution'; date: string; data: ProjectContributor }
  | { type: 'event_host'; date: string; data: EventHost }
  | { type: 'event_organisation'; date: string; data: Event }

export type MajorImpactCard = {
  actionCategoryLabel: string | null
  date: string
  evidenceUrl: string | null
  href: string | null
  id: number | string
  isPinned: boolean
  isVerified: boolean
  meta: string[]
  summary: string
  typeLabel: string
  variant:
    | 'engagement-impact'
    | 'speaker-engagement'
    | 'facilitator-engagement'
    | 'research'
    | 'grant'
    | 'organised-event'
}

export type FullTimelineRow = {
  date: string
  detail: string | null
  href: string | null
  id: string
  kind: string
  title: string
}

export const engagementTypeLabels: Record<string, string> = {
  participant: 'Participant',
  facilitator: 'Facilitator',
  speaker: 'Speaker',
  volunteer: 'Volunteer',
  organizer: 'Organizer',
  mentor: 'Mentor',
  contribution: 'Contribution',
  other: 'Other',
}

export const impactTypeLabels: Record<string, string> = {
  career_transition: 'Career Transition',
  research_contribution: 'Research Contribution',
  community_building: 'Community Building',
  grant_awarded: 'Grant Awarded',
  publication: 'Publication',
  educational: 'Educational',
  community: 'Community',
  other: 'Other',
}

export const projectRoleLabels: Record<string, string> = {
  lead_author: 'Lead Author',
  co_author: 'Co-Author',
  contributor: 'Contributor',
  advisor: 'Advisor',
  other: 'Other',
}

export const impactStageLabels: Record<string, string> = {
  awareness: 'Awareness',
  learning: 'Learning',
  application: 'Application',
  contribution: 'Contribution',
}

export const eventTypeLabels: Record<string, string> = {
  workshop: 'Workshop',
  seminar: 'Seminar',
  talk: 'Talk',
  meetup: 'Meetup',
  reading_group: 'Reading Group',
  retreat: 'Retreat',
  panel: 'Panel',
  other: 'Other',
}

function toNaiveTitleCase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function getEventTypeLabel(event: Pick<Event, 'type' | 'typeOther'>): string {
  if (event.type === 'other' && event.typeOther) {
    return toNaiveTitleCase(event.typeOther)
  }

  return eventTypeLabels[event.type] || event.type
}

export const contextKindLabels: Record<string, string> = {
  event: 'Event',
  program: 'Program',
  cohort: 'Cohort',
  desk_session: 'Desk Session',
  feedback_form: 'Feedback Form',
  external_event: 'External Event',
  other: 'Other',
}
