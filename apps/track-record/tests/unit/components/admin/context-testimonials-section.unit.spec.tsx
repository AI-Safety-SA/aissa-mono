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
  useFormFields: vi.fn(),
}))

vi.mock('@/components/admin/cohort-engagements-api', () => ({
  PayloadAPIError: class PayloadAPIError extends Error {
    readonly status: number

    constructor(message: string, status: number) {
      super(message)
      this.status = status
    }
  },
  createQuickPerson: vi.fn(),
  searchPersons: vi.fn(),
}))

vi.mock('@/components/admin/context-testimonials-api', () => ({
  createContextTestimonial: vi.fn(),
  fetchContextTestimonials: vi.fn(),
}))

import { useDocumentDrawer, useDocumentInfo, useFormFields } from '@payloadcms/ui'

import {
  CohortTestimonialsSection,
  EventTestimonialsSection,
} from '@/components/admin/ContextTestimonialsSection'
import {
  createQuickPerson,
  searchPersons,
} from '@/components/admin/cohort-engagements-api'
import {
  createContextTestimonial,
  fetchContextTestimonials,
} from '@/components/admin/context-testimonials-api'
import type { Testimonial } from '@/payload-types'

function createTestimonial(overrides: Partial<Testimonial> = {}): Testimonial {
  return {
    context: {
      relationTo: 'cohorts',
      value: 42,
    },
    contextKind: 'cohort',
    createdAt: '2026-02-01T10:00:00.000Z',
    id: 1,
    isPublished: false,
    quote: 'Great cohort learning experience.',
    updatedAt: '2026-02-01T10:00:00.000Z',
    ...overrides,
  }
}

function renderCohortComponent() {
  return render(
    <CohortTestimonialsSection
      {...({
        field: {
          admin: {},
          name: 'cohortTestimonials',
          type: 'ui',
        },
        path: 'cohortTestimonials',
      } as any)}
    />,
  )
}

function renderEventComponent() {
  return render(
    <EventTestimonialsSection
      {...({
        field: {
          admin: {},
          name: 'eventTestimonials',
          type: 'ui',
        },
        path: 'eventTestimonials',
      } as any)}
    />,
  )
}

describe('ContextTestimonialsSection', () => {
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

    vi.mocked(fetchContextTestimonials).mockResolvedValue([])
    vi.mocked(searchPersons).mockResolvedValue([])
    vi.mocked(useFormFields).mockImplementation((selector: any) =>
      selector([
        {
          startDate: { value: '' },
        },
      ]),
    )
    vi.mocked(createQuickPerson).mockResolvedValue({
      createdAt: '2026-01-01T00:00:00.000Z',
      email: 'newperson@example.com',
      fullName: 'New Person',
      id: 22,
      updatedAt: '2026-01-01T00:00:00.000Z',
    } as any)
    vi.mocked(createContextTestimonial).mockResolvedValue(createTestimonial())
  })

  it('shows save-first message and disables actions when context is unsaved', () => {
    vi.mocked(useDocumentInfo).mockReturnValue({ id: undefined } as any)

    renderCohortComponent()

    expect(screen.getByText('Save cohort first to add testimonials.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Testimonial' })).toBeDisabled()
    expect(fetchContextTestimonials).not.toHaveBeenCalled()
  })

  it('creates new person then creates testimonial for cohort context', async () => {
    vi.mocked(useDocumentInfo).mockReturnValue({ id: 42 } as any)

    renderCohortComponent()

    fireEvent.click(screen.getByRole('button', { name: 'Add Testimonial' }))
    fireEvent.click(screen.getByLabelText('New person'))
    fireEvent.change(screen.getByLabelText('Full name'), {
      target: { value: 'Testimonial Person' },
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'testimonialperson@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Quote'), {
      target: { value: 'The cohort significantly sharpened my AI safety thinking.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create Testimonial' }))

    await waitFor(() => {
      expect(createQuickPerson).toHaveBeenCalledWith({
        email: 'testimonialperson@example.com',
        fullName: 'Testimonial Person',
      })
    })

    expect(createContextTestimonial).toHaveBeenCalledWith(
      expect.objectContaining({
        context: {
          relationTo: 'cohorts',
          value: 42,
        },
        person: 22,
        quote: 'The cohort significantly sharpened my AI safety thinking.',
      }),
    )
  })

  it('uses event context and prefilled context date when creating attribution-only testimonial', async () => {
    vi.mocked(useDocumentInfo).mockReturnValue({ id: 11 } as any)
    vi.mocked(useFormFields).mockImplementation((selector: any) =>
      selector([
        {
          eventDate: { value: '2026-05-01T16:30:00.000Z' },
        },
      ]),
    )

    renderEventComponent()

    fireEvent.click(screen.getByRole('button', { name: 'Add Testimonial' }))
    expect(screen.getByLabelText('Context date (optional)')).toHaveValue('2026-05-01')

    fireEvent.click(screen.getByLabelText('Attribution only'))
    fireEvent.change(screen.getByLabelText('Attribution name (optional)'), {
      target: { value: 'Anonymous Participant' },
    })
    fireEvent.change(screen.getByLabelText('Quote'), {
      target: { value: 'Excellent event; practical and deeply thoughtful.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create Testimonial' }))

    await waitFor(() => {
      expect(createContextTestimonial).toHaveBeenCalledWith(
        expect.objectContaining({
          attributionName: 'Anonymous Participant',
          context: {
            relationTo: 'events',
            value: 11,
          },
          contextDate: '2026-05-01',
          quote: 'Excellent event; practical and deeply thoughtful.',
        }),
      )
    })
  })
})
