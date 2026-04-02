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
  ACTION_CATEGORY_OPTIONS: [
    { label: 'Career Role', value: 'career_role' },
    { label: 'Grant', value: 'grant' },
    { label: 'Internship', value: 'internship' },
    { label: 'Academic Pivot', value: 'academic_pivot' },
    { label: 'Upskilling', value: 'upskilling' },
    { label: 'Community Building', value: 'community_building' },
    { label: 'Research', value: 'research' },
  ],
  IMPACT_TYPE_OPTIONS: [
    { label: 'Career Transition', value: 'career_transition' },
    { label: 'Research Contribution', value: 'research_contribution' },
    { label: 'Community Building', value: 'community_building' },
    { label: 'Grant Awarded', value: 'grant_awarded' },
    { label: 'Publication', value: 'publication' },
    { label: 'Educational', value: 'educational' },
    { label: 'Community', value: 'community' },
    { label: 'Other', value: 'other' },
  ],
  PayloadAPIError: class PayloadAPIError extends Error {
    readonly status: number

    constructor(message: string, status: number) {
      super(message)
      this.status = status
    }
  },
  createPersonContextEngagement: vi.fn(),
  createPersonEngagementImpact: vi.fn(),
  deleteCollectionDocument: vi.fn(),
  fetchPersonEngagements: vi.fn(),
  searchContexts: vi.fn(),
  toNumericId: (value: unknown) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && Number.isFinite(Number(value))) return Number(value)
    return null
  },
}))

import { useDocumentDrawer, useDocumentInfo } from '@payloadcms/ui'

import { PersonProgramEngagementsSection } from '@/components/admin/PersonContextEngagementsSection'
import {
  createPersonContextEngagement,
  createPersonEngagementImpact,
  fetchPersonEngagements,
  searchContexts,
} from '@/components/admin/person-admin-api'

describe('PersonProgramEngagementsSection', () => {
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

    vi.mocked(fetchPersonEngagements).mockResolvedValue([])
    vi.mocked(searchContexts).mockResolvedValue([
      {
        id: 11,
        label: 'AISF Fellowship 2026',
        relationTo: 'programs',
        secondaryLabel: 'aisf-fellowship-2026',
        startDate: '2026-01-01',
      },
    ] as any)
    vi.mocked(createPersonContextEngagement).mockResolvedValue({
      context: { relationTo: 'programs', value: 11 },
      contextKind: 'program',
      createdAt: '2026-04-01T10:00:00.000Z',
      id: 88,
      person: 7,
      type: 'participant',
      updatedAt: '2026-04-01T10:00:00.000Z',
    } as any)
    vi.mocked(createPersonEngagementImpact).mockResolvedValue({
      createdAt: '2026-04-01T10:05:00.000Z',
      id: 99,
      person: 7,
      summary: 'Started a new safety reading group',
      type: 'community_building',
      updatedAt: '2026-04-01T10:05:00.000Z',
    } as any)
  })

  function renderComponent() {
    return render(
      <PersonProgramEngagementsSection
        {...({
          field: {
            admin: {},
            name: 'programEngagementsAdmin',
            type: 'ui',
          },
          path: 'programEngagementsAdmin',
        } as any)}
      />,
    )
  }

  it('shows save-first message when person is unsaved', () => {
    vi.mocked(useDocumentInfo).mockReturnValue({ id: undefined } as any)

    renderComponent()

    expect(screen.getByText('Save person first to add program engagements.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Engagement' })).toBeDisabled()
    expect(fetchPersonEngagements).not.toHaveBeenCalled()
  })

  it('creates a program engagement and linked impact', async () => {
    vi.mocked(useDocumentInfo).mockReturnValue({ id: 7 } as any)

    renderComponent()

    fireEvent.click(screen.getByRole('button', { name: 'Add Engagement' }))
    fireEvent.change(screen.getByLabelText('Search program'), {
      target: { value: 'AISF' },
    })

    expect(await screen.findByText('AISF Fellowship 2026')).toBeInTheDocument()
    fireEvent.click(screen.getByText('AISF Fellowship 2026'))
    fireEvent.change(screen.getByLabelText('Engagement type'), {
      target: { value: 'participant' },
    })
    fireEvent.click(screen.getByLabelText('Create linked impact now'))
    fireEvent.change(screen.getByLabelText('Impact type'), {
      target: { value: 'community_building' },
    })
    fireEvent.change(screen.getByLabelText('Impact summary'), {
      target: { value: 'Started a new safety reading group' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create Engagement + Impact' }))

    await waitFor(() => {
      expect(createPersonContextEngagement).toHaveBeenCalledWith(
        expect.objectContaining({
          context: {
            relationTo: 'programs',
            value: 11,
          },
          person: 7,
          type: 'participant',
        }),
      )
    })

    expect(createPersonEngagementImpact).toHaveBeenCalledWith(
      expect.objectContaining({
        engagement: 88,
        person: 7,
        summary: 'Started a new safety reading group',
        type: 'community_building',
      }),
    )
  })

  it('retries only the linked impact after the engagement already exists', async () => {
    vi.mocked(useDocumentInfo).mockReturnValue({ id: 7 } as any)
    vi.mocked(createPersonEngagementImpact)
      .mockRejectedValueOnce(new Error('Temporary impact failure'))
      .mockResolvedValueOnce({
        createdAt: '2026-04-01T10:05:00.000Z',
        id: 99,
        person: 7,
        summary: 'Started a new safety reading group',
        type: 'community_building',
        updatedAt: '2026-04-01T10:05:00.000Z',
      } as any)

    renderComponent()

    fireEvent.click(screen.getByRole('button', { name: 'Add Engagement' }))
    fireEvent.change(screen.getByLabelText('Search program'), {
      target: { value: 'AISF' },
    })

    fireEvent.click(await screen.findByText('AISF Fellowship 2026'))
    fireEvent.change(screen.getByLabelText('Engagement type'), {
      target: { value: 'participant' },
    })
    fireEvent.click(screen.getByLabelText('Create linked impact now'))
    fireEvent.change(screen.getByLabelText('Impact type'), {
      target: { value: 'community_building' },
    })
    fireEvent.change(screen.getByLabelText('Impact summary'), {
      target: { value: 'Started a new safety reading group' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create Engagement + Impact' }))

    expect(await screen.findByText('Temporary impact failure')).toBeInTheDocument()
    expect(
      screen.getByText('Engagement already created. Saving again will retry only the linked impact.'),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Create Engagement + Impact' }))

    await waitFor(() => {
      expect(createPersonEngagementImpact).toHaveBeenCalledTimes(2)
    })

    expect(createPersonContextEngagement).toHaveBeenCalledTimes(1)
  })
})
