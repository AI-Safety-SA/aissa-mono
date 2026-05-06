import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import PersonPage from '@/app/(frontend)/people/[id]/page'
import { getPersonDetailsPageData } from '@/lib/data'
import { getCurrentFrontendViewer } from '@/utilities/frontend-gate-server'

const notFoundMock = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND')
})

vi.mock('next/navigation', () => ({
  notFound: () => notFoundMock(),
}))

vi.mock('@/lib/data', () => ({
  getPersonDetailsPageData: vi.fn(),
}))

vi.mock('@/utilities/frontend-gate-server', () => ({
  getCurrentFrontendViewer: vi.fn(),
}))

vi.mock('@/components/person/person-header', () => ({
  PersonHeader: ({ person }: { person: { fullName: string } }) => (
    <div data-testid="person-header">{person.fullName}</div>
  ),
}))

vi.mock('@/components/person/person-main-content', () => ({
  PersonMainContent: () => <div data-testid="person-main-content" />,
}))

vi.mock('@/components/person/person-sidebar', () => ({
  PersonSidebar: () => <div data-testid="person-sidebar" />,
}))

vi.mock('@/components/person/person-timeline-explorer', () => ({
  PersonTimelineExplorer: () => <div data-testid="person-timeline-explorer" />,
}))

describe('people/[id] page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getCurrentFrontendViewer).mockResolvedValue({
      audience: 'funder',
      canViewCommunityHighlights: true,
      canViewFundingDetails: true,
      isGateEnabled: true,
      isUnlocked: true,
    })
  })

  it('calls notFound for a non-numeric id', async () => {
    await expect(PersonPage({ params: Promise.resolve({ id: 'abc' }) })).rejects.toThrow(
      'NEXT_NOT_FOUND',
    )
    expect(notFoundMock).toHaveBeenCalledTimes(1)
    expect(getPersonDetailsPageData).not.toHaveBeenCalled()
  })

  it('calls notFound when person is missing', async () => {
    vi.mocked(getPersonDetailsPageData).mockResolvedValue({
      fullTimelineRows: [],
      majorImpacts: [],
      person: null,
      testimonials: [],
      timelineItems: [],
    })

    await expect(PersonPage({ params: Promise.resolve({ id: '1' }) })).rejects.toThrow(
      'NEXT_NOT_FOUND',
    )
    expect(notFoundMock).toHaveBeenCalledTimes(1)
  })

  it('calls notFound when person is unpublished', async () => {
    vi.mocked(getPersonDetailsPageData).mockResolvedValue({
      fullTimelineRows: [],
      majorImpacts: [],
      person: {
        fullName: 'Unpublished Person',
        id: 1,
        isPublished: false,
      } as any,
      testimonials: [],
      timelineItems: [],
    })

    await expect(PersonPage({ params: Promise.resolve({ id: '1' }) })).rejects.toThrow(
      'NEXT_NOT_FOUND',
    )
    expect(notFoundMock).toHaveBeenCalledTimes(1)
  })

  it('renders published people', async () => {
    vi.mocked(getPersonDetailsPageData).mockResolvedValue({
      fullTimelineRows: [],
      majorImpacts: [],
      person: {
        fullName: 'Published Person',
        id: 1,
        isPublished: true,
      } as any,
      testimonials: [],
      timelineItems: [],
    })

    const element = await PersonPage({ params: Promise.resolve({ id: '1' }) })
    render(element)

    expect(screen.getByTestId('person-header')).toHaveTextContent('Published Person')
    expect(screen.getByTestId('person-main-content')).toBeInTheDocument()
    expect(screen.getByTestId('person-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('person-timeline-explorer')).toBeInTheDocument()
    expect(notFoundMock).not.toHaveBeenCalled()
  })

  it('passes audience-based funding visibility into the person data loader', async () => {
    vi.mocked(getCurrentFrontendViewer).mockResolvedValue({
      audience: 'community',
      canViewCommunityHighlights: false,
      canViewFundingDetails: false,
      isGateEnabled: true,
      isUnlocked: true,
    })
    vi.mocked(getPersonDetailsPageData).mockResolvedValue({
      fullTimelineRows: [],
      majorImpacts: [],
      person: {
        fullName: 'Community Viewer',
        id: 1,
        isPublished: true,
      } as any,
      testimonials: [],
      timelineItems: [],
    })

    const element = await PersonPage({ params: Promise.resolve({ id: '1' }) })
    render(element)

    expect(getPersonDetailsPageData).toHaveBeenCalledWith(1, { canViewFundingDetails: false })
  })
})
