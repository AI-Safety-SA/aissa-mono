'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CommunityEditShell } from '../_components/community-edit-shell'
import { communityEditSubmit, getCommunityEditSession } from '../_lib/api'
import { clearCommunityEditDraft, getCommunityEditDraft } from '../_lib/draft'

export default function CommunityEditReviewPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draftSummary, setDraftSummary] = useState({
    engagements: 0,
    impacts: 0,
    profileFields: 0,
    testimonials: 0,
  })

  useEffect(() => {
    async function bootstrap() {
      try {
        const session = await getCommunityEditSession()
        setEmail(session.submission.email)
      } catch {
        router.replace('/community-edit/verify')
        return
      }

      const draft = getCommunityEditDraft()
      setDraftSummary({
        engagements: draft.engagements?.length || 0,
        impacts: draft.impacts?.length || 0,
        profileFields:
          Object.values(draft.profile || {}).filter((value) => String(value || '').trim().length > 0)
            .length || 0,
        testimonials: draft.testimonials?.length || 0,
      })

      setIsLoadingSession(false)
    }

    void bootstrap()
  }, [router])

  async function submitForReview() {
    setError(null)
    setIsSubmitting(true)
    try {
      await communityEditSubmit()
      clearCommunityEditDraft()
      router.push('/community-edit/submitted')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit for review.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingSession) {
    return (
      <CommunityEditShell
        step={7}
        title="Review Submission"
        description="Loading your verified session..."
      >
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">Loading session...</CardContent>
        </Card>
      </CommunityEditShell>
    )
  }

  return (
    <CommunityEditShell
      step={7}
      title="Review Submission"
      description="Confirm your staged changes and submit them for admin review."
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Submission Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {email ? <p className="m-0 text-muted-foreground">Verified email: {email}</p> : null}
            <p className="m-0">Profile updates: {draftSummary.profileFields}</p>
            <p className="m-0">Engagement entries: {draftSummary.engagements}</p>
            <p className="m-0">Testimonial entries: {draftSummary.testimonials}</p>
            <p className="m-0">Impact entries: {draftSummary.impacts}</p>
          </CardContent>
        </Card>

        {error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={submitForReview} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit for Review'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/community-edit/impacts')}>
            Back to Impacts
          </Button>
        </div>
      </div>
    </CommunityEditShell>
  )
}

