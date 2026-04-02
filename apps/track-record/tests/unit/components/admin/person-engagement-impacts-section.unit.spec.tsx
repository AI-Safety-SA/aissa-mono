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
  createPersonEngagementImpact: vi.fn(),
  deleteCollectionDocument: vi.fn(),
  fetchPersonEngagementImpacts: vi.fn(),
  fetchPersonEngagements: vi.fn(),
  toNumericId: (value: unknown) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && Number.isFinite(Number(value))) return Number(value)
    return null
  },
}))

import { useDocumentDrawer, useDocumentInfo } from '@payloadcms/ui'

import { PersonEngagementImpactsSection } from '@/components/admin/PersonEngagementImpactsSection'
import {
  createPersonEngagementImpact,
  fetchPersonEngagementImpacts,
  fetchPersonEngagements,
} from '@/components/admin/person-admin-api'

describe('PersonEngagementImpactsSection', () => {
  const mockOpenDrawer = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useDocumentDrawer).mockReturnValue([
      () => null,
      () => null,
      {
        closeDrawer: vi.fn(),
        drawerDepth: 0,
        drawerSlug: 'impact-drawer',
        isDrawerOpen: false,
        openDrawer: mockOpenDrawer,
        toggleDrawer: vi.fn(),
      },
    ] as any)

    vi.mocked(fetchPersonEngagementImpacts).mockResolvedValue([])
    vi.mocked(fetchPersonEngagements).mockResolvedValue([
      {
        context: { relationTo: 'programs', value: 11 },
        contextKind: 'program',
        createdAt: '2026-03-01T10:00:00.000Z',
        id: 88,
        person: 42,
        title: 'AISF Fellowship 2026 — Participant',
        type: 'participant',
        updatedAt: '2026-03-01T10:00:00.000Z',
      },
    ] as any)
    vi.mocked(createPersonEngagementImpact).mockResolvedValue({
      createdAt: '2026-04-01T10:00:00.000Z',
      id: 91,
      person: 42,
      summary: 'Launched a new AI safety study circle',
      type: 'community_building',
      updatedAt: '2026-04-01T10:00:00.000Z',
    } as any)
  })

  function renderComponent() {
    return render(
      <PersonEngagementImpactsSection
        {...({
          field: {
            admin: {},
            name: 'personEngagementImpactsAdmin',
            type: 'ui',
          },
          path: 'personEngagementImpactsAdmin',
        } as any)}
      />,
    )
  }

  it('creates an impact linked to an existing engagement', async () => {
    vi.mocked(useDocumentInfo).mockReturnValue({ id: 42 } as any)

    renderComponent()

    fireEvent.click(screen.getByRole('button', { name: 'Add Impact' }))
    expect(await screen.findByText('AISF Fellowship 2026 — Participant')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Link to engagement (optional)'), {
      target: { value: '88' },
    })
    fireEvent.change(screen.getByLabelText('Impact type'), {
      target: { value: 'community_building' },
    })
    fireEvent.change(screen.getByLabelText('Impact summary'), {
      target: { value: 'Launched a new AI safety study circle' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create Impact' }))

    await waitFor(() => {
      expect(createPersonEngagementImpact).toHaveBeenCalledWith(
        expect.objectContaining({
          engagement: 88,
          person: 42,
          summary: 'Launched a new AI safety study circle',
          type: 'community_building',
        }),
      )
    })
  })
})
