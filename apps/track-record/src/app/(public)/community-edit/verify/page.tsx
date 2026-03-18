'use client'

import { useEffect, useState } from 'react'
import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CommunityEditShell } from '../_components/community-edit-shell'
import { FormInput } from '../_components/form-controls'
import { communityEditVerify } from '../_lib/api'

export default function CommunityEditVerifyPage() {
  return (
    <Suspense fallback={<VerifyFallback />}>
      <CommunityEditVerifyForm />
    </Suspense>
  )
}

function VerifyFallback() {
  return (
    <CommunityEditShell
      step={2}
      title="Verify Your Email"
      description="Loading verification..."
    >
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Loading verification form...
        </CardContent>
      </Card>
    </CommunityEditShell>
  )
}

function CommunityEditVerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState(searchParams.get('token') || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function verifyToken(inputToken: string) {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await communityEditVerify({ token: inputToken })
      setSuccessMessage(
        result.profileMode === 'new'
          ? 'Email verified. We created a new profile for this email. Redirecting...'
          : 'Email verified. We found your profile. Redirecting...',
      )
      setTimeout(() => {
        router.push('/community-edit/profile')
      }, 600)
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : 'Verification failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const urlToken = searchParams.get('token')
    if (!urlToken) return
    setToken(urlToken)
    void verifyToken(urlToken)
    // We only want auto-verify on first load/query-token change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token.trim()) {
      setError('Verification token is required.')
      return
    }
    await verifyToken(token.trim())
  }

  return (
    <CommunityEditShell
      step={2}
      title="Verify Your Email"
      description="Paste your token or open this page from the verification email link to access or create your profile."
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Email Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Verification Token</label>
              <FormInput
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Paste token from email"
                required
              />
            </div>

            {error ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm">
                {successMessage}
              </div>
            ) : null}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying...' : 'Verify and Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </CommunityEditShell>
  )
}
