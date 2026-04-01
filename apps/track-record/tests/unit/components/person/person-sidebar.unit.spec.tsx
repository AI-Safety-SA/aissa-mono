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
    expect(screen.getByText('Aisha Example')).toBeInTheDocument()
    expect(screen.getByText('Anonymous participant')).toBeInTheDocument()
  })

  it('links testimonial attribution when a different published featured person is attached', () => {
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

    expect(screen.getByRole('link', { name: 'Linked Person' })).toHaveAttribute(
      'href',
      '/people/77',
    )
  })
})
