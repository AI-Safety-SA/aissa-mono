import config from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { SubmissionsListClient } from './submissions-list-client'

export const dynamic = 'force-dynamic'

export default async function CommunityReviewListPage() {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  const auth = await payload.auth({
    canSetHeaders: false,
    headers: requestHeaders,
  })

  if (!auth.user) {
    redirect('/admin/login')
  }

  const { docs: submissions } = await payload.find({
    collection: 'community-submissions',
    user: auth.user,
    overrideAccess: false,
    sort: '-createdAt',
    limit: 100,
    depth: 1,
  })

  return <SubmissionsListClient submissions={submissions} />
}
