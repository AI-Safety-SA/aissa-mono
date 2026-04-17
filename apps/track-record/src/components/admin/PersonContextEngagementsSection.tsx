'use client'

import { Banner, Button, useDocumentDrawer, useDocumentInfo } from '@payloadcms/ui'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { UIFieldClientComponent } from 'payload'

import type { Engagement } from '@/payload-types'
import { engagementTypeLabels } from '@/lib/types'

import {
  ACTION_CATEGORY_OPTIONS,
  IMPACT_TYPE_OPTIONS,
  type ActionCategoryValue,
  type ContextRelation,
  type ContextSearchResult,
  type ImpactTypeValue,
  createPersonContextEngagement,
  createPersonEngagementImpact,
  deleteCollectionDocument,
  fetchPersonEngagements,
  searchContexts,
  toNumericId,
} from './person-admin-api'
import {
  getPersonAdminErrorMessage,
  personAdminModalCardStyles,
  personAdminModalStyles,
  personAdminSectionStyles,
  toDateInputValue,
  toFormattedDate,
} from './person-admin-ui'

type EngagementStatusValue = NonNullable<Engagement['engagement_status']>

const ENGAGEMENT_TYPE_OPTIONS: Array<{ label: string; value: Engagement['type'] }> = [
  { label: 'Participant', value: 'participant' },
  { label: 'Facilitator', value: 'facilitator' },
  { label: 'Speaker', value: 'speaker' },
  { label: 'Volunteer', value: 'volunteer' },
  { label: 'Organizer', value: 'organizer' },
  { label: 'Mentor', value: 'mentor' },
  { label: 'Contribution', value: 'contribution' },
  { label: 'Other', value: 'other' },
]

const ENGAGEMENT_STATUS_OPTIONS: Array<{ label: string; value: EngagementStatusValue }> = [
  { label: 'Completed', value: 'completed' },
  { label: 'Dropped Out', value: 'dropped_out' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Withdrawn', value: 'withdrawn' },
  { label: 'Attended', value: 'attended' },
]

type EngagementSectionContext = {
  label: string
  relationTo: ContextRelation
}

type PersonContextEngagementsSectionBaseProps = Record<string, unknown> & {
  context: EngagementSectionContext
}

function getContextLabel(
  context: Engagement['context'],
  fallback: string,
): string {
  if (!context) return fallback
  const contextValue = context.value

  if (typeof contextValue === 'object' && contextValue !== null) {
    if ('name' in contextValue && typeof contextValue.name === 'string') {
      if (
        context.relationTo === 'cohorts' &&
        'program' in contextValue &&
        typeof contextValue.program === 'object' &&
        contextValue.program !== null &&
        'name' in contextValue.program &&
        typeof contextValue.program.name === 'string'
      ) {
        return `${contextValue.name} (${contextValue.program.name})`
      }

      return contextValue.name
    }
  }

  return fallback
}

function getEngagementTypeLabel(engagement: Engagement): string {
  if (engagement.type === 'other' && engagement.typeOther) return engagement.typeOther
  return engagementTypeLabels[engagement.type] || engagement.type
}

function getContextDefaultDates(
  selectedContext: ContextSearchResult | null,
): {
  endDate: string
  startDate: string
} {
  if (!selectedContext) return { endDate: '', startDate: '' }

  if (selectedContext.relationTo === 'events') {
    const eventDate = toDateInputValue(selectedContext.eventDate)
    return {
      endDate: eventDate,
      startDate: eventDate,
    }
  }

  return {
    endDate: toDateInputValue(selectedContext.endDate),
    startDate: toDateInputValue(selectedContext.startDate),
  }
}

export const PersonContextEngagementsSectionBase = ({
  context,
}: PersonContextEngagementsSectionBaseProps) => {
  const { id } = useDocumentInfo()
  const personId = toNumericId(id)
  const canManage = personId !== null

  const [engagements, setEngagements] = useState<Engagement[]>([])
  const [isLoadingEngagements, setIsLoadingEngagements] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [editingEngagementId, setEditingEngagementId] = useState<number | null>(null)
  const [openDrawerRequested, setOpenDrawerRequested] = useState(false)
  const [EngagementDrawer, , { openDrawer }] = useDocumentDrawer({
    collectionSlug: 'engagements',
    id: editingEngagementId,
  })

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [contextSearch, setContextSearch] = useState('')
  const [searchResults, setSearchResults] = useState<ContextSearchResult[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedContext, setSelectedContext] = useState<ContextSearchResult | null>(null)
  const [engagementType, setEngagementType] = useState<Engagement['type'] | ''>('')
  const [engagementTypeOther, setEngagementTypeOther] = useState('')
  const [engagementStatus, setEngagementStatus] = useState<EngagementStatusValue | ''>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [rating, setRating] = useState('')
  const [wouldRecommend, setWouldRecommend] = useState('')
  const [metadataText, setMetadataText] = useState('')
  const [createImpactNow, setCreateImpactNow] = useState(false)
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
  const [createdEngagementId, setCreatedEngagementId] = useState<number | null>(null)

  const resetForm = useCallback(() => {
    setContextSearch('')
    setSearchResults([])
    setSearchError(null)
    setIsSearching(false)
    setSelectedContext(null)
    setEngagementType('')
    setEngagementTypeOther('')
    setEngagementStatus('')
    setStartDate('')
    setEndDate('')
    setRating('')
    setWouldRecommend('')
    setMetadataText('')
    setCreateImpactNow(false)
    setImpactType('')
    setImpactTypeOther('')
    setImpactSummary('')
    setImpactEvidenceUrl('')
    setImpactVerified(false)
    setImpactInfluenceScore('')
    setImpactActionCategory('')
    setFormError(null)
    setCreatedEngagementId(null)
  }, [])

  const refreshEngagements = useCallback(async () => {
    if (!canManage || personId === null) {
      setEngagements([])
      setListError(null)
      return
    }

    setIsLoadingEngagements(true)
    setListError(null)

    try {
      const docs = await fetchPersonEngagements({
        personId,
        relationTo: context.relationTo,
      })
      setEngagements(docs)
    } catch (error) {
      setListError(getPersonAdminErrorMessage(error))
    } finally {
      setIsLoadingEngagements(false)
    }
  }, [canManage, context.relationTo, personId])

  useEffect(() => {
    void refreshEngagements()
  }, [refreshEngagements])

  useEffect(() => {
    if (!openDrawerRequested || editingEngagementId === null) return
    openDrawer()
    setOpenDrawerRequested(false)
  }, [editingEngagementId, openDrawer, openDrawerRequested])

  useEffect(() => {
    if (!isAddModalOpen) return
    if (selectedContext !== null) {
      setSearchResults([])
      setSearchError(null)
      setIsSearching(false)
      return
    }

    const query = contextSearch.trim()
    if (query.length < 2) {
      setSearchResults([])
      setSearchError(null)
      return
    }

    let isCancelled = false
    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true)
      setSearchError(null)
      try {
        const contexts = await searchContexts({
          query,
          relationTo: context.relationTo,
        })
        if (!isCancelled) setSearchResults(contexts)
      } catch (error) {
        if (!isCancelled) setSearchError(getPersonAdminErrorMessage(error))
      } finally {
        if (!isCancelled) setIsSearching(false)
      }
    }, 250)

    return () => {
      isCancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [context.relationTo, contextSearch, isAddModalOpen, selectedContext])

  const engagementRows = useMemo(() => {
    return engagements.map((engagement) => ({
      contextDate: engagement.contextDate ?? engagement.createdAt,
      contextLabel: getContextLabel(engagement.context, `${context.label} #${engagement.id}`),
      id: engagement.id,
      status: engagement.engagement_status || '—',
      title: engagement.title || getEngagementTypeLabel(engagement),
      type: getEngagementTypeLabel(engagement),
    }))
  }, [context.label, engagements])

  const openAddModal = useCallback(() => {
    resetForm()
    setNotice(null)
    setIsAddModalOpen(true)
  }, [resetForm])

  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false)
    resetForm()
  }, [resetForm])

  const handleEditEngagement = useCallback((engagementId: number) => {
    setEditingEngagementId(engagementId)
    setOpenDrawerRequested(true)
  }, [])

  const handleDrawerSave = useCallback(() => {
    void refreshEngagements()
  }, [refreshEngagements])

  const handleCreateEngagement = useCallback(async () => {
    if (!canManage || personId === null) return

    setFormError(null)

    if (!selectedContext) {
      setFormError(`Select a ${context.label.toLowerCase()} before saving.`)
      return
    }

    if (!engagementType) {
      setFormError('Select an engagement type.')
      return
    }

    if (engagementType === 'other' && !engagementTypeOther.trim()) {
      setFormError('Specify the engagement type when "Other" is selected.')
      return
    }

    let parsedMetadata: Engagement['metadata'] | undefined
    if (metadataText.trim()) {
      try {
        parsedMetadata = JSON.parse(metadataText) as Engagement['metadata']
      } catch {
        setFormError('Metadata must be valid JSON.')
        return
      }
    }

    const parsedRating = rating.trim() ? Number(rating) : undefined
    if (
      parsedRating !== undefined &&
      (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 10)
    ) {
      setFormError('Rating must be a number between 1 and 10.')
      return
    }

    const parsedWouldRecommend = wouldRecommend.trim() ? Number(wouldRecommend) : undefined
    if (
      parsedWouldRecommend !== undefined &&
      (Number.isNaN(parsedWouldRecommend) ||
        parsedWouldRecommend < 1 ||
        parsedWouldRecommend > 10)
    ) {
      setFormError('Would recommend score must be a number between 1 and 10.')
      return
    }

    const parsedImpactInfluenceScore = impactInfluenceScore.trim()
      ? Number(impactInfluenceScore)
      : undefined
    if (
      createImpactNow &&
      parsedImpactInfluenceScore !== undefined &&
      (Number.isNaN(parsedImpactInfluenceScore) ||
        parsedImpactInfluenceScore < 1 ||
        parsedImpactInfluenceScore > 5)
    ) {
      setFormError('AISSA influence score must be a number between 1 and 5.')
      return
    }

    if (createImpactNow) {
      if (!impactType) {
        setFormError('Select an impact type when creating a linked impact.')
        return
      }
      if (impactType === 'other' && !impactTypeOther.trim()) {
        setFormError('Specify the impact type when "Other" is selected.')
        return
      }
      if (!impactSummary.trim()) {
        setFormError('Impact summary is required when creating a linked impact.')
        return
      }
    }

    setIsSubmitting(true)
    let createdEngagementThisAttempt = false

    try {
      const nextImpactType = createImpactNow ? impactType : undefined
      let engagementId = createdEngagementId

      if (engagementId === null) {
        const engagement = await createPersonContextEngagement({
          context: {
            relationTo: context.relationTo,
            value: selectedContext.id,
          },
          engagement_status: engagementStatus || undefined,
          endDate: endDate || undefined,
          metadata: parsedMetadata,
          person: personId,
          rating: parsedRating,
          startDate: startDate || undefined,
          type: engagementType,
          typeOther: engagementType === 'other' ? engagementTypeOther.trim() : undefined,
          wouldRecommend: parsedWouldRecommend,
        })
        engagementId = engagement.id
        createdEngagementThisAttempt = true
        setCreatedEngagementId(engagement.id)
      }

      if (createImpactNow) {
        await createPersonEngagementImpact({
          action_category: impactActionCategory || undefined,
          aissa_influence_score: parsedImpactInfluenceScore,
          engagement: engagementId,
          evidenceUrl: impactEvidenceUrl.trim() || undefined,
          isVerified: impactVerified,
          person: personId,
          summary: impactSummary.trim(),
          type: nextImpactType as ImpactTypeValue,
          typeOther: nextImpactType === 'other' ? impactTypeOther.trim() : undefined,
        })
      }

      setIsAddModalOpen(false)
      setNotice(
        createImpactNow
          ? `${context.label} engagement and linked impact created.`
          : `${context.label} engagement created.`,
      )
      resetForm()
      await refreshEngagements()
    } catch (error) {
      if (createImpactNow && (createdEngagementId !== null || createdEngagementThisAttempt)) {
        setNotice(
          `${context.label} engagement already exists. Fix the impact details and save again to retry the linked impact only.`,
        )
        await refreshEngagements()
      }
      setFormError(getPersonAdminErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }, [
    canManage,
    context.label,
    context.relationTo,
    createImpactNow,
    createdEngagementId,
    endDate,
    engagementStatus,
    engagementType,
    engagementTypeOther,
    impactActionCategory,
    impactEvidenceUrl,
    impactInfluenceScore,
    impactSummary,
    impactType,
    impactTypeOther,
    impactVerified,
    metadataText,
    personId,
    rating,
    refreshEngagements,
    resetForm,
    selectedContext,
    startDate,
    wouldRecommend,
  ])

  const handleDeleteEngagement = useCallback(
    async (engagementId: number) => {
      if (!window.confirm('Delete this engagement? This cannot be undone.')) return

      setIsDeletingId(engagementId)
      setNotice(null)
      setListError(null)

      try {
        await deleteCollectionDocument({
          collection: 'engagements',
          id: engagementId,
        })
        setNotice(`${context.label} engagement deleted.`)
        await refreshEngagements()
      } catch (error) {
        setListError(getPersonAdminErrorMessage(error))
      } finally {
        setIsDeletingId(null)
      }
    },
    [context.label, refreshEngagements],
  )

  return (
    <section style={personAdminSectionStyles()}>
      <div style={{ alignItems: 'center', display: 'flex', gap: 12, justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0 }}>{context.label} Engagements</h3>
          <p style={{ color: 'var(--theme-elevation-500)', margin: '4px 0 0' }}>
            Manage {context.label.toLowerCase()} links for this person and optionally create a linked impact at the same time.
          </p>
        </div>
        <Button disabled={!canManage} onClick={openAddModal} type="button">
          Add Engagement
        </Button>
      </div>

      {!canManage && (
        <div style={{ marginTop: 12 }}>
          <Banner type="info">Save person first to add {context.label.toLowerCase()} engagements.</Banner>
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
        {isLoadingEngagements && <p>Loading engagements...</p>}

        {!isLoadingEngagements && canManage && engagementRows.length === 0 && (
          <p style={{ color: 'var(--theme-elevation-500)', margin: 0 }}>
            No {context.label.toLowerCase()} engagements have been added yet.
          </p>
        )}

        {!isLoadingEngagements && engagementRows.length > 0 && (
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid var(--theme-elevation-200)', padding: '8px', textAlign: 'left' }}>
                  {context.label}
                </th>
                <th style={{ borderBottom: '1px solid var(--theme-elevation-200)', padding: '8px', textAlign: 'left' }}>
                  Title
                </th>
                <th style={{ borderBottom: '1px solid var(--theme-elevation-200)', padding: '8px', textAlign: 'left' }}>
                  Type
                </th>
                <th style={{ borderBottom: '1px solid var(--theme-elevation-200)', padding: '8px', textAlign: 'left' }}>
                  Status
                </th>
                <th style={{ borderBottom: '1px solid var(--theme-elevation-200)', padding: '8px', textAlign: 'left' }}>
                  Context Date / Created
                </th>
                <th style={{ borderBottom: '1px solid var(--theme-elevation-200)', padding: '8px', textAlign: 'left' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {engagementRows.map((row) => (
                <tr key={row.id}>
                  <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px' }}>
                    {row.contextLabel}
                  </td>
                  <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px' }}>
                    {row.title}
                  </td>
                  <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px' }}>
                    {row.type}
                  </td>
                  <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px' }}>
                    {row.status}
                  </td>
                  <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px' }}>
                    {toFormattedDate(row.contextDate)}
                  </td>
                  <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button buttonStyle="secondary" onClick={() => handleEditEngagement(row.id)} type="button">
                        Edit
                      </Button>
                      <Button
                        buttonStyle="secondary"
                        disabled={isDeletingId === row.id}
                        onClick={() => void handleDeleteEngagement(row.id)}
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

      <EngagementDrawer onDelete={handleDrawerSave} onSave={handleDrawerSave} />

      {isAddModalOpen && (
        <div aria-label={`Add ${context.label} Engagement`} aria-modal="true" role="dialog" style={personAdminModalStyles()}>
          <div style={personAdminModalCardStyles()}>
            <div style={{ alignItems: 'center', display: 'flex', gap: 12, justifyContent: 'space-between' }}>
              <h4 style={{ margin: 0 }}>Add {context.label} Engagement</h4>
              <Button buttonStyle="secondary" onClick={closeAddModal} type="button">
                Close
              </Button>
            </div>

            <div style={{ marginTop: 16 }}>
              {createdEngagementId !== null && createImpactNow && (
                <div style={{ marginBottom: 12 }}>
                  <Banner type="info">
                    Engagement already created. Saving again will retry only the linked impact.
                  </Banner>
                </div>
              )}

              <div>
                <label htmlFor={`${context.relationTo}-search-input`}>Search {context.label.toLowerCase()}</label>
                <input
                  id={`${context.relationTo}-search-input`}
                  onChange={(event) => {
                    setContextSearch(event.target.value)
                    setSelectedContext(null)
                    setFormError(null)
                  }}
                  placeholder="Type at least 2 characters..."
                  type="text"
                  value={contextSearch}
                  style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                />

                {isSearching && <p style={{ marginBottom: 0 }}>Searching...</p>}
                {searchError && (
                  <p style={{ color: 'var(--theme-error-500)', marginBottom: 0 }}>{searchError}</p>
                )}

                {searchResults.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0 }}>
                    {searchResults.map((result) => {
                      const isSelected = selectedContext?.id === result.id

                      return (
                        <li key={result.id} style={{ marginBottom: 6 }}>
                          <button
                            onClick={() => {
                              const defaults = getContextDefaultDates(result)
                              setSelectedContext(result)
                              setContextSearch(result.label)
                              setSearchResults([])
                              if (!startDate) setStartDate(defaults.startDate)
                              if (!endDate) setEndDate(defaults.endDate)
                              setFormError(null)
                            }}
                            style={{
                              background: isSelected ? 'var(--theme-elevation-100)' : 'transparent',
                              border: '1px solid var(--theme-elevation-200)',
                              borderRadius: 6,
                              cursor: 'pointer',
                              display: 'block',
                              padding: 8,
                              textAlign: 'left',
                              width: '100%',
                            }}
                            type="button"
                          >
                            <strong>{result.label}</strong>
                            {result.secondaryLabel ? <div>{result.secondaryLabel}</div> : null}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}

                {selectedContext && (
                  <p style={{ color: 'var(--theme-elevation-500)', marginBottom: 0, marginTop: 8 }}>
                    Selected {context.label.toLowerCase()}: {selectedContext.label}
                  </p>
                )}
              </div>

              <div style={{ marginTop: 16 }}>
                <label htmlFor={`${context.relationTo}-engagement-type-select`}>Engagement type</label>
                <select
                  id={`${context.relationTo}-engagement-type-select`}
                  onChange={(event) => {
                    setEngagementType(event.target.value as Engagement['type'] | '')
                    setFormError(null)
                  }}
                  value={engagementType}
                  style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                >
                  <option value="">Select type</option>
                  {ENGAGEMENT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {engagementType === 'other' && (
                <div style={{ marginTop: 12 }}>
                  <label htmlFor={`${context.relationTo}-engagement-type-other`}>Specify engagement type</label>
                  <input
                    id={`${context.relationTo}-engagement-type-other`}
                    onChange={(event) => setEngagementTypeOther(event.target.value)}
                    type="text"
                    value={engagementTypeOther}
                    style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                  />
                </div>
              )}

              <div style={{ marginTop: 12 }}>
                <label htmlFor={`${context.relationTo}-engagement-status-select`}>Engagement status (optional)</label>
                <select
                  id={`${context.relationTo}-engagement-status-select`}
                  onChange={(event) =>
                    setEngagementStatus(event.target.value as EngagementStatusValue | '')
                  }
                  value={engagementStatus}
                  style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                >
                  <option value="">None</option>
                  {ENGAGEMENT_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr', marginTop: 12 }}>
                <div>
                  <label htmlFor={`${context.relationTo}-engagement-start-date`}>Start date (optional)</label>
                  <input
                    id={`${context.relationTo}-engagement-start-date`}
                    onChange={(event) => setStartDate(event.target.value)}
                    type="date"
                    value={startDate}
                    style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                  />
                </div>
                <div>
                  <label htmlFor={`${context.relationTo}-engagement-end-date`}>End date (optional)</label>
                  <input
                    id={`${context.relationTo}-engagement-end-date`}
                    onChange={(event) => setEndDate(event.target.value)}
                    type="date"
                    value={endDate}
                    style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr', marginTop: 12 }}>
                <div>
                  <label htmlFor={`${context.relationTo}-engagement-rating`}>Rating (1-10)</label>
                  <input
                    id={`${context.relationTo}-engagement-rating`}
                    max={10}
                    min={1}
                    onChange={(event) => setRating(event.target.value)}
                    step={1}
                    type="number"
                    value={rating}
                    style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                  />
                </div>
                <div>
                  <label htmlFor={`${context.relationTo}-engagement-would-recommend`}>Would recommend (1-10)</label>
                  <input
                    id={`${context.relationTo}-engagement-would-recommend`}
                    max={10}
                    min={1}
                    onChange={(event) => setWouldRecommend(event.target.value)}
                    step={1}
                    type="number"
                    value={wouldRecommend}
                    style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <label htmlFor={`${context.relationTo}-engagement-metadata`}>Metadata JSON (optional)</label>
                <textarea
                  id={`${context.relationTo}-engagement-metadata`}
                  onChange={(event) => setMetadataText(event.target.value)}
                  placeholder='{"notes":"Joined from waitlist"}'
                  rows={3}
                  value={metadataText}
                  style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                />
              </div>

              <div
                style={{
                  border: '1px solid var(--theme-elevation-200)',
                  borderRadius: 8,
                  marginTop: 20,
                  padding: 16,
                }}
              >
                <label style={{ display: 'inline-flex', gap: 8 }}>
                  <input
                    checked={createImpactNow}
                    onChange={(event) => setCreateImpactNow(event.target.checked)}
                    type="checkbox"
                  />
                  Create linked impact now
                </label>

                {createImpactNow && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ marginBottom: 12 }}>
                      <label htmlFor={`${context.relationTo}-impact-type`}>Impact type</label>
                      <select
                        id={`${context.relationTo}-impact-type`}
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
                        <label htmlFor={`${context.relationTo}-impact-type-other`}>Specify impact type</label>
                        <input
                          id={`${context.relationTo}-impact-type-other`}
                          onChange={(event) => setImpactTypeOther(event.target.value)}
                          type="text"
                          value={impactTypeOther}
                          style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                        />
                      </div>
                    )}

                    <div style={{ marginBottom: 12 }}>
                      <label htmlFor={`${context.relationTo}-impact-summary`}>Impact summary</label>
                      <textarea
                        id={`${context.relationTo}-impact-summary`}
                        onChange={(event) => setImpactSummary(event.target.value)}
                        rows={3}
                        value={impactSummary}
                        style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                      />
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <label htmlFor={`${context.relationTo}-impact-evidence-url`}>Evidence URL (optional)</label>
                      <input
                        id={`${context.relationTo}-impact-evidence-url`}
                        onChange={(event) => setImpactEvidenceUrl(event.target.value)}
                        type="text"
                        value={impactEvidenceUrl}
                        style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr', marginBottom: 12 }}>
                      <div>
                        <label htmlFor={`${context.relationTo}-impact-influence-score`}>AISSA influence score (1-5)</label>
                        <input
                          id={`${context.relationTo}-impact-influence-score`}
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
                        <label htmlFor={`${context.relationTo}-impact-action-category`}>Action category (optional)</label>
                        <select
                          id={`${context.relationTo}-impact-action-category`}
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
                  </div>
                )}
              </div>

              {formError && (
                <p style={{ color: 'var(--theme-error-500)', marginBottom: 0, marginTop: 12 }}>
                  {formError}
                </p>
              )}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
                <Button buttonStyle="secondary" onClick={closeAddModal} type="button">
                  Cancel
                </Button>
                <Button disabled={isSubmitting} onClick={() => void handleCreateEngagement()} type="button">
                  {isSubmitting ? 'Saving...' : createImpactNow ? 'Create Engagement + Impact' : 'Create Engagement'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

const PROGRAM_CONTEXT = {
  label: 'Program',
  relationTo: 'programs',
} as const

const EVENT_CONTEXT = {
  label: 'Event',
  relationTo: 'events',
} as const

const COHORT_CONTEXT = {
  label: 'Cohort',
  relationTo: 'cohorts',
} as const

export const PersonProgramEngagementsSection: UIFieldClientComponent = (props) => {
  return <PersonContextEngagementsSectionBase {...props} context={PROGRAM_CONTEXT} />
}

export const PersonEventEngagementsSection: UIFieldClientComponent = (props) => {
  return <PersonContextEngagementsSectionBase {...props} context={EVENT_CONTEXT} />
}

export const PersonCohortEngagementsSection: UIFieldClientComponent = (props) => {
  return <PersonContextEngagementsSectionBase {...props} context={COHORT_CONTEXT} />
}
