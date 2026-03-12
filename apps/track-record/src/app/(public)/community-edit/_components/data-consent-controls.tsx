'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { COMMUNITY_SUPPORT_EMAIL } from '@/utilities/community/support-contact'
import {
  type CommunitySessionSummary,
  getCommunityEditSession,
  requestCommunityDeletion,
  stageConsent,
} from '../_lib/api'

function deletionStatusMessage(
  status: CommunitySessionSummary['deletionReviewStatus'],
): string | null {
  if (status === 'pending') return 'Deletion request pending critical admin review.'
  if (status === 'approved')
    return 'Deletion request approved and will be applied irreversibly on review apply.'
  if (status === 'rejected') {
    return `Deletion request was rejected because identity verification did not match. Contact ${COMMUNITY_SUPPORT_EMAIL} for support.`
  }
  return null
}

export function DataConsentControls() {
  const router = useRouter()
  const [session, setSession] = useState<CommunitySessionSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [displayToFunders, setDisplayToFunders] = useState(false)
  const [shareWithPartners, setShareWithPartners] = useState(false)
  const [isSavingConsent, setIsSavingConsent] = useState(false)
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [ackIrreversible, setAckIrreversible] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const loadSession = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await getCommunityEditSession()
      setSession(result.submission)
      setDisplayToFunders(result.submission.displayToFundersConsentRequested)
      setShareWithPartners(result.submission.shareWithPartnersConsentRequested)
    } catch {
      setSession(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadSession()
  }, [loadSession])

  const canEdit = useMemo(() => {
    return session?.verifiedEmail === true && session.status === 'draft'
  }, [session])

  const availabilityMessage = useMemo(() => {
    if (isLoading) return 'Loading session...'
    if (!session) return 'Start and verify your submission to manage consent and deletion settings.'
    if (session.status !== 'draft') {
      return `Controls are read-only while submission status is "${session.status}".`
    }
    if (!session.verifiedEmail) return 'Verify your email before changing consent settings.'
    return null
  }, [isLoading, session])

  async function saveConsentPreferences() {
    if (!canEdit) return

    setError(null)
    setStatusMessage(null)
    setIsSavingConsent(true)
    try {
      await stageConsent({
        displayToFunders,
        shareWithPartners,
      })
      setStatusMessage('Consent preferences saved to this submission.')
      setSession((current) =>
        current
          ? {
              ...current,
              displayToFundersConsentRequested: displayToFunders,
              shareWithPartnersConsentRequested: shareWithPartners,
            }
          : current,
      )
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Unable to save consent preferences.',
      )
    } finally {
      setIsSavingConsent(false)
    }
  }

  async function submitDeletionRequest() {
    if (!canEdit) return
    if (!ackIrreversible) {
      setError('Please confirm that deletion/anonymisation is irreversible.')
      return
    }

    setError(null)
    setStatusMessage(null)
    setIsSubmittingDelete(true)
    try {
      const result = await requestCommunityDeletion({
        acknowledgeIrreversible: true,
        mode: 'exit',
      })

      if (result.submitted) {
        router.push(result.nextPath || '/community-edit/deletion-requested')
        return
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Unable to submit deletion request.',
      )
    } finally {
      setIsSubmittingDelete(false)
    }
  }

  const deletionMessage = session ? deletionStatusMessage(session.deletionReviewStatus) : null

  return (
    <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
      <div className="space-y-4">
        <div>
          <h2 className="m-0 text-sm font-semibold uppercase tracking-wide">Data &amp; Consent</h2>
          <p className="m-0 mt-1 text-sm text-muted-foreground">
            Manage how your information may be used in funder/partner contexts, or request full
            anonymisation.
          </p>
        </div>

        {availabilityMessage ? (
          <div className="rounded-md border border-amber-500/30 bg-background px-3 py-2 text-xs text-muted-foreground">
            {availabilityMessage}
          </div>
        ) : null}

        {deletionMessage ? (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-700">
            {deletionMessage}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={displayToFunders}
              disabled={!canEdit || isSavingConsent || isSubmittingDelete}
              onChange={(event) => setDisplayToFunders(event.target.checked)}
            />
            Display to funders
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={shareWithPartners}
              disabled={!canEdit || isSavingConsent || isSubmittingDelete}
              onChange={(event) => setShareWithPartners(event.target.checked)}
            />
            Share with partners (future feature)
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={!canEdit || isSavingConsent || isSubmittingDelete}
            onClick={() => void saveConsentPreferences()}
          >
            {isSavingConsent ? 'Saving...' : 'Save Consent Preferences'}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!canEdit || isSavingConsent || isSubmittingDelete}
            onClick={() => {
              setIsDeleteConfirmOpen((current) => !current)
              setError(null)
              setStatusMessage(null)
            }}
          >
            Request Full Anonymisation
          </Button>
        </div>

        {isDeleteConfirmOpen ? (
          <div className="space-y-3 rounded-md border border-red-500/40 bg-red-500/10 p-3">
            <p className="m-0 text-sm">
              This action requests full anonymisation and exits this flow. AISSA reviewers only
              confirm your verified identity before irreversible anonymisation is applied.
            </p>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={ackIrreversible}
                onChange={(event) => setAckIrreversible(event.target.checked)}
                disabled={isSubmittingDelete}
              />
              I understand this request is irreversible once approved.
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="destructive"
                disabled={isSubmittingDelete}
                onClick={() => void submitDeletionRequest()}
              >
                {isSubmittingDelete ? 'Submitting...' : 'Request Full Anonymisation and Exit'}
              </Button>
            </div>
          </div>
        ) : null}

        {statusMessage ? (
          <div className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-700">
            {statusMessage}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  )
}
