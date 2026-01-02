import React from 'react'
import '@repo/ui/styles.css'
import './globals.css'

export const metadata = {
  description: 'AI Safety South Africa - Track Record Dashboard',
  title: 'AISSA Track Record',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" className="dark">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
