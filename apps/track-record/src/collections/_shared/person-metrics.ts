import type { PayloadRequest } from 'payload'

export async function recomputePersonMetrics(req: PayloadRequest, personId: number): Promise<void> {
  const [engagements, impacts, projectContributions, eventHosts, organisedEvents] =
    await Promise.all([
      req.payload.find({
        collection: 'engagements',
        where: { person: { equals: personId } },
        limit: 0,
        depth: 0,
        req,
      }),
      req.payload.find({
        collection: 'engagement-impacts',
        where: { person: { equals: personId } },
        limit: 0,
        depth: 0,
        req,
      }),
      req.payload.find({
        collection: 'project-contributors',
        where: { person: { equals: personId } },
        limit: 0,
        depth: 0,
        req,
      }),
      req.payload.find({
        collection: 'event-hosts',
        where: { person: { equals: personId } },
        limit: 0,
        depth: 0,
        req,
      }),
      req.payload.find({
        collection: 'events',
        where: { organiser: { equals: personId } },
        limit: 0,
        depth: 0,
        req,
      }),
    ])

  const engagementDates = engagements.docs
    .map((engagement) => engagement.contextDate || engagement.createdAt)
    .filter((value): value is string => typeof value === 'string')
    .map((value) => new Date(value))
    .filter((value) => !Number.isNaN(value.getTime()))

  engagementDates.sort((a, b) => a.getTime() - b.getTime())

  const firstEngagementDate = engagementDates[0]?.toISOString()
  const lastEngagementDate = engagementDates[engagementDates.length - 1]?.toISOString()

  const contributions =
    projectContributions.totalDocs + eventHosts.totalDocs + organisedEvents.totalDocs

  await req.payload.update({
    collection: 'persons',
    id: personId,
    data: {
      totalEngagements: engagements.totalDocs,
      totalImpacts: impacts.totalDocs,
      contributions,
      firstEngagementDate: firstEngagementDate ?? null,
      lastEngagementDate: lastEngagementDate ?? null,
    },
    req,
  })
}
