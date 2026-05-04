import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/(payload)/api/public-track-record/[...path]/route'
import { getPublicCollectionPayload } from '@/lib/public-track-record'

vi.mock('@/lib/public-track-record', () => ({
  getPublicCollectionPayload: vi.fn(),
}))

function request(token?: string) {
  return new NextRequest('http://localhost/api/public-track-record/home', {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  })
}

describe('public track-record API route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    vi.stubEnv('PUBLIC_TRACK_RECORD_API_TOKEN', 'service-token')
  })

  it('rejects missing or invalid bearer tokens', async () => {
    expect((await GET(request(), { params: Promise.resolve({ path: ['home'] }) })).status).toBe(401)
    expect(
      (await GET(request('wrong'), { params: Promise.resolve({ path: ['home'] }) })).status,
    ).toBe(401)
    expect(getPublicCollectionPayload).not.toHaveBeenCalled()
  })

  it('returns sanitized payloads for valid service tokens', async () => {
    vi.mocked(getPublicCollectionPayload).mockResolvedValue({
      stats: {
        totalEvents: 1,
        totalParticipants: 2,
        totalPrograms: 3,
        totalProjects: 4,
        totalResearch: 5,
      },
      programs: [],
      events: [],
      projects: [],
      research: [],
    })

    const response = await GET(request('service-token'), {
      params: Promise.resolve({ path: ['home'] }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(JSON.stringify(body)).not.toMatch(/grant|funding|funder/i)
    expect(body.stats).toEqual({
      totalEvents: 1,
      totalParticipants: 2,
      totalPrograms: 3,
      totalProjects: 4,
      totalResearch: 5,
    })
  })
})
