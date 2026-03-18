import type { ReactNode } from 'react'

type PublicShellProps = {
  children: ReactNode
}

export function PublicShell({ children }: PublicShellProps) {
  return (
    <main className="container mx-auto flex w-full flex-1 max-w-5xl flex-col px-4 py-10">
      {children}
    </main>
  )
}
