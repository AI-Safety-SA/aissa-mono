import { createPlatformEvent, platformEventNames } from '@repo/platform-events'
import type { Payload } from 'payload'
import { emitPlatformEvent } from '@/inngest/emit'

type WorkOSUser = {
  email?: string | null
  firstName?: string | null
  id: string
  lastName?: string | null
}

type PersonDoc = {
  id: number
  email: string
  fullName: string
  preferredName?: string | null
  workosUserId?: string | null
}

function normalizeFullName(user: WorkOSUser): string {
  const firstName = typeof user.firstName === 'string' ? user.firstName.trim() : ''
  const lastName = typeof user.lastName === 'string' ? user.lastName.trim() : ''
  const fullName = `${firstName} ${lastName}`.trim()

  if (fullName.length > 0) return fullName
  if (typeof user.email === 'string' && user.email.trim().length > 0) return user.email.trim()

  return `WorkOS User ${user.id}`
}

export async function findPersonByWorkOSUserId(
  payload: Payload,
  workosUserId: string,
): Promise<PersonDoc | null> {
  const result = await payload.find({
    collection: 'persons',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      workosUserId: {
        equals: workosUserId,
      },
    },
  })

  return (result.docs[0] as PersonDoc | undefined) ?? null
}

export async function resolveOrCreatePersonForWorkOSUser(
  payload: Payload,
  user: WorkOSUser,
): Promise<PersonDoc> {
  const existingByWorkOSId = await findPersonByWorkOSUserId(payload, user.id)
  if (existingByWorkOSId) {
    const updated = await payload.update({
      collection: 'persons',
      id: existingByWorkOSId.id,
      data: {
        authProvider: 'workos',
        lastLoginAt: new Date().toISOString(),
      },
      overrideAccess: true,
    } as any)

    return updated as unknown as PersonDoc
  }

  const email = user.email?.trim().toLowerCase()
  if (!email) {
    throw new Error('WorkOS user is missing an email address')
  }

  const existingByEmail = await payload.find({
    collection: 'persons',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      email: {
        equals: email,
      },
    },
  })

  if (existingByEmail.docs[0]) {
    const updated = await payload.update({
      collection: 'persons',
      id: (existingByEmail.docs[0] as PersonDoc).id,
      data: {
        authProvider: 'workos',
        fullName: (existingByEmail.docs[0] as PersonDoc).fullName || normalizeFullName(user),
        lastLoginAt: new Date().toISOString(),
        workosUserId: user.id,
      },
      overrideAccess: true,
    } as any)

    await emitPlatformEvent(
      createPlatformEvent({
        name: platformEventNames.personIdentityLinked,
        data: {
          email,
          personId: (updated as unknown as PersonDoc).id,
          workosUserId: user.id,
        },
      }),
    )

    return updated as unknown as PersonDoc
  }

  const created = await payload.create({
    collection: 'persons',
    data: {
      authProvider: 'workos',
      email,
      fullName: normalizeFullName(user),
      joinedAt: new Date().toISOString().split('T')[0],
      lastLoginAt: new Date().toISOString(),
      preferredName: typeof user.firstName === 'string' ? user.firstName.trim() : undefined,
      workosUserId: user.id,
    },
    overrideAccess: true,
  } as any)

  await emitPlatformEvent(
    createPlatformEvent({
      name: platformEventNames.personIdentityLinked,
      data: {
        email,
          personId: (created as unknown as PersonDoc).id,
          workosUserId: user.id,
        },
      }),
    )

  return created as unknown as PersonDoc
}
