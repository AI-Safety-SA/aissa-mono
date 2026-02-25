'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CommunityEditShell } from '../_components/community-edit-shell'
import { FormInput, FormSelect, FormTextarea } from '../_components/form-controls'
import { getCommunityEditSession, stageImpact } from '../_lib/api'
import { type DraftImpact, getCommunityEditDraft, patchCommunityEditDraft } from '../_lib/draft'

const EMPTY_IMPACT: DraftImpact = {
  context: { relationTo: 'events', value: '' },
  summary: '',
  type: 'career_transition',
}

export default function CommunityEditImpactsPage() {
  const router = useRouter()
  const [impactForm, setImpactForm] = useState<DraftImpact>(EMPTY_IMPACT)
  const [impactDrafts, setImpactDrafts] = useState<DraftImpact[]>([])
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
      setImpactDrafts(draft.impacts || [])
      setIsLoadingSession(false)
    }
    void bootstrap()
  }, [router])

  function addImpactDraft() {
    setError(null)
    if (!impactForm.context.value) {
      setError('Context relation and ID are required.')
      return
    }
    if (!impactForm.summary.trim()) {
      setError('Impact summary is required.')
      return
    }

    setImpactDrafts((current) => [
      ...current,
      {
        ...impactForm,
        summary: impactForm.summary.trim(),
      },
    ])
    setImpactForm(EMPTY_IMPACT)
  }

  async function submitAndContinue() {
    setError(null)
    setIsSubmitting(true)

    try {
      for (const impact of impactDrafts) {
        await stageImpact(impact as unknown as Record<string, unknown>)
      }

      patchCommunityEditDraft({ impacts: impactDrafts })
      router.push('/community-edit/review')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to stage impacts.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingSession) {
    return (
      <CommunityEditShell
        step={6}
        title="Report Impacts"
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
      step={6}
      title="Report Impacts"
      description="Describe event/program impacts on your career or contributions."
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New Impact Draft</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Context Relation</label>
                <FormSelect
                  value={impactForm.context.relationTo}
                  onChange={(event) =>
                    setImpactForm((current) => ({
                      ...current,
                      context: {
                        ...current.context,
                        relationTo: event.target.value as 'events' | 'programs',
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
                  value={String(impactForm.context.value)}
                  onChange={(event) =>
                    setImpactForm((current) => ({
                      ...current,
                      context: {
                        ...current.context,
                        value: event.target.value,
                      },
                    }))
                  }
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Impact Type</label>
                <FormSelect
                  value={impactForm.type}
                  onChange={(event) =>
                    setImpactForm((current) => ({
                      ...current,
                      type: event.target.value as DraftImpact['type'],
                    }))
                  }
                >
                  <option value="career_transition">Career transition</option>
                  <option value="research_contribution">Research contribution</option>
                  <option value="community_building">Community building</option>
                  <option value="grant_awarded">Grant awarded</option>
                  <option value="publication">Publication</option>
                  <option value="educational">Educational</option>
                  <option value="community">Community</option>
                  <option value="other">Other</option>
                </FormSelect>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Summary</label>
                <FormTextarea
                  value={impactForm.summary}
                  onChange={(event) =>
                    setImpactForm((current) => ({ ...current, summary: event.target.value }))
                  }
                />
              </div>
            </div>

            <Button type="button" variant="outline" onClick={addImpactDraft}>
              Add Impact Draft
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Draft</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">Impact drafts: {impactDrafts.length}</CardContent>
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
              patchCommunityEditDraft({ impacts: impactDrafts })
              router.push('/community-edit/review')
            }}
          >
            Skip for Now
          </Button>
        </div>
      </div>
    </CommunityEditShell>
  )
}

