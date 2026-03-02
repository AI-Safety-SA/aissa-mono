import type { Payload } from 'payload'

type MinimalPerson = {
  email?: string | null
  fullName?: string | null
  id: number
}

export type PersonMatchResult = {
  matchedBy: 'email' | 'full_name' | 'none'
  person: MinimalPerson | null
  placeholderEmail: boolean
}

const PLACEHOLDER_EMAIL_PATTERNS = [
  /placeholder/i,
  /placeholder\.aissa\.org$/i,
  /example\.com$/i,
  /noemail/i,
  /tbd/i,
]

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

function isPlaceholderEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return PLACEHOLDER_EMAIL_PATTERNS.some((pattern) => pattern.test(email))
}

export async function findPersonForCommunityEdit(args: {
  email: string
  fullName?: string
  payload: Payload
}): Promise<PersonMatchResult> {
  const { payload } = args
  const normalizedEmail = normalizeEmail(args.email)
  const trimmedName = args.fullName?.trim()

  const emailMatch = await payload.find({
    collection: 'persons',
    where: {
      email: { equals: normalizedEmail },
    },
    limit: 1,
    depth: 0,
  })

  if (emailMatch.docs[0]) {
    const person = emailMatch.docs[0] as MinimalPerson
    return {
      matchedBy: 'email',
      person,
      placeholderEmail: isPlaceholderEmail(person.email),
    }
  }

  if (trimmedName) {
    const nameMatch = await payload.find({
      collection: 'persons',
      where: {
        fullName: { equals: trimmedName },
      },
      limit: 2,
      depth: 0,
    })

    if (nameMatch.docs.length === 1) {
      const person = nameMatch.docs[0] as MinimalPerson
      return {
        matchedBy: 'full_name',
        person,
        placeholderEmail: isPlaceholderEmail(person.email),
      }
    }
  }

  return {
    matchedBy: 'none',
    person: null,
    placeholderEmail: false,
  }
}

