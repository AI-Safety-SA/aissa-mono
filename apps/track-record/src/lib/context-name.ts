type ContextRelation = 'events' | 'programs' | 'cohorts'

type PopulatedProgram = {
  name?: string | null
  slug?: string | null
}

type PopulatedContextValue = {
  name?: string | null
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

function getContextCollectionLabel(relationTo: ContextRelation | undefined): string | null {
  if (relationTo === 'events') return 'Event'
  if (relationTo === 'programs') return 'Program'
  if (relationTo === 'cohorts') return 'Cohort'
  return null
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

export function getContextLabel(context: ContextInput): string | null {
  if (!context || !isRecord(context.value)) return null

  const relationTo = context.relationTo as ContextRelation | undefined
  const value = context.value as PopulatedContextValue

  if (relationTo === 'events' || relationTo === 'programs') {
    return typeof value.name === 'string' ? value.name : null
  }

  if (relationTo === 'cohorts') {
    const program = isRecord(value.program) ? (value.program as PopulatedProgram) : null
    if (typeof program?.name === 'string' && typeof value.name === 'string') {
      return `${program.name} / ${value.name}`
    }

    return typeof value.name === 'string' ? value.name : null
  }

  return null
}

export function getContextFallbackLabel(context: ContextInput): string | null {
  return getContextCollectionLabel(context?.relationTo as ContextRelation | undefined)
}

export function getTestimonialContextBadgeDetails(
  context: ContextInput,
): { href: string | null; label: string } {
  const contextLabel = getContextLabel(context) ?? getContextFallbackLabel(context)

  return {
    href: getContextHref(context),
    label: contextLabel ? `${contextLabel} — Testimonial` : 'General Testimonial',
  }
}
