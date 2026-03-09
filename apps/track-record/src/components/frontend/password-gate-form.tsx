'use client'

import { useActionState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

type PasswordGateState = {
  error: string | null
}

type PasswordGateFormProps = {
  action: (state: PasswordGateState, formData: FormData) => Promise<PasswordGateState>
}

const initialState: PasswordGateState = {
  error: null,
}

export function PasswordGateForm({ action }: PasswordGateFormProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [state, formAction, isPending] = useActionState(action, initialState)

  const returnTo = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`

  return (
    <form action={formAction} className="w-full max-w-sm space-y-4 rounded-lg border p-6 bg-card">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Enter Password</h1>
        <p className="text-sm text-muted-foreground">This site is currently protected.</p>
      </div>

      <input type="hidden" name="returnTo" value={returnTo} />

      <div className="space-y-2">
        <label htmlFor="site-password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="site-password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="off"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Checking...' : 'Unlock Site'}
      </button>
    </form>
  )
}
