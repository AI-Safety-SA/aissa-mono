import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DashboardHero } from '@/components/dashboard/dashboard-hero'

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('DashboardHero', () => {
  it('renders theme-neutral quick links and omits the removed promo card copy', () => {
    render(<DashboardHero />)

    expect(screen.getByRole('heading', { name: 'AISSA Track Record' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /programs/i })).toHaveAttribute('href', '/programs')
    expect(screen.getByRole('link', { name: /events/i })).toHaveAttribute('href', '/events')
    expect(screen.getByRole('link', { name: /research/i })).toHaveAttribute('href', '/research')
    expect(screen.getByRole('link', { name: /community/i })).toHaveAttribute('href', '/people')
    expect(
      screen.queryByText(/designed for transparent reporting on community growth/i),
    ).not.toBeInTheDocument()
  })
})
