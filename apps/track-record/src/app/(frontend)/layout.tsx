import React from 'react'
import '@repo/ui/styles.css'
import './globals.css'
import { cookies } from 'next/headers'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { PasswordGateForm } from '@/components/frontend/password-gate-form'
import { ThemeScript } from '@/components/theme-script'
import {
  FRONTEND_GATE_COOKIE_NAME,
  getFrontendAudienceCapabilities,
  getFrontendGateCookieAudience,
  getFrontendGateConfig,
  isFrontendGateCookieValid,
} from '@/utilities/frontend-gate'

export const metadata = {
  description: 'AI Safety South Africa - Track Record Dashboard',
  title: 'AISSA Track Record',
  icons: {
    icon: '/icon.png',
  },
}

export const dynamic = 'force-dynamic'

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
  const audience =
    config.status === 'disabled' ? 'funder' : getFrontendGateCookieAudience(gateCookie) || 'community'
  const capabilities = getFrontendAudienceCapabilities(audience)

  if (!isUnlocked) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen bg-background">
          <ThemeScript />
          <main className="flex min-h-screen items-center justify-center p-4 sm:p-6">
            <React.Suspense fallback={null}>
              <PasswordGateForm />
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
        <Navigation canViewFundingDetails={capabilities.canViewFundingDetails} />
        <main className="flex-1">{children}</main>
        <Footer
          canViewFundingDetails={capabilities.canViewFundingDetails}
          showLockAction={config.status === 'enabled'}
        />
      </body>
    </html>
  )
}
