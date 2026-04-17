import { getPayload } from 'payload'
import { platformEventNames } from '@repo/platform-events'
import config from '@payload-config'
import { recomputePersonMetricsWithPayload } from '@/collections/_shared/person-metrics'
import { inngest } from '../client'

export const recomputePersonMetricsFunction = inngest.createFunction(
  {
    id: 'recompute-person-metrics',
    retries: 2,
    triggers: [
      {
        event: platformEventNames.personMetricsRecomputeRequested,
      },
    ],
  },
  async ({ event }: { event: { data: { personId: number; source: string } } }) => {
    const payload = await getPayload({ config })

    await recomputePersonMetricsWithPayload(payload, event.data.personId)

    return {
      personId: event.data.personId,
      source: event.data.source,
      success: true,
    }
  },
)
