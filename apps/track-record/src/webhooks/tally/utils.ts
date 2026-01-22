import { createHmac, timingSafeEqual } from 'crypto'
import type { TallyField, WorkflowType } from './types'

export function verifyTallySignature(payload: string, signature: string | null): boolean {
  if (!signature) return false

  const secret = process.env.TALLY_WEBHOOK_SECRET
  if (!secret) {
    throw new Error('TALLY_WEBHOOK_SECRET not configured')
  }

  const expected = createHmac('sha256', secret).update(payload).digest('base64')
  const expectedBuffer = Buffer.from(expected)
  const signatureBuffer = Buffer.from(signature)

  if (expectedBuffer.length !== signatureBuffer.length) return false

  return timingSafeEqual(signatureBuffer, expectedBuffer)
}

export function extractFieldValue(fields: TallyField[], key: string): unknown {
  return fields.find((field) => field.key === key)?.value
}

export function extractFieldByLabel(fields: TallyField[], label: string): unknown {
  const normalized = label.toLowerCase()
  return fields.find((field) => field.label?.toLowerCase().includes(normalized))?.value
}

export function normalizeWorkflowType(value: string | null): WorkflowType | null {
  if (!value) return null
  const trimmed = value.trim()
  if (trimmed === 'event_participant_feedback') return 'event_participant_feedback'
  if (trimmed === 'event_facilitator_report') return 'event_facilitator_report'
  if (trimmed === 'program_pre_survey') return 'program_pre_survey'
  if (trimmed === 'program_post_survey') return 'program_post_survey'
  return null
}

export function parseNumberValue(value: unknown): number | undefined {
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (!Number.isNaN(parsed)) return parsed
  }
  return undefined
}

export function parseBooleanValue(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized === 'yes' || normalized === 'true'
  }
  return false
}

export function mapEventType(
  eventName: string | undefined,
): 'workshop' | 'talk' | 'meetup' | 'reading_group' | 'retreat' | 'panel' | null {
  if (!eventName) return null
  const lower = eventName.toLowerCase()

  if (lower.includes('reading group') || lower === 'paper reading group') {
    return 'reading_group'
  }
  if (lower.includes('hackathon')) {
    return null
  }
  if (lower.includes('workshop')) {
    return 'workshop'
  }
  if (lower.includes('talk')) {
    return 'talk'
  }
  if (lower.includes('meetup')) {
    return 'meetup'
  }
  if (lower.includes('retreat')) {
    return 'retreat'
  }
  if (lower.includes('panel')) {
    return 'panel'
  }

  return 'meetup'
}

export function generateEventSlug(eventType: string | undefined, eventDate: string | undefined): string {
  const typeStr = eventType || 'event'
  const dateStr = eventDate || new Date().toISOString().split('T')[0]

  const typeSlug = typeStr
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

  const date = new Date(dateStr)
  const formattedDate = Number.isNaN(date.getTime())
    ? new Date().toISOString().split('T')[0]
    : date.toISOString().split('T')[0]

  return `${typeSlug}-${formattedDate}`
}
