import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { CommunityEditShell } from '@/app/(public)/community-edit/_components/community-edit-shell'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/components/aissa-brand', () => ({
  AissaBrand: ({ title }: { title?: string }) => <div>AISSA Brand {title}</div>,
}))

vi.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <button type="button">Theme Toggle</button>,
}))

function renderShell(step: number) {
  return render(
    <CommunityEditShell step={step} title="Title" description="Description">
      <div>Body Content</div>
    </CommunityEditShell>,
  )
}

describe('CommunityEditShell', () => {
  it('renders the sticky header brand and theme toggle', () => {
    const { container } = renderShell(3)

    expect(screen.getAllByText('AISSA Brand Community Edit')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Theme Toggle' })).toBeInTheDocument()
    expect(container.querySelectorAll('.max-w-5xl')).toHaveLength(3)
  })

  it('renders the page content inside the shell body', () => {
    renderShell(3)

    expect(screen.getByText('Body Content')).toBeInTheDocument()
  })

  it('shows the active step metadata', () => {
    renderShell(3)

    expect(screen.getByText('Step 3 of 8: Profile')).toBeInTheDocument()
  })

  it('renders the shared public footer links', () => {
    renderShell(3)

    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
      'href',
      '/privacy-policy',
    )
    expect(screen.getByRole('link', { name: 'Code of Conduct' })).toHaveAttribute(
      'href',
      '/code-of-conduct',
    )
  })
})
