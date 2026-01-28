import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PersonTimeline } from '@/components/person/person-timeline'
import type { TimelineItem } from '@/lib/types'

// Mock TimelineCard to simplify testing
vi.mock('@/components/person/timeline-card', () => ({
  TimelineCard: ({ item }: { item: TimelineItem }) => (
    <div data-testid={`timeline-card-${item.type}`}>{item.type}</div>
  ),
}))

describe('PersonTimeline component', () => {
  it('renders empty state when no items', () => {
    render(<PersonTimeline items={[]} />)
    expect(screen.getByText('No timeline entries yet.')).toBeInTheDocument()
  })

  it('renders timeline cards for each item', () => {
    const items: TimelineItem[] = [
      {
        type: 'engagement',
        date: '2024-01-15',
        data: {
          id: 1,
          person: 1,
          type: 'participant',
          context: { relationTo: 'events', value: 1 },
          contextKind: 'event',
          updatedAt: '2024-01-15',
          createdAt: '2024-01-15',
        },
      },
      {
        type: 'impact',
        date: '2024-02-20',
        data: {
          id: 1,
          person: 1,
          type: 'career_transition',
          summary: 'Got a new job',
          updatedAt: '2024-02-20',
          createdAt: '2024-02-20',
        },
      },
    ]

    render(<PersonTimeline items={items} />)

    expect(screen.getByTestId('timeline-card-engagement')).toBeInTheDocument()
    expect(screen.getByTestId('timeline-card-impact')).toBeInTheDocument()
  })

  it('renders all timeline item types', () => {
    const items: TimelineItem[] = [
      {
        type: 'engagement',
        date: '2024-01-01',
        data: {
          id: 1,
          person: 1,
          type: 'participant',
          context: { relationTo: 'events', value: 1 },
          contextKind: 'event',
          updatedAt: '2024-01-01',
          createdAt: '2024-01-01',
        },
      },
      {
        type: 'impact',
        date: '2024-01-02',
        data: {
          id: 2,
          person: 1,
          type: 'publication',
          summary: 'Published a paper',
          updatedAt: '2024-01-02',
          createdAt: '2024-01-02',
        },
      },
      {
        type: 'project_contribution',
        date: '2024-01-03',
        data: {
          id: 3,
          project: 1,
          person: 1,
          role: 'lead_author',
          updatedAt: '2024-01-03',
          createdAt: '2024-01-03',
        },
      },
      {
        type: 'event_host',
        date: '2024-01-04',
        data: {
          id: 4,
          event: 1,
          person: 1,
          updatedAt: '2024-01-04',
          createdAt: '2024-01-04',
        },
      },
      {
        type: 'event_organisation',
        date: '2024-01-05',
        data: {
          id: 5,
          slug: 'test-event',
          name: 'Test Event',
          type: 'workshop',
          organiser: 1,
          eventDate: '2024-01-05',
          updatedAt: '2024-01-05',
          createdAt: '2024-01-05',
        },
      },
    ]

    render(<PersonTimeline items={items} />)

    expect(screen.getByTestId('timeline-card-engagement')).toBeInTheDocument()
    expect(screen.getByTestId('timeline-card-impact')).toBeInTheDocument()
    expect(screen.getByTestId('timeline-card-project_contribution')).toBeInTheDocument()
    expect(screen.getByTestId('timeline-card-event_host')).toBeInTheDocument()
    expect(screen.getByTestId('timeline-card-event_organisation')).toBeInTheDocument()
  })
})
