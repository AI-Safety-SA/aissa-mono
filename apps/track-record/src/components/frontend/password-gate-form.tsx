'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import {
  FRONTEND_GATE_ERROR_SEARCH_PARAM,
  type FrontendGateErrorCode,
} from '@/utilities/frontend-gate-shared'

function getErrorMessage(errorCode: string | null): string | null {
  if (!errorCode) return null

  const normalizedCode = errorCode as FrontendGateErrorCode
  if (normalizedCode === 'invalid') {
    return 'Invalid password. Please try again.'
  }

  if (normalizedCode === 'unavailable') {
    return 'Frontend gate is not currently enabled.'
  }

  return null
}

export function PasswordGateForm() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const returnParams = new URLSearchParams(searchParams.toString())
  const errorMessage = getErrorMessage(returnParams.get(FRONTEND_GATE_ERROR_SEARCH_PARAM))
  returnParams.delete(FRONTEND_GATE_ERROR_SEARCH_PARAM)
  const returnTo = `${pathname}${returnParams.toString() ? `?${returnParams.toString()}` : ''}`

  return (
    <form
      action="/frontend-gate/unlock"
      method="post"
      className="w-full max-w-sm space-y-4 rounded-lg border p-6 bg-card"
    >
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
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <button
        type="submit"
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Unlock Site
      </button>
    </form>
  )
}
