'use client'

import { Banner, Button, useDocumentDrawer, useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { UIFieldClientComponent } from 'payload'

import type { Person, Testimonial } from '@/payload-types'

import {
  type ContextKind,
  type ContextRelation,
  PayloadAPIError,
  createQuickPerson,
  searchPersons,
} from './cohort-engagements-api'
import {
  type ContextTestimonialCreateInput,
  createContextTestimonial,
  fetchContextTestimonials,
} from './context-testimonials-api'

type PersonMode = 'existing' | 'new' | 'attribution'

type TestimonialsSectionContext = {
  kind: ContextKind
  label: string
  relationTo: ContextRelation
}

type ContextTestimonialsSectionBaseProps = Record<string, unknown> & {
  context: TestimonialsSectionContext
}

function getErrorMessage(error: unknown): string {
  if (error instanceof PayloadAPIError) return error.message
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred.'
}

function normalizeNumericId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && Number.isFinite(Number(value))) return Number(value)
  return null
}

function toFormattedDate(value?: string | null): string {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return value
  return date.toLocaleString()
}

function toDateInputValue(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return ''

  const explicitDate = value.match(/^\d{4}-\d{2}-\d{2}/)
  if (explicitDate) return explicitDate[0]

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.valueOf())) return ''
  return parsedDate.toISOString().slice(0, 10)
}

function getContextDateDefault(
  fields: Record<string, { value?: unknown } | undefined>,
  context: TestimonialsSectionContext,
): string {
  if (context.relationTo === 'events') {
    return toDateInputValue(fields.eventDate?.value)
  }

  return toDateInputValue(fields.startDate?.value)
}

function getTestimonialPersonLabel(testimonial: Testimonial): string {
  if (typeof testimonial.person === 'object' && testimonial.person !== null) {
    return testimonial.person.fullName || testimonial.attributionName || 'Anonymous'
  }

  if (typeof testimonial.person === 'number') {
    return `Person #${testimonial.person}`
  }

  return testimonial.attributionName || 'Anonymous'
}

function truncateQuote(quote: string, maxLength = 110): string {
  const trimmed = quote.trim()
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength - 1)}…`
}

const EVENT_CONTEXT = {
  kind: 'event',
  label: 'Event',
  relationTo: 'events',
} as const

const PROGRAM_CONTEXT = {
  kind: 'program',
  label: 'Program',
  relationTo: 'programs',
} as const

const COHORT_CONTEXT = {
  kind: 'cohort',
  label: 'Cohort',
  relationTo: 'cohorts',
} as const

const ContextTestimonialsSectionBase = ({
  context,
}: ContextTestimonialsSectionBaseProps) => {
  const { id } = useDocumentInfo()
  const contextDateDefault = useFormFields(([fields]) =>
    getContextDateDefault(fields as Record<string, { value?: unknown } | undefined>, context),
  )

  const contextId =
    typeof id === 'number'
      ? id
      : typeof id === 'string' && Number.isFinite(Number(id))
        ? Number(id)
        : null
  const canManage = contextId !== null

  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [editingTestimonialId, setEditingTestimonialId] = useState<number | null>(null)
  const [openDrawerRequested, setOpenDrawerRequested] = useState(false)
  const [TestimonialDrawer, , { openDrawer }] = useDocumentDrawer({
    collectionSlug: 'testimonials',
    id: editingTestimonialId,
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
  const [quote, setQuote] = useState('')
  const [attributionName, setAttributionName] = useState('')
  const [attributionTitle, setAttributionTitle] = useState('')
  const [rating, setRating] = useState('')
  const [contextDate, setContextDate] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [emailConflictPerson, setEmailConflictPerson] = useState<Person | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetAddTestimonialForm = useCallback(() => {
    setPersonMode('existing')
    setPersonSearch('')
    setSearchResults([])
    setSearchError(null)
    setIsSearching(false)
    setSelectedPersonId(null)
    setSelectedPersonLabel(null)
    setNewPersonFullName('')
    setNewPersonEmail('')
    setQuote('')
    setAttributionName('')
    setAttributionTitle('')
    setRating('')
    setContextDate(contextDateDefault)
    setIsPublished(false)
    setFormError(null)
    setEmailConflictPerson(null)
  }, [contextDateDefault])

  const refreshTestimonials = useCallback(async () => {
    if (!canManage || contextId === null) {
      setTestimonials([])
      setListError(null)
      return
    }

    setIsLoadingTestimonials(true)
    setListError(null)

    try {
      const docs = await fetchContextTestimonials({
        contextId,
        contextRelation: context.relationTo,
      })
      setTestimonials(docs)
    } catch (error) {
      setListError(getErrorMessage(error))
    } finally {
      setIsLoadingTestimonials(false)
    }
  }, [canManage, context.relationTo, contextId])

  useEffect(() => {
    void refreshTestimonials()
  }, [refreshTestimonials])

  useEffect(() => {
    if (!openDrawerRequested || editingTestimonialId === null) return
    openDrawer()
    setOpenDrawerRequested(false)
  }, [editingTestimonialId, openDrawer, openDrawerRequested])

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

  const openAddTestimonialModal = useCallback(() => {
    resetAddTestimonialForm()
    setNotice(null)
    setIsAddModalOpen(true)
  }, [resetAddTestimonialForm])

  const closeAddTestimonialModal = useCallback(() => {
    setIsAddModalOpen(false)
    resetAddTestimonialForm()
  }, [resetAddTestimonialForm])

  const handleEditTestimonial = useCallback((testimonialId: number) => {
    setEditingTestimonialId(testimonialId)
    setOpenDrawerRequested(true)
  }, [])

  const handleDrawerSave = useCallback(() => {
    void refreshTestimonials()
  }, [refreshTestimonials])

  const rows = useMemo(() => {
    return testimonials.map((testimonial) => {
      return {
        attributionTitle: testimonial.attributionTitle || '—',
        contextDate: testimonial.contextDate ?? testimonial.createdAt,
        id: testimonial.id,
        isPublished: testimonial.isPublished ? 'Yes' : 'No',
        person: getTestimonialPersonLabel(testimonial),
        quote: truncateQuote(testimonial.quote),
        rating: testimonial.rating ?? '—',
      }
    })
  }, [testimonials])

  const handleUseExistingPersonByEmail = useCallback(() => {
    if (!emailConflictPerson) return

    setPersonMode('existing')
    setSelectedPersonId(emailConflictPerson.id)
    setSelectedPersonLabel(`${emailConflictPerson.fullName} (${emailConflictPerson.email})`)
    setPersonSearch(emailConflictPerson.fullName)
    setSearchResults([])
    setFormError(null)
    setEmailConflictPerson(null)
  }, [emailConflictPerson])

  const handleCreateTestimonial = useCallback(async () => {
    if (!canManage || contextId === null) return

    setFormError(null)
    setEmailConflictPerson(null)

    if (!quote.trim()) {
      setFormError('Quote is required.')
      return
    }

    if (personMode === 'existing' && !selectedPersonId) {
      setFormError('Select a person before saving.')
      return
    }

    if (personMode === 'new' && (!newPersonFullName.trim() || !newPersonEmail.trim())) {
      setFormError('Full name and email are required for new person quick create.')
      return
    }

    const parsedRating = rating.trim() ? Number(rating) : undefined
    if (
      parsedRating !== undefined &&
      (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 10)
    ) {
      setFormError('Rating must be a number between 1 and 10.')
      return
    }

    const parsedAttributionName = attributionName.trim()
    if (personMode === 'attribution' && !parsedAttributionName) {
      setFormError('Attribution name is required when no person is linked.')
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

      const payload: ContextTestimonialCreateInput = {
        context: {
          relationTo: context.relationTo,
          value: contextId,
        },
        isPublished,
        quote: quote.trim(),
      }

      if (personId !== null) payload.person = personId
      if (parsedAttributionName) payload.attributionName = parsedAttributionName
      if (attributionTitle.trim()) payload.attributionTitle = attributionTitle.trim()
      if (parsedRating !== undefined) payload.rating = parsedRating
      if (contextDate) payload.contextDate = contextDate

      await createContextTestimonial(payload)

      setIsAddModalOpen(false)
      setNotice(`Testimonial added to ${context.label.toLowerCase()}.`)
      resetAddTestimonialForm()
      await refreshTestimonials()
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }, [
    attributionName,
    attributionTitle,
    canManage,
    context.label,
    context.relationTo,
    contextDate,
    contextId,
    isPublished,
    newPersonEmail,
    newPersonFullName,
    personMode,
    quote,
    rating,
    refreshTestimonials,
    resetAddTestimonialForm,
    selectedPersonId,
  ])

  return (
    <section style={{ border: '1px solid var(--theme-elevation-200)', borderRadius: 8, padding: 16 }}>
      <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h3 style={{ margin: 0 }}>{context.label} Testimonials</h3>
          <p style={{ color: 'var(--theme-elevation-500)', margin: '4px 0 0' }}>
            Manage {context.label.toLowerCase()} testimonials with optional person linking.
          </p>
        </div>
        <Button disabled={!canManage} onClick={openAddTestimonialModal} type="button">
          Add Testimonial
        </Button>
      </div>

      {!canManage && (
        <div style={{ marginTop: 12 }}>
          <Banner type="info">Save {context.label.toLowerCase()} first to add testimonials.</Banner>
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
        {isLoadingTestimonials && <p>Loading testimonials...</p>}

        {!isLoadingTestimonials && canManage && rows.length === 0 && (
          <p style={{ color: 'var(--theme-elevation-500)', margin: 0 }}>
            No {context.label.toLowerCase()} testimonials have been added yet.
          </p>
        )}

        {!isLoadingTestimonials && rows.length > 0 && (
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid var(--theme-elevation-200)', padding: '8px', textAlign: 'left' }}>
                  Person / Attribution
                </th>
                <th style={{ borderBottom: '1px solid var(--theme-elevation-200)', padding: '8px', textAlign: 'left' }}>
                  Quote
                </th>
                <th style={{ borderBottom: '1px solid var(--theme-elevation-200)', padding: '8px', textAlign: 'left' }}>
                  Rating
                </th>
                <th style={{ borderBottom: '1px solid var(--theme-elevation-200)', padding: '8px', textAlign: 'left' }}>
                  Published
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
              {rows.map((row) => {
                return (
                  <tr key={row.id}>
                    <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px' }}>
                      <div>{row.person}</div>
                      <div style={{ color: 'var(--theme-elevation-500)', fontSize: 12 }}>
                        {row.attributionTitle}
                      </div>
                    </td>
                    <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px' }}>
                      {row.quote}
                    </td>
                    <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px' }}>
                      {row.rating}
                    </td>
                    <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px' }}>
                      {row.isPublished}
                    </td>
                    <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px' }}>
                      {toFormattedDate(row.contextDate)}
                    </td>
                    <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px' }}>
                      <Button buttonStyle="secondary" onClick={() => handleEditTestimonial(row.id)} type="button">
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

      <TestimonialDrawer onDelete={handleDrawerSave} onSave={handleDrawerSave} />

      {isAddModalOpen && (
        <div
          aria-label="Add Testimonial"
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
              <h4 style={{ margin: 0 }}>Add Testimonial</h4>
              <Button buttonStyle="secondary" onClick={closeAddTestimonialModal} type="button">
                Close
              </Button>
            </div>

            <div style={{ marginTop: 16 }}>
              <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
                <legend style={{ fontWeight: 600, marginBottom: 8 }}>Person Source</legend>
                <label style={{ display: 'inline-flex', gap: 8, marginRight: 16 }}>
                  <input
                    checked={personMode === 'existing'}
                    name="testimonialPersonMode"
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
                <label style={{ display: 'inline-flex', gap: 8, marginRight: 16 }}>
                  <input
                    checked={personMode === 'new'}
                    name="testimonialPersonMode"
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
                <label style={{ display: 'inline-flex', gap: 8 }}>
                  <input
                    checked={personMode === 'attribution'}
                    name="testimonialPersonMode"
                    onChange={() => {
                      setPersonMode('attribution')
                      setSelectedPersonId(null)
                      setEmailConflictPerson(null)
                      setFormError(null)
                    }}
                    type="radio"
                  />
                  Attribution only
                </label>
              </fieldset>

              {personMode === 'existing' && (
                <div style={{ marginTop: 12 }}>
                  <label htmlFor="testimonial-person-search-input">Search person</label>
                  <input
                    id="testimonial-person-search-input"
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
                  <label htmlFor="new-testimonial-person-full-name">Full name</label>
                  <input
                    id="new-testimonial-person-full-name"
                    onChange={(event) => {
                      setNewPersonFullName(event.target.value)
                      setFormError(null)
                    }}
                    required
                    type="text"
                    value={newPersonFullName}
                    style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                  />

                  <label htmlFor="new-testimonial-person-email" style={{ display: 'block', marginTop: 12 }}>
                    Email
                  </label>
                  <input
                    id="new-testimonial-person-email"
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

              <div style={{ marginTop: 12 }}>
                <label htmlFor="testimonial-quote">Quote</label>
                <textarea
                  id="testimonial-quote"
                  onChange={(event) => {
                    setQuote(event.target.value)
                    setFormError(null)
                  }}
                  rows={4}
                  value={quote}
                  style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr', marginTop: 12 }}>
                <div>
                  <label htmlFor="testimonial-attribution-name">Attribution name (optional)</label>
                  <input
                    id="testimonial-attribution-name"
                    onChange={(event) => {
                      setAttributionName(event.target.value)
                      setFormError(null)
                    }}
                    placeholder={personMode === 'attribution' ? 'Required in attribution-only mode' : ''}
                    type="text"
                    value={attributionName}
                    style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                  />
                </div>
                <div>
                  <label htmlFor="testimonial-attribution-title">Attribution title (optional)</label>
                  <input
                    id="testimonial-attribution-title"
                    onChange={(event) => {
                      setAttributionTitle(event.target.value)
                      setFormError(null)
                    }}
                    type="text"
                    value={attributionTitle}
                    style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr', marginTop: 12 }}>
                <div>
                  <label htmlFor="testimonial-rating">Rating (1-10)</label>
                  <input
                    id="testimonial-rating"
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
                  <label htmlFor="testimonial-context-date">Context date (optional)</label>
                  <input
                    id="testimonial-context-date"
                    onChange={(event) => setContextDate(event.target.value)}
                    type="date"
                    value={contextDate}
                    style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <label style={{ display: 'inline-flex', gap: 8 }}>
                  <input
                    checked={isPublished}
                    onChange={(event) => setIsPublished(event.target.checked)}
                    type="checkbox"
                  />
                  Published
                </label>
              </div>

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
                <Button buttonStyle="secondary" onClick={closeAddTestimonialModal} type="button">
                  Cancel
                </Button>
                <Button disabled={isSubmitting} onClick={() => void handleCreateTestimonial()} type="button">
                  {isSubmitting ? 'Saving...' : 'Create Testimonial'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export const CohortTestimonialsSection: UIFieldClientComponent = (props) => {
  return <ContextTestimonialsSectionBase {...props} context={COHORT_CONTEXT} />
}

export const ProgramTestimonialsSection: UIFieldClientComponent = (props) => {
  return <ContextTestimonialsSectionBase {...props} context={PROGRAM_CONTEXT} />
}

export const EventTestimonialsSection: UIFieldClientComponent = (props) => {
  return <ContextTestimonialsSectionBase {...props} context={EVENT_CONTEXT} />
}
