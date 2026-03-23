import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ResearchPage from '@/app/(frontend)/research/page'
import { getPublishedResearch } from '@/lib/data'

vi.mock('@/lib/data', () => ({
  getPublishedResearch: vi.fn(),
}))

vi.mock('@/components/ui/page-header', () => ({
  PageHeader: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  ),
}))

describe('research page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a table with external links, year-only dates, and badges', async () => {
    vi.mocked(getPublishedResearch).mockResolvedValue([
      {
        acceptedVenue: 'NeurIPS',
        arxivLink: 'https://arxiv.org/abs/1234.5678',
        authors: [
          { id: '1', person: { fullName: 'Ada Lovelace' } },
          { id: '2', name: 'Grace Hopper' },
        ],
        id: 1,
        publicationDate: '2025-01-05T00:00:00.000Z',
        status: 'accepted',
        title: 'Scalable Oversight in Practice',
        venueType: 'conference',
      },
      {
        acceptedVenue: null,
        arxivLink: null,
        authors: [],
        doi: '10.1000/example',
        id: 2,
        publicationDate: null,
        status: 'submitted',
        title: 'A DOI-Only Paper',
        venueType: 'preprint',
      },
      {
        acceptedVenue: 'Workshop on Governance',
        arxivLink: null,
        authors: [],
        doi: null,
        id: 3,
        publicationDate: '2024-03-01T00:00:00.000Z',
        status: null,
        title: 'Offline Research Entry',
        venueType: null,
      },
    ] as any)

    const element = await ResearchPage()
    render(element)

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Scalable Oversight in Practice' })).toHaveAttribute(
      'href',
      'https://arxiv.org/abs/1234.5678',
    )
    expect(screen.getByRole('link', { name: 'A DOI-Only Paper' })).toHaveAttribute(
      'href',
      'https://doi.org/10.1000/example',
    )
    expect(screen.getByText('Ada Lovelace, Grace Hopper')).toBeInTheDocument()
    expect(screen.getByText('Conference')).toBeInTheDocument()
    expect(screen.getByText('2025')).toBeInTheDocument()
    expect(screen.getByText('Accepted')).toBeInTheDocument()
    expect(screen.getByText('Offline Research Entry')).toBeInTheDocument()
  })

  it('renders the empty state when no research is published', async () => {
    vi.mocked(getPublishedResearch).mockResolvedValue([])

    const element = await ResearchPage()
    render(element)

    expect(screen.getByText('No research publications to display yet.')).toBeInTheDocument()
  })
})
