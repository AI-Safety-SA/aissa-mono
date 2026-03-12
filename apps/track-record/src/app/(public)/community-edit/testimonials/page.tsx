'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CommunityEditShell } from '../_components/community-edit-shell'
import { FormTextarea } from '../_components/form-controls'
import { getCommunityEditSession, stageTestimonials } from '../_lib/api'
import { getCommunityEditDraft, patchCommunityEditDraft } from '../_lib/draft'

export default function CommunityEditTestimonialsPage() {
  const router = useRouter()
  const [generalTestimonial, setGeneralTestimonial] = useState('')
  const [generalTestimonialConsent, setGeneralTestimonialConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingSession, setIsLoadingSession] = useState(true)

  useEffect(() => {
    async function bootstrap() {
      try {
        await getCommunityEditSession()
      } catch {
        router.replace('/community-edit/verify')
        return
      }

      const draft = getCommunityEditDraft()
      setGeneralTestimonial(draft.generalTestimonial?.quote || '')
      setGeneralTestimonialConsent(draft.generalTestimonial?.consentToPublish || false)
      setIsLoadingSession(false)
    }
    void bootstrap()
  }, [router])

  async function submitAndContinue() {
    setError(null)
    setIsSubmitting(true)

    try {
      await stageTestimonials({
        generalTestimonial: generalTestimonial.trim(),
        generalTestimonialConsent,
        testimonials: [],
      })

      patchCommunityEditDraft({
        generalTestimonial: {
          consentToPublish: generalTestimonialConsent,
          quote: generalTestimonial.trim(),
        },
        testimonials: [],
      })
      router.push('/community-edit/impacts')
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Unable to stage testimonials.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingSession) {
    return (
      <CommunityEditShell
        step={5}
        title="Add Testimonials"
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
      step={5}
      title="Add Testimonials"
      description="Share a general testimonial about AISSA."
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">General Testimonial About AISSA (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">General testimonial quote</label>
              <FormTextarea
                value={generalTestimonial}
                onChange={(event) => setGeneralTestimonial(event.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={generalTestimonialConsent}
                onChange={(event) => setGeneralTestimonialConsent(event.target.checked)}
              />
              I consent to this general testimonial being published.
            </label>
          </CardContent>
        </Card>

        {error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={submitAndContinue} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save and Continue'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              patchCommunityEditDraft({
                generalTestimonial: {
                  consentToPublish: generalTestimonialConsent,
                  quote: generalTestimonial.trim(),
                },
                testimonials: [],
              })
              router.push('/community-edit/impacts')
            }}
          >
            Skip for Now
          </Button>
        </div>
      </div>
    </CommunityEditShell>
  )
}
