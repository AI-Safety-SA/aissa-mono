import type { PayloadRequest } from 'payload'
import { computePersonMetrics, fetchPersonActivityData } from '@/lib/person-activity'

export async function recomputePersonMetrics(req: PayloadRequest, personId: number): Promise<void> {
  const activity = await fetchPersonActivityData(req.payload, personId, req)
  const metrics = computePersonMetrics(activity)

  await req.payload.update({
    collection: 'persons',
    id: personId,
    data: metrics,
    req,
  })
}
