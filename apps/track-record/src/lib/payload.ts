import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * Safely get Payload instance with better error messages for missing environment variables
 *
 * This wrapper provides clearer error messages when PAYLOAD_SECRET is missing,
 * especially helpful during Netlify builds where environment variables must be
 * explicitly set in the dashboard.
 */
export async function getPayloadInstance() {
  try {
    return await getPayload({ config })
  } catch (error) {
    if (error instanceof Error && error.message.includes('missing secret key')) {
      const isNetlify = process.env.NETLIFY === 'true'
      const isBuild = process.env.NEXT_PHASE === 'phase-production-build'

      if (isNetlify || isBuild) {
        throw new Error(
          'PAYLOAD_SECRET is required during build. ' +
            'Please set PAYLOAD_SECRET in your Netlify environment variables. ' +
            'Go to Site settings > Build & deploy > Environment variables in the Netlify dashboard. ' +
            'See NETLIFY_SETUP.md for more details.',
        )
      }

      throw new Error(
        'PAYLOAD_SECRET environment variable is required. ' +
          'Please set PAYLOAD_SECRET in your environment variables or .env file.',
      )
    }
    throw error
  }
}
