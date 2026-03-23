type MediaWithUrl = {
  url?: string | null
}

export function getMediaPublicUrl(media: MediaWithUrl | null | undefined): string | null {
  if (!media?.url) return null

  const normalizedUrl = media.url.trim()
  return normalizedUrl.length > 0 ? normalizedUrl : null
}
