import type { Payload } from 'payload'
import { getPayload } from 'payload'
import config from '@payload-config'
import { normalizeWorkflowType, verifyTallySignature } from '@/webhooks/tally/utils'
import type { TallyWebhookPayload } from '@/webhooks/tally/types'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const payload = await getPayload({ config })

  const rawBody = await request.text()
  const signature = request.headers.get('Tally-Signature')

  if (!verifyTallySignature(rawBody, signature)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let body: TallyWebhookPayload
  try {
    body = JSON.parse(rawBody) as TallyWebhookPayload
  } catch (_error) {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const submissionId = body?.data?.submissionId
  if (!submissionId) {
    return Response.json({ error: 'Missing submissionId' }, { status: 400 })
  }

  const existing = await payload.find({
    collection: 'feedback-submissions',
    where: { externalSubmissionId: { equals: submissionId } },
    limit: 1,
  })

  if (existing.totalDocs > 0) {
    return Response.json({ status: 'already_processed', id: existing.docs[0].id })
  }

  const workflowType = normalizeWorkflowType(request.headers.get('X-Tally-Workflow-Type'))

  const feedbackSubmission = await payload.create({
    collection: 'feedback-submissions',
    data: {
      source: workflowType || 'other',
      externalSubmissionId: submissionId,
      externalRespondentId: body.data.respondentId,
      submittedAt: body.data.createdAt,
      tallyFormId: body.data.formId,
      workflowType: workflowType || undefined,
      processingStatus: 'pending',
      answers: body.data.fields,
    },
  } as unknown as Parameters<Payload['create']>[0])

  await payload.jobs.queue({
    task: 'processTallySubmission',
    input: {
      feedbackSubmissionId: feedbackSubmission.id,
      workflowType: workflowType || undefined,
      tallyPayload: body as unknown as Record<string, unknown>,
    },
  })

  return Response.json({ status: 'accepted', id: feedbackSubmission.id })
}
