import type { Payload, PayloadRequest } from 'payload'
import { describe, it, beforeAll, expect } from 'vitest'

import { getTestPayload } from '../utils/test-payload'
import { createTestPerson, createTestEvent } from '../utils/fixtures'
import type { TallyWebhookPayload } from '@/webhooks/tally/types'
import { handleEventParticipantFeedback } from '@/webhooks/tally/workflows/event-participant-feedback'
import { handleEventFacilitatorReport } from '@/webhooks/tally/workflows/event-facilitator-report'

let payload: Payload
let req: PayloadRequest

describe('Tally workflow handlers', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
    req = { payload } as PayloadRequest
  })

  it('processes event participant feedback submissions', async () => {
    const unique = Date.now()

    const organiser = await createTestPerson(payload, {
      email: `organiser-${unique}@example.com`,
      fullName: `Organiser ${unique}`,
    })

    const eventSlug = `event-participant-${unique}`
    const event = await createTestEvent(payload, {
      slug: eventSlug,
      name: `Participant Event ${unique}`,
      type: 'workshop',
      organiser: organiser.id,
      eventDate: new Date().toISOString(),
    })

    const submissionId = `submission-${unique}`
    const feedbackSubmission = await payload.create({
      collection: 'feedback-submissions',
      data: {
        source: 'event_participant_feedback',
        externalSubmissionId: submissionId,
        externalRespondentId: `respondent-${unique}`,
        submittedAt: new Date().toISOString(),
        processingStatus: 'pending',
        answers: [],
      } as any,
    })

    const tallyPayload: TallyWebhookPayload = {
      eventId: `event-${unique}`,
      eventType: 'FORM_RESPONSE',
      createdAt: new Date().toISOString(),
      data: {
        responseId: `response-${unique}`,
        submissionId,
        respondentId: `respondent-${unique}`,
        formId: `form-${unique}`,
        formName: 'Participant Feedback',
        createdAt: new Date().toISOString(),
        fields: [
          { key: 'event_slug', label: 'event_slug', type: 'text', value: eventSlug },
          { key: 'email', label: 'Email', type: 'text', value: `participant-${unique}@example.com` },
          { key: 'full_name', label: 'Full name', type: 'text', value: `Participant ${unique}` },
          {
            key: 'rating',
            label: 'Overall, how would you rate the event on a scale from 1-10?',
            type: 'number',
            value: 9,
          },
          {
            key: 'recommend',
            label: 'How likely would you be to recommend this event to a friend?',
            type: 'number',
            value: 8,
          },
          {
            key: 'beneficial',
            label: 'What aspects of the event were most beneficial?',
            type: 'text',
            value: 'Great discussions',
          },
          {
            key: 'improve',
            label: 'What aspects of the event could we improve?',
            type: 'text',
            value: 'More snacks',
          },
          {
            key: 'future',
            label: 'What kind of events do you hope to see us host in the future?',
            type: 'text',
            value: 'Workshops',
          },
          {
            key: 'first_time',
            label: 'Is this your first time attending an AISSA event?',
            type: 'text',
            value: 'Yes',
          },
          {
            key: 'quote',
            label: 'Do you consent to publishing a quote?',
            type: 'text',
            value: 'Yes',
          },
          {
            key: 'testimonial',
            label: 'Testimonial',
            type: 'text',
            value: 'This was fantastic!',
          },
        ],
      },
    }

    await handleEventParticipantFeedback({
      feedbackSubmissionId: feedbackSubmission.id,
      tallyPayload,
      req,
    })

    const updated = await payload.findByID({
      collection: 'feedback-submissions',
      id: feedbackSubmission.id,
      depth: 0,
    })

    expect(updated.context).toEqual({ relationTo: 'events', value: event.id })
    expect(updated.rating).toBe(9)
    expect(updated.wouldRecommend).toBe(8)
    expect(updated.externalIdentity).toBeDefined()

    const testimonial = await payload.find({
      collection: 'testimonials',
      where: { quote: { equals: 'This was fantastic!' } },
      limit: 1,
    })
    expect(testimonial.totalDocs).toBe(1)
  })

  it('processes event facilitator report submissions', async () => {
    const unique = Date.now() + 1
    const submissionId = `facilitator-submission-${unique}`

    const feedbackSubmission = await payload.create({
      collection: 'feedback-submissions',
      data: {
        source: 'event_facilitator_report',
        externalSubmissionId: submissionId,
        externalRespondentId: `facilitator-${unique}`,
        submittedAt: new Date().toISOString(),
        processingStatus: 'pending',
        answers: [],
      } as any,
    })

    const eventDate = new Date().toISOString()
    const tallyPayload: TallyWebhookPayload = {
      eventId: `event-${unique}`,
      eventType: 'FORM_RESPONSE',
      createdAt: new Date().toISOString(),
      data: {
        responseId: `response-${unique}`,
        submissionId,
        respondentId: `facilitator-${unique}`,
        formId: `form-${unique}`,
        formName: 'Facilitator Report',
        createdAt: new Date().toISOString(),
        fields: [
          { key: 'email', label: 'Your email', type: 'text', value: `facilitator-${unique}@example.com` },
          { key: 'full_name', label: 'Full name', type: 'text', value: `Facilitator ${unique}` },
          {
            key: 'event_name',
            label: 'What event did you host?',
            type: 'text',
            value: `Facilitator Event ${unique}`,
          },
          { key: 'event_type', label: 'Event type', type: 'text', value: 'Workshop' },
          { key: 'event_date', label: 'What date was the event?', type: 'text', value: eventDate },
          {
            key: 'attendance',
            label: 'How many people attended the event?',
            type: 'number',
            value: 42,
          },
          {
            key: 'description',
            label: 'Briefly, what happened at the event and how did it go?',
            type: 'text',
            value: 'Great turnout.',
          },
          {
            key: 'photos',
            label: 'Please upload some photos from the event',
            type: 'text',
            value: 'https://example.com/photo.jpg',
          },
        ],
      },
    }

    await handleEventFacilitatorReport({
      feedbackSubmissionId: feedbackSubmission.id,
      tallyPayload,
      req,
    })

    const updated = await payload.findByID({
      collection: 'feedback-submissions',
      id: feedbackSubmission.id,
      depth: 0,
    })

    expect(updated.context).toBeDefined()
    expect(updated.person).toBeDefined()

    const host = await payload.find({
      collection: 'event-hosts',
      where: {
        and: [
          { event: { equals: (updated.context as { value: number }).value } },
          { person: { equals: updated.person as number } },
        ],
      },
      limit: 1,
    })
    expect(host.totalDocs).toBe(1)
  })
})
