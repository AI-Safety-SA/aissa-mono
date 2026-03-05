import React from 'react'
import '@repo/ui/styles.css'
import '../(frontend)/globals.css'

export const metadata = {
  title: 'AISSA Track Record - Admin Review',
}

export default function AdminCustomLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
