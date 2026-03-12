import type { AnchorHTMLAttributes } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { CodeOfConductCard } from '@/components/code-of-conduct-card'

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('CodeOfConductCard component', () => {
  it('renders a live preview only after the preview toggle is opened', () => {
    render(<CodeOfConductCard />)

    expect(screen.queryByTitle('AISSA Code of Conduct')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /preview code of conduct/i }))
    expect(screen.getByTitle('AISSA Code of Conduct')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /hide live preview/i }))
    expect(screen.queryByTitle('AISSA Code of Conduct')).not.toBeInTheDocument()
  })
})
