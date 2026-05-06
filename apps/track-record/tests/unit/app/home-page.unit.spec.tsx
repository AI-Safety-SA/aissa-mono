import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import HomePage from '@/app/(frontend)/page'
import {
  getFeaturedResearch,
  getGroupedFeaturedPeople,
  getImpactStats,
  getProgramsWithStats,
  getRecentEvents,
  getTestimonials,
} from '@/lib/data'
import { getCurrentFrontendViewer } from '@/utilities/frontend-gate-server'

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
    getImpactStats: vi.fn(),
    getProgramsWithStats: vi.fn(),
    getRecentEvents: vi.fn(),
    getFeaturedResearch: vi.fn(),
    getTestimonials: vi.fn(),
    getGroupedFeaturedPeople: vi.fn(),
  }
})

vi.mock('@/lib/default-images', () => ({
  getDefaultImages: vi.fn().mockResolvedValue({}),
  getEventDefaultImage: vi.fn(() => null),
  getProgramDefaultImage: vi.fn(() => null),
}))

vi.mock('@/utilities/frontend-gate-server', () => ({
  getCurrentFrontendViewer: vi.fn(),
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
  TestimonialList: () => (
    <section>
      <h2>What Participants Say</h2>
      <div>Testimonials</div>
    </section>
  ),
}))

describe('home page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getCurrentFrontendViewer).mockResolvedValue({
      audience: 'public',
      canViewCommunityHighlights: false,
      canViewFundingDetails: false,
      isGateEnabled: false,
      isUnlocked: true,
    })

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
  })

  it('renders public impact cards without funding or community links', async () => {
    render(await HomePage())

    expect(screen.queryByRole('link', { name: /Total Participants/i })).not.toBeInTheDocument()
    expect(screen.getByText('Total Participants')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Events Held/i })).toHaveAttribute('href', '/events')
    expect(screen.getByRole('link', { name: /Programs Completed/i })).toHaveAttribute(
      'href',
      '/programs',
    )
    expect(screen.getByRole('link', { name: /Significant Research Outputs/i })).toHaveAttribute(
      'href',
      '/research',
    )
    expect(screen.queryByRole('link', { name: /Total Funding/i })).not.toBeInTheDocument()
    expect(screen.queryByText('$250,000')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Community Projects/i })).not.toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(getGroupedFeaturedPeople).not.toHaveBeenCalled()
  })

  it('does not render community highlights or community reach on the public homepage', async () => {
    const { container } = render(await HomePage())

    expect(screen.queryByText('Featured Community')).not.toBeInTheDocument()
    expect(screen.queryByText('People Building the AISSA Track Record')).not.toBeInTheDocument()
    expect(screen.queryByText('Community Reach')).not.toBeInTheDocument()
    expect(container.querySelector('#featured-community')).toBeNull()
  })

  it('renders funding and community highlights for funder viewers', async () => {
    vi.mocked(getCurrentFrontendViewer).mockResolvedValue({
      audience: 'funder',
      canViewCommunityHighlights: true,
      canViewFundingDetails: true,
      isGateEnabled: true,
      isUnlocked: true,
    })

    const { container } = render(await HomePage())

    expect(screen.getByRole('link', { name: /Total Funding/i })).toHaveAttribute('href', '/grants')
    expect(screen.getByText('$250,000')).toBeInTheDocument()
    expect(screen.getByText('Featured Community')).toBeInTheDocument()
    expect(screen.getByText('People Building the AISSA Track Record')).toBeInTheDocument()
    expect(screen.getByText('Ada Example')).toBeInTheDocument()
    expect(container.querySelector('#featured-community')).toBeTruthy()
  })

  it('renders homepage sections in the updated product-priority order', async () => {
    vi.mocked(getProgramsWithStats).mockResolvedValue([
      {
        id: 1,
        name: 'AISF',
        slug: 'aisf',
        type: 'fellowship',
        cohortCount: 0,
        totalCompletions: 0,
        updatedAt: '2026-03-01T00:00:00.000Z',
        createdAt: '2026-03-01T00:00:00.000Z',
      },
    ] as any)
    vi.mocked(getRecentEvents).mockResolvedValue([
      {
        id: 1,
        name: 'Alignment Retreat',
        slug: 'alignment-retreat',
        type: 'retreat',
        organiser: 1,
        eventDate: '2026-03-10T00:00:00.000Z',
        metadata: { highlight: true },
        updatedAt: '2026-03-01T00:00:00.000Z',
        createdAt: '2026-03-01T00:00:00.000Z',
      },
    ] as any)
    vi.mocked(getFeaturedResearch).mockResolvedValue([
      {
        id: 1,
        title: 'Research Output',
      },
    ] as any)
    vi.mocked(getTestimonials).mockResolvedValue([
      {
        id: 1,
        quote: 'Excellent cohort.',
      },
    ] as any)
    render(await HomePage())

    const orderedHeadings = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent)

    expect(orderedHeadings).toEqual([
      'Our Impact',
      'What Participants Say',
      'Featured Programs',
      'Featured Research',
      'Events',
    ])
  })

  it('hides the funding card for community viewers', async () => {
    vi.mocked(getCurrentFrontendViewer).mockResolvedValue({
      audience: 'community',
      canViewCommunityHighlights: false,
      canViewFundingDetails: false,
      isGateEnabled: true,
      isUnlocked: true,
    })

    render(await HomePage())

    expect(screen.queryByRole('link', { name: /Total Funding/i })).not.toBeInTheDocument()
    expect(screen.queryByText('$250,000')).not.toBeInTheDocument()
  })
})
