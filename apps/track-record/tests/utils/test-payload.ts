import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

let payloadInstance: Payload | null = null

/**
 * Gets or creates a singleton Payload instance for tests
 * This ensures we reuse the same Payload instance across tests
 */
export async function getTestPayload(): Promise<Payload> {
  if (!payloadInstance) {
    const payloadConfig = await config
    payloadInstance = await getPayload({ config: payloadConfig })
  }
  return payloadInstance
}

/**
 * Resets the Payload instance (useful for cleanup between test suites)
 */
export function resetTestPayload(): void {
  payloadInstance = null
}
