import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  calculateParticipationTouchpoints,
  getAllPeople,
  getFeaturedResearch,
  getImpactStats,
  getProgramsWithStats,
  getTestimonials,
} from '@/lib/data'
import { getPayload } from 'payload'

// Mock the payload module
vi.mock('payload', () => ({
  getPayload: vi.fn(),
}))

// Mock the config
vi.mock('@/payload.config', () => ({
  default: {},
}))

describe('getImpactStats', () => {
  const mockFind = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup mock payload instance
    const mockPayload = {
      find: mockFind,
    }

    vi.mocked(getPayload).mockResolvedValue(mockPayload as any)
  })

  it('fetches all collections in parallel', async () => {
    // Setup mock responses
    mockFind
      .mockResolvedValueOnce({
        docs: [{ attendanceCount: 10 }],
        totalDocs: 5,
      }) // events
      .mockResolvedValueOnce({
        docs: [{ id: 1, metadata: {} }],
        totalDocs: 3,
      }) // programs
      .mockResolvedValueOnce({ totalDocs: 6 }) // research
      .mockResolvedValueOnce({ totalDocs: 8 }) // projects
      .mockResolvedValueOnce({
        totalDocs: 2,
        docs: [
          { dollarAmount: 1000, currency: 'USD' },
          { dollarAmount: 2000, currency: 'ZAR' },
        ],
      }) // grants
      .mockResolvedValueOnce({
        docs: [{ id: 11, program: 1, acceptedCount: 20, completionCount: 10 }],
      }) // cohorts
      .mockResolvedValueOnce({ docs: [] }) // engagements

    const result = await getImpactStats()

    // Should call find 7 times (events, programs, research, projects, grants, cohorts, engagements)
    expect(mockFind).toHaveBeenCalledTimes(7)
    expect(result.totalFundingDollars).toBe(3000)

    // Verify parallel execution - all calls should be made
    expect(mockFind).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        collection: 'events',
      }),
    )
    expect(mockFind).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        collection: 'programs',
      }),
    )
    expect(mockFind).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        collection: 'research',
      }),
    )
    expect(mockFind).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        collection: 'projects',
      }),
    )
    expect(mockFind).toHaveBeenNthCalledWith(
      5,
      expect.objectContaining({
        collection: 'grants',
      }),
    )
    expect(mockFind).toHaveBeenNthCalledWith(
      6,
      expect.objectContaining({
        collection: 'cohorts',
      }),
    )
    expect(mockFind).toHaveBeenNthCalledWith(
      7,
      expect.objectContaining({
        collection: 'engagements',
      }),
    )
  })

  it('calculates total participants as event attendance plus program-card participants', async () => {
    mockFind
      .mockResolvedValueOnce({
        docs: [{ attendanceCount: 5 }, { attendanceCount: 7 }],
        totalDocs: 2,
      }) // events
      .mockResolvedValueOnce({
        docs: [
          { id: 1, metadata: {} },
          { id: 2, metadata: { participants: 99 } },
          { id: 3, metadata: { participants: '9' } },
        ],
        totalDocs: 3,
      }) // programs
      .mockResolvedValueOnce({ totalDocs: 6 })
      .mockResolvedValueOnce({ totalDocs: 8 })
      .mockResolvedValueOnce({ totalDocs: 0, docs: [] })
      .mockResolvedValueOnce({
        docs: [
          { id: 11, program: 1, acceptedCount: 10, completionCount: 8 },
          { id: 12, program: 1, acceptedCount: null, completionCount: 0 },
          { id: 13, program: 1, acceptedCount: 5, completionCount: 2 },
        ],
      }) // cohorts
      .mockResolvedValueOnce({
        docs: [
          { id: 201, contextKind: 'program', context: { relationTo: 'programs', value: 2 } },
          { id: 202, contextKind: 'program', context: { relationTo: 'programs', value: 2 } },
        ],
      }) // engagements

    const result = await getImpactStats()

    expect(result.totalParticipants).toBe(38) // event attendance 12 + program totals 15 + 2 + 9
  })

  it('calculates participation touchpoints from event attendance and program participants', () => {
    expect(
      calculateParticipationTouchpoints(
        [{ attendanceCount: 30 }, { attendanceCount: null }, { attendanceCount: 12 }],
        [{ totalParticipants: 20 }, { totalParticipants: undefined }, { totalParticipants: 8 }],
      ),
    ).toBe(70)
  })

  it('returns correct stats structure', async () => {
    mockFind
      .mockResolvedValueOnce({
        docs: [{ attendanceCount: 40 }],
        totalDocs: 50,
      })
      .mockResolvedValueOnce({
        docs: [{ id: 1, metadata: {} }],
        totalDocs: 10,
      })
      .mockResolvedValueOnce({ totalDocs: 6 })
      .mockResolvedValueOnce({ totalDocs: 25 })
      .mockResolvedValueOnce({
        totalDocs: 3,
        docs: [
          { dollarAmount: 2000, currency: 'USD' },
          { dollarAmount: 1000, currency: 'USD' },
          { dollarAmount: 50000, currency: 'ZAR' },
        ],
      })
      .mockResolvedValueOnce({
        docs: [{ id: 11, program: 1, acceptedCount: 100, completionCount: 50 }],
      })
      .mockResolvedValueOnce({ docs: [] })

    const result = await getImpactStats()

    expect(result).toEqual({
      totalParticipants: 140,
      totalEvents: 50,
      totalPrograms: 10,
      totalResearch: 6,
      totalProjects: 25,
      totalFundedGrants: 3,
      totalFundingDollars: 53000,
    })
  })

  it('filters only published items', async () => {
    mockFind
      .mockResolvedValueOnce({ docs: [], totalDocs: 0 })
      .mockResolvedValueOnce({ docs: [], totalDocs: 0 })
      .mockResolvedValueOnce({ totalDocs: 0 })
      .mockResolvedValueOnce({ totalDocs: 0 })
      .mockResolvedValueOnce({ totalDocs: 0, docs: [] })
      .mockResolvedValueOnce({ docs: [] })
      .mockResolvedValueOnce({ docs: [] })

    await getImpactStats()

    // Verify published entity calls filter for published items
    const calls = mockFind.mock.calls
    ;[calls[0], calls[1], calls[2], calls[3], calls[5]].forEach((call) => {
      expect(call[0]).toMatchObject({
        where: {
          isPublished: { equals: true },
        },
      })
    })

    expect(calls[4]?.[0]).toMatchObject({
      where: {
        and: [
          {
            isPublished: { equals: true },
          },
          {
            status: {
              in: ['awarded', 'active', 'completed'],
            },
          },
        ],
      },
    })
    expect(calls[6]?.[0]).toMatchObject({
      where: {
        contextKind: { equals: 'program' },
      },
    })
  })
})

describe('getFeaturedResearch', () => {
  const mockFind = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getPayload).mockResolvedValue({
      find: mockFind,
    } as any)
  })

  it('queries research collection with isPublished filter', async () => {
    mockFind.mockResolvedValueOnce({ docs: [] })

    await getFeaturedResearch()

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'research',
        where: { isPublished: { equals: true } },
        sort: '-publicationDate',
        depth: 1,
      }),
    )
  })

  it('respects custom limit', async () => {
    mockFind.mockResolvedValueOnce({ docs: [] })

    await getFeaturedResearch(3)

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 0,
      }),
    )
  })

  it('returns docs from result', async () => {
    const mockDocs = [
      { id: 1, title: 'Research A' },
      { id: 2, title: 'Research B' },
    ]
    mockFind.mockResolvedValueOnce({ docs: mockDocs })

    const results = await getFeaturedResearch()

    expect(results).toEqual(mockDocs)
  })

  it('puts unknown publication dates last before applying the limit', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [
        { id: 1, title: 'Undated Research', publicationDate: null },
        { id: 2, title: 'Older Research', publicationDate: '2024-01-01T00:00:00.000Z' },
        { id: 3, title: 'Newest Research', publicationDate: '2025-06-01T00:00:00.000Z' },
      ],
    })

    const results = await getFeaturedResearch(2)

    expect(results.map((item) => item.id)).toEqual([3, 2])
  })
})

describe('getTestimonials', () => {
  const mockFind = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getPayload).mockResolvedValue({
      find: mockFind,
    } as any)
  })

  it('requests enough depth to populate cohort parent program links', async () => {
    mockFind.mockResolvedValueOnce({ docs: [] })

    await getTestimonials()

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'testimonials',
        sort: '-priorityScore',
        depth: 3,
      }),
    )
  })
})

describe('getAllPeople', () => {
  const mockFind = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getPayload).mockResolvedValue({
      find: mockFind,
    } as any)
  })

  it('sorts by weighted community score with impacts weighted highest', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [
        {
          id: 1,
          fullName: 'Engagement Heavy',
          totalEngagements: 12,
          totalContributions: 0,
          totalImpacts: 0,
        },
        {
          id: 2,
          fullName: 'Impact Heavy',
          totalEngagements: 0,
          totalContributions: 0,
          totalImpacts: 3,
        },
        {
          id: 3,
          fullName: 'Balanced',
          totalEngagements: 2,
          totalContributions: 1,
          totalImpacts: 1,
        },
      ],
    })

    const people = await getAllPeople()

    expect(people.map((p) => p.id)).toEqual([2, 1, 3])
  })
})

describe('getProgramsWithStats', () => {
  const mockFind = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getPayload).mockResolvedValue({
      find: mockFind,
    } as any)
  })

  it('uses cohort accepted counts when program has cohorts', async () => {
    mockFind
      .mockResolvedValueOnce({
        docs: [
          {
            id: 1,
            slug: 'course-1',
            name: 'Course 1',
            type: 'course',
            isPublished: true,
            metadata: { participants: 42 },
          },
        ],
      }) // programs
      .mockResolvedValueOnce({
        docs: [
          { id: 11, program: 1, acceptedCount: 10, completionCount: 8 },
          { id: 12, program: 1, acceptedCount: 4, completionCount: 2 },
        ],
      }) // cohorts
      .mockResolvedValueOnce({
        docs: [
          {
            id: 101,
            contextKind: 'program',
            context: { relationTo: 'programs', value: 1 },
          },
          {
            id: 102,
            contextKind: 'program',
            context: { relationTo: 'programs', value: 1 },
          },
        ],
      }) // engagements

    const results = await getProgramsWithStats()

    expect(results).toHaveLength(1)
    expect(results[0].totalParticipants).toBe(14)
  })

  it('uses first-class participant count before derived or metadata counts', async () => {
    mockFind
      .mockResolvedValueOnce({
        docs: [
          {
            id: 1,
            slug: 'retreat-1',
            name: 'Retreat 1',
            type: 'retreat',
            isPublished: true,
            metadata: { participants: 42 },
            participantCount: 20,
          },
        ],
      }) // programs
      .mockResolvedValueOnce({
        docs: [{ id: 11, program: 1, acceptedCount: 10, completionCount: 8 }],
      }) // cohorts
      .mockResolvedValueOnce({
        docs: [
          {
            id: 101,
            contextKind: 'program',
            context: { relationTo: 'programs', value: 1 },
          },
        ],
      }) // engagements

    const results = await getProgramsWithStats()

    expect(results).toHaveLength(1)
    expect(results[0].totalParticipants).toBe(20)
  })

  it('falls back to program engagement count when no cohorts exist', async () => {
    mockFind
      .mockResolvedValueOnce({
        docs: [
          {
            id: 2,
            slug: 'fellowship-1',
            name: 'Fellowship 1',
            type: 'fellowship',
            isPublished: true,
            metadata: { participants: '15' },
          },
        ],
      }) // programs
      .mockResolvedValueOnce({ docs: [] }) // cohorts
      .mockResolvedValueOnce({
        docs: [
          {
            id: 201,
            contextKind: 'program',
            context: { relationTo: 'programs', value: 2 },
          },
          {
            id: 202,
            contextKind: 'program',
            context: { relationTo: 'programs', value: 2 },
          },
        ],
      }) // engagements

    const results = await getProgramsWithStats()

    expect(results).toHaveLength(1)
    expect(results[0].totalParticipants).toBe(2)
  })

  it('falls back to metadata participants when no cohorts or program engagements exist', async () => {
    mockFind
      .mockResolvedValueOnce({
        docs: [
          {
            id: 4,
            slug: 'volunteer-1',
            name: 'Volunteer Program 1',
            type: 'volunteer_program',
            isPublished: true,
            metadata: { participants: '15' },
          },
        ],
      }) // programs
      .mockResolvedValueOnce({ docs: [] }) // cohorts
      .mockResolvedValueOnce({ docs: [] }) // engagements

    const results = await getProgramsWithStats()

    expect(results).toHaveLength(1)
    expect(results[0].totalParticipants).toBe(15)
  })

  it('leaves participants undefined when neither engagements nor metadata has a count', async () => {
    mockFind
      .mockResolvedValueOnce({
        docs: [
          {
            id: 3,
            slug: 'hackathon-1',
            name: 'Hackathon 1',
            type: 'hackathon',
            isPublished: true,
            metadata: {},
          },
        ],
      }) // programs
      .mockResolvedValueOnce({ docs: [] }) // cohorts
      .mockResolvedValueOnce({ docs: [] }) // engagements

    const results = await getProgramsWithStats()

    expect(results).toHaveLength(1)
    expect(results[0].totalParticipants).toBeUndefined()
  })

  it('puts programs with unknown start dates last before applying the limit', async () => {
    mockFind
      .mockResolvedValueOnce({
        docs: [
          {
            id: 1,
            slug: 'undated-program',
            name: 'Undated Program',
            type: 'course',
            isPublished: true,
            startDate: null,
            metadata: {},
          },
          {
            id: 2,
            slug: 'older-program',
            name: 'Older Program',
            type: 'course',
            isPublished: true,
            startDate: '2024-01-01T00:00:00.000Z',
            metadata: {},
          },
          {
            id: 3,
            slug: 'newer-program',
            name: 'Newer Program',
            type: 'course',
            isPublished: true,
            startDate: '2025-01-01T00:00:00.000Z',
            metadata: {},
          },
        ],
      })
      .mockResolvedValueOnce({ docs: [] })
      .mockResolvedValueOnce({ docs: [] })

    const results = await getProgramsWithStats(2)

    expect(results.map((program) => program.id)).toEqual([3, 2])
  })
})
