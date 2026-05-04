import React from 'react'
import '@repo/ui/styles.css'
import './globals.css'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { PasswordGateForm } from '@/components/frontend/password-gate-form'
import { ThemeScript } from '@/components/theme-script'
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

  const viewer = await getCurrentFrontendViewer()

  if (!viewer.isUnlocked) {
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
        <Navigation canViewFundingDetails={viewer.canViewFundingDetails} />
        <main className="flex-1">{children}</main>
        <Footer
          canViewFundingDetails={viewer.canViewFundingDetails}
          showLockAction={viewer.isGateEnabled}
        />
      </body>
    </html>
  )
}
