import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CommunityPersonCard } from '@/components/dashboard/community-person-card'
import type { Person } from '@/payload-types'

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

describe('CommunityPersonCard component', () => {
  it('renders person name with link', () => {
    const person = createMockPerson()
    render(<CommunityPersonCard person={person} />)

    const link = screen.getByRole('link', { name: 'John Doe' })
    expect(link).toHaveAttribute('href', '/people/1')
  })

  it('renders preferred name when available', () => {
    const person = createMockPerson({ preferredName: 'Johnny' })
    render(<CommunityPersonCard person={person} />)

    expect(screen.getByRole('link', { name: 'Johnny' })).toBeInTheDocument()
  })

  it('renders initials when no headshot', () => {
    const person = createMockPerson({ fullName: 'Jane Smith' })
    render(<CommunityPersonCard person={person} />)

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
    render(<CommunityPersonCard person={person} />)

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  it('renders organisation from direct field when available', () => {
    const person = createMockPerson({ organisation: 'University of Cape Town' })

    render(<CommunityPersonCard person={person} />)

    expect(screen.getByText('University of Cape Town')).toBeInTheDocument()
  })

  it('renders organisation from alternate metadata keys', () => {
    const person = createMockPerson({
      metadata: {
        company: 'BlueDot Impact',
      },
    })

    render(<CommunityPersonCard person={person} />)

    expect(screen.getByText('BlueDot Impact')).toBeInTheDocument()
  })

  it('does not render organisation when missing', () => {
    const person = createMockPerson()
    render(<CommunityPersonCard person={person} />)

    expect(screen.queryByText('BlueDot Impact')).not.toBeInTheDocument()
  })

  it('renders contributions when available', () => {
    const person = createMockPerson({ contributions: 3 })
    render(<CommunityPersonCard person={person} />)

    expect(screen.getByText('3 contributions')).toBeInTheDocument()
  })

  it('renders singular contribution label', () => {
    const person = createMockPerson({ contributions: 1 })
    render(<CommunityPersonCard person={person} />)

    expect(screen.getByText('1 contribution')).toBeInTheDocument()
  })

  it('does not render contributions when missing', () => {
    const person = createMockPerson()
    render(<CommunityPersonCard person={person} />)

    expect(screen.queryByText(/contribution/i)).not.toBeInTheDocument()
  })

  it('renders website link and normalizes URL without protocol', () => {
    const person = createMockPerson({ websiteUrl: 'example.com' })
    render(<CommunityPersonCard person={person} />)

    const websiteLink = screen.getByRole('link', { name: /website/i })
    expect(websiteLink).toHaveAttribute('href', 'https://example.com')
  })

  it('renders website link with existing protocol unchanged', () => {
    const person = createMockPerson({ websiteUrl: 'https://example.com' })
    render(<CommunityPersonCard person={person} />)

    const websiteLink = screen.getByRole('link', { name: /website/i })
    expect(websiteLink).toHaveAttribute('href', 'https://example.com')
  })

  it('does not render website link when missing', () => {
    const person = createMockPerson()
    render(<CommunityPersonCard person={person} />)

    expect(screen.queryByRole('link', { name: /website/i })).not.toBeInTheDocument()
  })
})
