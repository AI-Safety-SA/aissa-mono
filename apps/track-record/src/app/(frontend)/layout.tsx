import React from 'react'
import '@repo/ui/styles.css'
import './globals.css'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { PasswordGateForm } from '@/components/frontend/password-gate-form'
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

  redirect(returnTo)
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const config = getFrontendGateConfig()

  if (config.status === 'misconfigured') {
    return (
      <html lang="en" className="dark">
        <body className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-lg border bg-card p-6">
            <h1 className="text-xl font-semibold mb-2">Frontend Gate Misconfigured</h1>
            <p className="text-sm text-muted-foreground">{config.message}</p>
          </div>
        </body>
      </html>
    )
  }

  const cookieStore = await cookies()
  const gateCookie = cookieStore.get(FRONTEND_GATE_COOKIE_NAME)?.value
  const isUnlocked = config.status === 'disabled' || isFrontendGateCookieValid(gateCookie)

  if (!isUnlocked) {
    return (
      <html lang="en" className="dark">
        <body className="min-h-screen bg-background flex items-center justify-center p-4">
          <React.Suspense fallback={null}>
            <PasswordGateForm action={unlockFrontendGate} />
          </React.Suspense>
        </body>
      </html>
    )
  }

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
