import type { Payload } from 'payload'
import type { WorkflowContext } from './index'
import {
  extractFieldByLabel,
  generateEventSlug,
  mapEventType,
  parseNumberValue,
} from '../utils'

async function findOrCreatePerson({
  payload,
  email,
  fullName,
  req,
}: {
  payload: Payload
  email?: string
  fullName?: string
  req: WorkflowContext['req']
}): Promise<number> {
  const trimmedEmail = email?.trim()
  const trimmedName = fullName?.trim()

  if (trimmedEmail) {
    const existing = await payload.find({
      collection: 'persons',
      where: { email: { equals: trimmedEmail } },
      limit: 1,
      req,
    })
    if (existing.totalDocs > 0) {
      return existing.docs[0].id
    }
  }

  if (trimmedName) {
    const existing = await payload.find({
      collection: 'persons',
      where: { fullName: { equals: trimmedName } },
      limit: 1,
      req,
    })
    if (existing.totalDocs > 0) {
      return existing.docs[0].id
    }
  }

  if (!trimmedEmail && !trimmedName) {
    throw new Error('Facilitator report missing email and full name')
  }

  const created = await payload.create({
    collection: 'persons',
    data: {
      email: trimmedEmail || `${trimmedName?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}@placeholder.aissa.org`,
      fullName: trimmedName || trimmedEmail?.split('@')[0] || 'Facilitator',
    },
    req,
  })

  return created.id
}

async function findOrCreateExternalIdentity({
  payload,
  respondentId,
  email,
  req,
}: {
  payload: Payload
  respondentId: string
  email?: string
  req: WorkflowContext['req']
}): Promise<number> {
  const key = `tally:${respondentId}`
  const existing = await payload.find({
    collection: 'external-identities',
    where: { key: { equals: key } },
    limit: 1,
    req,
  })

  if (existing.totalDocs > 0) {
    return existing.docs[0].id
  }

  const created = await payload.create({
    collection: 'external-identities',
    data: {
      key,
      provider: 'tally',
      externalId: respondentId,
      email: email?.trim() || undefined,
    },
    req,
  })

  return created.id
}

export async function handleEventFacilitatorReport({
  feedbackSubmissionId,
  tallyPayload,
  req,
}: WorkflowContext): Promise<void> {
  const { payload } = req
  const fields = tallyPayload.data.fields

  const email = extractFieldByLabel(fields, 'email')
  const fullName = extractFieldByLabel(fields, 'full name')
  const eventName = extractFieldByLabel(fields, 'event did you host')
  const eventTypeLabel = extractFieldByLabel(fields, 'event type')
  const eventDateValue = extractFieldByLabel(fields, 'event date')
  const attendanceCountValue = extractFieldByLabel(fields, 'attended')
  const description = extractFieldByLabel(fields, 'what happened')
  const photos = extractFieldByLabel(fields, 'photos')

  const facilitatorId = await findOrCreatePerson({
    payload,
    email: typeof email === 'string' ? email : undefined,
    fullName: typeof fullName === 'string' ? fullName : undefined,
    req,
  })

  const eventType = mapEventType(
    typeof eventTypeLabel === 'string' ? eventTypeLabel : (typeof eventName === 'string' ? eventName : undefined),
  )
  if (!eventType) {
    throw new Error('Unable to determine event type for facilitator report')
  }

  const eventDateRaw = typeof eventDateValue === 'string' ? eventDateValue : undefined
  const parsedEventDate = eventDateRaw ? new Date(eventDateRaw) : null
  if (!parsedEventDate || Number.isNaN(parsedEventDate.getTime())) {
    throw new Error(`Invalid event date: ${eventDateRaw ?? 'unknown'}`)
  }

  const eventSlug = generateEventSlug(
    typeof eventName === 'string' ? eventName : (typeof eventTypeLabel === 'string' ? eventTypeLabel : undefined),
    parsedEventDate.toISOString(),
  )

  const existingEvent = await payload.find({
    collection: 'events',
    where: { slug: { equals: eventSlug } },
    limit: 1,
    req,
  })

  let eventId: number

  if (existingEvent.totalDocs > 0) {
    eventId = existingEvent.docs[0].id
  } else {
    const attendanceCount = parseNumberValue(attendanceCountValue)
    const created = await payload.create({
      collection: 'events',
      data: {
        slug: eventSlug,
        name:
          (typeof eventName === 'string' && eventName.trim()) ||
          (typeof eventTypeLabel === 'string' && eventTypeLabel.trim()) ||
          'Event',
        type: eventType,
        organiser: facilitatorId,
        eventDate: parsedEventDate.toISOString(),
        attendanceCount,
        metadata: {
          source: 'tally_facilitator_report',
          submissionId: tallyPayload.data.submissionId,
          respondentId: tallyPayload.data.respondentId,
          description: typeof description === 'string' ? description : undefined,
          photos: typeof photos === 'string' ? photos : undefined,
        },
      },
      req,
    })
    eventId = created.id
  }

  const existingHost = await payload.find({
    collection: 'event-hosts',
    where: {
      and: [{ event: { equals: eventId } }, { person: { equals: facilitatorId } }],
    },
    limit: 1,
    req,
  })

  if (existingHost.totalDocs === 0) {
    await payload.create({
      collection: 'event-hosts',
      data: {
        event: eventId,
        person: facilitatorId,
      },
      req,
    })
  }

  const respondentId = tallyPayload.data.respondentId
  const externalIdentityId =
    respondentId && respondentId.trim()
      ? await findOrCreateExternalIdentity({
          payload,
          respondentId,
          email: typeof email === 'string' ? email : undefined,
          req,
        })
      : undefined

  await payload.update({
    collection: 'feedback-submissions',
    id: feedbackSubmissionId,
    data: {
      context: { relationTo: 'events', value: eventId },
      person: facilitatorId,
      externalIdentity: externalIdentityId,
    },
    req,
  })
}
