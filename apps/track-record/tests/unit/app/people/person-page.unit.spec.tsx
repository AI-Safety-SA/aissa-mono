import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import PersonPage from '@/app/(frontend)/people/[id]/page'
import { getPersonDetailsPageData } from '@/lib/data'

const notFoundMock = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND')
})

vi.mock('next/navigation', () => ({
  notFound: () => notFoundMock(),
}))

vi.mock('@/lib/data', () => ({
  getPersonDetailsPageData: vi.fn(),
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

describe('people/[id] page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls notFound for a non-numeric id', async () => {
    await expect(PersonPage({ params: Promise.resolve({ id: 'abc' }) })).rejects.toThrow(
      'NEXT_NOT_FOUND',
    )
    expect(notFoundMock).toHaveBeenCalledTimes(1)
  })

  it('calls notFound when person is missing', async () => {
    vi.mocked(getPersonDetailsPageData).mockResolvedValue({
      fullTimelineRows: [],
      majorImpacts: [],
      person: null,
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
        id: 1,
        fullName: 'Unpublished Person',
        isPublished: false,
        highlight: true,
      } as any,
      timelineItems: [],
    })

    await expect(PersonPage({ params: Promise.resolve({ id: '1' }) })).rejects.toThrow(
      'NEXT_NOT_FOUND',
    )
    expect(notFoundMock).toHaveBeenCalledTimes(1)
  })

  it('calls notFound when person is not highlighted', async () => {
    vi.mocked(getPersonDetailsPageData).mockResolvedValue({
      fullTimelineRows: [],
      majorImpacts: [],
      person: {
        id: 1,
        fullName: 'Non Highlighted Person',
        isPublished: true,
        highlight: false,
      } as any,
      timelineItems: [],
    })

    await expect(PersonPage({ params: Promise.resolve({ id: '1' }) })).rejects.toThrow(
      'NEXT_NOT_FOUND',
    )
    expect(notFoundMock).toHaveBeenCalledTimes(1)
  })

  it('renders person details when person is published and highlighted', async () => {
    vi.mocked(getPersonDetailsPageData).mockResolvedValue({
      fullTimelineRows: [],
      majorImpacts: [],
      person: {
        id: 1,
        fullName: 'Highlighted Person',
        isPublished: true,
        highlight: true,
      } as any,
      timelineItems: [],
    })

    const element = await PersonPage({ params: Promise.resolve({ id: '1' }) })
    render(element)

    expect(screen.getByTestId('person-header')).toHaveTextContent('Highlighted Person')
    expect(screen.getByTestId('person-main-content')).toBeInTheDocument()
    expect(screen.getByTestId('person-sidebar')).toBeInTheDocument()
    expect(notFoundMock).not.toHaveBeenCalled()
  })

  it('renders tiered people even when legacy highlight is false', async () => {
    vi.mocked(getPersonDetailsPageData).mockResolvedValue({
      fullTimelineRows: [],
      majorImpacts: [],
      person: {
        id: 1,
        featuredTier: 'team',
        fullName: 'Tiered Person',
        highlight: false,
        isPublished: true,
      } as any,
      timelineItems: [],
    })

    const element = await PersonPage({ params: Promise.resolve({ id: '1' }) })
    render(element)

    expect(screen.getByTestId('person-header')).toHaveTextContent('Tiered Person')
    expect(notFoundMock).not.toHaveBeenCalled()
  })
})
