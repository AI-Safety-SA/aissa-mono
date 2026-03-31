import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TestimonialList } from '@/components/dashboard/testimonial-list'
import type { Testimonial } from '@/payload-types'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const createMockTestimonial = (overrides: Partial<Testimonial> = {}): Testimonial => ({
  id: 1,
  quote: 'AISSA gave me better judgment and a stronger network.',
  attributionName: 'Anonymous',
  rating: 9,
  priorityScore: 50,
  updatedAt: '2026-03-31T10:00:00.000Z',
  createdAt: '2026-03-31T10:00:00.000Z',
  ...overrides,
})

describe('TestimonialList', () => {
  it('renders generated testimonial context titles as badge links', () => {
    const testimonials: Testimonial[] = [
      createMockTestimonial({
        context: {
          relationTo: 'events',
          value: {
            id: 10,
            slug: 'alignment-sprint',
            name: 'Alignment Sprint',
            type: 'workshop',
            organiser: 1,
            eventDate: '2026-03-15T09:00:00.000Z',
            updatedAt: '2026-03-15T09:00:00.000Z',
            createdAt: '2026-03-01T09:00:00.000Z',
          },
        },
      }),
    ]

    render(<TestimonialList testimonials={testimonials} />)

    expect(screen.getByText('Alignment Sprint — Testimonial')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Alignment Sprint — Testimonial' })).toHaveAttribute(
      'href',
      '/events/alignment-sprint',
    )
  })

  it('renders a General Testimonial badge when no context is linked', () => {
    render(<TestimonialList testimonials={[createMockTestimonial({ context: null })]} />)

    expect(screen.getByText('General Testimonial')).toBeInTheDocument()
  })

  it('does not render the legacy star rating UI', () => {
    render(<TestimonialList testimonials={[createMockTestimonial()]} />)

    expect(screen.queryByLabelText(/out of 5 stars/i)).not.toBeInTheDocument()
  })
})
