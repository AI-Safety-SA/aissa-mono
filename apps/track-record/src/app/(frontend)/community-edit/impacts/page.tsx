'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CommunityEditShell } from '../_components/community-edit-shell'
import { FormInput, FormSelect, FormTextarea } from '../_components/form-controls'
import {
  type PersonEngagement,
  type StagedSummary,
  getCommunityEditSession,
  getPersonData,
  getStagedSummary,
  stageImpacts,
} from '../_lib/api'
import { type DraftImpact, getCommunityEditDraft, patchCommunityEditDraft } from '../_lib/draft'

type EngagementOption = {
  id: number | string
  label: string
  source: 'existing' | 'staged'
}

const EMPTY_IMPACT: DraftImpact = {
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

  const [engagementOptions, setEngagementOptions] = useState<EngagementOption[]>([])

  useEffect(() => {
    async function bootstrap() {
      try {
        await getCommunityEditSession()
      } catch {
        router.replace('/community-edit/verify')
        return
      }

      let personData: Awaited<ReturnType<typeof getPersonData>>
      let staged: Awaited<ReturnType<typeof getStagedSummary>> | null = null

      try {
        personData = await getPersonData()
      } catch {
        setError('Unable to load your data. Please try again later.')
        setIsLoadingSession(false)
        return
      }

      try {
        staged = await getStagedSummary()
      } catch {
        // getStagedSummary may fail if the schema is out of date; still show the page
      }

      const options: EngagementOption[] = []

      // Existing engagements from server
      for (const eng of personData.engagements) {
        options.push({
          id: eng.id,
          label: `${eng.type} @ ${eng.contextName || `#${eng.id}`}${eng.contextDate ? ` (${new Date(eng.contextDate).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short' })})` : ''}`,
          source: 'existing',
        })
      }

      // Staged new engagements (already staged in previous step)
      if (staged) {
        for (const eng of staged.engagements) {
          if (eng.operation === 'create') {
            options.push({
              id: eng.id,
              label: `[New] ${eng.type}`,
              source: 'staged',
            })
          }
        }
      }

      setEngagementOptions(options)

      const draft = getCommunityEditDraft()
      setImpactDrafts(draft.impacts || [])
      setIsLoadingSession(false)
    }
    void bootstrap()
  }, [router])

  function getSelectedEngagementLabel(): string {
    if (impactForm.engagementId !== undefined) {
      const match = engagementOptions.find(
        (opt) => opt.source === 'existing' && String(opt.id) === String(impactForm.engagementId),
      )
      return match?.label || `Engagement #${impactForm.engagementId}`
    }
    if (impactForm.draftEngagementIndex !== undefined) {
      const match = engagementOptions.find(
        (opt) => opt.source === 'staged' && String(opt.id) === String(impactForm.draftEngagementIndex),
      )
      return match?.label || `Staged engagement #${impactForm.draftEngagementIndex}`
    }
    return 'None selected'
  }

  function addImpactDraft() {
    setError(null)
    if (impactForm.engagementId === undefined && impactForm.draftEngagementIndex === undefined) {
      setError('Please select an engagement this impact relates to.')
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

  function removeImpactDraft(index: number) {
    setImpactDrafts((current) => current.filter((_, i) => i !== index))
  }

  async function submitAndContinue() {
    setError(null)
    setIsSubmitting(true)

    try {
      // Convert drafts to API format
      const apiImpacts = impactDrafts.map((draft) => ({
        actionCategory: draft.actionCategory,
        aissaInfluenceScore: draft.aissaInfluenceScore,
        engagement: draft.engagementId,
        evidenceUrl: draft.evidenceUrl,
        stagedEngagement: draft.draftEngagementIndex,
        summary: draft.summary,
        type: draft.type,
        typeOther: draft.typeOther,
      }))

      await stageImpacts({ impacts: apiImpacts })

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
      description="Describe how your AISSA engagements impacted your career or contributions."
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New Impact Draft</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Engagement</label>
                <FormSelect
                  value={
                    impactForm.engagementId !== undefined
                      ? `existing:${impactForm.engagementId}`
                      : impactForm.draftEngagementIndex !== undefined
                        ? `staged:${impactForm.draftEngagementIndex}`
                        : ''
                  }
                  onChange={(event) => {
                    const val = event.target.value
                    if (!val) {
                      setImpactForm((current) => ({
                        ...current,
                        engagementId: undefined,
                        draftEngagementIndex: undefined,
                      }))
                      return
                    }
                    const [source, id] = val.split(':')
                    if (source === 'existing') {
                      setImpactForm((current) => ({
                        ...current,
                        engagementId: Number(id),
                        draftEngagementIndex: undefined,
                      }))
                    } else {
                      setImpactForm((current) => ({
                        ...current,
                        engagementId: undefined,
                        draftEngagementIndex: Number(id),
                      }))
                    }
                  }}
                >
                  <option value="">Select an engagement...</option>
                  {engagementOptions.filter((opt) => opt.source === 'existing').length > 0 ? (
                    <optgroup label="Existing Engagements">
                      {engagementOptions
                        .filter((opt) => opt.source === 'existing')
                        .map((opt) => (
                          <option key={`existing:${opt.id}`} value={`existing:${opt.id}`}>
                            {opt.label}
                          </option>
                        ))}
                    </optgroup>
                  ) : null}
                  {engagementOptions.filter((opt) => opt.source === 'staged').length > 0 ? (
                    <optgroup label="Staged New Engagements">
                      {engagementOptions
                        .filter((opt) => opt.source === 'staged')
                        .map((opt) => (
                          <option key={`staged:${opt.id}`} value={`staged:${opt.id}`}>
                            {opt.label}
                          </option>
                        ))}
                    </optgroup>
                  ) : null}
                </FormSelect>
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

              {impactForm.type === 'other' ? (
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Other Type (specify)</label>
                  <FormInput
                    value={impactForm.typeOther || ''}
                    onChange={(event) =>
                      setImpactForm((current) => ({ ...current, typeOther: event.target.value }))
                    }
                  />
                </div>
              ) : null}

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Summary</label>
                <FormTextarea
                  value={impactForm.summary}
                  onChange={(event) =>
                    setImpactForm((current) => ({ ...current, summary: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Action Category (optional)</label>
                <FormSelect
                  value={impactForm.actionCategory || ''}
                  onChange={(event) =>
                    setImpactForm((current) => ({
                      ...current,
                      actionCategory: (event.target.value || undefined) as DraftImpact['actionCategory'],
                    }))
                  }
                >
                  <option value="">Not specified</option>
                  <option value="career_role">Career Role</option>
                  <option value="grant">Grant</option>
                  <option value="internship">Internship</option>
                  <option value="academic_pivot">Academic Pivot</option>
                  <option value="upskilling">Upskilling</option>
                  <option value="community_building">Community Building</option>
                  <option value="research">Research</option>
                </FormSelect>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">AISSA Influence Score (1-5)</label>
                <FormInput
                  type="number"
                  min={1}
                  max={5}
                  value={impactForm.aissaInfluenceScore !== undefined ? String(impactForm.aissaInfluenceScore) : ''}
                  onChange={(event) =>
                    setImpactForm((current) => ({
                      ...current,
                      aissaInfluenceScore: event.target.value ? Number(event.target.value) : undefined,
                    }))
                  }
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Evidence URL (optional)</label>
                <FormInput
                  value={impactForm.evidenceUrl || ''}
                  onChange={(event) =>
                    setImpactForm((current) => ({ ...current, evidenceUrl: event.target.value || undefined }))
                  }
                  placeholder="https://..."
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
          <CardContent className="space-y-2 text-sm">
            {impactDrafts.length === 0 ? (
              <p className="m-0 text-muted-foreground">No impacts drafted yet.</p>
            ) : null}
            {impactDrafts.map((draft, index) => (
              <div key={index} className="flex items-center justify-between rounded border px-3 py-2">
                <span className="truncate">
                  <span className="font-medium">{draft.type}</span>
                  {' - '}
                  {draft.summary.length > 60 ? `${draft.summary.slice(0, 60)}...` : draft.summary}
                </span>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeImpactDraft(index)}>
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
