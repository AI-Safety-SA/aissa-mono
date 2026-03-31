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

/** Result of fetching a context document and extracting its date + name. */
export interface ContextDocResult {
  date: string | null
  name: string | null
}

/**
 * Fetch the context document and extract its date and name.
 */
export async function fetchContextDoc(args: {
  req: PayloadRequest
  relationTo: ContextCollection
  id: number | string
}): Promise<ContextDocResult> {
  const { req, relationTo, id } = args

  const doc = await req.payload.findByID({
    collection: relationTo,
    id: id as any,
    req,
    depth: 0,
  })

  if (!doc) return { date: null, name: null }

  const date =
    relationTo === 'events'
      ? ((doc as any).eventDate ?? null)
      : ((doc as any).startDate ?? null)

  const name: string | null = typeof (doc as any).name === 'string' ? (doc as any).name : null

  return { date, name }
}

/**
 * Derive just the context date. Thin wrapper around fetchContextDoc for
 * callers that don't need the name (Testimonials, FeedbackSubmissions, community-context).
 */
export async function deriveContextDate(args: {
  req: PayloadRequest
  relationTo: ContextCollection
  id: number | string
}): Promise<string | null> {
  const { date } = await fetchContextDoc(args)
  return date
}
