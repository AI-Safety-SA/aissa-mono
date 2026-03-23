import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgramCard } from '@/components/dashboard/program-card'
import type { Program } from '@/payload-types'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

const createMockProgram = (overrides: Partial<Program> = {}): Program => ({
  id: 1,
  slug: 'program-1',
  name: 'Program 1',
  type: 'course',
  updatedAt: '2024-01-01',
  createdAt: '2024-01-01',
  ...overrides,
})

describe('ProgramCard', () => {
  it('shows cohort count for course programs', () => {
    const program = createMockProgram({ type: 'course' })
    render(<ProgramCard program={program} cohortCount={2} />)

    expect(screen.getByText('2 cohorts')).toBeInTheDocument()
  })

  it('hides cohort count for non-course programs', () => {
    const program = createMockProgram({ type: 'fellowship' })
    render(<ProgramCard program={program} cohortCount={2} />)

    expect(screen.queryByText('2 cohorts')).not.toBeInTheDocument()
  })

  it('shows participants when provided', () => {
    const program = createMockProgram()
    render(<ProgramCard program={program} totalParticipants={12} />)

    expect(screen.getByText('12 participants')).toBeInTheDocument()
  })

  it('hides participants when no value is provided', () => {
    const program = createMockProgram()
    render(<ProgramCard program={program} />)

    expect(screen.queryByText(/participants/)).not.toBeInTheDocument()
  })

  it('renders a highlighted image when one is available', () => {
    const program = createMockProgram({
      images: [
        {
          id: 'image-1',
          isHighlighted: true,
          image: {
            id: 9,
            alt: 'Program hero',
            url: '/api/media/file/program-hero.png',
            updatedAt: '2024-01-01',
            createdAt: '2024-01-01',
          },
        },
      ],
    })

    render(<ProgramCard program={program} />)

    expect(screen.getByRole('img')).toHaveAttribute('src', '/api/media/file/program-hero.png')
  })
})
