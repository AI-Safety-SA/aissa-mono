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

export const engagementTypeLabels: Record<string, string> = {
  participant: 'Participant',
  facilitator: 'Facilitator',
  speaker: 'Speaker',
  volunteer: 'Volunteer',
  organizer: 'Organizer',
  mentor: 'Mentor',
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
  talk: 'Talk',
  meetup: 'Meetup',
  reading_group: 'Reading Group',
  retreat: 'Retreat',
  panel: 'Panel',
  other: 'Other',
}

export const contextKindLabels: Record<string, string> = {
  event: 'Event',
  program: 'Program',
  cohort: 'Cohort',
}
