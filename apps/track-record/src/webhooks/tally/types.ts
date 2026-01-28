export const WORKFLOW_TYPES = [
  'event_participant_feedback',
  'event_facilitator_report',
  'program_pre_survey',
  'program_post_survey',
] as const

export type WorkflowType = (typeof WORKFLOW_TYPES)[number]

export interface TallyWebhookPayload {
  eventId: string
  eventType: 'FORM_RESPONSE'
  createdAt: string
  data: {
    responseId: string
    submissionId: string
    respondentId: string
    formId: string
    formName: string
    createdAt: string
    fields: TallyField[]
  }
}

export interface TallyField {
  key: string
  label: string
  type: string
  value: unknown
  options?: { id: string; text: string }[]
}
