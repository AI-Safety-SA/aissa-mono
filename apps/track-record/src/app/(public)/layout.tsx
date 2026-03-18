import React from 'react'
import '@repo/ui/styles.css'
import '../(frontend)/globals.css'
import { ThemeScript } from '@/components/theme-script'
import { PublicFooter } from '@/components/public-footer'
import { ThemeToggle } from '@/components/theme-toggle'
import { AissaBrand } from '@/components/aissa-brand'

export const metadata = {
  title: 'AISSA Track Record',
  icons: {
    icon: '/icon.png',
  },
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeScript />
        <div className="flex flex-col min-h-screen">
          <header className="top-0 z-50 border-b border-primary/10 bg-background/90 backdrop-blur-xl supports-backdrop-filter:bg-background/70">
            <div className="container mx-auto flex h-20 max-w-5xl items-center justify-between px-4">
              <AissaBrand href="/" title="Track Record" />
              <ThemeToggle />
            </div>
          </header>
          {children}
        </div>
        <PublicFooter />
      </body>
    </html>
  )
}
