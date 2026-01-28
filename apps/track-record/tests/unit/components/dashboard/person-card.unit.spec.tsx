import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PersonCard } from '@/components/dashboard/person-card'
import type { Person } from '@/payload-types'

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

const createMockPerson = (overrides: Partial<Person> = {}): Person => ({
  id: 1,
  email: 'test@example.com',
  fullName: 'John Doe',
  updatedAt: '2024-01-01',
  createdAt: '2024-01-01',
  ...overrides,
})

describe('PersonCard component', () => {
  it('renders person name with link', () => {
    const person = createMockPerson()
    render(<PersonCard person={person} />)

    const link = screen.getByRole('link', { name: 'John Doe' })
    expect(link).toHaveAttribute('href', '/people/1')
  })

  it('renders preferred name when available', () => {
    const person = createMockPerson({ preferredName: 'Johnny' })
    render(<PersonCard person={person} />)

    expect(screen.getByRole('link', { name: 'Johnny' })).toBeInTheDocument()
  })

  it('renders initials when no headshot', () => {
    const person = createMockPerson({ fullName: 'Jane Smith' })
    render(<PersonCard person={person} />)

    expect(screen.getByText('JS')).toBeInTheDocument()
  })

  it('renders headshot when available', () => {
    const person = createMockPerson({
      headshot: {
        id: 1,
        url: 'https://example.com/photo.jpg',
        alt: 'John photo',
        updatedAt: '2024-01-01',
        createdAt: '2024-01-01',
      },
    })
    render(<PersonCard person={person} />)

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  it('renders impact stage badge', () => {
    const person = createMockPerson({ current_impact_stage: 'learning' })
    render(<PersonCard person={person} />)

    expect(screen.getByText('Learning')).toBeInTheDocument()
  })

  it('renders featured story excerpt', () => {
    const person = createMockPerson({
      featuredStory: {
        root: {
          type: 'root',
          direction: null,
          format: '',
          indent: 0,
          version: 1,
          children: [
            {
              type: 'paragraph',
              version: 1,
              children: [{ type: 'text', text: 'This is my AI safety journey story.' }],
            },
          ],
        },
      },
    })
    render(<PersonCard person={person} />)

    expect(screen.getByText('This is my AI safety journey story.')).toBeInTheDocument()
  })

  it('truncates long featured story excerpt', () => {
    const longText =
      'This is a very long featured story that should be truncated because it exceeds the maximum character limit that is allowed for the card display.'
    const person = createMockPerson({
      featuredStory: {
        root: {
          type: 'root',
          direction: null,
          format: '',
          indent: 0,
          version: 1,
          children: [
            {
              type: 'paragraph',
              version: 1,
              children: [{ type: 'text', text: longText }],
            },
          ],
        },
      },
    })
    render(<PersonCard person={person} />)

    expect(screen.getByText(/\.\.\.$/)).toBeInTheDocument()
  })

  it('renders engagement count', () => {
    const person = createMockPerson({ totalEngagements: 5 })
    render(<PersonCard person={person} />)

    expect(screen.getByText('5 engagements')).toBeInTheDocument()
  })

  it('renders impact count', () => {
    const person = createMockPerson({ totalImpacts: 3 })
    render(<PersonCard person={person} />)

    expect(screen.getByText('3 impacts')).toBeInTheDocument()
  })

  it('does not render engagement count when null', () => {
    const person = createMockPerson({ totalEngagements: null })
    render(<PersonCard person={person} />)

    expect(screen.queryByText(/engagements/)).not.toBeInTheDocument()
  })

  it('renders zero engagement count', () => {
    const person = createMockPerson({ totalEngagements: 0 })
    render(<PersonCard person={person} />)

    expect(screen.getByText('0 engagements')).toBeInTheDocument()
  })

  it('handles headshot as number (not populated)', () => {
    const person = createMockPerson({ headshot: 123 as any })
    render(<PersonCard person={person} />)

    // Should fall back to initials
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('renders initials correctly for single-word names', () => {
    const person = createMockPerson({ fullName: 'Madonna' })
    render(<PersonCard person={person} />)

    expect(screen.getByText('M')).toBeInTheDocument()
  })

  it('renders initials correctly for multi-word names', () => {
    const person = createMockPerson({ fullName: 'Mary Jane Watson' })
    render(<PersonCard person={person} />)

    expect(screen.getByText('MJ')).toBeInTheDocument()
  })
})
