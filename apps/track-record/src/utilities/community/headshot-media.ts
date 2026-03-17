import { Buffer } from 'node:buffer'
import type { Payload } from 'payload'

export const COMMUNITY_HEADSHOT_CLEANUP_TASK_SLUG = 'cleanupCommunityHeadshotUpload'

const COMMUNITY_HEADSHOT_CLEANUP_DELAY_MS = 24 * 60 * 60 * 1000

export const COMMUNITY_HEADSHOT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export type CommunityHeadshotMimeType = (typeof COMMUNITY_HEADSHOT_ALLOWED_MIME_TYPES)[number]

export function detectCommunityHeadshotMimeType(buffer: Buffer): CommunityHeadshotMimeType | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg'
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png'
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp'
  }

  return null
}

export function getRelationshipId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value
  }

  if (typeof value === 'string' && /^\d+$/.test(value)) {
    return Number(value)
  }

  if (value && typeof value === 'object' && 'id' in value) {
    return getRelationshipId((value as { id?: unknown }).id)
  }

  return null
}

export async function queueCommunityHeadshotCleanup(
  payload: Payload,
  input: { mediaId: number; submissionId: number },
): Promise<void> {
  await (payload.jobs.queue as any)({
    task: COMMUNITY_HEADSHOT_CLEANUP_TASK_SLUG,
    input,
    waitUntil: new Date(Date.now() + COMMUNITY_HEADSHOT_CLEANUP_DELAY_MS),
  })
}
