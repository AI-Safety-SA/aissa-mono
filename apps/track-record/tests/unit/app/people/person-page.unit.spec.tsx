import { describe, it, expect, vi, beforeEach } from 'vitest'
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

  it('always returns notFound for public person detail routes', async () => {
    await expect(PersonPage({ params: Promise.resolve({ id: 'abc' }) })).rejects.toThrow(
      'NEXT_NOT_FOUND',
    )
    expect(notFoundMock).toHaveBeenCalledTimes(1)
    expect(getCurrentFrontendViewer).not.toHaveBeenCalled()
    expect(getPersonDetailsPageData).not.toHaveBeenCalled()
  })
})
