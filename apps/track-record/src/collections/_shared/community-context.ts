import type { PayloadRequest } from 'payload'
import { deriveContextDate } from './context'

export type CommunityContextCollection = 'events' | 'programs'
export type CommunityContextKind = 'event' | 'program'

export function getCommunityContextKindFromCollection(
  collection: CommunityContextCollection,
): CommunityContextKind {
  return collection === 'events' ? 'event' : 'program'
}

export function normalizeCommunityContext(
  context: unknown,
): { relationTo: CommunityContextCollection; value: number | string } | null {
  if (context && typeof context === 'object' && 'relationTo' in context && 'value' in context) {
    const typedContext = context as { relationTo?: unknown; value?: unknown }
    const relationTo = typedContext.relationTo
    const value = typedContext.value

    if (
      (relationTo === 'events' || relationTo === 'programs') &&
      (typeof value === 'number' || typeof value === 'string')
    ) {
      return { relationTo, value }
    }
  }

  return null
}

export async function deriveCommunityContextDate(args: {
  req: PayloadRequest
  relationTo: CommunityContextCollection
  id: number | string
}): Promise<string | null> {
  return deriveContextDate(args)
}
