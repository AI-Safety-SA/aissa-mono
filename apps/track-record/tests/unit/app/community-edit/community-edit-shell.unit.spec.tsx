import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { CommunityEditShell } from '@/app/(public)/community-edit/_components/community-edit-shell'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

function renderShell(step: number) {
  return render(
    <CommunityEditShell step={step} title="Title" description="Description">
      <div>Body Content</div>
    </CommunityEditShell>,
  )
}

describe('CommunityEditShell', () => {
  it('renders the shared-width shell container for community-edit content', () => {
    const { container } = renderShell(3)

    expect(container.querySelector('main')).toHaveClass('max-w-5xl')
  })

  it('renders the page content inside the shell body', () => {
    renderShell(3)

    expect(screen.getByText('Body Content')).toBeInTheDocument()
  })

  it('shows the active step metadata', () => {
    renderShell(3)

    expect(screen.getByText('Step 3 of 8: Profile')).toBeInTheDocument()
  })
})
