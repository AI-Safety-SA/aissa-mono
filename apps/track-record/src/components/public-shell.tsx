import type { ReactNode } from 'react'
import { AissaBrand } from '@/components/aissa-brand'
import { ThemeToggle } from '@/components/theme-toggle'
import { PublicFooter } from '@/components/public-footer'

type PublicShellProps = {
  children: ReactNode
}

export function PublicShell({ children }: PublicShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="sticky top-0 z-50 border-b border-primary/10 bg-background/90 backdrop-blur-xl supports-backdrop-filter:bg-background/70">
        <div className="container mx-auto flex h-20 max-w-5xl items-center justify-between px-4">
          <AissaBrand title="Community Edit" />
          <ThemeToggle />
        </div>
      </div>
      <main className="container mx-auto flex flex-1 max-w-5xl flex-col px-4 py-10">
        {children}
      </main>
      <PublicFooter />
    </div>
  )
}
