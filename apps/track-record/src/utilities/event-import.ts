import type { Person } from '@/payload-types'

export type ImportedEventRecord = {
  attendanceCount?: number
  eventDate: string
  location?: string
  metadata?: Record<string, unknown>
  name: string
  organiserName: string
  type: EventType
}

export type EventType =
  | 'meetup'
  | 'other'
  | 'panel'
  | 'reading_group'
  | 'retreat'
  | 'seminar'
  | 'talk'
  | 'workshop'

export type PersonCandidate = Pick<Person, 'fullName' | 'id' | 'preferredName'>

export type PersonResolution = {
  candidates: Array<{
    id: number
    name: string
    preferredName: string | null
    score: number
    strategy: MatchStrategy
  }>
  match: PersonCandidate | null
  reason: string
  strategy: MatchStrategy
}

type CandidateScore = {
  candidate: PersonCandidate
  score: number
  strategy: MatchStrategy
}

type MatchStrategy =
  | 'exact-full-name'
  | 'exact-preferred-name'
  | 'exact-preferred-plus-surname'
  | 'none'
  | 'prefix-first-name-same-surname'
  | 'single-token-preferred-name'
  | 'single-token-unique-name-part'
  | 'token-subset-same-surname'

const MIN_CONFIDENT_SCORE = 85
const MIN_CLEAR_MARGIN = 5

function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

export function normalizeName(value: string): string {
  return normalizeWhitespace(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .toLowerCase()
}

export function tokenizeName(value: string): string[] {
  return normalizeName(value)
    .split(/[\s-]+/)
    .map((token) => token.trim())
    .filter(Boolean)
}

function buildPreferredPlusSurname(preferredName: string | null | undefined, fullName: string): string | null {
  if (!preferredName) return null

  const preferredTokens = tokenizeName(preferredName)
  const fullNameTokens = tokenizeName(fullName)

  if (preferredTokens.length === 0 || fullNameTokens.length < 2) return null

  return `${preferredTokens[0]} ${fullNameTokens[fullNameTokens.length - 1]}`
}

function scoreCandidate(inputName: string, candidate: PersonCandidate): CandidateScore | null {
  const normalizedInput = normalizeName(inputName)
  const inputTokens = tokenizeName(inputName)
  const normalizedFullName = normalizeName(candidate.fullName)
  const normalizedPreferredName = candidate.preferredName ? normalizeName(candidate.preferredName) : null
  const preferredPlusSurname = buildPreferredPlusSurname(candidate.preferredName, candidate.fullName)
  const fullNameTokens = tokenizeName(candidate.fullName)

  if (normalizedInput.length === 0) {
    return null
  }

  if (normalizedInput === normalizedFullName) {
    return { candidate, score: 100, strategy: 'exact-full-name' }
  }

  if (normalizedPreferredName && normalizedInput === normalizedPreferredName) {
    return { candidate, score: 98, strategy: 'exact-preferred-name' }
  }

  if (preferredPlusSurname && normalizedInput === preferredPlusSurname) {
    return { candidate, score: 96, strategy: 'exact-preferred-plus-surname' }
  }

  if (inputTokens.length === 1) {
    if (normalizedPreferredName === normalizedInput) {
      return { candidate, score: 98, strategy: 'single-token-preferred-name' }
    }

    if (fullNameTokens.includes(normalizedInput)) {
      return { candidate, score: 86, strategy: 'single-token-unique-name-part' }
    }

    return null
  }

  const inputSurname = inputTokens[inputTokens.length - 1]
  const candidateSurname = fullNameTokens[fullNameTokens.length - 1]
  const firstNameMatchesByPrefix =
    inputTokens[0].length >= 4 &&
    fullNameTokens[0] &&
    (fullNameTokens[0].startsWith(inputTokens[0]) || inputTokens[0].startsWith(fullNameTokens[0]))

  if (inputSurname === candidateSurname && firstNameMatchesByPrefix) {
    return { candidate, score: 91, strategy: 'prefix-first-name-same-surname' }
  }

  const allInputTokensAppearInCandidate = inputTokens.every((token) => fullNameTokens.includes(token))
  if (inputSurname === candidateSurname && allInputTokensAppearInCandidate) {
    return { candidate, score: 88, strategy: 'token-subset-same-surname' }
  }

  return null
}

export function resolvePersonByName(
  inputName: string,
  candidates: PersonCandidate[],
): PersonResolution {
  const scored = candidates
    .map((candidate) => scoreCandidate(inputName, candidate))
    .filter((candidate): candidate is CandidateScore => candidate !== null)
    .sort((left, right) => right.score - left.score || left.candidate.id - right.candidate.id)

  const detailedCandidates = scored.slice(0, 5).map((entry) => ({
    id: entry.candidate.id,
    name: entry.candidate.fullName,
    preferredName: entry.candidate.preferredName ?? null,
    score: entry.score,
    strategy: entry.strategy,
  }))

  const top = scored[0]
  const second = scored[1]

  if (!top) {
    return {
      match: null,
      reason: 'No candidate matched the provided name.',
      strategy: 'none',
      candidates: [],
    }
  }

  if (top.score < MIN_CONFIDENT_SCORE) {
    return {
      match: null,
      reason: `Best candidate score ${top.score} is below confidence threshold ${MIN_CONFIDENT_SCORE}.`,
      strategy: 'none',
      candidates: detailedCandidates,
    }
  }

  if (second && top.score - second.score < MIN_CLEAR_MARGIN) {
    return {
      match: null,
      reason: `Best candidate score ${top.score} is too close to next candidate score ${second.score}.`,
      strategy: 'none',
      candidates: detailedCandidates,
    }
  }

  return {
    match: top.candidate,
    reason: `Matched via ${top.strategy}.`,
    strategy: top.strategy,
    candidates: detailedCandidates,
  }
}

export function slugifyEventName(name: string, eventDate: string): string {
  const eventDay = eventDate.slice(0, 10)
  const slugBase = `${name} ${eventDay}`

  return normalizeName(slugBase)
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function inferTypeOther(record: ImportedEventRecord): string {
  const normalizedName = normalizeName(record.name)

  const keywordMap: Array<[string, string]> = [
    ['hackathon', 'Hackathon'],
    ['conference', 'Conference'],
    ['retreat', 'Retreat'],
    ['seminar', 'Seminar'],
    ['workshop', 'Workshop'],
    ['meetup', 'Meetup'],
    ['panel', 'Panel'],
    ['talk', 'Talk'],
    ['reading group', 'Reading Group'],
  ]

  for (const [keyword, label] of keywordMap) {
    if (normalizedName.includes(keyword)) {
      return label
    }
  }

  return 'Other'
}

export function extractHostNames(record: ImportedEventRecord): string[] {
  const hosts = record.metadata?.hosts
  if (!Array.isArray(hosts)) return []

  return hosts
    .filter((value): value is string => typeof value === 'string')
    .map((value) => normalizeWhitespace(value))
    .filter(Boolean)
}

export function looksLikeOrganisationName(value: string): boolean {
  const normalized = normalizeName(value)

  const organisationKeywords = [
    'ai safety',
    'association',
    'collective',
    'consulting',
    'foundation',
    'group',
    'institute',
    'lab',
    'laboratory',
    'policy',
    'project',
    'research',
    'school',
    'society',
    'studio',
    'university',
  ]

  return organisationKeywords.some((keyword) => normalized.includes(keyword))
}
