export type ExternalIdentityProvider = 'tally' | 'google_sheets' | 'manual' | 'other'

export interface MissingField {
  path: string
  reason: string
  sourceColumn?: string
}

export interface ProposedPerson {
  email?: string
  fullName?: string
  preferredName?: string
  phone?: string
  metadata?: Record<string, unknown>
}

export interface ProposedExternalIdentity {
  provider: ExternalIdentityProvider
  externalId?: string
  email?: string
  phone?: string
  metadata?: Record<string, unknown>
}

export interface ProposedEvent {
  slug?: string
  name?: string
  type?:
    | 'workshop'
    | 'talk'
    | 'meetup'
    | 'reading_group'
    | 'retreat'
    | 'panel'
    | 'other'
  typeOther?: string
  eventDate?: string
  location?: string
  metadata?: Record<string, unknown>
}

export interface ProposedFeedbackSubmission {
  source:
    | 'event_participant_feedback'
    | 'event_facilitator_report'
    | 'program_pre_survey'
    | 'program_post_survey'
    | 'other'
  externalSubmissionId?: string
  externalRespondentId?: string
  submittedAt?: string
  rating?: number
  wouldRecommend?: number
  beneficialAspects?: string
  improvements?: string
  futureEvents?: string
  consentToPublishQuote?: boolean
  answers: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export interface ProposedEngagement {
  type?: 'participant' | 'facilitator' | 'speaker' | 'volunteer' | 'organizer' | 'mentor' | 'other'
  typeOther?: string
  engagement_status?: 'completed' | 'dropped_out' | 'in_progress' | 'withdrawn' | 'attended'
  rating?: number
  wouldRecommend?: number
  metadata?: Record<string, unknown>
}

export interface ProposedTestimonial {
  quote?: string
  rating?: number
  attributionName?: string
  metadata?: Record<string, unknown>
}

export interface ProposedRecord {
  person?: ProposedPerson
  externalIdentity?: ProposedExternalIdentity
  event?: ProposedEvent
  feedbackSubmission?: ProposedFeedbackSubmission
  engagement?: ProposedEngagement
  testimonial?: ProposedTestimonial
}

export interface NormalizedRecordSource {
  filePath: string
  format: 'csv' | 'json' | 'text'
  rowNumber?: number
}

export interface NormalizedRecord {
  recordId: string
  source: NormalizedRecordSource
  raw: Record<string, unknown> | string
  inferred: {
    fileLabel: string
    importerHint:
      | 'event_participant_feedback'
      | 'event_facilitator_report'
      | 'generic_feedback'
      | 'generic_document'
  }
  proposed: ProposedRecord
  missing: MissingField[]
  review: {
    status: 'needs_review' | 'ready'
    notes: string[]
  }
}

export interface NormalizedBatch {
  schemaVersion: 'manual-ingest/v1'
  batchId: string
  createdAt: string
  notes: string[]
  sourceFiles: string[]
  records: NormalizedRecord[]
}

export interface EntityMatch {
  entity: 'person' | 'event' | 'externalIdentity' | 'feedbackSubmission' | 'engagement' | 'testimonial'
  strategy: string
  matchedId: number
  detail: string
}

export type RefValue = { $ref: string }

export interface PlanOperation {
  id: string
  collection: string
  method: 'POST' | 'PATCH'
  path: string
  data: Record<string, unknown>
  approved: boolean
  registerRef?: string
  reason: string
}

export interface RecordPlan {
  recordId: string
  blockedReasons: string[]
  matches: EntityMatch[]
  operations: PlanOperation[]
}

export interface PlanBatch {
  schemaVersion: 'manual-ingest-plan/v1'
  batchId: string
  generatedAt: string
  normalizedInputPath: string
  targetBaseUrl: string
  approval: {
    status: 'pending' | 'approved'
    approvedBy: string | null
    approvedAt: string | null
  }
  summary: {
    totalRecords: number
    recordsWithOperations: number
    recordsBlocked: number
    totalOperations: number
  }
  records: RecordPlan[]
  operations: PlanOperation[]
}

export interface ApplyOperationResult {
  operationId: string
  method: 'POST' | 'PATCH'
  path: string
  status: 'success' | 'failed' | 'skipped'
  responseId?: number
  error?: string
}

export interface ApplyReport {
  schemaVersion: 'manual-ingest-report/v1'
  batchId: string
  appliedAt: string
  targetBaseUrl: string
  planPath: string
  summary: {
    totalOperations: number
    attempted: number
    successful: number
    failed: number
    skipped: number
  }
  results: ApplyOperationResult[]
}
