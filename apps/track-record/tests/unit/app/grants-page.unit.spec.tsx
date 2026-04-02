import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import GrantsPage from '@/app/(frontend)/grants/page'
import { getPublishedGrants } from '@/lib/data'
import { getCurrentFrontendViewer } from '@/utilities/frontend-gate-server'

const notFoundMock = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND')
})

vi.mock('next/navigation', () => ({
  notFound: () => notFoundMock(),
}))

vi.mock('@/lib/data', () => ({
  getPublishedGrants: vi.fn(),
}))

vi.mock('@/utilities/frontend-gate-server', () => ({
  getCurrentFrontendViewer: vi.fn(),
}))

vi.mock('@/components/ui/page-header', () => ({
  PageHeader: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  ),
}))

describe('grants page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getCurrentFrontendViewer).mockResolvedValue({
      audience: 'funder',
      canViewFundingDetails: true,
      isGateEnabled: true,
      isUnlocked: true,
    })
  })

  it('returns notFound for community viewers', async () => {
    vi.mocked(getCurrentFrontendViewer).mockResolvedValue({
      audience: 'community',
      canViewFundingDetails: false,
      isGateEnabled: true,
      isUnlocked: true,
    })

    await expect(GrantsPage()).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFoundMock).toHaveBeenCalledTimes(1)
  })

  it('renders grant details for funder viewers', async () => {
    vi.mocked(getPublishedGrants).mockResolvedValue([
      {
        id: 1,
        title: 'AIS Governance Grant',
        funder: 'Open Philanthropy',
        dollarAmount: 100000,
        grantPeriodStart: '2025-01-01T00:00:00.000Z',
        grantPeriodEnd: '2025-12-31T00:00:00.000Z',
        status: 'active',
      },
    ] as any)

    const element = await GrantsPage()
    render(element)

    expect(screen.getByRole('heading', { name: 'Grants' })).toBeInTheDocument()
    expect(screen.getByText('AIS Governance Grant')).toBeInTheDocument()
    expect(screen.getByText('Open Philanthropy')).toBeInTheDocument()
    expect(screen.getByText('$100,000')).toBeInTheDocument()
  })
})
