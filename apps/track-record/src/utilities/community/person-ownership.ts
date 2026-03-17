import type { Payload } from 'payload'

type CommunityEditPerson = {
  email?: string | null
  fullName?: string | null
  id: number
  isPublished?: boolean | null
}

export type CommunityEditProfileMode = 'existing' | 'new'

const PENDING_FULL_NAME_PREFIX = 'Pending community profile for '

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

export function buildPendingCommunityProfileFullName(email: string): string {
  return `${PENDING_FULL_NAME_PREFIX}${normalizeEmail(email)}`
}

export function isPendingCommunityProfileFullName(value: unknown): boolean {
  return typeof value === 'string' && value.startsWith(PENDING_FULL_NAME_PREFIX)
}

export function hasResolvedCommunityProfileFullName(value: unknown): boolean {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    !isPendingCommunityProfileFullName(value)
  )
}

export async function findPersonByCommunityEditEmail(args: {
  email: string
  payload: Payload
}): Promise<CommunityEditPerson | null> {
  const normalizedEmail = normalizeEmail(args.email)

  const emailMatch = await args.payload.find({
    collection: 'persons',
    where: {
      email: { equals: normalizedEmail },
    },
    limit: 1,
    depth: 0,
  })

  return (emailMatch.docs[0] as CommunityEditPerson | undefined) ?? null
}

export async function resolveOrCreatePersonForCommunityEditEmail(args: {
  email: string
  payload: Payload
}): Promise<{ person: CommunityEditPerson; profileMode: CommunityEditProfileMode }> {
  const normalizedEmail = normalizeEmail(args.email)
  const existing = await findPersonByCommunityEditEmail({
    email: normalizedEmail,
    payload: args.payload,
  })
  if (existing) {
    return {
      person: existing,
      profileMode: 'existing',
    }
  }

  try {
    const created = (await args.payload.create({
      collection: 'persons',
      data: {
        email: normalizedEmail,
        fullName: buildPendingCommunityProfileFullName(normalizedEmail),
        isPublished: false,
      },
      depth: 0,
    })) as CommunityEditPerson

    return {
      person: created,
      profileMode: 'new',
    }
  } catch (error) {
    const recovered = await findPersonByCommunityEditEmail({
      email: normalizedEmail,
      payload: args.payload,
    })
    if (recovered) {
      return {
        person: recovered,
        profileMode: 'existing',
      }
    }
    throw error
  }
}
