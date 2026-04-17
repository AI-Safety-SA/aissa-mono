import { Inngest } from 'inngest'

export const inngest = new Inngest({
  id: 'track-record',
  eventKey: process.env.INNGEST_EVENT_KEY,
})

export function isInngestEventingConfigured(): boolean {
  return Boolean(process.env.INNGEST_EVENT_KEY)
}
