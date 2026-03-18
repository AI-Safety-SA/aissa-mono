type MediaWithUrl = {
  _key?: string | null
  url?: string | null
}

export function getUploadthingMediaUrl(key: string | null | undefined): string | null {
  if (!key) return null

  const normalizedKey = key.trim()
  if (!normalizedKey) return null

  return `https://utfs.io/f/${normalizedKey}`
}

export function getMediaPublicUrl(media: MediaWithUrl | null | undefined): string | null {
  return getUploadthingMediaUrl(media?._key) ?? media?.url ?? null
}
