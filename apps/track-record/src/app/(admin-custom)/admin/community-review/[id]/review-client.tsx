'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatContextName } from '@/lib/context-name'
import {
  getCommunityApplyReadiness,
  isReviewItemResolved,
} from '@/utilities/community/apply-readiness'
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
type DeletionReviewStatus = 'approved' | 'pending' | 'rejected'

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

type SectionCollectionSlug =
  | 'staged-person-updates'
  | 'staged-engagements'
  | 'staged-engagement-removals'
  | 'staged-testimonials'
  | 'staged-engagement-impacts'

type SectionConfig = {
  collection: SectionCollectionSlug
  items:
    | StagedPersonUpdate[]
    | StagedEngagement[]
    | StagedEngagementRemoval[]
    | StagedTestimonial[]
    | StagedEngagementImpact[]
  title: string
}

type SubmissionConsentView = {
  deletionRequested: boolean
  deletionRequestedAt: string | null
  deletionReviewNotes: string
  deletionReviewStatus: 'not_requested' | 'pending' | 'approved' | 'rejected'
  displayToFundersConsentRequested: boolean
  shareWithPartnersConsentRequested: boolean
}

type ApplyResultSummary = {
  applied: {
    consents: number
    deletions: number
    engagements: number
    generalTestimonials: number
    impacts: number
    personUpdates: number
    removals: number
    testimonials: number
  }
  deletionHandling: 'not_requested' | 'applied' | 'rejected_identity_mismatch' | 'apply_failed'
  outcome: 'approved' | 'partial' | 'rejected'
  pendingCount: number
  rejectedCount: number
}

function getSubmissionConsentView(submission: CommunitySubmission): SubmissionConsentView {
  const deletionReviewStatus =
    submission.deletionReviewStatus === 'pending' ||
    submission.deletionReviewStatus === 'approved' ||
    submission.deletionReviewStatus === 'rejected' ||
    submission.deletionReviewStatus === 'not_requested'
      ? submission.deletionReviewStatus
      : 'not_requested'

  return {
    deletionRequested: submission.deletionRequested ?? false,
    deletionRequestedAt: submission.deletionRequestedAt ?? null,
    deletionReviewNotes: submission.deletionReviewNotes ?? '',
    deletionReviewStatus,
    displayToFundersConsentRequested: submission.displayToFundersConsentRequested ?? false,
    shareWithPartnersConsentRequested: submission.shareWithPartnersConsentRequested ?? false,
  }
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

function getItemValidationMessage(edit: {
  reviewNotes: string
  reviewStatus: ReviewStatus
}): string | null {
  if (edit.reviewStatus === 'rejected' && edit.reviewNotes.trim().length === 0) {
    return 'Rejection note is required when status is rejected.'
  }
  return null
}

function getItemStateClassName(status: ReviewStatus): string {
  if (status === 'approved') {
    return 'border-emerald-500/70 bg-emerald-500/5'
  }
  if (status === 'rejected') {
    return 'border-rose-500/70 bg-rose-500/5'
  }
  return 'border-amber-500/70 bg-amber-500/5'
}

function getItemStatusBadgeVariant(
  status: ReviewStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'approved') return 'default'
  if (status === 'rejected') return 'destructive'
  return 'secondary'
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialConsentView = getSubmissionConsentView(initialReview.submission)
  const [review, setReview] = useState<ReviewBundle>(initialReview)
  const [editMap, setEditMap] = useState<EditMap>(() => buildInitialEditMap(initialReview))
  const [reviewNotes, setReviewNotes] = useState(initialReview.submission.reviewNotes || '')
  const [deletionReviewStatus, setDeletionReviewStatus] = useState<DeletionReviewStatus>(
    initialConsentView.deletionReviewStatus === 'not_requested'
      ? 'pending'
      : initialConsentView.deletionReviewStatus,
  )
  const [deletionReviewNotes, setDeletionReviewNotes] = useState(
    initialConsentView.deletionReviewNotes,
  )
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [applyResult, setApplyResult] = useState<ApplyResultSummary | null>(null)
  const [sectionViewOverrides, setSectionViewOverrides] = useState<
    Partial<Record<SectionCollectionSlug, 'collapsed' | 'expanded'>>
  >({})
  const [returnRefreshToken, setReturnRefreshToken] = useState<string | null>(null)

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

  const submissionConsentView = useMemo(
    () => getSubmissionConsentView(review.submission),
    [review.submission],
  )

  const applyReadiness = useMemo(() => getCommunityApplyReadiness(review), [review])

  const sectionAutoCollapsed = useMemo<Record<SectionCollectionSlug, boolean>>(() => {
    const result: Record<SectionCollectionSlug, boolean> = {
      'staged-engagement-impacts': false,
      'staged-engagement-removals': false,
      'staged-engagements': false,
      'staged-person-updates': false,
      'staged-testimonials': false,
    }

    for (const section of sections) {
      result[section.collection] =
        section.items.length > 0 &&
        section.items.every((item) =>
          isReviewItemResolved({
            reviewNotes: item.reviewNotes,
            reviewStatus: item.reviewStatus,
          }),
        )
    }

    return result
  }, [sections])

  const refreshMarker = searchParams.get('refresh')

  const refreshReview = useCallback(async (): Promise<void> => {
    const result = await requestJSON<{ review: ReviewBundle }>(
      `/api/community-edit/admin/review/${encodeURIComponent(submissionId)}`,
    )
    setReview(result.review)
    setEditMap(buildInitialEditMap(result.review))
    setReviewNotes(result.review.submission.reviewNotes || '')
    const consentView = getSubmissionConsentView(result.review.submission)
    setDeletionReviewStatus(
      consentView.deletionReviewStatus === 'not_requested'
        ? 'pending'
        : consentView.deletionReviewStatus,
    )
    setDeletionReviewNotes(consentView.deletionReviewNotes)
  }, [submissionId])

  useEffect(() => {
    if (!refreshMarker) return

    void refreshReview().catch(() => {
      setErrorMessage('Unable to refresh submission state.')
    })
  }, [refreshMarker, refreshReview])

  async function saveDeletionReview(): Promise<void> {
    if (!submissionConsentView.deletionRequested) return

    setBusyKey('deletion')
    setErrorMessage(null)
    setStatusMessage(null)
    try {
      await requestJSON(
        `/api/community-edit/admin/review/${encodeURIComponent(submissionId)}/deletion`,
        {
          body: JSON.stringify({
            deletionReviewNotes,
            deletionReviewStatus,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        },
      )
      await refreshReview()
      setStatusMessage('Saved critical deletion review.')
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to save critical deletion review.',
      )
    } finally {
      setBusyKey(null)
    }
  }

  async function saveItem(args: {
    collection: SectionCollectionSlug
    id: number | string
  }): Promise<void> {
    const key = itemKey(args.collection, args.id)
    const edit = editMap[key]
    if (!edit) return
    const validationMessage = getItemValidationMessage(edit)
    if (validationMessage) {
      setErrorMessage(validationMessage)
      return
    }

    setBusyKey(key)
    setErrorMessage(null)
    setStatusMessage(null)
    try {
      await requestJSON(
        `/api/community-edit/admin/review/${encodeURIComponent(submissionId)}/item`,
        {
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
        },
      )
      await refreshReview()
      setStatusMessage(`Saved review item ${args.id}.`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save review item.')
    } finally {
      setBusyKey(null)
    }
  }

  async function applyBulk(args: {
    collection: SectionCollectionSlug
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
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to apply bulk review status.',
      )
    } finally {
      setBusyKey(null)
    }
  }

  async function applySubmission(): Promise<void> {
    setBusyKey('apply')
    setErrorMessage(null)
    setStatusMessage(null)
    setApplyResult(null)
    try {
      const result = await requestJSON<{
        result: ApplyResultSummary
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
      setApplyResult(result.result)
      setReturnRefreshToken(String(Date.now()))
      setStatusMessage(`Submission applied with outcome: ${result.result.outcome}.`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to apply submission.')
    } finally {
      setBusyKey(null)
    }
  }

  function getSectionCollapsed(collection: SectionCollectionSlug): boolean {
    const override = sectionViewOverrides[collection]
    if (override === 'expanded') return false
    if (override === 'collapsed') return true
    return sectionAutoCollapsed[collection]
  }

  function toggleSection(collection: SectionCollectionSlug): void {
    const collapsed = getSectionCollapsed(collection)
    setSectionViewOverrides((current) => ({
      ...current,
      [collection]: collapsed ? 'expanded' : 'collapsed',
    }))
  }

  const listHref = returnRefreshToken
    ? `/admin/community-review?refresh=${encodeURIComponent(returnRefreshToken)}`
    : '/admin/community-review'

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <Link
        href={listHref}
        prefetch={false}
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
          <div className="text-muted-foreground">
            <strong>Display to funders:</strong>{' '}
            {submissionConsentView.displayToFundersConsentRequested ? 'Yes' : 'No'}
          </div>
          <div className="text-muted-foreground">
            <strong>Share with partners:</strong>{' '}
            {submissionConsentView.shareWithPartnersConsentRequested ? 'Yes' : 'No'}
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
            <Button
              type="button"
              onClick={() => void applySubmission()}
              disabled={busyKey !== null || !applyReadiness.canApply}
            >
              {busyKey === 'apply' ? 'Applying...' : 'Apply Submission'}
            </Button>
          </div>
          {!applyReadiness.canApply ? (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-amber-900">
              {applyReadiness.reasons.map((reason) => (
                <p key={reason} className="m-0 text-sm">
                  {reason}
                </p>
              ))}
            </div>
          ) : null}
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

      {applyResult ? (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2">
              <span>Apply Result</span>
              <Badge
                variant={
                  applyResult.outcome === 'approved'
                    ? 'default'
                    : applyResult.outcome === 'rejected'
                      ? 'destructive'
                      : 'secondary'
                }
              >
                {applyResult.outcome}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="m-0 text-muted-foreground">
              <strong>Deletion handling:</strong> {applyResult.deletionHandling}
            </p>
            <div className="grid gap-2 md:grid-cols-2">
              <p className="m-0 text-muted-foreground">
                <strong>Pending after apply:</strong> {applyResult.pendingCount}
              </p>
              <p className="m-0 text-muted-foreground">
                <strong>Rejected after apply:</strong> {applyResult.rejectedCount}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <p className="m-0 text-muted-foreground">
                Person updates: {applyResult.applied.personUpdates}
              </p>
              <p className="m-0 text-muted-foreground">
                Engagements: {applyResult.applied.engagements}
              </p>
              <p className="m-0 text-muted-foreground">Removals: {applyResult.applied.removals}</p>
              <p className="m-0 text-muted-foreground">
                Testimonials: {applyResult.applied.testimonials}
              </p>
              <p className="m-0 text-muted-foreground">Impacts: {applyResult.applied.impacts}</p>
              <p className="m-0 text-muted-foreground">Consents: {applyResult.applied.consents}</p>
              <p className="m-0 text-muted-foreground">
                General testimonials: {applyResult.applied.generalTestimonials}
              </p>
              <p className="m-0 text-muted-foreground">
                Deletions: {applyResult.applied.deletions}
              </p>
            </div>
            <div className="pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  router.push(listHref)
                }}
              >
                Return to Submissions
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {submissionConsentView.deletionRequested ? (
        <Card className="border-red-500/40">
          <CardHeader>
            <CardTitle>Critical Deletion Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="m-0 text-muted-foreground">
              Submitter requested full anonymisation/deletion handling.
            </p>
            {submissionConsentView.deletionRequestedAt ? (
              <p className="m-0 text-muted-foreground">
                <strong>Requested at:</strong>{' '}
                {new Date(submissionConsentView.deletionRequestedAt).toLocaleString('en-ZA')}
              </p>
            ) : null}
            <div className="grid gap-2 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Deletion Review Status
                </label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={deletionReviewStatus}
                  disabled={busyKey !== null}
                  onChange={(event) =>
                    setDeletionReviewStatus(event.target.value as DeletionReviewStatus)
                  }
                >
                  <option value="pending">pending</option>
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Deletion Review Notes
                </label>
                <textarea
                  className="min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                  value={deletionReviewNotes}
                  disabled={busyKey !== null}
                  onChange={(event) => setDeletionReviewNotes(event.target.value)}
                />
              </div>
            </div>
            <Button
              type="button"
              disabled={busyKey !== null}
              onClick={() => void saveDeletionReview()}
            >
              Save Critical Review
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {sections.map((section) => {
        const collapsed = getSectionCollapsed(section.collection)
        const resolvedCount = section.items.filter((item) =>
          isReviewItemResolved({
            reviewNotes: item.reviewNotes,
            reviewStatus: item.reviewStatus,
          }),
        ).length

        return (
          <Card key={section.collection}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle>{section.title}</CardTitle>
                  {section.items.length > 0 ? (
                    <p className="m-0 text-xs text-muted-foreground">
                      {resolvedCount}/{section.items.length} resolved
                    </p>
                  ) : null}
                </div>
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
                    onClick={() => toggleSection(section.collection)}
                  >
                    {collapsed ? 'Expand' : 'Collapse'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {section.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">No staged items in this section.</p>
              ) : collapsed ? (
                <p className="text-sm text-muted-foreground">
                  Section collapsed. Expand to review or edit staged items.
                </p>
              ) : (
                <div className="space-y-4">
                  {section.items.map((item) => {
                    const key = itemKey(section.collection, item.id)
                    const edit = editMap[key] || {
                      reviewNotes: item.reviewNotes || '',
                      reviewStatus: item.reviewStatus,
                    }
                    const itemValidationMessage = getItemValidationMessage(edit)
                    const itemStatus = edit.reviewStatus

                    return (
                      <div
                        key={key}
                        className={`rounded-md border p-3 space-y-3 ${getItemStateClassName(itemStatus)}`}
                      >
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>ID: {item.id}</span>
                          <Badge variant={getItemStatusBadgeVariant(itemStatus)}>
                            {itemStatus}
                          </Badge>
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
                              <strong>Context:</strong>{' '}
                              {formatContextName(item.context, { includeKindLabel: true })}
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
                              <strong>Context:</strong>{' '}
                              {formatContextName(item.context, { includeKindLabel: true })}
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
                                <strong>Staged Engagement:</strong>{' '}
                                {formatValue(item.stagedEngagement)}
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
                              className={`min-h-20 w-full rounded-md border px-3 py-2 text-sm ${
                                itemValidationMessage ? 'border-rose-500/80' : ''
                              }`}
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
                            {itemValidationMessage ? (
                              <p className="m-0 text-xs text-rose-700">{itemValidationMessage}</p>
                            ) : null}
                          </div>
                        </div>

                        <Button
                          type="button"
                          disabled={busyKey !== null || Boolean(itemValidationMessage)}
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
        )
      })}
    </div>
  )
}
