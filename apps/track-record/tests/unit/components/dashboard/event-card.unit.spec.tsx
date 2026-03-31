import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EventCard } from '@/components/dashboard/event-card'
import type { Event } from '@/payload-types'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

const createMockEvent = (overrides: Partial<Event> = {}): Event => ({
  id: 1,
  slug: 'event-1',
  name: 'Event 1',
  type: 'workshop',
  organiser: 1 as any,
  eventDate: '2024-01-15T00:00:00.000Z',
  updatedAt: '2024-01-01',
  createdAt: '2024-01-01',
  ...overrides,
})

describe('EventCard', () => {
  it('renders the event name with a link', () => {
    const event = createMockEvent()
    render(<EventCard event={event} />)

    expect(screen.getByRole('link', { name: 'Event 1' })).toHaveAttribute('href', '/events/event-1')
  })

  it('renders a highlighted image when one is available', () => {
    const event = createMockEvent({
      images: [
        {
          id: 'image-1',
          isHighlighted: true,
          image: {
            id: 9,
            alt: 'Event hero',
            url: '/api/media/file/event-hero.png',
            updatedAt: '2024-01-01',
            createdAt: '2024-01-01',
          },
        },
      ],
    })

    render(<EventCard event={event} />)

    expect(screen.getByRole('img')).toHaveAttribute('src', '/api/media/file/event-hero.png')
  })

  it('renders a title-cased typeOther label when the event type is other', () => {
    const event = createMockEvent({
      type: 'other',
      typeOther: 'community reading circle',
    })

    render(<EventCard event={event} />)

    expect(screen.getByText('Community Reading Circle')).toBeInTheDocument()
  })
})
