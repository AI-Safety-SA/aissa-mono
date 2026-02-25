'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CommunityEditShell } from '../_components/community-edit-shell'
import { FormInput, FormTextarea } from '../_components/form-controls'
import { getCommunityEditSession, stageProfile } from '../_lib/api'
import { getCommunityEditDraft, patchCommunityEditDraft } from '../_lib/draft'

type ProfileFormState = {
  bio: string
  fullName: string
  organisation: string
  personTag: string
  preferredName: string
  websiteUrl: string
}

const EMPTY_PROFILE_STATE: ProfileFormState = {
  bio: '',
  fullName: '',
  organisation: '',
  personTag: '',
  preferredName: '',
  websiteUrl: '',
}

export default function CommunityEditProfilePage() {
  const router = useRouter()
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [form, setForm] = useState<ProfileFormState>(EMPTY_PROFILE_STATE)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSession() {
      try {
        const session = await getCommunityEditSession()
        setSessionEmail(session.submission.email)
      } catch {
        router.replace('/community-edit/verify')
        return
      }

      const draft = getCommunityEditDraft()
      setForm({
        ...EMPTY_PROFILE_STATE,
        ...draft.profile,
      })
      setIsLoadingSession(false)
    }

    void loadSession()
  }, [router])

  const updates = useMemo(() => {
    return (Object.entries(form) as Array<[keyof ProfileFormState, string]>)
      .filter(([, value]) => value.trim().length > 0)
      .map(([field, value]) => ({
        field,
        proposedValue: value.trim(),
      }))
  }, [form])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (updates.length === 0) {
      setError('Add at least one profile update, or use Skip.')
      return
    }

    setIsSubmitting(true)
    try {
      await stageProfile({ updates })
      patchCommunityEditDraft({ profile: form })
      router.push('/community-edit/engagements')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to stage profile updates.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function setField(field: keyof ProfileFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  if (isLoadingSession) {
    return (
      <CommunityEditShell
        step={3}
        title="Update Profile"
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
      step={3}
      title="Update Profile"
      description="Tell us what profile details need updating. Leave fields blank if no change is needed."
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Profile Changes</CardTitle>
          {sessionEmail ? <p className="text-sm text-muted-foreground m-0">Verified as {sessionEmail}</p> : null}
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <FormInput value={form.fullName} onChange={(event) => setField('fullName', event.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Preferred Name</label>
                <FormInput
                  value={form.preferredName}
                  onChange={(event) => setField('preferredName', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Person Tag</label>
                <FormInput value={form.personTag} onChange={(event) => setField('personTag', event.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Website URL</label>
                <FormInput
                  value={form.websiteUrl}
                  onChange={(event) => setField('websiteUrl', event.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Organisation</label>
                <FormInput
                  value={form.organisation}
                  onChange={(event) => setField('organisation', event.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Bio</label>
                <FormTextarea value={form.bio} onChange={(event) => setField('bio', event.target.value)} />
              </div>
            </div>

            {error ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save and Continue'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  patchCommunityEditDraft({ profile: form })
                  router.push('/community-edit/engagements')
                }}
              >
                Skip for Now
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </CommunityEditShell>
  )
}

