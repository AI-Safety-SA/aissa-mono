import { describe, expect, it } from 'vitest'

import {
  getMetadataBoolean,
  getMetadataString,
  isEventHighlighted,
  isProgramLargeCard,
} from '@/lib/content-flags'

describe('content flags', () => {
  it('parses boolean-like metadata values', () => {
    expect(getMetadataBoolean({ featured: true }, 'featured')).toBe(true)
    expect(getMetadataBoolean({ featured: '1' }, 'featured')).toBe(true)
    expect(getMetadataBoolean({ featured: 0 }, 'featured')).toBe(false)
    expect(getMetadataBoolean({ featured: 'false' }, 'featured')).toBe(false)
  })

  it('identifies highlighted events from metadata', () => {
    expect(isEventHighlighted({ metadata: { highlight: true } })).toBe(true)
    expect(isEventHighlighted({ metadata: { highlight: false } })).toBe(false)
  })

  it('returns trimmed string metadata values only', () => {
    expect(getMetadataString({ website: ' https://example.com ' }, 'website')).toBe(
      'https://example.com',
    )
    expect(getMetadataString({ website: '   ' }, 'website')).toBeUndefined()
    expect(getMetadataString({ website: 1 }, 'website')).toBeUndefined()
  })

  it('requires three populated media objects for large program cards', () => {
    expect(
      isProgramLargeCard({
        metadata: { large: true },
        images: [
          { image: { id: 1 } as any },
          { image: { id: 2 } as any },
          { image: { id: 3 } as any },
        ],
      }),
    ).toBe(true)

    expect(
      isProgramLargeCard({
        metadata: { large: true },
        images: [{ image: 1 }, { image: { id: 2 } as any }, { image: { id: 3 } as any }],
      }),
    ).toBe(false)
  })
})
