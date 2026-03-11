'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CommunityEditShell } from '../_components/community-edit-shell'
import { ContextCombobox } from '../_components/context-combobox'
import { FormInput, FormSelect, FormTextarea } from '../_components/form-controls'
import {
  type ContextOptions,
  type PersonEngagement,
  getCommunityEditSession,
  getContextOptions,
  getPersonData,
  stageEngagements,
} from '../_lib/api'
import {
  type DraftEngagement,
  type DraftRemoval,
  getCommunityEditDraft,
  patchCommunityEditDraft,
} from '../_lib/draft'

const EMPTY_ENGAGEMENT: DraftEngagement = {
  operation: 'create',
  type: 'participant',
}


export default function CommunityEditEngagementsPage() {
  const router = useRouter()
  const [engagementDrafts, setEngagementDrafts] = useState<DraftEngagement[]>([])
  const [removalDrafts, setRemovalDrafts] = useState<DraftRemoval[]>([])
  const [engagementForm, setEngagementForm] = useState<DraftEngagement>(EMPTY_ENGAGEMENT)
  const [removalEngagement, setRemovalEngagement] = useState('')
  const [removalReason, setRemovalReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingSession, setIsLoadingSession] = useState(true)

  const [contextOptions, setContextOptions] = useState<ContextOptions>({ events: [], programs: [] })
  const [existingEngagements, setExistingEngagements] = useState<PersonEngagement[]>([])

  useEffect(() => {
    async function bootstrap() {
      try {
        await getCommunityEditSession()
      } catch {
        router.replace('/community-edit/verify')
        return
      }

      const [contexts, personData] = await Promise.all([getContextOptions(), getPersonData()])
      setContextOptions(contexts)
      setExistingEngagements(personData.engagements)

      const draft = getCommunityEditDraft()
      setEngagementDrafts(draft.engagements || [])
      setRemovalDrafts(draft.removals || [])
      setIsLoadingSession(false)
    }

    void bootstrap()
  }, [router])

  function addEngagementDraft() {
    setError(null)
    if (!engagementForm.context?.value) {
      setError('Please select an event or program.')
      return
    }

    if (engagementForm.operation === 'update' && !engagementForm.existingEngagement) {
      setError('Please select the existing engagement to update.')
      return
    }

    setEngagementDrafts((current) => [
      ...current,
      { ...engagementForm },
    ])
    setEngagementForm(EMPTY_ENGAGEMENT)
  }

  function removeEngagementDraft(index: number) {
    setEngagementDrafts((current) => current.filter((_, i) => i !== index))
  }

  function addRemovalDraft() {
    setError(null)
    if (!removalEngagement) {
      setError('Please select an engagement to remove.')
      return
    }
    if (!removalReason.trim()) {
      setError('Provide a reason for removal.')
      return
    }

    setRemovalDrafts((current) => [
      ...current,
      {
        engagement: Number(removalEngagement),
        reason: removalReason.trim(),
      },
    ])
    setRemovalEngagement('')
    setRemovalReason('')
  }

  function removeRemovalDraft(index: number) {
    setRemovalDrafts((current) => current.filter((_, i) => i !== index))
  }

  async function submitAndContinue() {
    setError(null)
    setIsSubmitting(true)

    try {
      await stageEngagements({
        engagements: engagementDrafts as unknown as Array<Record<string, unknown>>,
        removals: removalDrafts as unknown as Array<Record<string, unknown>>,
      })

      patchCommunityEditDraft({
        engagements: engagementDrafts,
        removals: removalDrafts,
      })
      router.push('/community-edit/testimonials')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to stage engagements.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function getContextName(context?: { relationTo: string; value: number | string }): string {
    if (!context) return 'Unknown'
    const list = context.relationTo === 'events' ? contextOptions.events : contextOptions.programs
    const match = list.find((item) => String(item.id) === String(context.value))
    if (!match) return `${context.relationTo}#${context.value}`
    const date = context.relationTo === 'events' ? match.eventDate : match.startDate
    if (!date) return match.name
    const d = new Date(date)
    if (Number.isNaN(d.getTime())) return match.name
    return `${match.name} (${d.toLocaleDateString('en-ZA', { year: 'numeric', month: 'short' })})`
  }

  if (isLoadingSession) {
    return (
      <CommunityEditShell
        step={4}
        title="Update Engagements"
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
      step={4}
      title="Update Engagements"
      description="Add, update, or request removal of your engagements with AISSA events and programs."
    >
      <div className="space-y-6">
        {/* Existing engagements */}
        {existingEngagements.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Current Engagements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {existingEngagements.map((eng) => (
                  <div key={eng.id} className="flex items-center gap-2 rounded border px-3 py-2">
                    <span className="font-medium">{eng.type}</span>
                    <span className="text-muted-foreground">@</span>
                    <span>{eng.contextName || `#${eng.id}`}</span>
                    {eng.contextDate ? (
                      <span className="text-muted-foreground text-xs">
                        ({new Date(eng.contextDate).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short' })})
                      </span>
                    ) : null}
                    {eng.engagement_status ? (
                      <span className="ml-auto rounded bg-muted px-2 py-0.5 text-xs">{eng.engagement_status}</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Add or update engagement form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add or Update Engagement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Operation</label>
                <FormSelect
                  value={engagementForm.operation}
                  onChange={(event) =>
                    setEngagementForm((current) => ({
                      ...current,
                      operation: event.target.value as DraftEngagement['operation'],
                    }))
                  }
                >
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                </FormSelect>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <FormSelect
                  value={engagementForm.type}
                  onChange={(event) =>
                    setEngagementForm((current) => ({
                      ...current,
                      type: event.target.value as DraftEngagement['type'],
                    }))
                  }
                >
                  <option value="participant">Participant</option>
                  <option value="facilitator">Facilitator</option>
                  <option value="speaker">Speaker</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="organizer">Organizer</option>
                  <option value="mentor">Mentor</option>
                  <option value="other">Other</option>
                </FormSelect>
              </div>

              {engagementForm.type === 'other' ? (
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Other Type (specify)</label>
                  <FormInput
                    value={engagementForm.typeOther || ''}
                    onChange={(event) =>
                      setEngagementForm((current) => ({ ...current, typeOther: event.target.value }))
                    }
                  />
                </div>
              ) : null}

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Event or Program</label>
                <ContextCombobox
                  value={
                    engagementForm.context
                      ? `${engagementForm.context.relationTo}:${engagementForm.context.value}`
                      : ''
                  }
                  onChange={(val) => {
                    if (!val) {
                      setEngagementForm((current) => ({ ...current, context: undefined }))
                      return
                    }
                    const [relationTo, ...rest] = val.split(':')
                    const value = rest.join(':')
                    setEngagementForm((current) => ({
                      ...current,
                      context: {
                        relationTo: relationTo as 'events' | 'programs',
                        value: Number(value),
                      },
                    }))
                  }}
                  options={contextOptions}
                />
              </div>

              {engagementForm.operation === 'update' ? (
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Existing Engagement to Update</label>
                  <FormSelect
                    value={String(engagementForm.existingEngagement || '')}
                    onChange={(event) =>
                      setEngagementForm((current) => ({
                        ...current,
                        existingEngagement: event.target.value ? Number(event.target.value) : undefined,
                      }))
                    }
                  >
                    <option value="">Select an engagement...</option>
                    {existingEngagements.map((eng) => (
                      <option key={eng.id} value={eng.id}>
                        {eng.type} @ {eng.contextName || `#${eng.id}`}
                      </option>
                    ))}
                  </FormSelect>
                </div>
              ) : null}

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <FormSelect
                  value={engagementForm.engagement_status || ''}
                  onChange={(event) =>
                    setEngagementForm((current) => ({
                      ...current,
                      engagement_status: (event.target.value || undefined) as DraftEngagement['engagement_status'],
                    }))
                  }
                >
                  <option value="">Not specified</option>
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="attended">Attended</option>
                  <option value="dropped_out">Dropped Out</option>
                  <option value="withdrawn">Withdrawn</option>
                </FormSelect>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rating (1-10)</label>
                <FormInput
                  type="number"
                  min={1}
                  max={10}
                  value={engagementForm.rating !== undefined ? String(engagementForm.rating) : ''}
                  onChange={(event) =>
                    setEngagementForm((current) => ({
                      ...current,
                      rating: event.target.value ? Number(event.target.value) : undefined,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Would Recommend (1-10)</label>
                <FormInput
                  type="number"
                  min={1}
                  max={10}
                  value={engagementForm.wouldRecommend !== undefined ? String(engagementForm.wouldRecommend) : ''}
                  onChange={(event) =>
                    setEngagementForm((current) => ({
                      ...current,
                      wouldRecommend: event.target.value ? Number(event.target.value) : undefined,
                    }))
                  }
                />
              </div>
            </div>

            <Button type="button" variant="outline" onClick={addEngagementDraft}>
              Add Engagement Draft
            </Button>
          </CardContent>
        </Card>

        {/* Removal form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Request Engagement Removal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Engagement to Remove</label>
                <FormSelect
                  value={removalEngagement}
                  onChange={(event) => setRemovalEngagement(event.target.value)}
                >
                  <option value="">Select an engagement...</option>
                  {existingEngagements.map((eng) => (
                    <option key={eng.id} value={eng.id}>
                      {eng.type} @ {eng.contextName || `#${eng.id}`}
                    </option>
                  ))}
                </FormSelect>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Reason</label>
                <FormTextarea value={removalReason} onChange={(event) => setRemovalReason(event.target.value)} />
              </div>
            </div>
            <Button type="button" variant="outline" onClick={addRemovalDraft}>
              Add Removal Draft
            </Button>
          </CardContent>
        </Card>

        {/* Current drafts summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Draft</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {engagementDrafts.length === 0 && removalDrafts.length === 0 ? (
              <p className="m-0 text-muted-foreground">No engagement changes drafted yet.</p>
            ) : null}
            {engagementDrafts.map((draft, index) => (
              <div key={index} className="flex items-center justify-between rounded border px-3 py-2">
                <span>
                  <span className="font-medium">{draft.operation}</span> {draft.type} @ {getContextName(draft.context)}
                </span>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeEngagementDraft(index)}>
                  Remove
                </Button>
              </div>
            ))}
            {removalDrafts.map((draft, index) => (
              <div key={`removal-${index}`} className="flex items-center justify-between rounded border border-destructive/30 px-3 py-2">
                <span>
                  <span className="font-medium text-destructive">Remove</span>{' '}
                  engagement #{draft.engagement}: {draft.reason}
                </span>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeRemovalDraft(index)}>
                  Remove
                </Button>
              </div>
            ))}
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
              patchCommunityEditDraft({ engagements: engagementDrafts, removals: removalDrafts })
              router.push('/community-edit/testimonials')
            }}
          >
            Skip for Now
          </Button>
        </div>
      </div>
    </CommunityEditShell>
  )
}
