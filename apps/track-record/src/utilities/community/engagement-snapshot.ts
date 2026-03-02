type NormalizedContext = {
  relationTo: 'events' | 'programs'
  value: number | string
}

function getNumericOrNull(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function getStringOrNull(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function extractRelationshipId(value: unknown): number | string | null {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'number' || typeof id === 'string') return id
  }
  return null
}

export function normalizeCommunityContextForSnapshot(context: unknown): NormalizedContext | null {
  if (!context || typeof context !== 'object') return null

  if ('relationTo' in context && 'value' in context) {
    const relationTo = (context as { relationTo?: unknown }).relationTo
    const value = (context as { value?: unknown }).value
    if (
      (relationTo === 'events' || relationTo === 'programs') &&
      (typeof value === 'number' || typeof value === 'string')
    ) {
      return { relationTo, value }
    }
  }

  return null
}

export type EngagementSnapshot = {
  context: NormalizedContext | null
  engagement_status: string | null
  personId: number | string | null
  rating: number | null
  type: string | null
  typeOther: string | null
  updatedAt: string | null
  wouldRecommend: number | null
}

export function buildEngagementSnapshot(record: Record<string, unknown>): EngagementSnapshot {
  return {
    context: normalizeCommunityContextForSnapshot(record.context),
    engagement_status: getStringOrNull(record.engagement_status),
    personId: extractRelationshipId(record.person),
    rating: getNumericOrNull(record.rating),
    type: getStringOrNull(record.type),
    typeOther: getStringOrNull(record.typeOther),
    updatedAt: getStringOrNull(record.updatedAt),
    wouldRecommend: getNumericOrNull(record.wouldRecommend),
  }
}
