import { stringify } from 'csv-stringify/sync'
import type { Where } from 'payload'

import type { Person } from '@/payload-types'

// Only the most relevant fields - excludes bio, headshot, featuredStory, metadata, baseline fields, createdAt, updatedAt
export const PERSONS_CSV_COLUMNS = [
  'id',
  'fullName',
  'preferredName',
  'email',
  'personTag',
  'organisation',
  'websiteUrl',
  'joinedAt',
  'isPublished',
  'highlight',
  'totalEngagements',
  'totalImpacts',
  'totalContributions',
  'firstEngagementDate',
  'lastEngagementDate',
  'current_impact_stage',
  'total_engagement_hours',
] as const

type PersonsCSVColumn = (typeof PERSONS_CSV_COLUMNS)[number]
type PersonsCSVRow = Record<PersonsCSVColumn, boolean | number | string>

function formatValue(value: unknown): boolean | number | string {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value
  if (typeof value === 'string') return value
  return ''
}

function toCSVRow(person: Person): PersonsCSVRow {
  return {
    id: formatValue(person.id),
    fullName: formatValue(person.fullName),
    preferredName: formatValue(person.preferredName),
    email: formatValue(person.email),
    personTag: formatValue(person.personTag),
    organisation: formatValue(person.organisation),
    websiteUrl: formatValue(person.websiteUrl),
    joinedAt: formatValue(person.joinedAt),
    isPublished: formatValue(person.isPublished),
    highlight: formatValue(person.highlight),
    totalEngagements: formatValue(person.totalEngagements),
    totalImpacts: formatValue(person.totalImpacts),
    totalContributions: formatValue(person.totalContributions),
    firstEngagementDate: formatValue(person.firstEngagementDate),
    lastEngagementDate: formatValue(person.lastEngagementDate),
    current_impact_stage: formatValue(person.current_impact_stage),
    total_engagement_hours: formatValue(person.total_engagement_hours),
  }
}

export function buildPersonsCSV(persons: Person[]): string {
  return stringify(persons.map(toCSVRow), {
    columns: PERSONS_CSV_COLUMNS,
    header: true,
  })
}

export function parseWhereQueryParam(value: unknown): Where | undefined {
  if (!value) return undefined

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return undefined

    const parsed = JSON.parse(trimmed)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Invalid where query parameter')
    }

    return parsed as Where
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as Where
  }

  throw new Error('Invalid where query parameter')
}

// Filter type for export
export type ExportFilter = 'all' | 'published' | 'unpublished'

// Build where clause based on filter type
export function buildExportFilterWhere(filter: ExportFilter): Where | undefined {
  if (filter === 'published') {
    return { isPublished: { equals: true } }
  }
  if (filter === 'unpublished') {
    return { isPublished: { equals: false } }
  }
  return undefined // 'all' - no filter
}
