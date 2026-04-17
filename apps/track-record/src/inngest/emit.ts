import type { PlatformEvent, PersonMetricsRecomputeRequestedEvent } from '@repo/platform-events'
import { createPlatformEvent, platformEventNames } from '@repo/platform-events'
import type { PayloadRequest } from 'payload'
import { inngest, isInngestEventingConfigured } from './client'

export async function emitPlatformEvent(event: PlatformEvent): Promise<boolean> {
  if (!isInngestEventingConfigured()) {
    return false
  }

  try {
    await inngest.send(event as any)
    return true
  } catch (error) {
    console.error('Failed to emit Inngest event', error)
    return false
  }
}

export async function emitPersonMetricsRecomputeRequested(args: {
  personIds: Iterable<number>
  reason: PersonMetricsRecomputeRequestedEvent['data']['reason']
  source: string
}): Promise<boolean> {
  const uniquePersonIds = Array.from(new Set(args.personIds)).filter((personId) =>
    Number.isInteger(personId),
  )

  if (uniquePersonIds.length === 0) return true

  const results = await Promise.all(
    uniquePersonIds.map((personId) =>
      emitPlatformEvent(
        createPlatformEvent({
          name: platformEventNames.personMetricsRecomputeRequested,
          data: {
            personId,
            reason: args.reason,
            source: args.source,
          },
        }),
      ),
    ),
  )

  return results.every(Boolean)
}

export function getRequestEventSource(req: PayloadRequest, collectionSlug: string): string {
  return collectionSlug
}
