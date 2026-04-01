import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'

import EventsPage from '@/app/(frontend)/events/page'
import { getRecentEvents } from '@/lib/data'

vi.mock('payload', () => ({
  getPayload: vi.fn().mockResolvedValue({}),
}))

vi.mock('@/payload.config', () => ({
  default: {},
}))

vi.mock('@/lib/data', async () => {
  const actual = await vi.importActual<typeof import('@/lib/data')>('@/lib/data')
  return {
    ...actual,
    getRecentEvents: vi.fn(),
  }
})

vi.mock('@/lib/default-images', () => ({
  getDefaultImages: vi.fn().mockResolvedValue({}),
  getEventDefaultImage: vi.fn(() => null),
  getHighlightedImage: vi.fn(() => null),
}))

vi.mock('@/components/ui/page-header', () => ({
  PageHeader: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  ),
}))

vi.mock('@/components/dashboard/event-card', () => ({
  EventCard: ({ event }: { event: { name: string } }) => (
    <article data-testid="event-card">{event.name}</article>
  ),
}))

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode
    href: string
    className?: string
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

const createEvent = (id: number, name: string, metadata?: Record<string, unknown>) =>
  ({
    id,
    slug: `event-${id}`,
    name,
    type: 'workshop',
    organiser: 1,
    eventDate: `2026-03-${10 + id}T09:00:00.000Z`,
    location: `Location ${id}`,
    attendanceCount: id * 10,
    metadata,
    updatedAt: '2026-03-01T00:00:00.000Z',
    createdAt: '2026-03-01T00:00:00.000Z',
  }) as any

describe('events page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders highlighted event cards with backfill to three and keeps the remainder in a table', async () => {
    vi.mocked(getRecentEvents).mockResolvedValue([
      createEvent(1, 'Summit', { highlight: true }),
      createEvent(2, 'Workshop'),
      createEvent(3, 'Meetup'),
      createEvent(4, 'Reading Group'),
    ])

    render(await EventsPage())

    expect(screen.getByRole('heading', { name: 'Highlighted Events' })).toBeInTheDocument()
    expect(screen.getAllByTestId('event-card').map((card) => card.textContent)).toEqual([
      'Summit',
      'Workshop',
      'Meetup',
    ])

    const table = screen.getByRole('table')
    expect(within(table).getByRole('link', { name: 'Reading Group' })).toHaveAttribute(
      'href',
      '/events/event-4',
    )
  })

  it('falls back to the latest published events when no highlights are set', async () => {
    vi.mocked(getRecentEvents).mockResolvedValue([
      createEvent(1, 'First'),
      createEvent(2, 'Second'),
      createEvent(3, 'Third'),
      createEvent(4, 'Fourth'),
    ])

    render(await EventsPage())

    expect(screen.getByRole('heading', { name: 'Latest Events' })).toBeInTheDocument()
    expect(screen.getAllByTestId('event-card').map((card) => card.textContent)).toEqual([
      'First',
      'Second',
      'Third',
    ])

    const table = screen.getByRole('table')
    expect(within(table).getByText('Fourth')).toBeInTheDocument()
  })

  it('renders the empty state when there are no published events', async () => {
    vi.mocked(getRecentEvents).mockResolvedValue([])

    render(await EventsPage())

    expect(screen.getByText('No events to display yet.')).toBeInTheDocument()
  })
})
