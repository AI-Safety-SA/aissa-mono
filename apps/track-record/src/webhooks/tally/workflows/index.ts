import type { PayloadRequest } from 'payload'
import type { TallyWebhookPayload, WorkflowType } from '../types'
import { handleEventParticipantFeedback } from './event-participant-feedback'
import { handleEventFacilitatorReport } from './event-facilitator-report'

export interface WorkflowContext {
  feedbackSubmissionId: number
  tallyPayload: TallyWebhookPayload
  req: PayloadRequest
}

export type WorkflowHandler = (ctx: WorkflowContext) => Promise<void>

export const workflowHandlers: Record<WorkflowType, WorkflowHandler> = {
  event_participant_feedback: handleEventParticipantFeedback,
  event_facilitator_report: handleEventFacilitatorReport,
  program_pre_survey: async () => undefined,
  program_post_survey: async () => undefined,
}
