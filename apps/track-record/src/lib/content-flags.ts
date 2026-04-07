import type { Event, Person, Program } from '@/payload-types'

type MetadataValue = Event['metadata'] | Person['metadata'] | Program['metadata']

function readObjectMetadata(metadata: unknown): Record<string, unknown> | null {
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

export function getMetadataString(metadata: MetadataValue, key: string): string | undefined {
  const metadataObject = readObjectMetadata(metadata)
  if (!metadataObject) return undefined

  const value = metadataObject[key]
  return readMetadataString(value)
}

export function getNestedMetadataString(
  metadata: MetadataValue,
  keys: string[],
): string | undefined {
  let value: unknown = metadata

  for (const key of keys) {
    const metadataObject = readObjectMetadata(value)
    if (!metadataObject) return undefined

    value = metadataObject[key]
  }

  return readMetadataString(value)
}

function readMetadataString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export function isEventHighlighted(event: Pick<Event, 'metadata'>): boolean {
  return getMetadataBoolean(event.metadata, 'highlight') === true
}

export function isProgramLargeCard(program: Pick<Program, 'metadata' | 'images'>): boolean {
  const validImagesCount =
    program.images?.filter((item) => item.image && typeof item.image === 'object').length ?? 0

  return getMetadataBoolean(program.metadata, 'large') === true && validImagesCount >= 3
}
