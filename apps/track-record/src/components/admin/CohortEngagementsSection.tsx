'use client'

import { Banner, Button, useDocumentDrawer, useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { UIFieldClientComponent } from 'payload'

import type { Engagement, Person } from '@/payload-types'

import {
  type CohortEngagementCreateInput,
  PayloadAPIError,
  checkDuplicateCohortEngagement,
  createCohortEngagement,
  createQuickPerson,
  fetchCohortEngagements,
  searchPersons,
} from './cohort-engagements-api'

type PersonMode = 'existing' | 'new'
type EngagementStatusValue = NonNullable<Engagement['engagement_status']>

const ENGAGEMENT_TYPES: Array<{ label: string; value: Engagement['type'] }> = [
  { label: 'Participant', value: 'participant' },
  { label: 'Facilitator', value: 'facilitator' },
  { label: 'Speaker', value: 'speaker' },
  { label: 'Volunteer', value: 'volunteer' },
  { label: 'Organizer', value: 'organizer' },
  { label: 'Mentor', value: 'mentor' },
  { label: 'Other', value: 'other' },
]

const ENGAGEMENT_STATUS_OPTIONS: Array<{ label: string; value: EngagementStatusValue }> = [
  { label: 'Completed', value: 'completed' },
  { label: 'Dropped Out', value: 'dropped_out' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Withdrawn', value: 'withdrawn' },
  { label: 'Attended', value: 'attended' },
]

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

function getPersonCellData(personField: Engagement['person']): {
  email: string
  name: string
} {
  if (typeof personField === 'object' && personField !== null) {
    return {
      email: personField.email || '—',
      name: personField.fullName || 'Unnamed person',
    }
  }

  return {
    email: '—',
    name: typeof personField === 'number' ? `Person #${personField}` : 'Unknown person',
  }
}

function normalizeNumericId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && Number.isFinite(Number(value))) return Number(value)
  return null
}

function toDateInputValue(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return ''

  const explicitDate = value.match(/^\d{4}-\d{2}-\d{2}/)
  if (explicitDate) return explicitDate[0]

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.valueOf())) return ''
  return parsedDate.toISOString().slice(0, 10)
}

export const CohortEngagementsSection: UIFieldClientComponent = () => {
  const { id } = useDocumentInfo()
  const cohortDateDefaults = useFormFields(([fields]) => ({
    endDate: toDateInputValue(fields.endDate?.value),
    startDate: toDateInputValue(fields.startDate?.value),
  }))
  const cohortId =
    typeof id === 'number'
      ? id
      : typeof id === 'string' && Number.isFinite(Number(id))
        ? Number(id)
        : null
  const canManage = cohortId !== null

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
  const [personMode, setPersonMode] = useState<PersonMode>('existing')
  const [personSearch, setPersonSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Person[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null)
  const [selectedPersonLabel, setSelectedPersonLabel] = useState<string | null>(null)
  const [newPersonFullName, setNewPersonFullName] = useState('')
  const [newPersonEmail, setNewPersonEmail] = useState('')
  const [engagementType, setEngagementType] = useState<Engagement['type'] | ''>('')
  const [engagementStatus, setEngagementStatus] = useState<EngagementStatusValue | ''>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [rating, setRating] = useState('')
  const [wouldRecommend, setWouldRecommend] = useState('')
  const [metadataText, setMetadataText] = useState('')
  const [duplicateError, setDuplicateError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [emailConflictPerson, setEmailConflictPerson] = useState<Person | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetAddParticipantForm = useCallback(() => {
    setPersonMode('existing')
    setPersonSearch('')
    setSearchResults([])
    setSearchError(null)
    setIsSearching(false)
    setSelectedPersonId(null)
    setSelectedPersonLabel(null)
    setNewPersonFullName('')
    setNewPersonEmail('')
    setEngagementType('')
    setEngagementStatus('')
    setStartDate(cohortDateDefaults.startDate)
    setEndDate(cohortDateDefaults.endDate)
    setRating('')
    setWouldRecommend('')
    setMetadataText('')
    setDuplicateError(null)
    setFormError(null)
    setEmailConflictPerson(null)
  }, [cohortDateDefaults.endDate, cohortDateDefaults.startDate])

  const refreshEngagements = useCallback(async () => {
    if (!canManage || cohortId === null) {
      setEngagements([])
      setListError(null)
      return
    }

    setIsLoadingEngagements(true)
    setListError(null)

    try {
      const docs = await fetchCohortEngagements(cohortId)
      setEngagements(docs)
    } catch (error) {
      setListError(getErrorMessage(error))
    } finally {
      setIsLoadingEngagements(false)
    }
  }, [canManage, cohortId])

  useEffect(() => {
    void refreshEngagements()
  }, [refreshEngagements])

  useEffect(() => {
    if (!openDrawerRequested || editingEngagementId === null) return
    openDrawer()
    setOpenDrawerRequested(false)
  }, [editingEngagementId, openDrawer, openDrawerRequested])

  useEffect(() => {
    if (!isAddModalOpen || personMode !== 'existing') return
    if (selectedPersonId !== null) {
      setSearchResults([])
      setSearchError(null)
      setIsSearching(false)
      return
    }

    const query = personSearch.trim()
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
        const persons = await searchPersons(query)
        if (!isCancelled) setSearchResults(persons)
      } catch (error) {
        if (!isCancelled) setSearchError(getErrorMessage(error))
      } finally {
        if (!isCancelled) setIsSearching(false)
      }
    }, 250)

    return () => {
      isCancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [isAddModalOpen, personMode, personSearch, selectedPersonId])

  const openAddParticipantModal = useCallback(() => {
    resetAddParticipantForm()
    setNotice(null)
    setIsAddModalOpen(true)
  }, [resetAddParticipantForm])

  const closeAddParticipantModal = useCallback(() => {
    setIsAddModalOpen(false)
    resetAddParticipantForm()
  }, [resetAddParticipantForm])

  const handleEditEngagement = useCallback((engagementId: number) => {
    setEditingEngagementId(engagementId)
    setOpenDrawerRequested(true)
  }, [])

  const handleDrawerSave = useCallback(() => {
    void refreshEngagements()
  }, [refreshEngagements])

  const engagementRows = useMemo(() => {
    return engagements.map((engagement) => {
      const person = getPersonCellData(engagement.person)

      return {
        contextDate: engagement.contextDate ?? engagement.createdAt,
        createdAt: engagement.createdAt,
        email: person.email,
        id: engagement.id,
        name: person.name,
        status: engagement.engagement_status || '—',
        type: engagement.type,
      }
    })
  }, [engagements])

  const handleUseExistingPersonByEmail = useCallback(() => {
    if (!emailConflictPerson) return

    setPersonMode('existing')
    setSelectedPersonId(emailConflictPerson.id)
    setSelectedPersonLabel(`${emailConflictPerson.fullName} (${emailConflictPerson.email})`)
    setPersonSearch(emailConflictPerson.fullName)
    setSearchResults([])
    setFormError(null)
    setDuplicateError(null)
    setEmailConflictPerson(null)
  }, [emailConflictPerson])

  const handleCreateParticipant = useCallback(
    async () => {
      if (!canManage || cohortId === null) return

      setFormError(null)
      setDuplicateError(null)
      setEmailConflictPerson(null)

      if (!engagementType) {
        setFormError('Select an engagement type.')
        return
      }

      if (personMode === 'existing' && !selectedPersonId) {
        setFormError('Select a person before saving.')
        return
      }

      if (personMode === 'new') {
        if (!newPersonFullName.trim() || !newPersonEmail.trim()) {
          setFormError('Full name and email are required for new person quick create.')
          return
        }
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

      setIsSubmitting(true)

      try {
        let personId: number | null = selectedPersonId

        if (personMode === 'new') {
          const quickCreateInput = {
            email: newPersonEmail.trim(),
            fullName: newPersonFullName.trim(),
          }

          try {
            const createdPerson = await createQuickPerson(quickCreateInput)
            personId = normalizeNumericId(createdPerson.id)
          } catch (error) {
            const isPotentialEmailConflict =
              error instanceof PayloadAPIError && (error.status === 400 || error.status === 409)

            if (!isPotentialEmailConflict) throw error

            const matchingPerson = (await searchPersons(newPersonEmail.trim())).find(
              (person) => person.email.toLowerCase() === newPersonEmail.trim().toLowerCase(),
            )

            if (matchingPerson) {
              setEmailConflictPerson(matchingPerson)
              setFormError(
                'A person with this email already exists. Use the existing person found by email.',
              )
              return
            }

            throw error
          }
        }

        if (personId === null) {
          throw new Error('Unable to determine person for engagement creation.')
        }

        const isDuplicate = await checkDuplicateCohortEngagement({
          cohortId,
          personId,
        })

        if (isDuplicate) {
          setDuplicateError('This person is already linked to this cohort via an engagement.')
          return
        }

        const payload: CohortEngagementCreateInput = {
          context: {
            relationTo: 'cohorts',
            value: cohortId,
          },
          person: personId,
          type: engagementType,
        }

        if (engagementStatus) payload.engagement_status = engagementStatus
        if (startDate) payload.startDate = startDate
        if (endDate) payload.endDate = endDate
        if (parsedRating !== undefined) payload.rating = parsedRating
        if (parsedWouldRecommend !== undefined) payload.wouldRecommend = parsedWouldRecommend
        if (parsedMetadata !== undefined) payload.metadata = parsedMetadata

        await createCohortEngagement(payload)

        setIsAddModalOpen(false)
        setNotice('Participant added to cohort.')
        resetAddParticipantForm()
        await refreshEngagements()
      } catch (error) {
        setFormError(getErrorMessage(error))
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      canManage,
      cohortId,
      endDate,
      engagementStatus,
      engagementType,
      metadataText,
      newPersonEmail,
      newPersonFullName,
      personMode,
      rating,
      refreshEngagements,
      resetAddParticipantForm,
      selectedPersonId,
      startDate,
      wouldRecommend,
    ],
  )

  return (
    <section style={{ border: '1px solid var(--theme-elevation-200)', borderRadius: 8, padding: 16 }}>
      <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h3 style={{ margin: 0 }}>Cohort Participants (Engagements)</h3>
          <p style={{ color: 'var(--theme-elevation-500)', margin: '4px 0 0' }}>
            Manage cohort participants by creating and editing engagement records.
          </p>
        </div>
        <Button disabled={!canManage} onClick={openAddParticipantModal} type="button">
          Add Participant
        </Button>
      </div>

      {!canManage && (
        <div style={{ marginTop: 12 }}>
          <Banner type="info">Save cohort first to add participants.</Banner>
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
        {isLoadingEngagements && <p>Loading participants...</p>}

        {!isLoadingEngagements && canManage && engagementRows.length === 0 && (
          <p style={{ color: 'var(--theme-elevation-500)', margin: 0 }}>
            No cohort participants have been added yet.
          </p>
        )}

        {!isLoadingEngagements && engagementRows.length > 0 && (
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid var(--theme-elevation-200)', padding: '8px', textAlign: 'left' }}>
                  Person
                </th>
                <th style={{ borderBottom: '1px solid var(--theme-elevation-200)', padding: '8px', textAlign: 'left' }}>
                  Email
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
              {engagementRows.map((row) => {
                return (
                  <tr key={row.id}>
                    <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px' }}>
                      {row.name}
                    </td>
                    <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px' }}>
                      {row.email}
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
                      <Button buttonStyle="secondary" onClick={() => handleEditEngagement(row.id)} type="button">
                        Edit
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <EngagementDrawer onDelete={handleDrawerSave} onSave={handleDrawerSave} />

      {isAddModalOpen && (
        <div
          aria-label="Add Participant"
          aria-modal="true"
          role="dialog"
          style={{
            background: 'rgba(15, 23, 42, 0.35)',
            inset: 0,
            overflowY: 'auto',
            padding: 24,
            position: 'fixed',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'var(--theme-bg)',
              borderRadius: 8,
              margin: '0 auto',
              maxWidth: 720,
              padding: 20,
            }}
          >
            <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <h4 style={{ margin: 0 }}>Add Participant</h4>
              <Button buttonStyle="secondary" onClick={closeAddParticipantModal} type="button">
                Close
              </Button>
            </div>

            <div style={{ marginTop: 16 }}>
              <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
                <legend style={{ fontWeight: 600, marginBottom: 8 }}>Person Source</legend>
                <label style={{ display: 'inline-flex', gap: 8, marginRight: 16 }}>
                  <input
                    checked={personMode === 'existing'}
                    name="personMode"
                    onChange={() => {
                      setPersonMode('existing')
                      setSelectedPersonId(null)
                      setEmailConflictPerson(null)
                      setFormError(null)
                    }}
                    type="radio"
                  />
                  Existing person
                </label>
                <label style={{ display: 'inline-flex', gap: 8 }}>
                  <input
                    checked={personMode === 'new'}
                    name="personMode"
                    onChange={() => {
                      setPersonMode('new')
                      setSelectedPersonId(null)
                      setEmailConflictPerson(null)
                      setFormError(null)
                    }}
                    type="radio"
                  />
                  New person
                </label>
              </fieldset>

              {personMode === 'existing' && (
                <div style={{ marginTop: 12 }}>
                  <label htmlFor="person-search-input">Search person</label>
                  <input
                    id="person-search-input"
                    onChange={(event) => {
                      setPersonSearch(event.target.value)
                      setSelectedPersonId(null)
                      setSelectedPersonLabel(null)
                      setFormError(null)
                    }}
                    placeholder="Type at least 2 characters..."
                    type="text"
                    value={personSearch}
                    style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                  />

                  {isSearching && <p style={{ marginBottom: 0 }}>Searching...</p>}
                  {searchError && (
                    <p style={{ color: 'var(--theme-error-500)', marginBottom: 0 }}>{searchError}</p>
                  )}

                  {searchResults.length > 0 && (
                    <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0 }}>
                      {searchResults.map((person) => {
                        const isSelected = selectedPersonId === person.id

                        return (
                          <li key={person.id} style={{ marginBottom: 6 }}>
                            <button
                              onClick={() => {
                                setSelectedPersonId(person.id)
                                setSelectedPersonLabel(`${person.fullName} (${person.email})`)
                                setPersonSearch(person.fullName)
                                setSearchResults([])
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
                              <strong>{person.fullName}</strong>
                              <div>{person.email}</div>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}

                  {selectedPersonId && selectedPersonLabel && (
                    <p style={{ color: 'var(--theme-elevation-500)', marginBottom: 0, marginTop: 8 }}>
                      Selected person: {selectedPersonLabel}
                    </p>
                  )}
                </div>
              )}

              {personMode === 'new' && (
                <div style={{ marginTop: 12 }}>
                  <label htmlFor="new-person-full-name">Full name</label>
                  <input
                    id="new-person-full-name"
                    onChange={(event) => {
                      setNewPersonFullName(event.target.value)
                      setFormError(null)
                    }}
                    required
                    type="text"
                    value={newPersonFullName}
                    style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                  />

                  <label htmlFor="new-person-email" style={{ display: 'block', marginTop: 12 }}>
                    Email
                  </label>
                  <input
                    id="new-person-email"
                    onChange={(event) => {
                      setNewPersonEmail(event.target.value)
                      setFormError(null)
                    }}
                    required
                    type="email"
                    value={newPersonEmail}
                    style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                  />
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <label htmlFor="engagement-type-select">Engagement type</label>
                <select
                  id="engagement-type-select"
                  onChange={(event) => {
                    setEngagementType(event.target.value as Engagement['type'] | '')
                    setFormError(null)
                  }}
                  required
                  value={engagementType}
                  style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                >
                  <option value="">Select type</option>
                  {ENGAGEMENT_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: 12 }}>
                <label htmlFor="engagement-status-select">Engagement status (optional)</label>
                <select
                  id="engagement-status-select"
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
                  <label htmlFor="engagement-start-date">Start date (optional)</label>
                  <input
                    id="engagement-start-date"
                    onChange={(event) => setStartDate(event.target.value)}
                    type="date"
                    value={startDate}
                    style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                  />
                </div>
                <div>
                  <label htmlFor="engagement-end-date">End date (optional)</label>
                  <input
                    id="engagement-end-date"
                    onChange={(event) => setEndDate(event.target.value)}
                    type="date"
                    value={endDate}
                    style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr', marginTop: 12 }}>
                <div>
                  <label htmlFor="engagement-rating">Rating (1-10)</label>
                  <input
                    id="engagement-rating"
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
                  <label htmlFor="engagement-would-recommend">Would recommend (1-10)</label>
                  <input
                    id="engagement-would-recommend"
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
                <label htmlFor="engagement-metadata">Metadata JSON (optional)</label>
                <textarea
                  id="engagement-metadata"
                  onChange={(event) => setMetadataText(event.target.value)}
                  placeholder='{"notes":"Joined from waitlist"}'
                  rows={3}
                  value={metadataText}
                  style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                />
              </div>

              {duplicateError && (
                <p style={{ color: 'var(--theme-error-500)', marginBottom: 0, marginTop: 12 }}>
                  {duplicateError}
                </p>
              )}

              {formError && (
                <p style={{ color: 'var(--theme-error-500)', marginBottom: 0, marginTop: 12 }}>
                  {formError}
                </p>
              )}

              {emailConflictPerson && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ marginBottom: 8 }}>
                    Existing person found: <strong>{emailConflictPerson.fullName}</strong> (
                    {emailConflictPerson.email})
                  </p>
                  <Button buttonStyle="secondary" onClick={handleUseExistingPersonByEmail} type="button">
                    Use existing person found by email
                  </Button>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
                <Button buttonStyle="secondary" onClick={closeAddParticipantModal} type="button">
                  Cancel
                </Button>
                <Button disabled={isSubmitting} onClick={() => void handleCreateParticipant()} type="button">
                  {isSubmitting ? 'Saving...' : 'Create Engagement'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
