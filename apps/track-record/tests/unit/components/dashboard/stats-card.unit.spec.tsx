import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Users } from 'lucide-react'
import { StatsCard } from '@/components/dashboard/stats-card'

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode
    href: string
    className?: string
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

describe('StatsCard', () => {
  it('renders a full-card link when href is provided', () => {
    render(
      <StatsCard
        title="Significant Research Outputs"
        value={6}
        description="Papers and publications"
        icon={Users}
        href="/research"
      />,
    )

    expect(screen.getByRole('link', { name: /Significant Research Outputs/i })).toHaveAttribute(
      'href',
      '/research',
    )
  })

  it('uses larger icon sizing for regular cards', () => {
    const { container } = render(<StatsCard title="Total Participants" value={42} icon={Users} />)

    expect(container.querySelector('svg')).toHaveClass('h-7', 'w-7')
  })
})
