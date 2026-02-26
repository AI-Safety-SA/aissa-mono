import { describe, it, expect } from 'vitest'

import {
  formatValue,
  toCSVRow,
  buildPersonsCSV,
  buildExportFilterWhere,
  PERSONS_CSV_COLUMNS,
  EXPORT_FILTERS,
} from '@/collections/persons/csvExport'
import type { Person } from '@/payload-types'

// Minimal mock person for testing
function makePerson(overrides: Partial<Person> = {}): Person {
  return {
    id: 1,
    fullName: 'Jane Doe',
    preferredName: 'Jane',
    email: 'jane@example.com',
    personTag: 'researcher',
    organisation: 'AISSA',
    websiteUrl: 'https://jane.dev',
    joinedAt: '2024-01-15',
    isPublished: true,
    highlight: 'Key contributor',
    totalEngagements: 5,
    totalImpacts: 3,
    totalContributions: 8,
    firstEngagementDate: '2024-01-15',
    lastEngagementDate: '2025-06-01',
    current_impact_stage: 'active',
    total_engagement_hours: 42,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
    ...overrides,
  } as Person
}

describe('formatValue', () => {
  it('returns booleans as-is', () => {
    expect(formatValue(true)).toBe(true)
    expect(formatValue(false)).toBe(false)
  })

  it('returns numbers as-is', () => {
    expect(formatValue(42)).toBe(42)
    expect(formatValue(0)).toBe(0)
    expect(formatValue(-1)).toBe(-1)
  })

  it('returns normal strings as-is', () => {
    expect(formatValue('hello')).toBe('hello')
    expect(formatValue('Jane Doe')).toBe('Jane Doe')
  })

  it('sanitizes strings starting with = (CSV injection)', () => {
    expect(formatValue('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)")
  })

  it('sanitizes strings starting with + (CSV injection)', () => {
    expect(formatValue('+cmd|/C calc')).toBe("'+cmd|/C calc")
  })

  it('sanitizes strings starting with - (CSV injection)', () => {
    expect(formatValue('-cmd|/C calc')).toBe("'-cmd|/C calc")
  })

  it('sanitizes strings starting with @ (CSV injection)', () => {
    expect(formatValue('@SUM(A1)')).toBe("'@SUM(A1)")
  })

  it('returns empty string for null', () => {
    expect(formatValue(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(formatValue(undefined)).toBe('')
  })

  it('returns empty string for objects', () => {
    expect(formatValue({})).toBe('')
    expect(formatValue([])).toBe('')
  })
})

describe('toCSVRow', () => {
  it('maps a Person to a row with all CSV columns', () => {
    const person = makePerson()
    const row = toCSVRow(person)

    expect(Object.keys(row)).toHaveLength(PERSONS_CSV_COLUMNS.length)
    for (const col of PERSONS_CSV_COLUMNS) {
      expect(row).toHaveProperty(col)
    }
  })

  it('formats values correctly', () => {
    const person = makePerson({ fullName: 'Jane Doe', totalEngagements: 5, isPublished: true })
    const row = toCSVRow(person)

    expect(row.fullName).toBe('Jane Doe')
    expect(row.totalEngagements).toBe(5)
    expect(row.isPublished).toBe(true)
  })

  it('handles undefined/missing fields gracefully', () => {
    const person = makePerson({ preferredName: undefined, organisation: undefined })
    const row = toCSVRow(person)

    expect(row.preferredName).toBe('')
    expect(row.organisation).toBe('')
  })

  it('sanitizes potentially dangerous field values', () => {
    const person = makePerson({ fullName: '=EVIL()' })
    const row = toCSVRow(person)

    expect(row.fullName).toBe("'=EVIL()")
  })
})

describe('buildPersonsCSV', () => {
  it('generates CSV with headers for empty array', () => {
    const csv = buildPersonsCSV([])
    const lines = csv.trim().split('\n')

    expect(lines).toHaveLength(1) // header only
    expect(lines[0]).toContain('id')
    expect(lines[0]).toContain('fullName')
    expect(lines[0]).toContain('email')
  })

  it('generates CSV with header + 1 data row for single person', () => {
    const csv = buildPersonsCSV([makePerson()])
    const lines = csv.trim().split('\n')

    expect(lines).toHaveLength(2)
    expect(lines[1]).toContain('Jane Doe')
    expect(lines[1]).toContain('jane@example.com')
  })

  it('generates CSV with header + N data rows for multiple persons', () => {
    const persons = [
      makePerson({ id: 1, fullName: 'Alice' }),
      makePerson({ id: 2, fullName: 'Bob' }),
      makePerson({ id: 3, fullName: 'Charlie' }),
    ]
    const csv = buildPersonsCSV(persons)
    const lines = csv.trim().split('\n')

    expect(lines).toHaveLength(4) // header + 3
    expect(lines[1]).toContain('Alice')
    expect(lines[2]).toContain('Bob')
    expect(lines[3]).toContain('Charlie')
  })

  it('includes all expected column headers', () => {
    const csv = buildPersonsCSV([])
    const headerLine = csv.trim().split('\n')[0]

    for (const col of PERSONS_CSV_COLUMNS) {
      expect(headerLine).toContain(col)
    }
  })
})

describe('buildExportFilterWhere', () => {
  it('returns undefined for "all"', () => {
    expect(buildExportFilterWhere('all')).toBeUndefined()
  })

  it('returns isPublished equals true for "published"', () => {
    expect(buildExportFilterWhere('published')).toEqual({
      isPublished: { equals: true },
    })
  })

  it('returns isPublished equals false for "unpublished"', () => {
    expect(buildExportFilterWhere('unpublished')).toEqual({
      isPublished: { equals: false },
    })
  })
})

describe('EXPORT_FILTERS', () => {
  it('contains exactly all, published, unpublished', () => {
    expect(EXPORT_FILTERS).toEqual(['all', 'published', 'unpublished'])
  })
})
