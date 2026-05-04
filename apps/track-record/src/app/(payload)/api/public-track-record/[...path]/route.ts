import { NextResponse } from 'next/server'
import { getPublicCollectionPayload } from '@/lib/public-track-record'

function isAuthorized(request: Request): boolean {
  const expectedToken = process.env.PUBLIC_TRACK_RECORD_API_TOKEN
  if (!expectedToken) return false

  const header = request.headers.get('authorization')
  return header === `Bearer ${expectedToken}`
}

export async function GET(request: Request, context: { params: Promise<{ path?: string[] }> }) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const params = await context.params
  const path = params.path?.join('/') || 'home'
  const payload = await getPublicCollectionPayload(path)

  if (!payload) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(payload)
}
