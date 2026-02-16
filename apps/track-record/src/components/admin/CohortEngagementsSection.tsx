'use client'

import type { UIFieldClientComponent } from 'payload'

import { ContextEngagementsSectionBase } from './ContextEngagementsSectionBase'

const EVENT_CONTEXT = {
  kind: 'event',
  label: 'Event',
  relationTo: 'events',
} as const

const PROGRAM_CONTEXT = {
  kind: 'program',
  label: 'Program',
  relationTo: 'programs',
} as const

const COHORT_CONTEXT = {
  kind: 'cohort',
  label: 'Cohort',
  relationTo: 'cohorts',
} as const

export const CohortEngagementsSection: UIFieldClientComponent = (props) => {
  return <ContextEngagementsSectionBase {...props} context={COHORT_CONTEXT} />
}

export const ProgramEngagementsSection: UIFieldClientComponent = (props) => {
  return <ContextEngagementsSectionBase {...props} context={PROGRAM_CONTEXT} />
}

export const EventEngagementsSection: UIFieldClientComponent = (props) => {
  return <ContextEngagementsSectionBase {...props} context={EVENT_CONTEXT} />
}
