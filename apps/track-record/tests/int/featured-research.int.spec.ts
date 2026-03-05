import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest'

vi.setConfig({ testTimeout: 30000, hookTimeout: 60000 })
import { getTestPayload } from '../utils/test-payload'
import type { Payload } from 'payload'
import { getFeaturedResearch } from '@/lib/data'

let payload: Payload
let publishedResearchId: number
let unpublishedResearchId: number

describe('getFeaturedResearch', () => {
  beforeAll(async () => {
    payload = await getTestPayload()

    const published = await payload.create({
      collection: 'research',
      data: {
        title: 'Published Test Research',
        isPublished: true,
        status: 'published',
        publicationDate: '2025-06-01T00:00:00.000Z',
      },
    })
    publishedResearchId = published.id

    const unpublished = await payload.create({
      collection: 'research',
      data: {
        title: 'Unpublished Test Research',
        isPublished: false,
        status: 'draft',
      },
    })
    unpublishedResearchId = unpublished.id
  })

  afterAll(async () => {
    try {
      await payload.delete({ collection: 'research', id: publishedResearchId })
      await payload.delete({ collection: 'research', id: unpublishedResearchId })
    } catch (error) {
      console.error('Cleanup error:', error)
    }
  })

  it('returns published research items', async () => {
    const results = await getFeaturedResearch(100)

    expect(results).toBeDefined()
    expect(Array.isArray(results)).toBe(true)

    const found = results.find((r) => r.id === publishedResearchId)
    expect(found).toBeDefined()
    expect(found?.title).toBe('Published Test Research')
  })

  it('does not return unpublished research', async () => {
    const results = await getFeaturedResearch(100)

    const found = results.find((r) => r.id === unpublishedResearchId)
    expect(found).toBeUndefined()
  })

  it('respects limit parameter', async () => {
    const results = await getFeaturedResearch(1)

    expect(results.length).toBeLessThanOrEqual(1)
  })

  it('sorts by publicationDate descending', async () => {
    // Create a second published research with earlier date
    const earlier = await payload.create({
      collection: 'research',
      data: {
        title: 'Earlier Research',
        isPublished: true,
        status: 'published',
        publicationDate: '2024-01-01T00:00:00.000Z',
      },
    })

    try {
      const results = await getFeaturedResearch(100)
      const ids = results.map((r) => r.id)
      const publishedIdx = ids.indexOf(publishedResearchId)
      const earlierIdx = ids.indexOf(earlier.id)

      // Both should exist and published (2025) should come before earlier (2024)
      expect(publishedIdx).toBeGreaterThanOrEqual(0)
      expect(earlierIdx).toBeGreaterThanOrEqual(0)
      expect(publishedIdx).toBeLessThan(earlierIdx)
    } finally {
      await payload.delete({ collection: 'research', id: earlier.id })
    }
  })
})
