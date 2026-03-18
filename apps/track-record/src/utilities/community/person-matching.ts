import type { Payload } from 'payload'
import { findPersonByCommunityEditEmail } from './person-ownership'

type MinimalPerson = {
  email?: string | null
  fullName?: string | null
  id: number
  isPublished?: boolean | null
}

export type PersonMatchResult = {
  matchedBy: 'email' | 'none'
  person: MinimalPerson | null
}

export async function findPersonForCommunityEdit(args: {
  email: string
  fullName?: string
  payload: Payload
}): Promise<PersonMatchResult> {
  const person = await findPersonByCommunityEditEmail({
    email: args.email,
    payload: args.payload,
  })

  if (person) {
    return {
      matchedBy: 'email',
      person,
    }
  }

  return {
    matchedBy: 'none',
    person: null,
  }
}
