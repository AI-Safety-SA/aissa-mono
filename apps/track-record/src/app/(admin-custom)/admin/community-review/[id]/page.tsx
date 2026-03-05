import config from '@payload-config'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { CommunityReviewClient } from './review-client'
import {
  getCommunityReviewBundle,
  parseCommunitySubmissionId,
} from '@/utilities/community/review-data'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function CommunityReviewPage({ params }: PageProps) {
  const { id } = await params
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  const auth = await payload.auth({
    canSetHeaders: false,
    headers: requestHeaders,
  })

  if (!auth.user) {
    redirect('/admin/login')
  }

  const review = await getCommunityReviewBundle({
    payload,
    submissionId: parseCommunitySubmissionId(id),
    user: auth.user,
  })

  if (!review) {
    notFound()
  }

  return <CommunityReviewClient initialReview={review} submissionId={String(review.submission.id)} />
}
