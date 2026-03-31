import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TimelineCard } from '@/components/person/timeline-card'
import type { TimelineItem } from '@/lib/types'

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('TimelineCard component', () => {
  describe('Engagement content', () => {
    it('renders engagement title', () => {
      const item: TimelineItem = {
        type: 'engagement',
        date: '2024-01-15',
        data: {
          id: 1,
          person: 1,
          type: 'participant',
          title: 'AI Safety Workshop — Participant',
          context: { relationTo: 'events', value: 1 },
          contextKind: 'event',
          updatedAt: '2024-01-15',
          createdAt: '2024-01-15',
        },
      }

      render(<TimelineCard item={item} />)
      expect(screen.getByText('AI Safety Workshop — Participant')).toBeInTheDocument()
    })

    it('falls back to type label when title is missing', () => {
      const item: TimelineItem = {
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
      }

      render(<TimelineCard item={item} />)
      expect(screen.getByText('Participant')).toBeInTheDocument()
    })

    it('renders engagement status badge', () => {
      const item: TimelineItem = {
        type: 'engagement',
        date: '2024-01-15',
        data: {
          id: 1,
          person: 1,
          type: 'participant',
          context: { relationTo: 'programs', value: 1 },
          contextKind: 'program',
          engagement_status: 'completed',
          updatedAt: '2024-01-15',
          createdAt: '2024-01-15',
        },
      }

      render(<TimelineCard item={item} />)
      expect(screen.getByText('completed')).toBeInTheDocument()
    })

    it('renders link to event context', () => {
      const item: TimelineItem = {
        type: 'engagement',
        date: '2024-01-15',
        data: {
          id: 1,
          person: 1,
          type: 'speaker',
          context: {
            relationTo: 'events',
            value: {
              id: 10,
              slug: 'test-event',
              name: 'Test Event',
              type: 'workshop',
              organiser: 1,
              eventDate: '2024-01-15',
              updatedAt: '2024-01-15',
              createdAt: '2024-01-15',
            },
          },
          contextKind: 'event',
          updatedAt: '2024-01-15',
          createdAt: '2024-01-15',
        },
      }

      render(<TimelineCard item={item} />)
      const link = screen.getByRole('link', { name: 'Test Event' })
      expect(link).toHaveAttribute('href', '/events/test-event')
    })
  })

  describe('Impact content', () => {
    it('renders impact type and summary', () => {
      const item: TimelineItem = {
        type: 'impact',
        date: '2024-02-20',
        data: {
          id: 1,
          person: 1,
          type: 'career_transition',
          summary: 'Transitioned to AI safety role',
          updatedAt: '2024-02-20',
          createdAt: '2024-02-20',
        },
      }

      render(<TimelineCard item={item} />)
      expect(screen.getByText('Career Transition')).toBeInTheDocument()
      expect(screen.getByText('Transitioned to AI safety role')).toBeInTheDocument()
    })

    it('renders verified badge when verified', () => {
      const item: TimelineItem = {
        type: 'impact',
        date: '2024-02-20',
        data: {
          id: 1,
          person: 1,
          type: 'grant_awarded',
          summary: 'Received research grant',
          isVerified: true,
          updatedAt: '2024-02-20',
          createdAt: '2024-02-20',
        },
      }

      render(<TimelineCard item={item} />)
      expect(screen.getByText('Verified')).toBeInTheDocument()
    })

    it('renders evidence link when provided', () => {
      const item: TimelineItem = {
        type: 'impact',
        date: '2024-02-20',
        data: {
          id: 1,
          person: 1,
          type: 'publication',
          summary: 'Published research paper',
          evidenceUrl: 'https://example.com/paper',
          updatedAt: '2024-02-20',
          createdAt: '2024-02-20',
        },
      }

      render(<TimelineCard item={item} />)
      const link = screen.getByRole('link', { name: 'View evidence' })
      expect(link).toHaveAttribute('href', 'https://example.com/paper')
    })
  })

  describe('Project contribution content', () => {
    it('renders project role and link', () => {
      const item: TimelineItem = {
        type: 'project_contribution',
        date: '2024-03-10',
        data: {
          id: 1,
          project: {
            id: 5,
            slug: 'ai-safety-tool',
            title: 'AI Safety Tool',
            type: 'software_tool',
            updatedAt: '2024-03-10',
            createdAt: '2024-03-10',
          },
          person: 1,
          role: 'lead_author',
          updatedAt: '2024-03-10',
          createdAt: '2024-03-10',
        },
      }

      render(<TimelineCard item={item} />)
      expect(screen.getByText('Lead Author')).toBeInTheDocument()
      const link = screen.getByRole('link', { name: 'AI Safety Tool' })
      expect(link).toHaveAttribute('href', '/projects/ai-safety-tool')
    })

    it('handles project as number (not populated)', () => {
      const item: TimelineItem = {
        type: 'project_contribution',
        date: '2024-03-10',
        data: {
          id: 1,
          project: 5,
          person: 1,
          role: 'contributor',
          updatedAt: '2024-03-10',
          createdAt: '2024-03-10',
        },
      }

      render(<TimelineCard item={item} />)
      expect(screen.getByText('Contributor')).toBeInTheDocument()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })
  })

  describe('Event host content', () => {
    it('renders event host with event link', () => {
      const item: TimelineItem = {
        type: 'event_host',
        date: '2024-04-05',
        data: {
          id: 1,
          event: {
            id: 20,
            slug: 'workshop-event',
            name: 'AI Workshop',
            type: 'workshop',
            organiser: 1,
            eventDate: '2024-04-05',
            updatedAt: '2024-04-05',
            createdAt: '2024-04-05',
          },
          person: 1,
          updatedAt: '2024-04-05',
          createdAt: '2024-04-05',
        },
      }

      render(<TimelineCard item={item} />)
      expect(screen.getByText(/Hosted.*Workshop/)).toBeInTheDocument()
      const link = screen.getByRole('link', { name: 'AI Workshop' })
      expect(link).toHaveAttribute('href', '/events/workshop-event')
    })
  })

  describe('Event organisation content', () => {
    it('renders organised event with details', () => {
      const item: TimelineItem = {
        type: 'event_organisation',
        date: '2024-05-15',
        data: {
          id: 30,
          slug: 'panel-discussion',
          name: 'AI Safety Panel',
          type: 'panel',
          organiser: 1,
          eventDate: '2024-05-15',
          attendanceCount: 50,
          updatedAt: '2024-05-15',
          createdAt: '2024-05-15',
        },
      }

      render(<TimelineCard item={item} />)
      expect(screen.getByText('Organised Panel')).toBeInTheDocument()
      const link = screen.getByRole('link', { name: 'AI Safety Panel' })
      expect(link).toHaveAttribute('href', '/events/panel-discussion')
      expect(screen.getByText('50 attendees')).toBeInTheDocument()
    })

    it('uses typeOther for other event labels', () => {
      const item: TimelineItem = {
        type: 'event_organisation',
        date: '2024-05-15',
        data: {
          id: 31,
          slug: 'community-circle',
          name: 'Community Circle',
          type: 'other',
          typeOther: 'community reading circle',
          organiser: 1,
          eventDate: '2024-05-15',
          attendanceCount: 20,
          updatedAt: '2024-05-15',
          createdAt: '2024-05-15',
        },
      }

      render(<TimelineCard item={item} />)
      expect(screen.getByText('Organised Community Reading Circle')).toBeInTheDocument()
    })
  })

  describe('Common elements', () => {
    it('displays formatted date', () => {
      const item: TimelineItem = {
        type: 'engagement',
        date: '2024-06-20',
        data: {
          id: 1,
          person: 1,
          type: 'participant',
          context: { relationTo: 'events', value: 1 },
          contextKind: 'event',
          updatedAt: '2024-06-20',
          createdAt: '2024-06-20',
        },
      }

      render(<TimelineCard item={item} />)
      expect(screen.getByText('Jun 20, 2024')).toBeInTheDocument()
    })

    it('displays type badge', () => {
      const item: TimelineItem = {
        type: 'impact',
        date: '2024-01-01',
        data: {
          id: 1,
          person: 1,
          type: 'educational',
          summary: 'Test impact',
          updatedAt: '2024-01-01',
          createdAt: '2024-01-01',
        },
      }

      render(<TimelineCard item={item} />)
      expect(screen.getByText('Impact')).toBeInTheDocument()
    })
  })
})
