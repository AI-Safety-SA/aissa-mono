'use client'

import { Banner, Button, useDocumentDrawer, useDocumentInfo } from '@payloadcms/ui'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { UIFieldClientComponent } from 'payload'

import type { Engagement, EngagementImpact } from '@/payload-types'
import { engagementTypeLabels, impactTypeLabels } from '@/lib/types'

import {
  ACTION_CATEGORY_OPTIONS,
  IMPACT_TYPE_OPTIONS,
  type ActionCategoryValue,
  type ImpactTypeValue,
  PayloadAPIError,
  createPersonEngagementImpact,
  deleteCollectionDocument,
  fetchPersonEngagementImpacts,
  fetchPersonEngagements,
  toNumericId,
} from './person-admin-api'

function getErrorMessage(error: unknown): string {
  if (error instanceof PayloadAPIError) return error.message
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred.'
}

function toFormattedDate(value?: string | null): string {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return value
  return date.toLocaleString()
}

function getImpactTypeLabel(impact: EngagementImpact): string {
  if (impact.type === 'other' && impact.typeOther) return impact.typeOther
  return impactTypeLabels[impact.type] || impact.type
}

function getEngagementLabel(engagement: Engagement): string {
  if (engagement.title) return engagement.title
  if (engagement.type === 'other' && engagement.typeOther) return engagement.typeOther
  return engagementTypeLabels[engagement.type] || engagement.type
}

function modalStyles(): Record<string, string | number> {
  return {
    background: 'rgba(15, 23, 42, 0.35)',
    inset: 0,
    overflowY: 'auto',
    padding: 24,
    position: 'fixed',
    zIndex: 1000,
  }
}

function modalCardStyles(): Record<string, string | number> {
  return {
    background: 'var(--theme-bg)',
    borderRadius: 8,
    margin: '0 auto',
    maxWidth: 760,
    padding: 20,
  }
}

function sectionStyles(): Record<string, string | number> {
  return {
    border: '1px solid var(--theme-elevation-200)',
    borderRadius: 8,
    marginTop: 24,
    padding: 16,
  }
}

export const PersonEngagementImpactsSection: UIFieldClientComponent = () => {
  const { id } = useDocumentInfo()
  const personId = toNumericId(id)
  const canManage = personId !== null

  const [impacts, setImpacts] = useState<EngagementImpact[]>([])
  const [isLoadingImpacts, setIsLoadingImpacts] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [editingImpactId, setEditingImpactId] = useState<number | null>(null)
  const [openDrawerRequested, setOpenDrawerRequested] = useState(false)
  const [ImpactDrawer, , { openDrawer }] = useDocumentDrawer({
    collectionSlug: 'engagement-impacts',
    id: editingImpactId,
  })

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [availableEngagements, setAvailableEngagements] = useState<Engagement[]>([])
  const [isLoadingEngagementOptions, setIsLoadingEngagementOptions] = useState(false)
  const [selectedEngagementId, setSelectedEngagementId] = useState('')
  const [impactType, setImpactType] = useState<ImpactTypeValue | ''>('')
  const [impactTypeOther, setImpactTypeOther] = useState('')
  const [impactSummary, setImpactSummary] = useState('')
  const [impactEvidenceUrl, setImpactEvidenceUrl] = useState('')
  const [impactVerified, setImpactVerified] = useState(false)
  const [impactInfluenceScore, setImpactInfluenceScore] = useState('')
  const [impactActionCategory, setImpactActionCategory] = useState<ActionCategoryValue | ''>('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null)

  const refreshImpacts = useCallback(async () => {
    if (!canManage || personId === null) {
      setImpacts([])
      setListError(null)
      return
    }

    setIsLoadingImpacts(true)
    setListError(null)

    try {
      const docs = await fetchPersonEngagementImpacts(personId)
      setImpacts(docs)
    } catch (error) {
      setListError(getErrorMessage(error))
    } finally {
      setIsLoadingImpacts(false)
    }
  }, [canManage, personId])

  useEffect(() => {
    void refreshImpacts()
  }, [refreshImpacts])

  useEffect(() => {
    if (!openDrawerRequested || editingImpactId === null) return
    openDrawer()
    setOpenDrawerRequested(false)
  }, [editingImpactId, openDrawer, openDrawerRequested])

  useEffect(() => {
    if (!isAddModalOpen || !canManage || personId === null) return

    let isCancelled = false
    void (async () => {
      setIsLoadingEngagementOptions(true)
      try {
        const docs = await fetchPersonEngagements({ personId })
        if (!isCancelled) setAvailableEngagements(docs)
      } catch (error) {
        if (!isCancelled) setFormError(getErrorMessage(error))
      } finally {
        if (!isCancelled) setIsLoadingEngagementOptions(false)
      }
    })()

    return () => {
      isCancelled = true
    }
  }, [canManage, isAddModalOpen, personId])

  const rows = useMemo(() => {
    return impacts.map((impact) => ({
      createdAt: impact.createdAt,
      engagementLabel:
        typeof impact.engagement === 'object' && impact.engagement !== null
          ? getEngagementLabel(impact.engagement)
          : '—',
      id: impact.id,
      summary:
        impact.summary.length > 110 ? `${impact.summary.slice(0, 109)}…` : impact.summary,
      type: getImpactTypeLabel(impact),
      verified: impact.isVerified ? 'Yes' : 'No',
    }))
  }, [impacts])

  const engagementOptions = useMemo(() => {
    return availableEngagements.map((engagement) => ({
      id: engagement.id,
      label: getEngagementLabel(engagement),
    }))
  }, [availableEngagements])

  const resetForm = useCallback(() => {
    setSelectedEngagementId('')
    setImpactType('')
    setImpactTypeOther('')
    setImpactSummary('')
    setImpactEvidenceUrl('')
    setImpactVerified(false)
    setImpactInfluenceScore('')
    setImpactActionCategory('')
    setFormError(null)
  }, [])

  const openAddModal = useCallback(() => {
    resetForm()
    setNotice(null)
    setIsAddModalOpen(true)
  }, [resetForm])

  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false)
    resetForm()
  }, [resetForm])

  const handleEditImpact = useCallback((impactId: number) => {
    setEditingImpactId(impactId)
    setOpenDrawerRequested(true)
  }, [])

  const handleDrawerSave = useCallback(() => {
    void refreshImpacts()
  }, [refreshImpacts])

  const handleCreateImpact = useCallback(async () => {
    if (!canManage || personId === null) return

    setFormError(null)

    if (!impactType) {
      setFormError('Impact type is required.')
      return
    }

    if (impactType === 'other' && !impactTypeOther.trim()) {
      setFormError('Specify the impact type when "Other" is selected.')
      return
    }

    if (!impactSummary.trim()) {
      setFormError('Impact summary is required.')
      return
    }

    const parsedImpactInfluenceScore = impactInfluenceScore.trim()
      ? Number(impactInfluenceScore)
      : undefined
    if (
      parsedImpactInfluenceScore !== undefined &&
      (Number.isNaN(parsedImpactInfluenceScore) ||
        parsedImpactInfluenceScore < 1 ||
        parsedImpactInfluenceScore > 5)
    ) {
      setFormError('AISSA influence score must be a number between 1 and 5.')
      return
    }

    setIsSubmitting(true)

    try {
      await createPersonEngagementImpact({
        action_category: impactActionCategory || undefined,
        aissa_influence_score: parsedImpactInfluenceScore,
        engagement: selectedEngagementId ? Number(selectedEngagementId) : undefined,
        evidenceUrl: impactEvidenceUrl.trim() || undefined,
        isVerified: impactVerified,
        person: personId,
        summary: impactSummary.trim(),
        type: impactType,
        typeOther: impactType === 'other' ? impactTypeOther.trim() : undefined,
      })

      setIsAddModalOpen(false)
      setNotice('Impact created.')
      resetForm()
      await refreshImpacts()
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }, [
    canManage,
    impactActionCategory,
    impactEvidenceUrl,
    impactInfluenceScore,
    impactSummary,
    impactType,
    impactTypeOther,
    impactVerified,
    personId,
    refreshImpacts,
    resetForm,
    selectedEngagementId,
  ])

  const handleDeleteImpact = useCallback(
    async (impactId: number) => {
      if (!window.confirm('Delete this impact? This cannot be undone.')) return

      setIsDeletingId(impactId)
      setNotice(null)
      setListError(null)

      try {
        await deleteCollectionDocument({
          collection: 'engagement-impacts',
          id: impactId,
        })
        setNotice('Impact deleted.')
        await refreshImpacts()
      } catch (error) {
        setListError(getErrorMessage(error))
      } finally {
        setIsDeletingId(null)
      }
    },
    [refreshImpacts],
  )

  return (
    <section style={sectionStyles()}>
      <div style={{ alignItems: 'center', display: 'flex', gap: 12, justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0 }}>Engagement Impacts</h3>
          <p style={{ color: 'var(--theme-elevation-500)', margin: '4px 0 0' }}>
            Manage impact records for this person and optionally link them to an existing engagement.
          </p>
        </div>
        <Button disabled={!canManage} onClick={openAddModal} type="button">
          Add Impact
        </Button>
      </div>

      {!canManage && (
        <div style={{ marginTop: 12 }}>
          <Banner type="info">Save person first to add impacts.</Banner>
        </div>
      )}

      {notice && (
        <div style={{ marginTop: 12 }}>
          <Banner type="success">{notice}</Banner>
        </div>
      )}

      {listError && (
        <div style={{ marginTop: 12 }}>
          <Banner type="error">{listError}</Banner>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        {isLoadingImpacts && <p>Loading impacts...</p>}

        {!isLoadingImpacts && canManage && rows.length === 0 && (
          <p style={{ color: 'var(--theme-elevation-500)', margin: 0 }}>
            No impacts have been added yet.
          </p>
        )}

        {!isLoadingImpacts && rows.length > 0 && (
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid var(--theme-elevation-200)', padding: '8px', textAlign: 'left' }}>
                  Type
                </th>
                <th style={{ borderBottom: '1px solid var(--theme-elevation-200)', padding: '8px', textAlign: 'left' }}>
                  Summary
                </th>
                <th style={{ borderBottom: '1px solid var(--theme-elevation-200)', padding: '8px', textAlign: 'left' }}>
                  Linked Engagement
                </th>
                <th style={{ borderBottom: '1px solid var(--theme-elevation-200)', padding: '8px', textAlign: 'left' }}>
                  Verified
                </th>
                <th style={{ borderBottom: '1px solid var(--theme-elevation-200)', padding: '8px', textAlign: 'left' }}>
                  Created
                </th>
                <th style={{ borderBottom: '1px solid var(--theme-elevation-200)', padding: '8px', textAlign: 'left' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px' }}>
                    {row.type}
                  </td>
                  <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px' }}>
                    {row.summary}
                  </td>
                  <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px' }}>
                    {row.engagementLabel}
                  </td>
                  <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px' }}>
                    {row.verified}
                  </td>
                  <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px' }}>
                    {toFormattedDate(row.createdAt)}
                  </td>
                  <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button buttonStyle="secondary" onClick={() => handleEditImpact(row.id)} type="button">
                        Edit
                      </Button>
                      <Button
                        buttonStyle="secondary"
                        disabled={isDeletingId === row.id}
                        onClick={() => void handleDeleteImpact(row.id)}
                        type="button"
                      >
                        {isDeletingId === row.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ImpactDrawer onDelete={handleDrawerSave} onSave={handleDrawerSave} />

      {isAddModalOpen && (
        <div aria-label="Add Impact" aria-modal="true" role="dialog" style={modalStyles()}>
          <div style={modalCardStyles()}>
            <div style={{ alignItems: 'center', display: 'flex', gap: 12, justifyContent: 'space-between' }}>
              <h4 style={{ margin: 0 }}>Add Impact</h4>
              <Button buttonStyle="secondary" onClick={closeAddModal} type="button">
                Close
              </Button>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ marginBottom: 12 }}>
                <label htmlFor="person-impact-engagement">Link to engagement (optional)</label>
                <select
                  id="person-impact-engagement"
                  onChange={(event) => setSelectedEngagementId(event.target.value)}
                  value={selectedEngagementId}
                  style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                >
                  <option value="">None</option>
                  {engagementOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {isLoadingEngagementOptions && (
                  <p style={{ color: 'var(--theme-elevation-500)', marginBottom: 0, marginTop: 8 }}>
                    Loading engagement options...
                  </p>
                )}
              </div>

              <div style={{ marginBottom: 12 }}>
                <label htmlFor="person-impact-type">Impact type</label>
                <select
                  id="person-impact-type"
                  onChange={(event) => setImpactType(event.target.value as ImpactTypeValue | '')}
                  value={impactType}
                  style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                >
                  <option value="">Select type</option>
                  {IMPACT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {impactType === 'other' && (
                <div style={{ marginBottom: 12 }}>
                  <label htmlFor="person-impact-type-other">Specify impact type</label>
                  <input
                    id="person-impact-type-other"
                    onChange={(event) => setImpactTypeOther(event.target.value)}
                    type="text"
                    value={impactTypeOther}
                    style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                  />
                </div>
              )}

              <div style={{ marginBottom: 12 }}>
                <label htmlFor="person-impact-summary">Impact summary</label>
                <textarea
                  id="person-impact-summary"
                  onChange={(event) => setImpactSummary(event.target.value)}
                  rows={3}
                  value={impactSummary}
                  style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label htmlFor="person-impact-evidence-url">Evidence URL (optional)</label>
                <input
                  id="person-impact-evidence-url"
                  onChange={(event) => setImpactEvidenceUrl(event.target.value)}
                  type="text"
                  value={impactEvidenceUrl}
                  style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr', marginBottom: 12 }}>
                <div>
                  <label htmlFor="person-impact-influence-score">AISSA influence score (1-5)</label>
                  <input
                    id="person-impact-influence-score"
                    max={5}
                    min={1}
                    onChange={(event) => setImpactInfluenceScore(event.target.value)}
                    step={1}
                    type="number"
                    value={impactInfluenceScore}
                    style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                  />
                </div>
                <div>
                  <label htmlFor="person-impact-action-category">Action category (optional)</label>
                  <select
                    id="person-impact-action-category"
                    onChange={(event) =>
                      setImpactActionCategory(event.target.value as ActionCategoryValue | '')
                    }
                    value={impactActionCategory}
                    style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                  >
                    <option value="">None</option>
                    {ACTION_CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label style={{ display: 'inline-flex', gap: 8 }}>
                <input
                  checked={impactVerified}
                  onChange={(event) => setImpactVerified(event.target.checked)}
                  type="checkbox"
                />
                Verified
              </label>

              {formError && (
                <p style={{ color: 'var(--theme-error-500)', marginBottom: 0, marginTop: 12 }}>
                  {formError}
                </p>
              )}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
                <Button buttonStyle="secondary" onClick={closeAddModal} type="button">
                  Cancel
                </Button>
                <Button disabled={isSubmitting} onClick={() => void handleCreateImpact()} type="button">
                  {isSubmitting ? 'Saving...' : 'Create Impact'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
