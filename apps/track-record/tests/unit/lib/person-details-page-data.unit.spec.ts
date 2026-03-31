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
        docs: [
          {
            id: 1,
            createdAt: '2024-01-01T00:00:00.000Z',
            title: 'Winter 2024 — Participant',
            context: {
              relationTo: 'cohorts',
              value: {
                name: 'Winter 2024',
                slug: 'winter-2024',
                program: {
                  name: 'AISF Fellowship',
                  slug: 'aisf-fellowship',
                },
              },
            },
            contextDate: null,
            engagement_status: 'completed',
            type: 'participant',
          },
        ],
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
      .mockResolvedValueOnce({
        totalDocs: 0,
        docs: [],
      })
      .mockResolvedValueOnce({
        totalDocs: 0,
        docs: [],
      })
      .mockResolvedValueOnce({
        totalDocs: 0,
        docs: [],
      })

    const result = await getPersonDetailsPageData(42)

    expect(result.person?.id).toBe(42)
    expect(result.timelineItems).toHaveLength(4)
    expect(result.fullTimelineRows).toHaveLength(4)
    expect(result.fullTimelineRows[0]).toMatchObject({
      id: 'event-host-4',
    })
    expect(result.fullTimelineRows[3]).toMatchObject({
      detail: 'Participant • completed',
      href: '/programs/aisf-fellowship/cohorts/winter-2024',
      title: 'Winter 2024 — Participant',
    })
    expect(result.majorImpacts).toHaveLength(1)
    expect(result.testimonials).toEqual([])
    expect(mockFind).toHaveBeenCalledTimes(8)
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
      .mockResolvedValueOnce({
        totalDocs: 0,
        docs: [],
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
      .mockResolvedValueOnce({ totalDocs: 0, docs: [] })
      .mockResolvedValueOnce({ totalDocs: 0, docs: [] })
      .mockResolvedValueOnce({ totalDocs: 0, docs: [] })

    const result = await getPersonDetailsPageData(555)

    expect(result.majorImpacts.map((impact) => impact.id)).toEqual([20, 10])
    expect(result.majorImpacts[0]?.isPinned).toBe(true)
  })

  it('derives major impacts and totalImpacts from research, grants, events, and speaker/facilitator engagements', async () => {
    mockFindByID.mockResolvedValue({
      id: 777,
      fullName: 'Derived Impact Person',
      isPublished: true,
      majorImpactPins: [],
      totalEngagements: 0,
      totalImpacts: 0,
      totalContributions: 0,
      firstEngagementDate: null,
      lastEngagementDate: null,
    })

    mockFind
      .mockResolvedValueOnce({
        totalDocs: 2,
        docs: [
          {
            id: 11,
            createdAt: '2024-01-03T00:00:00.000Z',
            contextDate: '2024-01-03T00:00:00.000Z',
            contextKind: 'event',
            context: {
              relationTo: 'events',
              value: { name: 'Cape Town Workshop', slug: 'cape-town-workshop' },
            },
            type: 'speaker',
          },
          {
            id: 12,
            createdAt: '2024-01-02T00:00:00.000Z',
            contextDate: '2024-01-02T00:00:00.000Z',
            contextKind: 'program',
            context: {
              relationTo: 'programs',
              value: { name: 'AISF Fellowship', slug: 'aisf-fellowship' },
            },
            type: 'facilitator',
          },
        ],
      })
      .mockResolvedValueOnce({
        totalDocs: 1,
        docs: [
          {
            id: 13,
            createdAt: '2024-01-01T00:00:00.000Z',
            summary: 'Manual impact',
            type: 'publication',
          },
        ],
      })
      .mockResolvedValueOnce({ totalDocs: 0, docs: [] })
      .mockResolvedValueOnce({ totalDocs: 0, docs: [] })
      .mockResolvedValueOnce({
        totalDocs: 1,
        docs: [
          {
            id: 14,
            createdAt: '2024-01-04T00:00:00.000Z',
            eventDate: '2024-01-04T00:00:00.000Z',
            name: 'Johannesburg Meetup',
            slug: 'joburg-meetup',
            type: 'meetup',
          },
        ],
      })
      .mockResolvedValueOnce({
        totalDocs: 1,
        docs: [
          {
            id: 15,
            createdAt: '2024-01-05T00:00:00.000Z',
            publicationDate: '2024-01-05T00:00:00.000Z',
            title: 'Scaling Evaluations',
            acceptedVenue: 'FAccT',
            status: 'published',
            isPublished: true,
            authors: [{ person: 777 }],
          },
        ],
      })
      .mockResolvedValueOnce({
        totalDocs: 1,
        docs: [
          {
            id: 16,
            createdAt: '2024-01-06T00:00:00.000Z',
            role: 'Co-PI',
            grant: {
              id: 17,
              title: 'Funder Ready Grant',
              funder: 'Open Philanthropy',
              currency: 'USD',
              dollarAmount: 50000,
              grantPeriodStart: '2024-01-06T00:00:00.000Z',
              status: 'awarded',
              isPublished: true,
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        totalDocs: 1,
        docs: [
          {
            id: 18,
            quote: 'AISSA meaningfully changed my career trajectory.',
            priorityScore: 80,
            createdAt: '2024-01-07T00:00:00.000Z',
            person: { id: 777, fullName: 'Derived Impact Person' },
            isPublished: true,
          },
        ],
      })

    const result = await getPersonDetailsPageData(777)

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          totalImpacts: 6,
        }),
      }),
    )
    expect(result.majorImpacts.map((impact) => impact.typeLabel)).toEqual([
      'Grant',
      'Published Research',
      'Organised Event',
      'Speaker',
      'Facilitator',
    ])
    expect(result.majorImpacts[0]).toMatchObject({
      meta: expect.arrayContaining(['Open Philanthropy', '$50,000', 'Co-PI']),
      summary: 'Funder Ready Grant',
    })
    expect(result.testimonials).toHaveLength(1)
  })
})
