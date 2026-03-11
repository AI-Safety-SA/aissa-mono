'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CommunityEditShell } from '../_components/community-edit-shell'
import { type StagedSummary, communityEditSubmit, getCommunityEditSession, getStagedSummary } from '../_lib/api'
import { clearCommunityEditDraft } from '../_lib/draft'

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export default function CommunityEditReviewPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [staged, setStaged] = useState<StagedSummary | null>(null)

  useEffect(() => {
    async function bootstrap() {
      try {
        const session = await getCommunityEditSession()
        setEmail(session.submission.email)
      } catch {
        router.replace('/community-edit/verify')
        return
      }

      try {
        const summary = await getStagedSummary()
        setStaged(summary)
      } catch {
        // If staged summary fails, still show page but without details
      }

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

  const hasAnyContent = staged && (
    staged.personUpdates.length > 0 ||
    staged.engagements.length > 0 ||
    staged.removals.length > 0 ||
    staged.testimonials.length > 0 ||
    staged.impacts.length > 0 ||
    staged.generalTestimonial !== null
  )

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
          <CardContent className="space-y-4 text-sm">
            {email ? <p className="m-0 text-muted-foreground">Verified email: {email}</p> : null}

            {!staged ? (
              <p className="m-0 text-muted-foreground">Unable to load staged items summary.</p>
            ) : !hasAnyContent ? (
              <p className="m-0 text-muted-foreground">
                No changes have been staged yet. Go back to previous steps to add changes.
              </p>
            ) : (
              <>
                {staged.personUpdates.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Profile Updates ({staged.personUpdates.length})</h3>
                    <div className="space-y-1">
                      {staged.personUpdates.map((update) => (
                        <div key={update.id} className="rounded border px-3 py-2">
                          <span className="font-medium">{update.field}</span>:{' '}
                          <span className="text-muted-foreground">{formatValue(update.currentValue)}</span>
                          {' → '}
                          <span>{formatValue(update.proposedValue)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {staged.engagements.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Engagements ({staged.engagements.length})</h3>
                    <div className="space-y-1">
                      {staged.engagements.map((eng) => (
                        <div key={eng.id} className="rounded border px-3 py-2">
                          <span className="font-medium">{eng.operation}</span> {eng.type}
                          {eng.engagement_status ? ` (${eng.engagement_status})` : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {staged.removals.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Removals ({staged.removals.length})</h3>
                    <div className="space-y-1">
                      {staged.removals.map((removal) => (
                        <div key={removal.id} className="rounded border border-destructive/30 px-3 py-2">
                          Remove engagement #{String(typeof removal.engagement === 'object' ? JSON.stringify(removal.engagement) : removal.engagement)}
                          : {removal.reason}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {staged.testimonials.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Testimonials ({staged.testimonials.length})</h3>
                    <div className="space-y-1">
                      {staged.testimonials.map((testimonial) => (
                        <div key={testimonial.id} className="rounded border px-3 py-2">
                          &ldquo;{testimonial.quote.length > 80 ? `${testimonial.quote.slice(0, 80)}...` : testimonial.quote}&rdquo;
                          {testimonial.consentToPublish ? ' (consent given)' : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {staged.generalTestimonial ? (
                  <div>
                    <h3 className="text-sm font-medium mb-2">General Testimonial</h3>
                    <div className="rounded border px-3 py-2">
                      &ldquo;{staged.generalTestimonial.quote.length > 80 ? `${staged.generalTestimonial.quote.slice(0, 80)}...` : staged.generalTestimonial.quote}&rdquo;
                      {staged.generalTestimonial.consent ? ' (consent given)' : ''}
                    </div>
                  </div>
                ) : null}

                {staged.impacts.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Impacts ({staged.impacts.length})</h3>
                    <div className="space-y-1">
                      {staged.impacts.map((impact) => (
                        <div key={impact.id} className="rounded border px-3 py-2">
                          <span className="font-medium">{impact.type}</span>: {impact.summary.length > 80 ? `${impact.summary.slice(0, 80)}...` : impact.summary}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            )}
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
