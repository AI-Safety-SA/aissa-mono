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

function getKindLabel(relationTo: string | null | undefined): string {
  if (relationTo === 'events') return 'Event'
  if (relationTo === 'programs') return 'Program'
  if (relationTo === 'cohorts') return 'Cohort'
  return 'Context'
}

function getDocName(value: unknown): string | null {
  if (!isRecord(value) || typeof value.name !== 'string') return null

  const trimmed = value.name.trim()
  return trimmed.length > 0 ? trimmed : null
}

function getCohortProgramName(value: unknown): string | null {
  if (!isRecord(value) || !('program' in value)) return null
  return getDocName(value.program)
}

function getContextBaseName(context: ContextInput): string | null {
  if (!context || !context.relationTo) return null

  const docName = getDocName(context.value)
  if (!docName) return null

  if (context.relationTo === 'cohorts') {
    const programName = getCohortProgramName(context.value)
    return programName ? `${programName} - ${docName}` : docName
  }

  return docName
}

export function formatContextName(
  context: ContextInput,
  options: { includeKindLabel?: boolean } = {},
): string {
  const relationTo = context?.relationTo
  const baseName = getContextBaseName(context)

  if (baseName) {
    return options.includeKindLabel ? `${getKindLabel(relationTo)}: ${baseName}` : baseName
  }

  if (relationTo) {
    return `${getKindLabel(relationTo)} unavailable`
  }

  return 'Context unavailable'
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
