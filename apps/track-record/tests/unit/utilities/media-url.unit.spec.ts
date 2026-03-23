import { describe, expect, it } from 'vitest'
import { getMediaPublicUrl } from '@/utilities/media-url'

describe('media url utilities', () => {
  it('returns the existing media url when present', () => {
    expect(
      getMediaPublicUrl({
        url: '/api/media/file/headshot.png',
      }),
    ).toBe('/api/media/file/headshot.png')
  })

  it('trims surrounding whitespace from urls', () => {
    expect(
      getMediaPublicUrl({
        url: '  /api/media/file/headshot.png  ',
      }),
    ).toBe('/api/media/file/headshot.png')
  })

  it('returns null for empty or missing urls', () => {
    expect(getMediaPublicUrl({ url: '   ' })).toBeNull()
    expect(getMediaPublicUrl({})).toBeNull()
    expect(getMediaPublicUrl(null)).toBeNull()
  })
})
