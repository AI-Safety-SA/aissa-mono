import { describe, expect, it } from 'vitest'
import { formatContextName, getContextHref } from '@/lib/context-name'

describe('formatContextName', () => {
  it('formats event names without exposing raw relation ids', () => {
    expect(
      formatContextName({
        relationTo: 'events',
        value: 42,
      }),
    ).toBe('Event unavailable')
  })

  it('formats program names', () => {
    expect(
      formatContextName({
        relationTo: 'programs',
        value: { name: 'AISF Fellowship' },
      }),
    ).toBe('AISF Fellowship')
  })

  it('formats cohort names with the parent program when available', () => {
    expect(
      formatContextName({
        relationTo: 'cohorts',
        value: {
          name: 'Winter 2026',
          program: { name: 'AISF Fellowship' },
        },
      }),
    ).toBe('AISF Fellowship - Winter 2026')
  })

  it('supports the admin view label prefix', () => {
    expect(
      formatContextName(
        {
          relationTo: 'events',
          value: { name: 'AISSA Research Meetup' },
        },
        { includeKindLabel: true },
      ),
    ).toBe('Event: AISSA Research Meetup')
  })
})

describe('getContextHref', () => {
  it('builds cohort links from cohort and parent program slugs', () => {
    expect(
      getContextHref({
        relationTo: 'cohorts',
        value: {
          slug: 'winter-2026',
          program: { slug: 'aisf-fellowship' },
        },
      }),
    ).toBe('/programs/aisf-fellowship/cohorts/winter-2026')
  })
})
