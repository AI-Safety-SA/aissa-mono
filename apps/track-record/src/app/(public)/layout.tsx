import React from 'react'
import '@repo/ui/styles.css'
import '../(frontend)/globals.css'
import Script from 'next/script'
import { Footer } from '@/components/footer'
import { buildTrackRecordThemeScript } from '@/lib/theme'

export const metadata = {
  title: 'AISSA Track Record',
  icons: {
    icon: '/icon.png',
  },
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground flex flex-col">
        <Script id="track-record-theme" strategy="beforeInteractive">
          {buildTrackRecordThemeScript()}
        </Script>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
