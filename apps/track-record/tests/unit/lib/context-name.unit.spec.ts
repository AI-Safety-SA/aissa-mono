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

  it('uses only the cohort title for populated cohort testimonial badges', () => {
    expect(
      getTestimonialContextBadgeDetails({
        relationTo: 'cohorts',
        value: {
          name: 'Intro to Cooperative AI Q2 2025 - Cohort 2',
          slug: 'intro-to-cooperative-ai-q2-2025-cohort-2',
          program: {
            name: 'Intro to Cooperative AI - Q2 2025',
            slug: 'intro-to-cooperative-ai-q2-2025',
          },
        },
      }),
    ).toEqual({
      href: '/programs/intro-to-cooperative-ai-q2-2025/cohorts/intro-to-cooperative-ai-q2-2025-cohort-2',
      label: 'Intro to Cooperative AI Q2 2025 - Cohort 2',
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
