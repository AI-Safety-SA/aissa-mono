import { Suspense } from 'react'
import '@repo/ui/styles.css'
import './globals.css'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { PasswordGateForm } from '@/components/frontend/password-gate-form'
import { ThemeScript } from '@/components/theme-script'
import { getFrontendGateConfig } from '@/utilities/frontend-gate'
import { getCurrentFrontendViewer } from '@/utilities/frontend-gate-server'

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
  const funderPassword = config.status === 'enabled' ? config.passwords.funder : null

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

  if (config.status === 'enabled' && !funderPassword) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen bg-background">
          <ThemeScript />
          <main className="flex min-h-screen items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-lg rounded-lg border bg-card p-6">
              <h1 className="text-xl font-semibold mb-2">Frontend Gate Misconfigured</h1>
              <p className="text-sm text-muted-foreground">
                The funder password is not configured. Set `FRONTEND_GATE_FUNDER_PASSWORD` or the
                legacy `FRONTEND_GATE_PASSWORD` to enable the primary gated experience.
              </p>
            </div>
          </main>
        </body>
      </html>
    )
  }

  const viewer = await getCurrentFrontendViewer()

  if (!viewer.isUnlocked) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen bg-background">
          <ThemeScript />
          <main className="flex min-h-screen items-center justify-center p-4 sm:p-6">
            <Suspense fallback={null}>
              <PasswordGateForm />
            </Suspense>
          </main>
        </body>
      </html>
    )
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background flex flex-col">
        <ThemeScript />
        <Navigation canViewFundingDetails={viewer.canViewFundingDetails} />
        <main className="flex-1">{children}</main>
        <Footer
          canViewFundingDetails={viewer.canViewFundingDetails}
          isGateEnabled={config.status === 'enabled'}
          viewerAudience={viewer.audience}
        />
      </body>
    </html>
  )
}
