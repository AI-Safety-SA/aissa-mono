import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@payloadcms/ui', () => ({
  Banner: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Button: ({
    children,
    disabled,
    onClick,
    type = 'button',
  }: {
    children?: React.ReactNode
    disabled?: boolean
    onClick?: () => void
    type?: 'button' | 'submit'
  }) => (
    <button disabled={disabled} onClick={onClick} type={type}>
      {children}
    </button>
  ),
  useDocumentDrawer: vi.fn(),
  useDocumentInfo: vi.fn(),
}))

vi.mock('@/components/admin/person-admin-api', () => ({
  PayloadAPIError: class PayloadAPIError extends Error {
    readonly status: number

    constructor(message: string, status: number) {
      super(message)
      this.status = status
    }
  },
  createPersonTestimonial: vi.fn(),
  deleteCollectionDocument: vi.fn(),
  fetchPersonTestimonials: vi.fn(),
  searchContexts: vi.fn(),
  toNumericId: (value: unknown) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && Number.isFinite(Number(value))) return Number(value)
    return null
  },
}))

import { useDocumentDrawer, useDocumentInfo } from '@payloadcms/ui'

import { PersonTestimonialsSection } from '@/components/admin/PersonTestimonialsSection'
import {
  createPersonTestimonial,
  fetchPersonTestimonials,
  searchContexts,
} from '@/components/admin/person-admin-api'

describe('PersonTestimonialsSection', () => {
  const mockOpenDrawer = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useDocumentDrawer).mockReturnValue([
      () => null,
      () => null,
      {
        closeDrawer: vi.fn(),
        drawerDepth: 0,
        drawerSlug: 'testimonial-drawer',
        isDrawerOpen: false,
        openDrawer: mockOpenDrawer,
        toggleDrawer: vi.fn(),
      },
    ] as any)

    vi.mocked(fetchPersonTestimonials).mockResolvedValue([])
    vi.mocked(searchContexts).mockResolvedValue([
      {
        eventDate: '2026-02-15T18:30:00.000Z',
        id: 13,
        label: 'Cape Town AI Safety Meetup',
        relationTo: 'events',
      },
    ] as any)
    vi.mocked(createPersonTestimonial).mockResolvedValue({
      createdAt: '2026-04-01T10:00:00.000Z',
      id: 51,
      person: 42,
      quote: 'Very strong event.',
      updatedAt: '2026-04-01T10:00:00.000Z',
    } as any)
  })

  function renderComponent() {
    return render(
      <PersonTestimonialsSection
        {...({
          field: {
            admin: {},
            name: 'personTestimonialsAdmin',
            type: 'ui',
          },
          path: 'personTestimonialsAdmin',
        } as any)}
      />,
    )
  }

  it('creates a general testimonial without context', async () => {
    vi.mocked(useDocumentInfo).mockReturnValue({ id: 42 } as any)

    renderComponent()

    fireEvent.click(screen.getByRole('button', { name: 'Add Testimonial' }))
    fireEvent.change(screen.getByLabelText('Quote'), {
      target: { value: 'Very strong event.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create Testimonial' }))

    await waitFor(() => {
      expect(createPersonTestimonial).toHaveBeenCalledWith(
        expect.objectContaining({
          person: 42,
          quote: 'Very strong event.',
        }),
      )
    })

    expect(createPersonTestimonial).toHaveBeenCalledWith(
      expect.not.objectContaining({
        context: expect.anything(),
      }),
    )
  })

  it('creates a contextual testimonial when a context is selected', async () => {
    vi.mocked(useDocumentInfo).mockReturnValue({ id: 42 } as any)

    renderComponent()

    fireEvent.click(screen.getByRole('button', { name: 'Add Testimonial' }))
    fireEvent.change(screen.getByLabelText('Quote'), {
      target: { value: 'Very strong event.' },
    })
    fireEvent.click(screen.getByLabelText('Attach optional context'))
    fireEvent.change(screen.getByLabelText('Context type'), {
      target: { value: 'events' },
    })
    fireEvent.change(screen.getByLabelText('Search context'), {
      target: { value: 'Cape' },
    })

    fireEvent.click(await screen.findByText('Cape Town AI Safety Meetup'))
    expect(screen.getByLabelText('Context date (optional)')).toHaveValue('2026-02-15')

    fireEvent.click(screen.getByRole('button', { name: 'Create Testimonial' }))

    await waitFor(() => {
      expect(createPersonTestimonial).toHaveBeenCalledWith(
        expect.objectContaining({
          context: {
            relationTo: 'events',
            value: 13,
          },
          contextDate: '2026-02-15',
          person: 42,
        }),
      )
    })
  })
})
