import { describe, expect, it } from 'vitest'
import { getContextHref } from '@/lib/context-name'

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
