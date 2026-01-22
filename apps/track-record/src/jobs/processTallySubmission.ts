import type { TaskConfig } from 'payload'
import { workflowHandlers } from '@/webhooks/tally/workflows'
import type { TallyWebhookPayload, WorkflowType } from '@/webhooks/tally/types'

export const processTallySubmissionTask: TaskConfig<'processTallySubmission'> = {
  slug: 'processTallySubmission',
  inputSchema: [
    { name: 'feedbackSubmissionId', type: 'number', required: true },
    { name: 'workflowType', type: 'text' },
    { name: 'tallyPayload', type: 'json', required: true },
  ],
  handler: async ({ input, req }) => {
    const { feedbackSubmissionId, workflowType, tallyPayload } = input
    const { payload } = req

    await payload.update({
      collection: 'feedback-submissions',
      id: feedbackSubmissionId,
      data: { processingStatus: 'processing', processingError: null },
      req,
    })

    const resolvedWorkflow = workflowType as WorkflowType | undefined
    const handler = resolvedWorkflow ? workflowHandlers[resolvedWorkflow] : undefined

    if (!resolvedWorkflow || !handler) {
      await payload.update({
        collection: 'feedback-submissions',
        id: feedbackSubmissionId,
        data: {
          processingStatus: 'failed',
          processingError: `Unknown workflow type: ${workflowType ?? 'missing'}`,
        },
        req,
      })
      return { output: { success: false, reason: 'unknown_workflow' } }
    }

    try {
      await handler({
        feedbackSubmissionId,
        tallyPayload: tallyPayload as unknown as TallyWebhookPayload,
        req,
      })

      await payload.update({
        collection: 'feedback-submissions',
        id: feedbackSubmissionId,
        data: { processingStatus: 'completed' },
        req,
      })

      return { output: { success: true } }
    } catch (error) {
      await payload.update({
        collection: 'feedback-submissions',
        id: feedbackSubmissionId,
        data: {
          processingStatus: 'failed',
          processingError: error instanceof Error ? error.message : String(error),
        },
        req,
      })

      throw error
    }
  },
}
