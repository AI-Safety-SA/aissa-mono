import { stringify } from 'csv-stringify/sync'

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
  'featuredTier',
  'featuredPriority',
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

// Single source of truth for export filter options
export const EXPORT_FILTERS = ['all', 'published', 'unpublished'] as const
export type ExportFilter = (typeof EXPORT_FILTERS)[number]

export function formatValue(value: unknown): boolean | number | string {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    // CSV injection prevention: sanitize formula trigger characters
    if (['=', '+', '-', '@'].includes(value.charAt(0))) {
      return `'${value}`
    }
    return value
  }
  return ''
}

export function toCSVRow(person: Person): PersonsCSVRow {
  return PERSONS_CSV_COLUMNS.reduce<PersonsCSVRow>((acc, key) => {
    acc[key] = formatValue(person[key as keyof Person])
    return acc
  }, {} as PersonsCSVRow)
}

export function buildPersonsCSV(persons: Person[]): string {
  return stringify(persons.map(toCSVRow), {
    columns: PERSONS_CSV_COLUMNS,
    header: true,
  })
}

// Build where clause based on filter type
export function buildExportFilterWhere(filter: ExportFilter) {
  if (filter === 'published') {
    return { isPublished: { equals: true } }
  }
  if (filter === 'unpublished') {
    return { isPublished: { equals: false } }
  }
  return undefined // 'all' - no filter
}
