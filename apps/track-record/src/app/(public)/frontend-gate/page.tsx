import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { PasswordGateForm } from '@/components/frontend/password-gate-form'
import { getFrontendGateConfig } from '@/utilities/frontend-gate'

export const dynamic = 'force-dynamic'

export default function FrontendGatePage() {
  const config = getFrontendGateConfig()
  const funderPassword = config.status === 'enabled' ? config.passwords.funder : null

  if (config.status === 'disabled') {
    redirect('/')
  }

  if (config.status === 'misconfigured' || !funderPassword) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-lg rounded-lg border bg-card p-6">
          <h1 className="mb-2 text-xl font-semibold">Frontend Gate Misconfigured</h1>
          <p className="text-sm text-muted-foreground">
            {config.status === 'misconfigured'
              ? config.message
              : 'The funder password is not configured. Set `FRONTEND_GATE_FUNDER_PASSWORD` or the legacy `FRONTEND_GATE_PASSWORD` to enable funder access.'}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
      <Suspense fallback={null}>
        <PasswordGateForm />
      </Suspense>
    </main>
  )
}
