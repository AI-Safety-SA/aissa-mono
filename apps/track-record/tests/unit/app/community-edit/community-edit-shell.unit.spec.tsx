import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { CommunityEditShell } from '@/app/(public)/community-edit/_components/community-edit-shell'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/app/(public)/community-edit/_components/data-consent-controls', () => ({
  DataConsentControls: () => <div>Data Consent Controls</div>,
}))

function renderShell(step: number) {
  return render(
    <CommunityEditShell step={step} title="Title" description="Description">
      <div>Body Content</div>
    </CommunityEditShell>,
  )
}

describe('CommunityEditShell', () => {
  it('shows data consent controls on step 3', () => {
    renderShell(3)

    expect(screen.getByText('Data Consent Controls')).toBeInTheDocument()
  })

  it('shows data consent controls on step 7', () => {
    renderShell(7)

    expect(screen.getByText('Data Consent Controls')).toBeInTheDocument()
  })

  it('hides data consent controls on other steps', () => {
    renderShell(4)

    expect(screen.queryByText('Data Consent Controls')).not.toBeInTheDocument()
  })

  it('does not render the shell footer privacy links', () => {
    renderShell(3)

    expect(screen.queryByText('Privacy Policy')).not.toBeInTheDocument()
  })
})
