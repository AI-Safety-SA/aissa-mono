import type { Payload, PayloadRequest } from 'payload'
import { emitPersonMetricsRecomputeRequested } from '@/inngest/emit'
import { computePersonMetrics, fetchPersonActivityData } from '@/lib/person-activity'

export async function recomputePersonMetricsWithPayload(
  payload: Payload,
  personId: number,
  req?: PayloadRequest,
): Promise<void> {
  const activity = await fetchPersonActivityData(payload, personId, req)
  const metrics = computePersonMetrics(activity)

  await payload.update({
    collection: 'persons',
    id: personId,
    data: metrics,
    ...(req ? { req } : { overrideAccess: true }),
  })
}

export async function recomputePersonMetrics(req: PayloadRequest, personId: number): Promise<void> {
  await recomputePersonMetricsWithPayload(req.payload, personId, req)
}

export async function schedulePersonMetricsRecompute(args: {
  personIds: Iterable<number>
  reason:
    | 'engagement_changed'
    | 'engagement_deleted'
    | 'impact_changed'
    | 'impact_deleted'
    | 'context_changed'
    | 'relation_changed'
    | 'manual'
  req: PayloadRequest
  source: string
}): Promise<void> {
  const personIds = Array.from(new Set(args.personIds)).filter((personId) => Number.isInteger(personId))

  if (personIds.length === 0) return

  const emitted = await emitPersonMetricsRecomputeRequested({
    personIds,
    reason: args.reason,
    source: args.source,
  })

  if (emitted) return

  for (const personId of personIds) {
    await recomputePersonMetrics(args.req, personId)
  }
}
