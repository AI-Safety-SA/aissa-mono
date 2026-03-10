'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CommunityEditShell } from '../_components/community-edit-shell'
import { FormInput, FormSelect, FormTextarea } from '../_components/form-controls'
import {
  type ContextOptions,
  getCommunityEditSession,
  getContextOptions,
  stageTestimonials,
} from '../_lib/api'
import { type DraftTestimonial, getCommunityEditDraft, patchCommunityEditDraft } from '../_lib/draft'

const EMPTY_TESTIMONIAL: DraftTestimonial = {
  quote: '',
}

function formatContextLabel(name: string, date: string | null | undefined): string {
  if (!date) return name
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return name
  return `${name} (${d.toLocaleDateString('en-ZA', { year: 'numeric', month: 'short' })})`
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

  const [contextOptions, setContextOptions] = useState<ContextOptions>({ events: [], programs: [] })

  useEffect(() => {
    async function bootstrap() {
      try {
        await getCommunityEditSession()
      } catch {
        router.replace('/community-edit/verify')
        return
      }

      const contexts = await getContextOptions()
      setContextOptions(contexts)

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

  function removeTestimonialDraft(index: number) {
    setTestimonialDrafts((current) => current.filter((_, i) => i !== index))
  }

  async function submitAndContinue() {
    setError(null)
    setIsSubmitting(true)

    try {
      await stageTestimonials({
        generalTestimonial,
        generalTestimonialConsent,
        testimonials: testimonialDrafts as unknown as Array<Record<string, unknown>>,
      })

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

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Event or Program (optional)</label>
                <FormSelect
                  value={
                    testimonialForm.context
                      ? `${testimonialForm.context.relationTo}:${testimonialForm.context.value}`
                      : ''
                  }
                  onChange={(event) => {
                    const val = event.target.value
                    if (!val) {
                      setTestimonialForm((current) => ({ ...current, context: undefined }))
                      return
                    }
                    const [relationTo, ...rest] = val.split(':')
                    const value = rest.join(':')
                    setTestimonialForm((current) => ({
                      ...current,
                      context: {
                        relationTo: relationTo as 'events' | 'programs',
                        value: Number(value),
                      },
                    }))
                  }}
                >
                  <option value="">None (general feedback)</option>
                  {contextOptions.events.length > 0 ? (
                    <optgroup label="Events">
                      {contextOptions.events.map((event) => (
                        <option key={`events:${event.id}`} value={`events:${event.id}`}>
                          {formatContextLabel(event.name, event.eventDate)}
                        </option>
                      ))}
                    </optgroup>
                  ) : null}
                  {contextOptions.programs.length > 0 ? (
                    <optgroup label="Programs">
                      {contextOptions.programs.map((program) => (
                        <option key={`programs:${program.id}`} value={`programs:${program.id}`}>
                          {formatContextLabel(program.name, program.startDate)}
                        </option>
                      ))}
                    </optgroup>
                  ) : null}
                </FormSelect>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rating (1-10, optional)</label>
                <FormInput
                  type="number"
                  min={1}
                  max={10}
                  value={testimonialForm.rating !== undefined ? String(testimonialForm.rating) : ''}
                  onChange={(event) =>
                    setTestimonialForm((current) => ({
                      ...current,
                      rating: event.target.value ? Number(event.target.value) : undefined,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium pt-6">
                  <input
                    type="checkbox"
                    checked={testimonialForm.consentToPublish || false}
                    onChange={(event) =>
                      setTestimonialForm((current) => ({
                        ...current,
                        consentToPublish: event.target.checked,
                      }))
                    }
                  />
                  Consent to publish
                </label>
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
            {testimonialDrafts.length === 0 ? (
              <p className="m-0 text-muted-foreground">No testimonials drafted yet.</p>
            ) : null}
            {testimonialDrafts.map((draft, index) => (
              <div key={index} className="flex items-center justify-between rounded border px-3 py-2">
                <span className="truncate">
                  &ldquo;{draft.quote.length > 60 ? `${draft.quote.slice(0, 60)}...` : draft.quote}&rdquo;
                </span>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeTestimonialDraft(index)}>
                  Remove
                </Button>
              </div>
            ))}
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
