'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CommunityEditShell } from '../_components/community-edit-shell'
import { FormInput, FormSelect, FormTextarea } from '../_components/form-controls'
import { getCommunityEditSession, stageEngagement, stageRemoval } from '../_lib/api'
import { type DraftEngagement, getCommunityEditDraft, patchCommunityEditDraft } from '../_lib/draft'

type DraftRemoval = {
  engagement: number
  reason: string
}

const EMPTY_ENGAGEMENT: DraftEngagement = {
  operation: 'create',
  type: 'participant',
}

export default function CommunityEditEngagementsPage() {
  const router = useRouter()
  const [engagementDrafts, setEngagementDrafts] = useState<DraftEngagement[]>([])
  const [removalDrafts, setRemovalDrafts] = useState<DraftRemoval[]>([])
  const [engagementForm, setEngagementForm] = useState<DraftEngagement>(EMPTY_ENGAGEMENT)
  const [removalEngagementId, setRemovalEngagementId] = useState('')
  const [removalReason, setRemovalReason] = useState('')
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
      setEngagementDrafts(draft.engagements || [])
      setIsLoadingSession(false)
    }

    void bootstrap()
  }, [router])

  function addEngagementDraft() {
    setError(null)
    const relationTo = (engagementForm.context?.relationTo || 'events') as 'events' | 'programs'
    const contextValue = engagementForm.context?.value

    if (!contextValue) {
      setError('Context relation and ID are required for each engagement.')
      return
    }

    if (engagementForm.operation === 'update' && !engagementForm.existingEngagement) {
      setError('existing engagement ID is required when operation is update.')
      return
    }

    const next = [
      ...engagementDrafts,
      {
        ...engagementForm,
        context: {
          relationTo,
          value: contextValue,
        },
      },
    ]
    setEngagementDrafts(next)
    setEngagementForm(EMPTY_ENGAGEMENT)
  }

  function addRemovalDraft() {
    setError(null)
    const parsedId = Number(removalEngagementId)
    if (!Number.isFinite(parsedId) || parsedId <= 0) {
      setError('Provide a valid engagement ID to remove.')
      return
    }
    if (!removalReason.trim()) {
      setError('Provide a reason for removal.')
      return
    }

    setRemovalDrafts((current) => [
      ...current,
      {
        engagement: parsedId,
        reason: removalReason.trim(),
      },
    ])
    setRemovalEngagementId('')
    setRemovalReason('')
  }

  async function submitAndContinue() {
    setError(null)
    setIsSubmitting(true)

    try {
      for (const engagement of engagementDrafts) {
        await stageEngagement(engagement as unknown as Record<string, unknown>)
      }
      for (const removal of removalDrafts) {
        await stageRemoval(removal as unknown as Record<string, unknown>)
      }

      patchCommunityEditDraft({
        engagements: engagementDrafts,
      })
      router.push('/community-edit/testimonials')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to stage engagements.')
    } finally {
      setIsSubmitting(false)
    }
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
      description="Add engagement corrections and optional removals. Use event/program IDs from existing records."
    >
      <div className="space-y-6">
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Context Relation</label>
                <FormSelect
                  value={engagementForm.context?.relationTo || 'events'}
                  onChange={(event) =>
                    setEngagementForm((current) => ({
                      ...current,
                      context: {
                        relationTo: event.target.value as 'events' | 'programs',
                        value: current.context?.value || '',
                      },
                    }))
                  }
                >
                  <option value="events">Event</option>
                  <option value="programs">Program</option>
                </FormSelect>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Context ID</label>
                <FormInput
                  value={String(engagementForm.context?.value || '')}
                  onChange={(event) =>
                    setEngagementForm((current) => ({
                      ...current,
                      context: {
                        relationTo: current.context?.relationTo || 'events',
                        value: event.target.value,
                      },
                    }))
                  }
                />
              </div>

              {engagementForm.operation === 'update' ? (
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Existing Engagement ID</label>
                  <FormInput
                    value={String(engagementForm.existingEngagement || '')}
                    onChange={(event) =>
                      setEngagementForm((current) => ({
                        ...current,
                        existingEngagement: event.target.value,
                      }))
                    }
                  />
                </div>
              ) : null}
            </div>

            <Button type="button" variant="outline" onClick={addEngagementDraft}>
              Add Engagement Draft
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Request Engagement Removal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Engagement ID</label>
                <FormInput
                  value={removalEngagementId}
                  onChange={(event) => setRemovalEngagementId(event.target.value)}
                />
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Draft</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="m-0">Engagement drafts: {engagementDrafts.length}</p>
            <p className="m-0">Removal drafts: {removalDrafts.length}</p>
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
              patchCommunityEditDraft({ engagements: engagementDrafts })
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

