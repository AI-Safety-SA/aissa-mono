import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getPersonDetailsPageData } from '@/lib/data'
import { getPayload } from 'payload'

vi.mock('payload', () => ({
  getPayload: vi.fn(),
}))

vi.mock('@/payload.config', () => ({
  default: {},
}))

describe('getPersonDetailsPageData', () => {
  const mockFindByID = vi.fn()
  const mockFind = vi.fn()
  const mockUpdate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdate.mockResolvedValue({})
    vi.mocked(getPayload).mockResolvedValue({
      findByID: mockFindByID,
      find: mockFind,
      update: mockUpdate,
    } as any)
  })

  it('loads timeline data once and skips write when metrics are aligned', async () => {
    mockFindByID.mockResolvedValue({
      id: 42,
      fullName: 'Aligned Person',
      isPublished: true,
      totalEngagements: 3,
      totalImpacts: 1,
      totalContributions: 2,
      firstEngagementDate: '2024-01-01T00:00:00.000Z',
      lastEngagementDate: '2024-01-04T00:00:00.000Z',
    })

    mockFind
      .mockResolvedValueOnce({
        totalDocs: 1,
        docs: [{ id: 1, createdAt: '2024-01-01T00:00:00.000Z', contextDate: null }],
      })
      .mockResolvedValueOnce({
        totalDocs: 1,
        docs: [{ id: 2, createdAt: '2024-01-02T00:00:00.000Z' }],
      })
      .mockResolvedValueOnce({
        totalDocs: 1,
        docs: [{ id: 3, createdAt: '2024-01-03T00:00:00.000Z', project: null }],
      })
      .mockResolvedValueOnce({
        totalDocs: 1,
        docs: [{ id: 4, createdAt: '2024-01-04T00:00:00.000Z', event: null }],
      })
      .mockResolvedValueOnce({
        totalDocs: 0,
        docs: [],
      })

    const result = await getPersonDetailsPageData(42)

    expect(result.person?.id).toBe(42)
    expect(result.timelineItems).toHaveLength(4)
    expect(result.fullTimelineRows).toHaveLength(4)
    expect(result.majorImpacts).toHaveLength(1)
    expect(mockFind).toHaveBeenCalledTimes(5)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('updates stored metrics when they are misaligned', async () => {
    mockFindByID.mockResolvedValue({
      id: 99,
      fullName: 'Misaligned Person',
      isPublished: true,
      totalEngagements: 10,
      totalImpacts: 10,
      totalContributions: 10,
      firstEngagementDate: null,
      lastEngagementDate: null,
    })

    mockFind
      .mockResolvedValueOnce({
        totalDocs: 1,
        docs: [{ id: 1, createdAt: '2024-01-01T00:00:00.000Z', contextDate: null }],
      })
      .mockResolvedValueOnce({
        totalDocs: 2,
        docs: [
          { id: 2, createdAt: '2024-01-03T00:00:00.000Z' },
          { id: 3, createdAt: '2024-01-02T00:00:00.000Z' },
        ],
      })
      .mockResolvedValueOnce({
        totalDocs: 1,
        docs: [{ id: 4, createdAt: '2024-01-03T00:00:00.000Z', project: null }],
      })
      .mockResolvedValueOnce({
        totalDocs: 0,
        docs: [],
      })
      .mockResolvedValueOnce({
        totalDocs: 0,
        docs: [],
      })

    await getPersonDetailsPageData(99)

    expect(mockUpdate).toHaveBeenCalledTimes(1)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'persons',
        id: 99,
        overrideAccess: true,
        data: expect.objectContaining({
          totalEngagements: 2,
          totalImpacts: 2,
          totalContributions: 1,
          firstEngagementDate: '2024-01-01T00:00:00.000Z',
          lastEngagementDate: '2024-01-03T00:00:00.000Z',
        }),
      }),
    )
  })

  it('fails open when correction update throws', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    mockFindByID.mockResolvedValue({
      id: 123,
      fullName: 'Error Person',
      isPublished: true,
      totalEngagements: 0,
      totalImpacts: 0,
      totalContributions: 0,
      firstEngagementDate: null,
      lastEngagementDate: null,
    })

    mockFind
      .mockResolvedValueOnce({
        totalDocs: 1,
        docs: [{ id: 1, createdAt: '2024-01-01T00:00:00.000Z', contextDate: null }],
      })
      .mockResolvedValueOnce({ totalDocs: 0, docs: [] })
      .mockResolvedValueOnce({ totalDocs: 0, docs: [] })
      .mockResolvedValueOnce({ totalDocs: 0, docs: [] })
      .mockResolvedValueOnce({ totalDocs: 0, docs: [] })

    mockUpdate.mockRejectedValue(new Error('db write failed'))

    const result = await getPersonDetailsPageData(123)

    expect(result.person?.id).toBe(123)
    expect(result.timelineItems).toHaveLength(1)
    expect(result.fullTimelineRows).toHaveLength(1)
    expect(errorSpy).toHaveBeenCalledTimes(1)

    errorSpy.mockRestore()
  })

  it('prefers pinned impacts before recent auto-filled impacts', async () => {
    mockFindByID.mockResolvedValue({
      id: 555,
      fullName: 'Pinned Person',
      isPublished: true,
      majorImpactPins: [20],
      totalEngagements: 0,
      totalImpacts: 0,
      totalContributions: 0,
      firstEngagementDate: null,
      lastEngagementDate: null,
    })

    mockFind
      .mockResolvedValueOnce({ totalDocs: 0, docs: [] })
      .mockResolvedValueOnce({
        totalDocs: 2,
        docs: [
          {
            id: 10,
            createdAt: '2024-01-01T00:00:00.000Z',
            summary: 'Auto impact',
            type: 'publication',
          },
          {
            id: 20,
            createdAt: '2023-01-01T00:00:00.000Z',
            summary: 'Pinned impact',
            type: 'grant_awarded',
          },
        ],
      })
      .mockResolvedValueOnce({ totalDocs: 0, docs: [] })
      .mockResolvedValueOnce({ totalDocs: 0, docs: [] })
      .mockResolvedValueOnce({ totalDocs: 0, docs: [] })

    const result = await getPersonDetailsPageData(555)

    expect(result.majorImpacts.map((impact) => impact.id)).toEqual([20, 10])
    expect(result.majorImpacts[0]?.isPinned).toBe(true)
  })
})
