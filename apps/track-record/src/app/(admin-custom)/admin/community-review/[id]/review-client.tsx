'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { decodeStagedProfileValue } from '@/utilities/community/staged-profile-value'
import type {
  CommunitySubmission,
  StagedEngagement,
  StagedEngagementImpact,
  StagedEngagementRemoval,
  StagedPersonUpdate,
  StagedTestimonial,
} from '@/payload-types'

type ReviewStatus = 'approved' | 'pending' | 'rejected'

type ReviewBundle = {
  engagements: StagedEngagement[]
  impacts: StagedEngagementImpact[]
  personUpdates: StagedPersonUpdate[]
  removals: StagedEngagementRemoval[]
  submission: CommunitySubmission
  testimonials: StagedTestimonial[]
}

type ReviewClientProps = {
  initialReview: ReviewBundle
  submissionId: string
}

type EditMap = Record<
  string,
  {
    reviewNotes: string
    reviewStatus: ReviewStatus
  }
>

type SectionConfig = {
  collection:
    | 'staged-person-updates'
    | 'staged-engagements'
    | 'staged-engagement-removals'
    | 'staged-testimonials'
    | 'staged-engagement-impacts'
  items:
    | StagedPersonUpdate[]
    | StagedEngagement[]
    | StagedEngagementRemoval[]
    | StagedTestimonial[]
    | StagedEngagementImpact[]
  title: string
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function itemKey(collection: string, id: number | string): string {
  return `${collection}:${id}`
}

async function requestJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init)
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>
  if (!response.ok) {
    const error = typeof body.error === 'string' ? body.error : 'Request failed.'
    throw new Error(error)
  }
  return body as T
}

function buildInitialEditMap(review: ReviewBundle): EditMap {
  const map: EditMap = {}
  const sections: SectionConfig[] = [
    {
      collection: 'staged-person-updates',
      items: review.personUpdates,
      title: 'Profile Updates',
    },
    {
      collection: 'staged-engagements',
      items: review.engagements,
      title: 'Engagements',
    },
    {
      collection: 'staged-engagement-removals',
      items: review.removals,
      title: 'Engagement Removals',
    },
    {
      collection: 'staged-testimonials',
      items: review.testimonials,
      title: 'Testimonials',
    },
    {
      collection: 'staged-engagement-impacts',
      items: review.impacts,
      title: 'Engagement Impacts',
    },
  ]

  for (const section of sections) {
    for (const item of section.items) {
      map[itemKey(section.collection, item.id)] = {
        reviewNotes: item.reviewNotes || '',
        reviewStatus: item.reviewStatus,
      }
    }
  }

  return map
}

export function CommunityReviewClient({ initialReview, submissionId }: ReviewClientProps) {
  const [review, setReview] = useState<ReviewBundle>(initialReview)
  const [editMap, setEditMap] = useState<EditMap>(() => buildInitialEditMap(initialReview))
  const [reviewNotes, setReviewNotes] = useState(initialReview.submission.reviewNotes || '')
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const sections = useMemo<SectionConfig[]>(
    () => [
      {
        collection: 'staged-person-updates',
        items: review.personUpdates,
        title: 'Profile Updates',
      },
      {
        collection: 'staged-engagements',
        items: review.engagements,
        title: 'Engagements',
      },
      {
        collection: 'staged-engagement-removals',
        items: review.removals,
        title: 'Engagement Removals',
      },
      {
        collection: 'staged-testimonials',
        items: review.testimonials,
        title: 'Testimonials',
      },
      {
        collection: 'staged-engagement-impacts',
        items: review.impacts,
        title: 'Engagement Impacts',
      },
    ],
    [review],
  )

  async function refreshReview(): Promise<void> {
    const result = await requestJSON<{ review: ReviewBundle }>(
      `/api/community-edit/admin/review/${encodeURIComponent(submissionId)}`,
    )
    setReview(result.review)
    setEditMap(buildInitialEditMap(result.review))
    setReviewNotes(result.review.submission.reviewNotes || '')
  }

  async function saveItem(args: {
    collection:
      | 'staged-person-updates'
      | 'staged-engagements'
      | 'staged-engagement-removals'
      | 'staged-testimonials'
      | 'staged-engagement-impacts'
    id: number | string
  }): Promise<void> {
    const key = itemKey(args.collection, args.id)
    const edit = editMap[key]
    if (!edit) return

    setBusyKey(key)
    setErrorMessage(null)
    setStatusMessage(null)
    try {
      await requestJSON(`/api/community-edit/admin/review/${encodeURIComponent(submissionId)}/item`, {
        body: JSON.stringify({
          collection: args.collection,
          id: args.id,
          reviewNotes: edit.reviewNotes,
          reviewStatus: edit.reviewStatus,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
      await refreshReview()
      setStatusMessage(`Saved review item ${args.id}.`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save review item.')
    } finally {
      setBusyKey(null)
    }
  }

  async function applyBulk(args: {
    collection:
      | 'staged-person-updates'
      | 'staged-engagements'
      | 'staged-engagement-removals'
      | 'staged-testimonials'
      | 'staged-engagement-impacts'
    reviewStatus: ReviewStatus
  }): Promise<void> {
    const key = `bulk:${args.collection}:${args.reviewStatus}`
    setBusyKey(key)
    setErrorMessage(null)
    setStatusMessage(null)
    try {
      const result = await requestJSON<{ updatedCount: number }>(
        `/api/community-edit/admin/review/${encodeURIComponent(submissionId)}/bulk`,
        {
          body: JSON.stringify({
            collection: args.collection,
            reviewStatus: args.reviewStatus,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        },
      )
      await refreshReview()
      setStatusMessage(`Updated ${result.updatedCount} items in ${args.collection}.`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to apply bulk review status.')
    } finally {
      setBusyKey(null)
    }
  }

  async function applySubmission(): Promise<void> {
    setBusyKey('apply')
    setErrorMessage(null)
    setStatusMessage(null)
    try {
      const result = await requestJSON<{
        result: {
          outcome: 'approved' | 'partial' | 'rejected'
        }
      }>(`/api/community-edit/admin/review/${encodeURIComponent(submissionId)}/apply`, {
        body: JSON.stringify({
          reviewNotes,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
      await refreshReview()
      setStatusMessage(`Submission applied with outcome: ${result.result.outcome}.`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to apply submission.')
    } finally {
      setBusyKey(null)
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <Link
        href="/admin/community-review"
        className="text-sm text-muted-foreground hover:text-foreground underline"
      >
        &larr; All Submissions
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Community Submission Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">Submission:</span>
            <span className="font-medium">#{review.submission.id}</span>
            <Badge variant="outline">{review.submission.status}</Badge>
          </div>
          <div className="text-muted-foreground">
            <strong>Email:</strong> {review.submission.email}
          </div>
          <div className="text-muted-foreground">
            <strong>Verified:</strong> {review.submission.verifiedEmail ? 'Yes' : 'No'}
          </div>
          <div className="space-y-2 pt-2">
            <label className="text-xs uppercase tracking-wide text-muted-foreground">
              Reviewer Notes
            </label>
            <textarea
              className="min-h-24 w-full rounded-md border px-3 py-2 text-sm"
              value={reviewNotes}
              onChange={(event) => setReviewNotes(event.target.value)}
              placeholder="High-level notes for the submitter"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void refreshReview()} disabled={busyKey !== null}>
              Refresh
            </Button>
            <Button type="button" onClick={() => void applySubmission()} disabled={busyKey !== null}>
              {busyKey === 'apply' ? 'Applying...' : 'Apply Submission'}
            </Button>
          </div>
          {statusMessage ? (
            <div className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-green-700">
              {statusMessage}
            </div>
          ) : null}
          {errorMessage ? (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-700">
              {errorMessage}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {sections.map((section) => (
        <Card key={section.collection}>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>{section.title}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={busyKey !== null}
                  onClick={() =>
                    void applyBulk({
                      collection: section.collection,
                      reviewStatus: 'approved',
                    })
                  }
                >
                  Approve All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busyKey !== null}
                  onClick={() =>
                    void applyBulk({
                      collection: section.collection,
                      reviewStatus: 'rejected',
                    })
                  }
                >
                  Reject All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {section.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No staged items in this section.</p>
            ) : (
              <div className="space-y-4">
                {section.items.map((item) => {
                  const key = itemKey(section.collection, item.id)
                  const edit = editMap[key] || {
                    reviewNotes: item.reviewNotes || '',
                    reviewStatus: item.reviewStatus,
                  }

                  return (
                    <div key={key} className="rounded-md border p-3 space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>ID: {item.id}</span>
                        <Badge variant="outline">{item.reviewStatus}</Badge>
                      </div>

                      {'field' in item ? (
                        <div className="text-sm space-y-2">
                          <div>
                            <strong>Field:</strong> {item.field}
                          </div>
                          <div>
                            <strong>Current:</strong>
                            <pre className="mt-1 whitespace-pre-wrap rounded bg-muted p-2 text-xs">
                              {formatValue(decodeStagedProfileValue(item.currentValue))}
                            </pre>
                          </div>
                          <div>
                            <strong>Proposed:</strong>
                            <pre className="mt-1 whitespace-pre-wrap rounded bg-muted p-2 text-xs">
                              {formatValue(decodeStagedProfileValue(item.proposedValue))}
                            </pre>
                          </div>
                        </div>
                      ) : null}

                      {'operation' in item ? (
                        <div className="text-sm space-y-1">
                          <div>
                            <strong>Operation:</strong> {item.operation}
                          </div>
                          <div>
                            <strong>Type:</strong> {item.type}
                          </div>
                          <div>
                            <strong>Context:</strong> {formatValue(item.context)}
                          </div>
                          <div>
                            <strong>Status:</strong> {item.engagement_status || '-'}
                          </div>
                        </div>
                      ) : null}

                      {'reason' in item ? (
                        <div className="text-sm space-y-1">
                          <div>
                            <strong>Engagement:</strong> {formatValue(item.engagement)}
                          </div>
                          <div>
                            <strong>Reason:</strong> {item.reason}
                          </div>
                        </div>
                      ) : null}

                      {'quote' in item ? (
                        <div className="text-sm space-y-1">
                          <div>
                            <strong>Quote:</strong> {item.quote}
                          </div>
                          <div>
                            <strong>Context:</strong> {formatValue(item.context)}
                          </div>
                          <div>
                            <strong>Consent:</strong> {item.consentToPublish ? 'Yes' : 'No'}
                          </div>
                        </div>
                      ) : null}

                      {'summary' in item ? (
                        <div className="text-sm space-y-1">
                          <div>
                            <strong>Type:</strong> {item.type}
                          </div>
                          <div>
                            <strong>Summary:</strong> {item.summary}
                          </div>
                          {'engagement' in item && item.engagement ? (
                            <div>
                              <strong>Engagement:</strong> {formatValue(item.engagement)}
                            </div>
                          ) : null}
                          {'stagedEngagement' in item && item.stagedEngagement ? (
                            <div>
                              <strong>Staged Engagement:</strong> {formatValue(item.stagedEngagement)}
                            </div>
                          ) : null}
                          <div>
                            <strong>AISSA Influence:</strong> {item.aissaInfluenceScore || '-'}
                          </div>
                        </div>
                      ) : null}

                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs uppercase tracking-wide text-muted-foreground">
                            Review Status
                          </label>
                          <select
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            value={edit.reviewStatus}
                            disabled={busyKey !== null}
                            onChange={(event) => {
                              const nextStatus = event.target.value as ReviewStatus
                              setEditMap((current) => ({
                                ...current,
                                [key]: {
                                  reviewNotes: edit.reviewNotes,
                                  reviewStatus: nextStatus,
                                },
                              }))
                            }}
                          >
                            <option value="pending">pending</option>
                            <option value="approved">approved</option>
                            <option value="rejected">rejected</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs uppercase tracking-wide text-muted-foreground">
                            Review Notes
                          </label>
                          <textarea
                            className="min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                            value={edit.reviewNotes}
                            disabled={busyKey !== null}
                            onChange={(event) =>
                              setEditMap((current) => ({
                                ...current,
                                [key]: {
                                  reviewNotes: event.target.value,
                                  reviewStatus: edit.reviewStatus,
                                },
                              }))
                            }
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        disabled={busyKey !== null}
                        onClick={() =>
                          void saveItem({
                            collection: section.collection,
                            id: item.id,
                          })
                        }
                      >
                        Save Item
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
