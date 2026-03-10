import React from 'react'
import '@repo/ui/styles.css'
import '../(frontend)/globals.css'
import { Footer } from '@/components/footer'

export const metadata = {
  title: 'AISSA Track Record',
  icons: {
    icon: '/icon.png',
  },
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground flex flex-col">
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
