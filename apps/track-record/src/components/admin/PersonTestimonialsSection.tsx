'use client'

import { Banner, Button, useDocumentDrawer, useDocumentInfo } from '@payloadcms/ui'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { UIFieldClientComponent } from 'payload'

import type { Testimonial } from '@/payload-types'

import {
  type ContextRelation,
  type ContextSearchResult,
  createPersonTestimonial,
  deleteCollectionDocument,
  fetchPersonTestimonials,
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

type ContextSelection = '' | ContextRelation

function getContextDateDefault(context: ContextSearchResult | null): string {
  if (!context) return ''

  if (context.relationTo === 'events') return toDateInputValue(context.eventDate)
  return toDateInputValue(context.startDate)
}

function getTestimonialContextLabel(testimonial: Testimonial): string {
  if (!testimonial.context) return 'General'

  const contextValue = testimonial.context.value
  if (typeof contextValue === 'object' && contextValue !== null && 'name' in contextValue) {
    return typeof contextValue.name === 'string' ? contextValue.name : 'Context'
  }

  return testimonial.contextKind ? testimonial.contextKind : 'Context'
}

export const PersonTestimonialsSection: UIFieldClientComponent = () => {
  const { id } = useDocumentInfo()
  const personId = toNumericId(id)
  const canManage = personId !== null

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
  const [quote, setQuote] = useState('')
  const [attributionName, setAttributionName] = useState('')
  const [attributionTitle, setAttributionTitle] = useState('')
  const [rating, setRating] = useState('')
  const [contextDate, setContextDate] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [attachContext, setAttachContext] = useState(false)
  const [contextRelation, setContextRelation] = useState<ContextSelection>('')
  const [contextSearch, setContextSearch] = useState('')
  const [selectedContext, setSelectedContext] = useState<ContextSearchResult | null>(null)
  const [searchResults, setSearchResults] = useState<ContextSearchResult[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null)

  const refreshTestimonials = useCallback(async () => {
    if (!canManage || personId === null) {
      setTestimonials([])
      setListError(null)
      return
    }

    setIsLoadingTestimonials(true)
    setListError(null)

    try {
      const docs = await fetchPersonTestimonials(personId)
      setTestimonials(docs)
    } catch (error) {
      setListError(getPersonAdminErrorMessage(error))
    } finally {
      setIsLoadingTestimonials(false)
    }
  }, [canManage, personId])

  useEffect(() => {
    void refreshTestimonials()
  }, [refreshTestimonials])

  useEffect(() => {
    if (!openDrawerRequested || editingTestimonialId === null) return
    openDrawer()
    setOpenDrawerRequested(false)
  }, [editingTestimonialId, openDrawer, openDrawerRequested])

  useEffect(() => {
    if (!isAddModalOpen || !attachContext || !contextRelation) return
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
          relationTo: contextRelation,
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
  }, [attachContext, contextRelation, contextSearch, isAddModalOpen, selectedContext])

  const rows = useMemo(() => {
    return testimonials.map((testimonial) => ({
      context: getTestimonialContextLabel(testimonial),
      contextDate: testimonial.contextDate ?? testimonial.createdAt,
      id: testimonial.id,
      published: testimonial.isPublished ? 'Yes' : 'No',
      quote: testimonial.quote.length > 110 ? `${testimonial.quote.slice(0, 109)}…` : testimonial.quote,
      rating: testimonial.rating ?? '—',
    }))
  }, [testimonials])

  const resetForm = useCallback(() => {
    setQuote('')
    setAttributionName('')
    setAttributionTitle('')
    setRating('')
    setContextDate('')
    setIsPublished(false)
    setAttachContext(false)
    setContextRelation('')
    setContextSearch('')
    setSelectedContext(null)
    setSearchResults([])
    setSearchError(null)
    setIsSearching(false)
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

  const handleEditTestimonial = useCallback((testimonialId: number) => {
    setEditingTestimonialId(testimonialId)
    setOpenDrawerRequested(true)
  }, [])

  const handleDrawerSave = useCallback(() => {
    void refreshTestimonials()
  }, [refreshTestimonials])

  const handleCreateTestimonial = useCallback(async () => {
    if (!canManage || personId === null) return

    setFormError(null)

    if (!quote.trim()) {
      setFormError('Quote is required.')
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

    if (attachContext) {
      if (!contextRelation) {
        setFormError('Select a context type before saving.')
        return
      }
      if (!selectedContext) {
        setFormError('Select a context before saving.')
        return
      }
    }

    setIsSubmitting(true)

    try {
      await createPersonTestimonial({
        attributionName: attributionName.trim() || undefined,
        attributionTitle: attributionTitle.trim() || undefined,
        context:
          attachContext && selectedContext
            ? {
                relationTo: selectedContext.relationTo,
                value: selectedContext.id,
              }
            : undefined,
        contextDate: contextDate || undefined,
        isPublished,
        person: personId,
        quote: quote.trim(),
        rating: parsedRating,
      })

      setIsAddModalOpen(false)
      setNotice('Testimonial created.')
      resetForm()
      await refreshTestimonials()
    } catch (error) {
      setFormError(getPersonAdminErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }, [
    attachContext,
    attributionName,
    attributionTitle,
    canManage,
    contextDate,
    contextRelation,
    isPublished,
    personId,
    quote,
    rating,
    refreshTestimonials,
    resetForm,
    selectedContext,
  ])

  const handleDeleteTestimonial = useCallback(
    async (testimonialId: number) => {
      if (!window.confirm('Delete this testimonial? This cannot be undone.')) return

      setIsDeletingId(testimonialId)
      setNotice(null)
      setListError(null)

      try {
        await deleteCollectionDocument({
          collection: 'testimonials',
          id: testimonialId,
        })
        setNotice('Testimonial deleted.')
        await refreshTestimonials()
      } catch (error) {
        setListError(getPersonAdminErrorMessage(error))
      } finally {
        setIsDeletingId(null)
      }
    },
    [refreshTestimonials],
  )

  return (
    <section style={personAdminSectionStyles()}>
      <div style={{ alignItems: 'center', display: 'flex', gap: 12, justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0 }}>Testimonials</h3>
          <p style={{ color: 'var(--theme-elevation-500)', margin: '4px 0 0' }}>
            Manage testimonials for this person, with optional event, program, or cohort context.
          </p>
        </div>
        <Button disabled={!canManage} onClick={openAddModal} type="button">
          Add Testimonial
        </Button>
      </div>

      {!canManage && (
        <div style={{ marginTop: 12 }}>
          <Banner type="info">Save person first to add testimonials.</Banner>
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
            No testimonials have been added yet.
          </p>
        )}

        {!isLoadingTestimonials && rows.length > 0 && (
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid var(--theme-elevation-200)', padding: '8px', textAlign: 'left' }}>
                  Context
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
              {rows.map((row) => (
                <tr key={row.id}>
                  <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px' }}>
                    {row.context}
                  </td>
                  <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px' }}>
                    {row.quote}
                  </td>
                  <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px' }}>
                    {row.rating}
                  </td>
                  <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px' }}>
                    {row.published}
                  </td>
                  <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px' }}>
                    {toFormattedDate(row.contextDate)}
                  </td>
                  <td style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button buttonStyle="secondary" onClick={() => handleEditTestimonial(row.id)} type="button">
                        Edit
                      </Button>
                      <Button
                        buttonStyle="secondary"
                        disabled={isDeletingId === row.id}
                        onClick={() => void handleDeleteTestimonial(row.id)}
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

      <TestimonialDrawer onDelete={handleDrawerSave} onSave={handleDrawerSave} />

      {isAddModalOpen && (
        <div aria-label="Add Testimonial" aria-modal="true" role="dialog" style={personAdminModalStyles()}>
          <div style={personAdminModalCardStyles()}>
            <div style={{ alignItems: 'center', display: 'flex', gap: 12, justifyContent: 'space-between' }}>
              <h4 style={{ margin: 0 }}>Add Testimonial</h4>
              <Button buttonStyle="secondary" onClick={closeAddModal} type="button">
                Close
              </Button>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ marginTop: 12 }}>
                <label htmlFor="person-testimonial-quote">Quote</label>
                <textarea
                  id="person-testimonial-quote"
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
                  <label htmlFor="person-testimonial-attribution-name">Attribution name (optional)</label>
                  <input
                    id="person-testimonial-attribution-name"
                    onChange={(event) => setAttributionName(event.target.value)}
                    type="text"
                    value={attributionName}
                    style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                  />
                </div>
                <div>
                  <label htmlFor="person-testimonial-attribution-title">Attribution title (optional)</label>
                  <input
                    id="person-testimonial-attribution-title"
                    onChange={(event) => setAttributionTitle(event.target.value)}
                    type="text"
                    value={attributionTitle}
                    style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr', marginTop: 12 }}>
                <div>
                  <label htmlFor="person-testimonial-rating">Rating (1-10)</label>
                  <input
                    id="person-testimonial-rating"
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
                  <label htmlFor="person-testimonial-context-date">Context date (optional)</label>
                  <input
                    id="person-testimonial-context-date"
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
                    checked={attachContext}
                    onChange={(event) => {
                      setAttachContext(event.target.checked)
                      if (!event.target.checked) {
                        setContextRelation('')
                        setContextSearch('')
                        setSelectedContext(null)
                        setSearchResults([])
                        setSearchError(null)
                      }
                    }}
                    type="checkbox"
                  />
                  Attach optional context
                </label>

                {attachContext && (
                  <div style={{ marginTop: 12 }}>
                    <div>
                      <label htmlFor="person-testimonial-context-type">Context type</label>
                      <select
                        id="person-testimonial-context-type"
                        onChange={(event) => {
                          setContextRelation(event.target.value as ContextSelection)
                          setContextSearch('')
                          setSelectedContext(null)
                          setSearchResults([])
                          setSearchError(null)
                        }}
                        value={contextRelation}
                        style={{ display: 'block', marginTop: 4, padding: 8, width: '100%' }}
                      >
                        <option value="">Select type</option>
                        <option value="events">Event</option>
                        <option value="programs">Program</option>
                        <option value="cohorts">Cohort</option>
                      </select>
                    </div>

                    {contextRelation && (
                      <div style={{ marginTop: 12 }}>
                        <label htmlFor="person-testimonial-context-search">Search context</label>
                        <input
                          id="person-testimonial-context-search"
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
                            {searchResults.map((result) => (
                              <li key={result.id} style={{ marginBottom: 6 }}>
                                <button
                                  onClick={() => {
                                    setSelectedContext(result)
                                    setContextSearch(result.label)
                                    setSearchResults([])
                                    if (!contextDate) setContextDate(getContextDateDefault(result))
                                    setFormError(null)
                                  }}
                                  style={{
                                    background: 'transparent',
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
                            ))}
                          </ul>
                        )}

                        {selectedContext && (
                          <p style={{ color: 'var(--theme-elevation-500)', marginBottom: 0, marginTop: 8 }}>
                            Selected context: {selectedContext.label}
                          </p>
                        )}
                      </div>
                    )}
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
