import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAllPeople, getImpactStats, getProgramsWithStats } from '@/lib/data'
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
        docs: [
          { id: 1, acceptedCount: 10 },
          { id: 2, acceptedCount: 20 },
        ],
      }) // cohorts
      .mockResolvedValueOnce({ totalDocs: 5 }) // events
      .mockResolvedValueOnce({ totalDocs: 3 }) // programs
      .mockResolvedValueOnce({ totalDocs: 8 }) // projects

    const result = await getImpactStats()

    // Should call find 4 times (cohorts, events, programs, projects)
    expect(mockFind).toHaveBeenCalledTimes(4)

    // Verify parallel execution - all calls should be made
    expect(mockFind).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        collection: 'cohorts',
      }),
    )
    expect(mockFind).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        collection: 'events',
      }),
    )
    expect(mockFind).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        collection: 'programs',
      }),
    )
    expect(mockFind).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        collection: 'projects',
      }),
    )
  })

  it('calculates total participants from cohorts', async () => {
    mockFind
      .mockResolvedValueOnce({
        docs: [
          { id: 1, acceptedCount: 10 },
          { id: 2, acceptedCount: 20 },
          { id: 3, acceptedCount: 5 },
        ],
      })
      .mockResolvedValueOnce({ totalDocs: 5 })
      .mockResolvedValueOnce({ totalDocs: 3 })
      .mockResolvedValueOnce({ totalDocs: 8 })

    const result = await getImpactStats()

    expect(result.totalParticipants).toBe(35) // 10 + 20 + 5
  })

  it('handles cohorts with null acceptedCount', async () => {
    mockFind
      .mockResolvedValueOnce({
        docs: [
          { id: 1, acceptedCount: 10 },
          { id: 2, acceptedCount: null },
          { id: 3, acceptedCount: 5 },
        ],
      })
      .mockResolvedValueOnce({ totalDocs: 5 })
      .mockResolvedValueOnce({ totalDocs: 3 })
      .mockResolvedValueOnce({ totalDocs: 8 })

    const result = await getImpactStats()

    expect(result.totalParticipants).toBe(15) // 10 + 0 + 5
  })

  it('returns correct stats structure', async () => {
    mockFind
      .mockResolvedValueOnce({
        docs: [{ id: 1, acceptedCount: 100 }],
      })
      .mockResolvedValueOnce({ totalDocs: 50 })
      .mockResolvedValueOnce({ totalDocs: 10 })
      .mockResolvedValueOnce({ totalDocs: 25 })

    const result = await getImpactStats()

    expect(result).toEqual({
      totalParticipants: 100,
      totalEvents: 50,
      totalPrograms: 10,
      totalProjects: 25,
    })
  })

  it('filters only published items', async () => {
    mockFind
      .mockResolvedValueOnce({ docs: [] })
      .mockResolvedValueOnce({ totalDocs: 0 })
      .mockResolvedValueOnce({ totalDocs: 0 })
      .mockResolvedValueOnce({ totalDocs: 0 })

    await getImpactStats()

    // Verify all calls filter for published items
    const calls = mockFind.mock.calls
    calls.forEach((call) => {
      expect(call[0]).toMatchObject({
        where: {
          isPublished: { equals: true },
        },
      })
    })
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
})
