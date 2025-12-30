import type { PayloadRequest } from 'payload'

export type ContextCollection = 'events' | 'programs' | 'cohorts'
export type ContextKind = 'event' | 'program' | 'cohort'

export function getContextKindFromCollection(collection: ContextCollection): ContextKind {
  if (collection === 'events') return 'event'
  if (collection === 'programs') return 'program'
  return 'cohort'
}

export function normalizePolymorphicContext(
  context: unknown,
): { relationTo: ContextCollection; value: number | string } | null {
  // Payload polymorphic relationship values look like:
  // { relationTo: 'events', value: 123 }
  if (
    context &&
    typeof context === 'object' &&
    'relationTo' in context &&
    'value' in context &&
    (context as any).relationTo &&
    (context as any).value !== undefined
  ) {
    const relationTo = (context as any).relationTo
    const value = (context as any).value
    if (
      (relationTo === 'events' || relationTo === 'programs' || relationTo === 'cohorts') &&
      (typeof value === 'string' || typeof value === 'number')
    ) {
      return { relationTo, value }
    }
  }
  return null
}

export async function deriveContextDate(args: {
  req: PayloadRequest
  relationTo: ContextCollection
  id: number | string
}): Promise<string | null> {
  const { req, relationTo, id } = args

  const doc = await req.payload.findByID({
    collection: relationTo,
    id: id as any,
    // Transaction safety / request scoping
    req,
    depth: 0,
  })

  if (!doc) return null

  if (relationTo === 'events') {
    return (doc as any).eventDate ?? null
  }

  // programs + cohorts both use startDate
  return (doc as any).startDate ?? null
}


