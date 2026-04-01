import { describe, expect, it } from 'vitest'
import {
  getContextHref,
  getContextLabel,
  getTestimonialContextBadgeDetails,
} from '@/lib/context-name'

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

describe('getContextLabel', () => {
  it('formats cohort labels with the parent program name when populated', () => {
    expect(
      getContextLabel({
        relationTo: 'cohorts',
        value: {
          name: 'Winter 2026',
          program: { name: 'AISF Fellowship' },
        },
      }),
    ).toBe('AISF Fellowship / Winter 2026')
  })
})

describe('getTestimonialContextBadgeDetails', () => {
  it('returns a linked testimonial badge label for populated contexts', () => {
    expect(
      getTestimonialContextBadgeDetails({
        relationTo: 'events',
        value: {
          name: 'Alignment Sprint',
          slug: 'alignment-sprint',
        },
      }),
    ).toEqual({
      href: '/events/alignment-sprint',
      label: 'Alignment Sprint — Testimonial',
    })
  })

  it('falls back to the context kind when the relationship is unpopulated', () => {
    expect(
      getTestimonialContextBadgeDetails({
        relationTo: 'programs',
        value: 42,
      }),
    ).toEqual({
      href: null,
      label: 'Program — Testimonial',
    })
  })

  it('returns the general testimonial label when no context exists', () => {
    expect(getTestimonialContextBadgeDetails(null)).toEqual({
      href: null,
      label: 'General Testimonial',
    })
  })
})
