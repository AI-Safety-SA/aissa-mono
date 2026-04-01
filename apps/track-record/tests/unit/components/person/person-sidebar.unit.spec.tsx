import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PersonSidebar } from '@/components/person/person-sidebar'

describe('PersonSidebar', () => {
  it('renders a testimonial card beneath quick info when testimonials are present', () => {
    render(
      <PersonSidebar
        person={{
          id: 42,
          fullName: 'Aisha Example',
          firstEngagementDate: '2024-01-01T00:00:00.000Z',
          joinedAt: '2023-06-01T00:00:00.000Z',
          isPublished: true,
        } as any}
        testimonials={[
          {
            id: 1,
            quote: 'AISSA helped me move into full-time AI safety work.',
            attributionTitle: 'Research Fellow',
            context: {
              relationTo: 'events',
              value: {
                id: 10,
                slug: 'ai-safety-workshop',
                name: 'AI Safety Workshop',
              },
            },
            createdAt: '2024-02-01T00:00:00.000Z',
            person: { id: 42, fullName: 'Aisha Example', isPublished: true, highlight: true },
          },
          {
            id: 2,
            quote: 'Strong facilitation and a very thoughtful community.',
            attributionName: 'Anonymous participant',
            createdAt: '2024-03-01T00:00:00.000Z',
            person: null,
          },
        ] as any}
      />,
    )

    expect(screen.getByText('Quick Info')).toBeInTheDocument()
    expect(screen.getByText('Testimonials')).toBeInTheDocument()
    expect(
      screen.getAllByText('AISSA helped me move into full-time AI safety work.').length,
    ).toBeGreaterThan(0)
    expect(
      screen.getByRole('link', { name: 'AI Safety Workshop — Testimonial' }),
    ).toHaveAttribute('href', '/events/ai-safety-workshop')
    expect(screen.getByText('— Research Fellow')).toBeInTheDocument()
    expect(screen.getAllByText('General Testimonial')).toHaveLength(1)
    expect(screen.queryByText('Aisha Example')).not.toBeInTheDocument()
    expect(screen.queryByText('Anonymous participant')).not.toBeInTheDocument()
  })

  it('links the testimonial context badge when a populated context is attached', () => {
    render(
      <PersonSidebar
        person={{
          id: 42,
          fullName: 'Aisha Example',
          isPublished: true,
        } as any}
        testimonials={[
          {
            id: 3,
            quote: 'Working with this community materially improved our research output.',
            context: {
              relationTo: 'programs',
              value: {
                id: 77,
                slug: 'research-scholars',
                name: 'Research Scholars',
              },
            },
            createdAt: '2024-04-01T00:00:00.000Z',
            person: {
              id: 77,
              fullName: 'Linked Person',
              isPublished: true,
              featuredTier: 'team',
              highlight: false,
            },
          },
        ] as any}
      />,
    )

    expect(screen.getByRole('link', { name: 'Research Scholars — Testimonial' })).toHaveAttribute(
      'href',
      '/programs/research-scholars',
    )
    expect(screen.queryByText('Linked Person')).not.toBeInTheDocument()
  })

  it('renders cohort testimonial badges with only the cohort title', () => {
    render(
      <PersonSidebar
        person={{
          id: 42,
          fullName: 'Aisha Example',
          isPublished: true,
        } as any}
        testimonials={[
          {
            id: 4,
            quote: 'The cohort gave me a much clearer path into the field.',
            context: {
              relationTo: 'cohorts',
              value: {
                id: 11,
                slug: 'intro-to-cooperative-ai-q2-2025-cohort-2',
                name: 'Intro to Cooperative AI Q2 2025 - Cohort 2',
                program: {
                  id: 12,
                  slug: 'intro-to-cooperative-ai-q2-2025',
                  name: 'Intro to Cooperative AI - Q2 2025',
                },
              },
            },
            createdAt: '2024-04-01T00:00:00.000Z',
            person: null,
          },
        ] as any}
      />,
    )

    expect(
      screen.getByRole('link', { name: 'Intro to Cooperative AI Q2 2025 - Cohort 2' }),
    ).toHaveAttribute(
      'href',
      '/programs/intro-to-cooperative-ai-q2-2025/cohorts/intro-to-cooperative-ai-q2-2025-cohort-2',
    )
    expect(
      screen.queryByText(
        'Intro to Cooperative AI - Q2 2025 / Intro to Cooperative AI Q2 2025 - Cohort 2 — Testimonial',
      ),
    ).not.toBeInTheDocument()
  })
})
