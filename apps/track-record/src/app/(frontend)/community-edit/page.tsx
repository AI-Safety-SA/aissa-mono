'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CommunityEditShell } from './_components/community-edit-shell'
import { FormInput } from './_components/form-controls'
import { communityEditStart } from './_lib/api'

export default function CommunityEditStartPage() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await communityEditStart({
        email,
        fullName: fullName || undefined,
      })
      setSuccessMessage(result.message)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to start submission.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CommunityEditShell
      step={1}
      title="Update Your AISSA Record"
      description="Enter your email to receive a verification link and start editing your profile."
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Start Community Edit</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <FormInput
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name (optional)</label>
              <FormInput
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your full name"
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

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Verification Email'}
              </Button>
              <Link href="/community-edit/verify" className="text-sm text-muted-foreground underline">
                I already have a token
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </CommunityEditShell>
  )
}

