import { describe, expect, it } from 'vitest'
import {
  buildEngagementSnapshot,
  extractRelationshipId,
  normalizeCommunityContextForSnapshot,
} from '@/utilities/community/engagement-snapshot'

describe('engagement snapshot utilities', () => {
  it('extracts relationship IDs from scalar and object values', () => {
    expect(extractRelationshipId(10)).toBe(10)
    expect(extractRelationshipId('11')).toBe('11')
    expect(extractRelationshipId({ id: 12 })).toBe(12)
    expect(extractRelationshipId({ id: '13' })).toBe('13')
    expect(extractRelationshipId({})).toBeNull()
  })

  it('normalizes community context objects', () => {
    expect(
      normalizeCommunityContextForSnapshot({
        relationTo: 'events',
        value: 21,
      }),
    ).toEqual({
      relationTo: 'events',
      value: 21,
    })

    expect(
      normalizeCommunityContextForSnapshot({
        relationTo: 'programs',
        value: 'abc',
      }),
    ).toEqual({
      relationTo: 'programs',
      value: 'abc',
    })

    expect(normalizeCommunityContextForSnapshot({ relationTo: 'cohorts', value: 1 })).toBeNull()
    expect(normalizeCommunityContextForSnapshot(null)).toBeNull()
  })

  it('builds a stable engagement snapshot shape', () => {
    const snapshot = buildEngagementSnapshot({
      context: { relationTo: 'events', value: 42 },
      engagement_status: 'completed',
      person: { id: 7 },
      rating: '9',
      type: 'participant',
      typeOther: 'n/a',
      updatedAt: '2026-02-26T10:00:00.000Z',
      wouldRecommend: 8,
    })

    expect(snapshot).toEqual({
      context: { relationTo: 'events', value: 42 },
      engagement_status: 'completed',
      personId: 7,
      rating: 9,
      type: 'participant',
      typeOther: 'n/a',
      updatedAt: '2026-02-26T10:00:00.000Z',
      wouldRecommend: 8,
    })
  })
})
