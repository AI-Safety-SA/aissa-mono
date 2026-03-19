import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PrivacyPolicyPage, { metadata } from '@/app/(public)/privacy-policy/page'

describe('privacy policy page', () => {
  it('renders inside the widened public shell while keeping article content readable', () => {
    const { container } = render(<PrivacyPolicyPage />)

    expect(container.querySelector('main')).toHaveClass('max-w-5xl')
    expect(screen.getByRole('heading', { name: 'Privacy Policy' }).closest('div')).toHaveClass(
      'max-w-3xl',
    )
  })

  it('exports the expected metadata', () => {
    expect(metadata).toMatchObject({
      title: 'Privacy Policy — AISSA Track Record',
      description: 'Privacy policy for the AISSA Track Record platform.',
    })
  })
})
