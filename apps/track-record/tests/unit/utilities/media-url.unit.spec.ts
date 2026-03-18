import { describe, expect, it } from 'vitest'
import { getMediaPublicUrl, getUploadthingMediaUrl } from '@/utilities/media-url'

describe('media url utilities', () => {
  it('builds a direct UploadThing URL from a stored key', () => {
    expect(getUploadthingMediaUrl('uploadthing-key-123')).toBe(
      'https://utfs.io/f/uploadthing-key-123',
    )
  })

  it('prefers the UploadThing key over Payloads proxy file route', () => {
    expect(
      getMediaPublicUrl({
        _key: 'uploadthing-key-123',
        url: '/api/media/file/headshot.png',
      }),
    ).toBe('https://utfs.io/f/uploadthing-key-123')
  })

  it('falls back to the existing url when no UploadThing key is present', () => {
    expect(
      getMediaPublicUrl({
        url: '/api/media/file/headshot.png',
      }),
    ).toBe('/api/media/file/headshot.png')
  })
})
