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

vi.mock('@/components/admin/cohort-engagements-api', () => ({
  PayloadAPIError: class PayloadAPIError extends Error {
    readonly status: number

    constructor(message: string, status: number) {
      super(message)
      this.status = status
    }
  },
  checkDuplicateCohortEngagement: vi.fn(),
  createCohortEngagement: vi.fn(),
  createQuickPerson: vi.fn(),
  fetchCohortEngagements: vi.fn(),
  searchPersons: vi.fn(),
}))

import { useDocumentDrawer, useDocumentInfo } from '@payloadcms/ui'

import { CohortEngagementsSection } from '@/components/admin/CohortEngagementsSection'
import {
  checkDuplicateCohortEngagement,
  createCohortEngagement,
  createQuickPerson,
  fetchCohortEngagements,
  searchPersons,
} from '@/components/admin/cohort-engagements-api'
import type { Engagement } from '@/payload-types'

function createEngagement(overrides: Partial<Engagement> = {}): Engagement {
  return {
    context: {
      relationTo: 'cohorts',
      value: 42,
    },
    contextKind: 'cohort',
    createdAt: '2026-02-01T10:00:00.000Z',
    id: 1,
    person: {
      createdAt: '2026-01-01T00:00:00.000Z',
      email: 'alex@example.com',
      fullName: 'Alex Example',
      id: 7,
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    type: 'participant',
    updatedAt: '2026-02-01T10:00:00.000Z',
    ...overrides,
  }
}

function renderComponent() {
  return render(
    <CohortEngagementsSection
      {...({
        field: {
          admin: {},
          name: 'cohortParticipantsEngagements',
          type: 'ui',
        },
        path: 'cohortParticipantsEngagements',
      } as any)}
    />,
  )
}

describe('CohortEngagementsSection', () => {
  const mockOpenDrawer = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useDocumentDrawer).mockReturnValue([
      () => null,
      () => null,
      {
        closeDrawer: vi.fn(),
        drawerDepth: 0,
        drawerSlug: 'engagement-drawer',
        isDrawerOpen: false,
        openDrawer: mockOpenDrawer,
        toggleDrawer: vi.fn(),
      },
    ] as any)

    vi.mocked(fetchCohortEngagements).mockResolvedValue([])
    vi.mocked(searchPersons).mockResolvedValue([])
    vi.mocked(createQuickPerson).mockResolvedValue({
      createdAt: '2026-01-01T00:00:00.000Z',
      email: 'newperson@example.com',
      fullName: 'New Person',
      id: 22,
      updatedAt: '2026-01-01T00:00:00.000Z',
    } as any)
    vi.mocked(checkDuplicateCohortEngagement).mockResolvedValue(false)
    vi.mocked(createCohortEngagement).mockResolvedValue(createEngagement())
  })

  it('shows save-first message and disables actions when cohort is unsaved', () => {
    vi.mocked(useDocumentInfo).mockReturnValue({ id: undefined } as any)

    renderComponent()

    expect(screen.getByText('Save cohort first to add participants.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Participant' })).toBeDisabled()
    expect(fetchCohortEngagements).not.toHaveBeenCalled()
  })

  it('loads cohort engagements when cohort is saved', async () => {
    vi.mocked(useDocumentInfo).mockReturnValue({ id: 42 } as any)
    vi.mocked(fetchCohortEngagements).mockResolvedValue([createEngagement()])

    renderComponent()

    expect(await screen.findByText('Alex Example')).toBeInTheDocument()
    expect(screen.getByText('alex@example.com')).toBeInTheDocument()
    expect(fetchCohortEngagements).toHaveBeenCalledWith(42)
  })

  it('blocks duplicate cohort engagement creation', async () => {
    vi.mocked(useDocumentInfo).mockReturnValue({ id: 42 } as any)
    vi.mocked(createQuickPerson).mockResolvedValue({
      createdAt: '2026-01-01T00:00:00.000Z',
      email: 'duplicate@example.com',
      fullName: 'Duplicate Person',
      id: 55,
      updatedAt: '2026-01-01T00:00:00.000Z',
    } as any)
    vi.mocked(checkDuplicateCohortEngagement).mockResolvedValue(true)

    renderComponent()

    fireEvent.click(screen.getByRole('button', { name: 'Add Participant' }))
    fireEvent.click(screen.getByLabelText('New person'))
    fireEvent.change(screen.getByLabelText('Full name'), {
      target: { value: 'Duplicate Person' },
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'duplicate@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Engagement type'), {
      target: { value: 'participant' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create Engagement' }))

    expect(
      await screen.findByText('This person is already linked to this cohort via an engagement.'),
    ).toBeInTheDocument()

    expect(checkDuplicateCohortEngagement).toHaveBeenCalledWith({
      cohortId: 42,
      personId: 55,
    })
    expect(createCohortEngagement).not.toHaveBeenCalled()
  })

  it('requires fullName and email in new-person mode', async () => {
    vi.mocked(useDocumentInfo).mockReturnValue({ id: 42 } as any)

    renderComponent()

    fireEvent.click(screen.getByRole('button', { name: 'Add Participant' }))
    fireEvent.click(screen.getByLabelText('New person'))
    fireEvent.change(screen.getByLabelText('Engagement type'), {
      target: { value: 'participant' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create Engagement' }))

    expect(
      await screen.findByText('Full name and email are required for new person quick create.'),
    ).toBeInTheDocument()
    expect(createQuickPerson).not.toHaveBeenCalled()
  })

  it('creates new person then creates engagement with cohort context', async () => {
    vi.mocked(useDocumentInfo).mockReturnValue({ id: 42 } as any)
    vi.mocked(createQuickPerson).mockResolvedValue({
      createdAt: '2026-01-01T00:00:00.000Z',
      email: 'newparticipant@example.com',
      fullName: 'New Participant',
      id: '77',
      updatedAt: '2026-01-01T00:00:00.000Z',
    } as any)

    renderComponent()

    fireEvent.click(screen.getByRole('button', { name: 'Add Participant' }))
    fireEvent.click(screen.getByLabelText('New person'))
    fireEvent.change(screen.getByLabelText('Full name'), {
      target: { value: 'New Participant' },
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'newparticipant@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Engagement type'), {
      target: { value: 'participant' },
    })
    fireEvent.change(screen.getByLabelText('Engagement status (optional)'), {
      target: { value: 'in_progress' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create Engagement' }))

    await waitFor(() => {
      expect(createQuickPerson).toHaveBeenCalledWith({
        email: 'newparticipant@example.com',
        fullName: 'New Participant',
      })
    })

    expect(createCohortEngagement).toHaveBeenCalledWith(
      expect.objectContaining({
        context: {
          relationTo: 'cohorts',
          value: 42,
        },
        engagement_status: 'in_progress',
        person: 77,
        type: 'participant',
      }),
    )
  })

  it('hides person search results after selecting an existing person', async () => {
    vi.mocked(useDocumentInfo).mockReturnValue({ id: 42 } as any)
    vi.mocked(searchPersons).mockResolvedValue([
      {
        createdAt: '2026-01-01T00:00:00.000Z',
        email: 'christine@example.com',
        fullName: 'Christine Matanyika',
        id: 12,
        updatedAt: '2026-01-01T00:00:00.000Z',
      } as any,
      {
        createdAt: '2026-01-01T00:00:00.000Z',
        email: 'leo@example.com',
        fullName: 'Leo Hyams',
        id: 13,
        updatedAt: '2026-01-01T00:00:00.000Z',
      } as any,
    ])

    renderComponent()

    fireEvent.click(screen.getByRole('button', { name: 'Add Participant' }))
    fireEvent.change(screen.getByLabelText('Search person'), {
      target: { value: 'leo' },
    })

    expect(await screen.findByText('Christine Matanyika')).toBeInTheDocument()
    expect(screen.getByText('Leo Hyams')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Leo Hyams/i }))

    await waitFor(() => {
      expect(screen.queryByText('Christine Matanyika')).not.toBeInTheDocument()
      expect(screen.queryByText('Leo Hyams')).not.toBeInTheDocument()
    })

    expect(
      screen.getByText('Selected person: Leo Hyams (leo@example.com)'),
    ).toBeInTheDocument()
  })
})
