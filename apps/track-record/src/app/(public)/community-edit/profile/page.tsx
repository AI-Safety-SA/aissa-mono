'use client'
import { DataConsentControls } from '../_components/data-consent-controls'

import type { ChangeEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CommunityEditShell } from '../_components/community-edit-shell'
import { ProfilePhotoField } from '../_components/profile-photo-field'
import { FormInput, FormTextarea } from '../_components/form-controls'
import {
  getCommunityEditSession,
  getPersonData,
  stageProfile,
  uploadCommunityHeadshot,
} from '../_lib/api'
import { getCommunityEditDraft, patchCommunityEditDraft } from '../_lib/draft'
import type { ProfileTextField } from '../_lib/profile-types'
import {
  type CurrentProfile,
  type ProfileFormState,
  EMPTY_PROFILE_STATE,
  buildProfileUpdates,
  isProfileFieldChanged,
  mergeProfileDrafts,
  profileStateFromCurrent,
  validateProfileForm,
} from '../_lib/profile-diff'

function getDisplayName(form: ProfileFormState, currentProfile: CurrentProfile | null): string {
  const candidates = [
    form.preferredName,
    form.fullName,
    currentProfile?.preferredName ?? '',
    currentProfile?.fullName ?? '',
  ]

  return (
    candidates.map((value) => value.trim()).find((value) => value.length > 0) ?? 'Community member'
  )
}

function getHeadshotAltText(form: ProfileFormState, currentProfile: CurrentProfile | null): string {
  return `${getDisplayName(form, currentProfile)} headshot`
}

function getInitials(form: ProfileFormState, currentProfile: CurrentProfile | null): string {
  return getDisplayName(form, currentProfile)
    .split(/\s+/)
    .map((segment) => segment[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function CommunityEditProfilePage() {
  const router = useRouter()
  const headshotInputRef = useRef<HTMLInputElement | null>(null)
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [form, setForm] = useState<ProfileFormState>(EMPTY_PROFILE_STATE)
  const [currentProfile, setCurrentProfile] = useState<CurrentProfile | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingHeadshot, setIsUploadingHeadshot] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [headshotError, setHeadshotError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSession() {
      try {
        const session = await getCommunityEditSession()
        setSessionEmail(session.submission.email)
      } catch {
        router.replace('/community-edit/verify')
        return
      }

      try {
        const personData = await getPersonData()
        const currentFromCanonical = personData.person
          ? (personData.person as CurrentProfile)
          : null
        setCurrentProfile(currentFromCanonical)

        const canonicalForm = profileStateFromCurrent(currentFromCanonical)
        const draft = getCommunityEditDraft()

        setForm(
          mergeProfileDrafts({
            canonical: canonicalForm,
            localDraft: draft.profile,
            submissionDraft: personData.draftProfile,
          }),
        )
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : 'Unable to load your current profile.',
        )
      } finally {
        setIsLoadingSession(false)
      }
    }

    void loadSession()
  }, [router])

  const updates = useMemo(() => {
    return buildProfileUpdates(form, currentProfile)
  }, [form, currentProfile])

  function persistProfileDraft(nextForm: ProfileFormState) {
    patchCommunityEditDraft({ profile: nextForm })
  }

  function setTextField(field: ProfileTextField, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function setHeadshot(headshot: ProfileFormState['headshot']) {
    setForm((current) => {
      const next = {
        ...current,
        headshot,
      }
      persistProfileDraft(next)
      return next
    })
  }

  function openHeadshotPicker() {
    headshotInputRef.current?.click()
  }

  function resetHeadshotToCurrent() {
    setHeadshotError(null)
    setHeadshot(currentProfile?.headshot ?? null)
  }

  async function handleHeadshotSelection(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target
    const file = input.files?.[0]
    input.value = ''

    if (!file) return

    setError(null)
    setHeadshotError(null)
    setIsUploadingHeadshot(true)

    try {
      const result = await uploadCommunityHeadshot({
        alt: getHeadshotAltText(form, currentProfile),
        file,
      })
      setHeadshot(result.media)
    } catch (uploadError) {
      setHeadshotError(
        uploadError instanceof Error ? uploadError.message : 'Unable to upload headshot.',
      )
    } finally {
      setIsUploadingHeadshot(false)
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const validationError = validateProfileForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    if (updates.length === 0) {
      setError('Add at least one profile update, or use Skip.')
      return
    }

    setIsSubmitting(true)
    try {
      await stageProfile({ updates })
      persistProfileDraft(form)
      router.push('/community-edit/engagements')
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Unable to stage profile updates.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function currentLabel(field: ProfileTextField): string | null {
    if (!currentProfile) return null
    const value = currentProfile[field]
    if (!value || value.trim() === '') return null
    return value
  }

  function fieldDifferenceHint(field: ProfileTextField): string | null {
    if (!currentProfile) return null

    const canonical = currentLabel(field)
    const changed = isProfileFieldChanged(field, form, currentProfile)
    if (!changed) return 'Unchanged from canonical value.'

    const canonicalPreview = canonical
      ? canonical.length > 100
        ? `${canonical.slice(0, 100)}...`
        : canonical
      : 'not set'

    return `Changed from canonical (${canonicalPreview}).`
  }

  function renderFieldDifferenceHint(field: ProfileTextField) {
    const hint = fieldDifferenceHint(field)
    if (!hint) return null
    return <p className="m-0 text-xs text-muted-foreground">{hint}</p>
  }

  if (isLoadingSession) {
    return (
      <CommunityEditShell
        step={3}
        title="Update Profile"
        description="Loading your verified session..."
      >
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Loading session...
          </CardContent>
        </Card>
      </CommunityEditShell>
    )
  }

  const displayName = getDisplayName(form, currentProfile)
  const headshot = form.headshot
  const canonicalHeadshot = currentProfile?.headshot ?? null
  const initials = getInitials(form, currentProfile)

  return (
    <CommunityEditShell
      step={3}
      title="Update Profile"
      description="Review your current details, refine the basics, and upload a fresh headshot if needed. Draft values resume from your latest saved submission."
    >
      <Card>
        <CardHeader className="space-y-3">
          <div className="space-y-1">
            <CardTitle className="text-xl">Profile Changes</CardTitle>
            <p className="m-0 text-sm text-muted-foreground">
              We only stage fields that differ from the canonical profile or your latest draft.
            </p>
          </div>
          {sessionEmail ? (
            <p className="m-0 text-sm text-muted-foreground">Verified as {sessionEmail}</p>
          ) : null}
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[320px,1fr]">
              <ProfilePhotoField
                canonicalHeadshot={canonicalHeadshot}
                displayName={displayName}
                headshot={headshot}
                headshotError={headshotError}
                headshotInputRef={headshotInputRef}
                initials={initials}
                isSubmitting={isSubmitting}
                isUploadingHeadshot={isUploadingHeadshot}
                onHeadshotSelection={(event) => void handleHeadshotSelection(event)}
                onOpenPicker={openHeadshotPicker}
                onRemove={() => {
                  setHeadshotError(null)
                  setHeadshot(null)
                }}
                onReset={resetHeadshotToCurrent}
              />

              <div className="space-y-6">
                <div className="rounded-xl border p-4">
                  <div className="mb-4 space-y-1">
                    <h2 className="m-0 text-base font-semibold">Identity</h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <FormInput
                        value={form.fullName}
                        required
                        onChange={(event) => setTextField('fullName', event.target.value)}
                      />
                      {renderFieldDifferenceHint('fullName')}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Preferred Name</label>
                      <FormInput
                        value={form.preferredName}
                        onChange={(event) => setTextField('preferredName', event.target.value)}
                      />
                      {renderFieldDifferenceHint('preferredName')}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Person Tag</label>
                      <FormInput
                        value={form.personTag}
                        onChange={(event) => setTextField('personTag', event.target.value)}
                      />
                      {renderFieldDifferenceHint('personTag')}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Organisation</label>
                      <FormInput
                        value={form.organisation}
                        onChange={(event) => setTextField('organisation', event.target.value)}
                      />
                      {renderFieldDifferenceHint('organisation')}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border p-4">
                  <div className="mb-4 space-y-1">
                    <h2 className="m-0 text-base font-semibold">Public Profile</h2>
                    <p className="m-0 text-sm text-muted-foreground">
                      These details help reviewers understand how the refreshed profile should read.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Website URL</label>
                      <FormInput
                        value={form.websiteUrl}
                        placeholder="https://..."
                        onChange={(event) => setTextField('websiteUrl', event.target.value)}
                      />
                      {renderFieldDifferenceHint('websiteUrl')}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bio</label>
                      <FormTextarea
                        value={form.bio}
                        onChange={(event) => setTextField('bio', event.target.value)}
                      />
                      {renderFieldDifferenceHint('bio')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSubmitting || isUploadingHeadshot}>
                {isSubmitting ? 'Saving...' : 'Save and Continue'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isUploadingHeadshot}
                onClick={() => {
                  persistProfileDraft(form)
                  router.push('/community-edit/engagements')
                }}
              >
                Skip for Now
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <DataConsentControls />
    </CommunityEditShell>
  )
}
