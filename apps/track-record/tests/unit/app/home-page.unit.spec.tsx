import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import HomePage from '@/app/(frontend)/page'
import {
  getCommunityStats,
  getFeaturedResearch,
  getGroupedFeaturedPeople,
  getImpactStats,
  getProgramsWithStats,
  getRecentEvents,
  getTestimonials,
} from '@/lib/data'

vi.mock('payload', () => ({
  getPayload: vi.fn().mockResolvedValue({}),
}))

vi.mock('@/payload.config', () => ({
  default: {},
}))

vi.mock('@/lib/data', () => ({
  getImpactStats: vi.fn(),
  getProgramsWithStats: vi.fn(),
  getRecentEvents: vi.fn(),
  getFeaturedResearch: vi.fn(),
  getTestimonials: vi.fn(),
  getGroupedFeaturedPeople: vi.fn(),
  getCommunityStats: vi.fn(),
}))

vi.mock('@/lib/default-images', () => ({
  getDefaultImages: vi.fn().mockResolvedValue({}),
  getEventDefaultImage: vi.fn(() => null),
  getProgramDefaultImage: vi.fn(() => null),
}))

vi.mock('@/lib/featured-people', () => ({
  FEATURED_TIER_ORDER: ['team'],
  FEATURED_TIER_CONTENT: {
    team: {
      title: 'Core Team',
      description: 'People building the organisation.',
    },
  },
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

vi.mock('@/components/dashboard/program-card', () => ({
  ProgramCard: ({ program }: { program: { name: string } }) => <div>{program.name}</div>,
}))

vi.mock('@/components/dashboard/event-card', () => ({
  EventCard: ({ event }: { event: { name: string } }) => <div>{event.name}</div>,
}))

vi.mock('@/components/dashboard/research-card', () => ({
  ResearchCard: ({ research }: { research: { title: string } }) => <div>{research.title}</div>,
}))

vi.mock('@/components/dashboard/person-card', () => ({
  PersonCard: ({ person }: { person: { fullName: string } }) => <div>{person.fullName}</div>,
}))

vi.mock('@/components/dashboard/testimonial-list', () => ({
  TestimonialList: () => <div>Testimonials</div>,
}))

describe('home page', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(getImpactStats).mockResolvedValue({
      totalParticipants: 128,
      totalEvents: 24,
      totalPrograms: 9,
      totalResearch: 6,
      totalProjects: 14,
      totalFundedGrants: 3,
      totalFundingDollars: 250000,
    })
    vi.mocked(getProgramsWithStats).mockResolvedValue([])
    vi.mocked(getRecentEvents).mockResolvedValue([])
    vi.mocked(getFeaturedResearch).mockResolvedValue([])
    vi.mocked(getTestimonials).mockResolvedValue([])
    vi.mocked(getGroupedFeaturedPeople).mockResolvedValue({
      team: [
        {
          id: 1,
          fullName: 'Ada Example',
        },
      ],
    } as any)
    vi.mocked(getCommunityStats).mockResolvedValue({
      linkedinFollowers: null,
      substackSubscribers: null,
      lumaSubscribers: null,
      whatsappCommunitySize: null,
      slackMembers: null,
      coworkingSeats: null,
    } as any)
  })

  it('renders five linked impact cards with a separate research destination', async () => {
    render(await HomePage())

    expect(screen.getByRole('link', { name: /Total Participants/i })).toHaveAttribute(
      'href',
      '#featured-community',
    )
    expect(screen.getByRole('link', { name: /Events Held/i })).toHaveAttribute('href', '/events')
    expect(screen.getByRole('link', { name: /Programs Completed/i })).toHaveAttribute(
      'href',
      '/programs',
    )
    expect(screen.getByRole('link', { name: /Significant Research Outputs/i })).toHaveAttribute(
      'href',
      '/research',
    )
    expect(screen.getByRole('link', { name: /Total Funding/i })).toHaveAttribute('href', '/grants')
    expect(screen.queryByRole('link', { name: /Community Projects/i })).not.toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('anchors the participants card target to the featured community section', async () => {
    const { container } = render(await HomePage())

    expect(screen.getByText('Featured Community')).toBeInTheDocument()
    expect(container.querySelector('#featured-community')).toBeTruthy()
  })
})
