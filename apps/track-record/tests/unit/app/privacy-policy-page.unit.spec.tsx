import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import PrivacyPolicyPage, { metadata } from '@/app/(public)/privacy-policy/page'

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

describe('privacy policy page', () => {
  it('renders inside the widened public shell while keeping article content readable', () => {
    const { container } = render(<PrivacyPolicyPage />)

    expect(container.querySelector('main')).toHaveClass('max-w-5xl')
    expect(screen.getByRole('heading', { name: 'Privacy Policy' }).closest('div')).toHaveClass(
      'max-w-3xl',
    )
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
      'href',
      '/privacy-policy',
    )
  })

  it('exports the expected metadata', () => {
    expect(metadata).toMatchObject({
      title: 'Privacy Policy — AISSA Track Record',
      description: 'Privacy policy for the AISSA Track Record platform.',
    })
  })
})
