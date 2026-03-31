type ContextRelation = 'events' | 'programs' | 'cohorts'

type PopulatedProgram = {
  slug?: string | null
}

type PopulatedContextValue = {
  slug?: string | null
  program?: number | PopulatedProgram | null
}

type ContextInput =
  | {
      relationTo?: string | null
      value?: unknown
    }
  | null
  | undefined

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function getContextHref(context: ContextInput): string | null {
  if (!context || !isRecord(context.value)) return null

  const relationTo = context.relationTo as ContextRelation | undefined
  const value = context.value as PopulatedContextValue

  if (relationTo === 'events' && typeof value.slug === 'string') {
    return `/events/${value.slug}`
  }

  if (relationTo === 'programs' && typeof value.slug === 'string') {
    return `/programs/${value.slug}`
  }

  if (relationTo === 'cohorts' && typeof value.slug === 'string') {
    const program = isRecord(value.program) ? (value.program as PopulatedProgram) : null
    if (typeof program?.slug === 'string') {
      return `/programs/${program.slug}/cohorts/${value.slug}`
    }
  }

  return null
}
