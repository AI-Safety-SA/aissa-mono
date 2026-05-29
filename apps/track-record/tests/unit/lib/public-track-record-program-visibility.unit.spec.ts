import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getPayload } from 'payload'

import {
  calculateParticipationTouchpoints,
  getFeaturedResearch,
  getProgramsWithStats,
  getRecentEvents,
  getTestimonials,
  type ProgramWithStats,
} from '@/lib/data'
import {
  PUBLIC_TEAM_FULL_NAMES,
  getPublicCollectionPayload,
  getPublicHomePayload,
  type PublicProgram,
} from '@/lib/public-track-record'
import type { Event, Media } from '@/payload-types'

vi.mock('@/payload.config', () => ({ default: {} }))

vi.mock('payload', () => ({
  getPayload: vi.fn(),
}))

vi.mock('@/lib/data', () => ({
  calculateParticipationTouchpoints: vi.fn(() => 0),
  FEATURED_EVENT_COUNT: 3,
  getFeaturedResearch: vi.fn(),
  getProgramsWithStats: vi.fn(),
  getRecentEvents: vi.fn(),
  getTestimonials: vi.fn(),
  splitHighlightedEvents: vi.fn((events) => ({
    featuredEvents: events.slice(0, 3),
    hasExplicitHighlights: false,
    remainingEvents: events.slice(3),
  })),
}))

vi.mock('@/lib/default-images', () => ({
  getDefaultImages: vi.fn(async () => null),
  getEventDefaultImage: vi.fn(() => null),
  getHighlightedImage: vi.fn(
    (images?: Array<{ image?: number | Media | null; isHighlighted?: boolean | null }>) => {
      if (!Array.isArray(images)) return null
      const highlighted = images.find(
        (item) => item.isHighlighted && typeof item.image === 'object',
      )
      return highlighted && typeof highlighted.image === 'object' ? highlighted.image : null
    },
  ),
}))

function media(id: number): Media {
  return {
    alt: `Program image ${id}`,
    createdAt: '2026-01-01T00:00:00.000Z',
    filename: `program-${id}.jpg`,
    id,
    updatedAt: '2026-01-01T00:00:00.000Z',
    url: `https://media.example.com/program-${id}.jpg`,
  }
}

function program(overrides: Partial<ProgramWithStats>): ProgramWithStats {
  const id = overrides.id ?? 1

  return {
    cohortCount: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    id,
    images: [{ image: media(id), isHighlighted: true }],
    isPublished: true,
    name: `Program ${id}`,
    showOnPublicWebsite: true,
    slug: `program-${id}`,
    startDate: `2026-01-0${id}T00:00:00.000Z`,
    totalCompletions: 0,
    type: 'course',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  } as ProgramWithStats
}

describe('public track-record program visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getPayload).mockResolvedValue({
      find: vi.fn(async ({ collection }) => {
        if (collection === 'persons') {
          return {
            docs: PUBLIC_TEAM_FULL_NAMES.map((fullName, index) => ({
              createdAt: '2026-01-01T00:00:00.000Z',
              fullName,
              id: index + 1,
              isPublished: true,
              updatedAt: '2026-01-01T00:00:00.000Z',
            })),
            totalDocs: PUBLIC_TEAM_FULL_NAMES.length,
          }
        }

        return { docs: [], totalDocs: 0 }
      }),
    } as never)
    vi.mocked(getProgramsWithStats).mockResolvedValue([])
    vi.mocked(getRecentEvents).mockResolvedValue([])
    vi.mocked(getFeaturedResearch).mockResolvedValue([])
    vi.mocked(getTestimonials).mockResolvedValue([])
  })

  it('returns homepage programs only from public highlighted records ordered by priority', async () => {
    vi.mocked(getProgramsWithStats).mockResolvedValue([
      program({
        highlightOnPublicWebsite: true,
        highlightPriority: 2,
        id: 1,
        name: 'Second Highlight',
      }),
      program({
        highlightOnPublicWebsite: true,
        highlightPriority: null,
        id: 2,
        name: 'Fallback Highlight',
      }),
      program({
        highlightOnPublicWebsite: true,
        highlightPriority: 1,
        id: 3,
        name: 'First Highlight',
      }),
      program({
        highlightOnPublicWebsite: true,
        highlightPriority: 0,
        id: 4,
        name: 'Hidden Highlight',
        showOnPublicWebsite: false,
      }),
      program({
        highlightOnPublicWebsite: false,
        id: 5,
        name: 'Listed But Not Highlighted',
      }),
      program({
        highlightOnPublicWebsite: true,
        id: 6,
        images: [],
        name: 'Highlighted Without Image',
      }),
    ])

    const home = await getPublicHomePayload()

    expect(home.programs.map((item) => item.name)).toEqual([
      'First Highlight',
      'Second Highlight',
      'Fallback Highlight',
    ])
    expect(home.programs.every((item) => item.highlightOnPublicWebsite)).toBe(true)
    expect(home.programs.every((item) => item.showOnPublicWebsite)).toBe(true)
  })

  it('keeps homepage stats scoped to the full published track record', async () => {
    const publicProgram = program({
      highlightOnPublicWebsite: true,
      id: 1,
      name: 'Public Highlight',
      totalParticipants: 10,
    })
    const trackRecordOnlyProgram = program({
      id: 2,
      name: 'Track Record Only Program',
      showOnPublicWebsite: false,
      totalParticipants: 20,
    })
    const event: Event = {
      attendanceCount: 5,
      createdAt: '2026-01-01T00:00:00.000Z',
      eventDate: '2026-01-01T00:00:00.000Z',
      id: 1,
      isPublished: true,
      name: 'Public Event',
      organiser: 1,
      slug: 'public-event',
      type: 'workshop',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }
    vi.mocked(getProgramsWithStats).mockResolvedValue([publicProgram, trackRecordOnlyProgram])
    vi.mocked(getRecentEvents).mockResolvedValue([event])
    vi.mocked(calculateParticipationTouchpoints).mockReturnValue(35)

    const home = await getPublicHomePayload()

    expect(home.programs.map((item) => item.name)).toEqual(['Public Highlight'])
    expect(home.stats.totalPrograms).toBe(2)
    expect(home.stats.totalParticipants).toBe(35)
    expect(calculateParticipationTouchpoints).toHaveBeenCalledWith(
      [event],
      [publicProgram, trackRecordOnlyProgram],
    )
  })

  it('returns the programs collection only from public website records with public images', async () => {
    vi.mocked(getProgramsWithStats).mockResolvedValue([
      program({ id: 1, name: 'Public Program' }),
      program({ id: 2, name: 'Track Record Only Program', showOnPublicWebsite: false }),
      program({ id: 3, images: [], name: 'Public Program Without Image' }),
    ])

    const programs = (await getPublicCollectionPayload('programs')) as PublicProgram[]

    expect(programs.map((item) => item.name)).toEqual(['Public Program'])
  })

  it('requires public website inclusion for program detail lookups', async () => {
    const find = vi.fn(async () => ({ docs: [], totalDocs: 0 }))
    vi.mocked(getPayload).mockResolvedValue({ find } as never)

    const detail = await getPublicCollectionPayload('programs/track-record-only')

    expect(detail).toBeNull()
    expect(find).toHaveBeenCalledWith({
      collection: 'programs',
      where: {
        and: [
          { slug: { equals: 'track-record-only' } },
          { isPublished: { equals: true } },
          { showOnPublicWebsite: { equals: true } },
        ],
      },
      limit: 1,
      depth: 1,
    })
  })
})
