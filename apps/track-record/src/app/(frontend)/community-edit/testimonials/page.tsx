'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CommunityEditShell } from '../_components/community-edit-shell'
import { FormInput, FormSelect, FormTextarea } from '../_components/form-controls'
import { getCommunityEditSession, stageTestimonial } from '../_lib/api'
import { type DraftTestimonial, getCommunityEditDraft, patchCommunityEditDraft } from '../_lib/draft'

const EMPTY_TESTIMONIAL: DraftTestimonial = {
  quote: '',
}

export default function CommunityEditTestimonialsPage() {
  const router = useRouter()
  const [testimonialForm, setTestimonialForm] = useState<DraftTestimonial>(EMPTY_TESTIMONIAL)
  const [testimonialDrafts, setTestimonialDrafts] = useState<DraftTestimonial[]>([])
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
      setTestimonialDrafts(draft.testimonials || [])
      setGeneralTestimonial(draft.generalTestimonial?.quote || '')
      setGeneralTestimonialConsent(draft.generalTestimonial?.consentToPublish || false)
      setIsLoadingSession(false)
    }
    void bootstrap()
  }, [router])

  function addTestimonialDraft() {
    setError(null)
    if (!testimonialForm.quote.trim()) {
      setError('Quote is required.')
      return
    }

    setTestimonialDrafts((current) => [
      ...current,
      {
        ...testimonialForm,
        quote: testimonialForm.quote.trim(),
      },
    ])
    setTestimonialForm(EMPTY_TESTIMONIAL)
  }

  async function submitAndContinue() {
    setError(null)
    setIsSubmitting(true)

    try {
      await stageTestimonial({
        generalTestimonial,
        generalTestimonialConsent,
      })

      for (const testimonial of testimonialDrafts) {
        await stageTestimonial(testimonial as unknown as Record<string, unknown>)
      }

      patchCommunityEditDraft({
        generalTestimonial: {
          consentToPublish: generalTestimonialConsent,
          quote: generalTestimonial,
        },
        testimonials: testimonialDrafts,
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
      description="Share testimonials linked to events/programs, or leave context empty for general feedback."
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New Testimonial Draft</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Quote</label>
                <FormTextarea
                  value={testimonialForm.quote}
                  onChange={(event) =>
                    setTestimonialForm((current) => ({ ...current, quote: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Context Relation (optional)</label>
                <FormSelect
                  value={testimonialForm.context?.relationTo || ''}
                  onChange={(event) =>
                    setTestimonialForm((current) => ({
                      ...current,
                      context: event.target.value
                        ? { relationTo: event.target.value as 'events' | 'programs', value: '' }
                        : undefined,
                    }))
                  }
                >
                  <option value="">None</option>
                  <option value="events">Event</option>
                  <option value="programs">Program</option>
                </FormSelect>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Context ID (optional)</label>
                <FormInput
                  value={String(testimonialForm.context?.value || '')}
                  onChange={(event) =>
                    setTestimonialForm((current) => ({
                      ...current,
                      context: current.context
                        ? { ...current.context, value: event.target.value }
                        : undefined,
                    }))
                  }
                />
              </div>
            </div>

            <Button type="button" variant="outline" onClick={addTestimonialDraft}>
              Add Testimonial Draft
            </Button>
          </CardContent>
        </Card>

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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Draft</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="m-0">Testimonial drafts: {testimonialDrafts.length}</p>
            <p className="m-0">
              General testimonial: {generalTestimonial.trim().length > 0 ? 'Provided' : 'Not provided'}
            </p>
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
                  quote: generalTestimonial,
                },
                testimonials: testimonialDrafts,
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
