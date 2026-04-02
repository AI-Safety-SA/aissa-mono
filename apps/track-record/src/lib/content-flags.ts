import type { Event, Program } from '@/payload-types'

type MetadataValue = Event['metadata'] | Program['metadata']

function readObjectMetadata(metadata: MetadataValue): Record<string, unknown> | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null
  }

  return metadata as Record<string, unknown>
}

export function getMetadataBoolean(metadata: MetadataValue, key: string): boolean | undefined {
  const metadataObject = readObjectMetadata(metadata)
  if (!metadataObject) return undefined

  const value = metadataObject[key]

  if (typeof value === 'boolean') return value
  if (typeof value === 'number') {
    if (value === 1) return true
    if (value === 0) return false
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true' || normalized === '1') return true
    if (normalized === 'false' || normalized === '0') return false
  }

  return undefined
}

export function isEventHighlighted(event: Pick<Event, 'metadata'>): boolean {
  return getMetadataBoolean(event.metadata, 'highlight') === true
}

export function isProgramLargeCard(program: Pick<Program, 'metadata' | 'images'>): boolean {
  const validImagesCount =
    program.images?.filter((item) => item.image && typeof item.image === 'object').length ?? 0

  return getMetadataBoolean(program.metadata, 'large') === true && validImagesCount >= 3
}
