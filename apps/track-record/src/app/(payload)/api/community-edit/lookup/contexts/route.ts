import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { resolveSessionSubmission } from '@/utilities/community/session-submission'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const payload = await getPayload({ config })
  const sessionResult = await resolveSessionSubmission({ payload, request })
  if ('errorResponse' in sessionResult) return sessionResult.errorResponse

  const [eventsResult, programsResult] = await Promise.all([
    payload.find({
      collection: 'events',
      where: { isPublished: { equals: true } },
      limit: 500,
      sort: '-eventDate',
      depth: 0,
    }),
    payload.find({
      collection: 'programs',
      where: { isPublished: { equals: true } },
      limit: 500,
      sort: '-startDate',
      depth: 0,
    }),
  ])

  const events = eventsResult.docs.map((event) => ({
    id: event.id,
    name: event.name,
    type: event.type,
    eventDate: event.eventDate,
  }))

  const programs = programsResult.docs.map((program) => ({
    id: program.id,
    name: program.name,
    type: program.type,
    startDate: program.startDate,
  }))

  return NextResponse.json({ events, programs, success: true })
}
