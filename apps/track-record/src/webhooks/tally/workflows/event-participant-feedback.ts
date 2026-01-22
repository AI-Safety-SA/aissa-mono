import type { Payload } from 'payload'
import type { WorkflowContext } from './index'
import {
  extractFieldByLabel,
  extractFieldValue,
  parseBooleanValue,
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
}): Promise<number | null> {
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

  if (!trimmedEmail && !trimmedName) return null

  const created = await payload.create({
    collection: 'persons',
    data: {
      email: trimmedEmail || `${trimmedName?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}@placeholder.aissa.org`,
      fullName: trimmedName || trimmedEmail?.split('@')[0] || 'Anonymous',
    },
    req,
  })

  return created.id
}

async function findOrCreateExternalIdentity({
  payload,
  respondentId,
  email,
  phone,
  req,
}: {
  payload: Payload
  respondentId: string
  email?: string
  phone?: string
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
      phone: phone?.trim() || undefined,
    },
    req,
  })

  return created.id
}

export async function handleEventParticipantFeedback({
  feedbackSubmissionId,
  tallyPayload,
  req,
}: WorkflowContext): Promise<void> {
  const { payload } = req
  const fields = tallyPayload.data.fields

  const eventSlugValue =
    extractFieldValue(fields, 'event_slug') ?? extractFieldByLabel(fields, 'event slug')
  const eventSlug = typeof eventSlugValue === 'string' ? eventSlugValue.trim() : undefined
  if (!eventSlug) {
    throw new Error('Missing event_slug in Tally submission')
  }

  const event = await payload.find({
    collection: 'events',
    where: { slug: { equals: eventSlug } },
    limit: 1,
    req,
  })

  if (event.totalDocs === 0) {
    throw new Error(`Event not found: ${eventSlug}`)
  }

  const email = extractFieldByLabel(fields, 'email')
  const fullName = extractFieldByLabel(fields, 'full name')
  const phone = extractFieldByLabel(fields, 'phone')

  const personId = await findOrCreatePerson({
    payload,
    email: typeof email === 'string' ? email : undefined,
    fullName: typeof fullName === 'string' ? fullName : undefined,
    req,
  })

  const respondentId = tallyPayload.data.respondentId
  const externalIdentityId =
    respondentId && respondentId.trim()
      ? await findOrCreateExternalIdentity({
          payload,
          respondentId,
          email: typeof email === 'string' ? email : undefined,
          phone: typeof phone === 'string' ? phone : undefined,
          req,
        })
      : undefined

  const rating = parseNumberValue(
    extractFieldByLabel(fields, 'rate the event') ?? extractFieldByLabel(fields, 'rating'),
  )
  const wouldRecommend = parseNumberValue(extractFieldByLabel(fields, 'recommend'))

  const beneficialAspects = extractFieldByLabel(fields, 'beneficial')
  const improvements = extractFieldByLabel(fields, 'improve')
  const futureEvents = extractFieldByLabel(fields, 'future')
  const isFirstTimeAttendee = parseBooleanValue(extractFieldByLabel(fields, 'first time'))
  const consentToPublishQuote = parseBooleanValue(extractFieldByLabel(fields, 'quote'))
  const testimonialText = extractFieldByLabel(fields, 'testimonial')

  await payload.update({
    collection: 'feedback-submissions',
    id: feedbackSubmissionId,
    data: {
      context: { relationTo: 'events', value: event.docs[0].id },
      person: personId || undefined,
      externalIdentity: externalIdentityId,
      rating,
      wouldRecommend,
      beneficialAspects: typeof beneficialAspects === 'string' ? beneficialAspects : undefined,
      improvements: typeof improvements === 'string' ? improvements : undefined,
      futureEvents: typeof futureEvents === 'string' ? futureEvents : undefined,
      isFirstTimeAttendee,
      consentToPublishQuote,
    },
    req,
  })

  if (consentToPublishQuote && typeof testimonialText === 'string' && testimonialText.trim()) {
    await payload.create({
      collection: 'testimonials',
      data: {
        quote: testimonialText.trim(),
        context: { relationTo: 'events', value: event.docs[0].id },
        person: personId || undefined,
        attributionName: personId ? undefined : 'Anonymous',
        rating,
      },
      req,
    })
  }
}
