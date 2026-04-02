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

  it('renders the large collage variant when metadata.large is true and three images exist', () => {
    const program = createMockProgram({
      description: {
        root: {
          type: 'root',
          version: 1,
          direction: null,
          format: '',
          indent: 0,
          children: [
            {
              type: 'paragraph',
              version: 1,
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'A flagship program focused on alignment research, governance, and community building.',
                },
              ],
            },
          ],
        },
      } as Program['description'],
      metadata: {
        large: true,
      },
      images: [
        {
          id: 'image-1',
          image: {
            id: 1,
            alt: 'Program image 1',
            url: '/api/media/file/program-1.png',
            updatedAt: '2024-01-01',
            createdAt: '2024-01-01',
          },
        },
        {
          id: 'image-2',
          image: {
            id: 2,
            alt: 'Program image 2',
            url: '/api/media/file/program-2.png',
            updatedAt: '2024-01-01',
            createdAt: '2024-01-01',
          },
        },
        {
          id: 'image-3',
          image: {
            id: 3,
            alt: 'Program image 3',
            url: '/api/media/file/program-3.png',
            updatedAt: '2024-01-01',
            createdAt: '2024-01-01',
          },
        },
      ],
    })

    render(<ProgramCard program={program} totalParticipants={24} totalCompletions={18} />)

    expect(screen.getByText('Featured Program')).toBeInTheDocument()
    expect(
      screen.getByText(
        'A flagship program focused on alignment research, governance, and community building.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Explore program/i })).toHaveAttribute(
      'href',
      '/programs/program-1',
    )
    expect(screen.getAllByRole('img')).toHaveLength(3)
    expect(screen.getByText('24 participants')).toBeInTheDocument()
    expect(screen.getByText('18 completions')).toBeInTheDocument()
  })

  it('falls back to the standard card when fewer than three populated media objects exist', () => {
    const program = createMockProgram({
      metadata: {
        large: true,
      },
      images: [
        {
          id: 'image-1',
          image: 1,
        },
        {
          id: 'image-2',
          image: {
            id: 2,
            alt: 'Program image 2',
            url: '/api/media/file/program-2.png',
            updatedAt: '2024-01-01',
            createdAt: '2024-01-01',
          },
        },
        {
          id: 'image-3',
          image: {
            id: 3,
            alt: 'Program image 3',
            url: '/api/media/file/program-3.png',
            updatedAt: '2024-01-01',
            createdAt: '2024-01-01',
          },
        },
      ],
    })

    render(<ProgramCard program={program} />)

    expect(screen.queryByText('Featured Program')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Explore program/i })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Program 1' })).toBeInTheDocument()
  })
})
