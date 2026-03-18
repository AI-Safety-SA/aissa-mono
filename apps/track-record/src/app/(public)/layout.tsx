import React from 'react'
import '@repo/ui/styles.css'
import '../(frontend)/globals.css'
import { ThemeScript } from '@/components/theme-script'

export const metadata = {
  title: 'AISSA Track Record',
  icons: {
    icon: '/icon.png',
  },
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeScript />
        {children}
      </body>
    </html>
  )
}
