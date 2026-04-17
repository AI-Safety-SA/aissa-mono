export const platformEventNames = {
  personProfileUpdated: 'person.profile.updated',
  personIdentityLinked: 'person.identity.linked',
  contextNodeUpserted: 'context.node.upserted',
  contextNodeArchived: 'context.node.archived',
  engagementUpserted: 'engagement.upserted',
  engagementDeleted: 'engagement.deleted',
  feedbackSubmissionReceived: 'feedback.submission.received',
  feedbackSubmissionProcessed: 'feedback.submission.processed',
  externalIdentityObserved: 'external.identity.observed',
  personMetricsRecomputeRequested: 'person.metrics.recompute.requested',
  deskBookingRecorded: 'desk_booking.booking.recorded',
  lumaAttendanceReceived: 'luma.attendance.received',
} as const

export type PlatformEventName =
  (typeof platformEventNames)[keyof typeof platformEventNames]

export interface PersonMetricsRecomputeRequestedEvent {
  name: typeof platformEventNames.personMetricsRecomputeRequested
  data: {
    personId: number
    reason:
      | 'engagement_changed'
      | 'engagement_deleted'
      | 'impact_changed'
      | 'impact_deleted'
      | 'context_changed'
      | 'relation_changed'
      | 'manual'
    source: string
  }
}

export interface ContextNodeUpsertedEvent {
  name: typeof platformEventNames.contextNodeUpserted
  data: {
    contextNodeId: number
    type: string
    sourceCollection: string
    sourceId: string
    displayName: string
    canonicalDate: string | null
  }
}

export interface ContextNodeArchivedEvent {
  name: typeof platformEventNames.contextNodeArchived
  data: {
    contextNodeId: number
    type: string
    sourceCollection: string
    sourceId: string
  }
}

export interface EngagementUpsertedEvent {
  name: typeof platformEventNames.engagementUpserted
  data: {
    engagementId: number
    personId: number
    contextNodeId: number
    type: string
    status: string | null
  }
}

export interface EngagementDeletedEvent {
  name: typeof platformEventNames.engagementDeleted
  data: {
    engagementId: number
    personId: number
    contextNodeId: number | null
  }
}

export interface FeedbackSubmissionReceivedEvent {
  name: typeof platformEventNames.feedbackSubmissionReceived
  data: {
    feedbackSubmissionId: number
    source: string
    processingStatus: string
    personId: number | null
    externalIdentityId: number | null
    contextNodeId: number | null
  }
}

export interface FeedbackSubmissionProcessedEvent {
  name: typeof platformEventNames.feedbackSubmissionProcessed
  data: {
    feedbackSubmissionId: number
    source: string
    processingStatus: string
    personId: number | null
    externalIdentityId: number | null
    contextNodeId: number | null
  }
}

export interface PersonIdentityLinkedEvent {
  name: typeof platformEventNames.personIdentityLinked
  data: {
    personId: number
    workosUserId: string
    email: string
  }
}

export interface PersonProfileUpdatedEvent {
  name: typeof platformEventNames.personProfileUpdated
  data: {
    personId: number
    workosUserId: string | null
  }
}

export interface ExternalIdentityObservedEvent {
  name: typeof platformEventNames.externalIdentityObserved
  data: {
    externalIdentityId: number
    provider: string
    externalId: string
    personId: number | null
  }
}

export interface DeskBookingRecordedEvent {
  name: typeof platformEventNames.deskBookingRecorded
  data: {
    bookingId: string
    workosUserId: string
    startsAt: string
    endsAt: string
    location: string
  }
}

export interface LumaAttendanceReceivedEvent {
  name: typeof platformEventNames.lumaAttendanceReceived
  data: {
    lumaEventId: string
    attendeeId: string
    attendeeEmail: string | null
    attendeeName: string | null
    attendedAt: string | null
  }
}

export type PlatformEvent =
  | ContextNodeArchivedEvent
  | ContextNodeUpsertedEvent
  | DeskBookingRecordedEvent
  | EngagementDeletedEvent
  | EngagementUpsertedEvent
  | ExternalIdentityObservedEvent
  | FeedbackSubmissionProcessedEvent
  | FeedbackSubmissionReceivedEvent
  | LumaAttendanceReceivedEvent
  | PersonIdentityLinkedEvent
  | PersonMetricsRecomputeRequestedEvent
  | PersonProfileUpdatedEvent

export function createPlatformEvent<TEvent extends PlatformEvent>(event: TEvent): TEvent {
  return event
}
