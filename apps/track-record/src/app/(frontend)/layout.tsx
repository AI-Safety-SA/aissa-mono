import React from 'react'
import '@repo/ui/styles.css'
import './globals.css'
import { cookies } from 'next/headers'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { PasswordGateForm } from '@/components/frontend/password-gate-form'
import { ThemeScript } from '@/components/theme-script'
import {
  delayFailedFrontendGateAttempt,
  FRONTEND_GATE_COOKIE_MAX_AGE_SECONDS,
  FRONTEND_GATE_COOKIE_NAME,
  createFrontendGateCookieValue,
  getFrontendGateConfig,
  isFrontendGateCookieValid,
  isFrontendGatePasswordValid,
  isSafeFrontendReturnPath,
} from '@/utilities/frontend-gate'

export const metadata = {
  description: 'AI Safety South Africa - Track Record Dashboard',
  title: 'AISSA Track Record',
  icons: {
    icon: '/icon.png',
  },
}

export const dynamic = 'force-dynamic'

type UnlockState = {
  error: string | null
  redirectTo?: string | null
}

async function unlockFrontendGate(_: UnlockState, formData: FormData): Promise<UnlockState> {
  'use server'

  const config = getFrontendGateConfig()
  if (config.status !== 'enabled') {
    return {
      error: 'Frontend gate is not currently enabled.',
    }
  }

  const password = String(formData.get('password') ?? '')
  const returnToRaw = String(formData.get('returnTo') ?? '/')
  const returnTo = isSafeFrontendReturnPath(returnToRaw) ? returnToRaw : '/'

  if (!isFrontendGatePasswordValid(password, config.password)) {
    await delayFailedFrontendGateAttempt()
    return {
      error: 'Invalid password. Please try again.',
    }
  }

  const cookieStore = await cookies()
  cookieStore.set(FRONTEND_GATE_COOKIE_NAME, createFrontendGateCookieValue(), {
    httpOnly: true,
    maxAge: FRONTEND_GATE_COOKIE_MAX_AGE_SECONDS,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  // Return redirectTo instead of calling redirect() — this lets the client do a hard
  // page reload, avoiding React reconciling two incompatible root layout structures.
  return { error: null, redirectTo: returnTo }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const config = getFrontendGateConfig()

  if (config.status === 'misconfigured') {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen bg-background">
          <ThemeScript />
          <main className="flex min-h-screen items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-lg rounded-lg border bg-card p-6">
              <h1 className="text-xl font-semibold mb-2">Frontend Gate Misconfigured</h1>
              <p className="text-sm text-muted-foreground">{config.message}</p>
            </div>
          </main>
        </body>
      </html>
    )
  }

  const cookieStore = await cookies()
  const gateCookie = cookieStore.get(FRONTEND_GATE_COOKIE_NAME)?.value
  const isUnlocked = config.status === 'disabled' || isFrontendGateCookieValid(gateCookie)

  if (!isUnlocked) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen bg-background">
          <ThemeScript />
          <main className="flex min-h-screen items-center justify-center p-4 sm:p-6">
            <React.Suspense fallback={null}>
              <PasswordGateForm action={unlockFrontendGate} />
            </React.Suspense>
          </main>
        </body>
      </html>
    )
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background flex flex-col">
        <ThemeScript />
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
