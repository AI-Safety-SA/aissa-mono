import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { CommunityReviewClient } from '@/app/(admin-custom)/admin/community-review/[id]/review-client'

const mockPush = vi.fn()
const mockRefresh = vi.fn()
const mockReplace = vi.fn()

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
    replace: mockReplace,
  }),
  useSearchParams: () => new URLSearchParams(),
}))

function makeReviewBundle(overrides: Record<string, unknown> = {}) {
  return {
    engagements: [],
    impacts: [],
    personUpdates: [
      {
        createdAt: '2026-03-01T00:00:00.000Z',
        currentValue: 'Current Name',
        field: 'fullName',
        id: 501,
        proposedValue: 'Updated Name',
        reviewNotes: '',
        reviewStatus: 'pending',
        submission: 101,
        updatedAt: '2026-03-01T00:00:00.000Z',
      },
    ],
    removals: [],
    submission: {
      createdAt: '2026-03-01T00:00:00.000Z',
      deletionRequested: false,
      deletionReviewNotes: '',
      deletionReviewStatus: 'not_requested',
      displayToFundersConsentRequested: false,
      email: 'person@example.com',
      id: 101,
      reviewNotes: '',
      shareWithPartnersConsentRequested: false,
      status: 'pending_review',
      updatedAt: '2026-03-01T00:00:00.000Z',
      verifiedEmail: true,
    },
    testimonials: [],
    ...overrides,
  } as any
}

describe('CommunityReviewClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('disables apply when standard submission has pending items', () => {
    render(<CommunityReviewClient initialReview={makeReviewBundle()} submissionId="101" />)

    expect(screen.getByRole('button', { name: 'Apply Submission' })).toBeDisabled()
    expect(screen.getByText(/Resolve all pending staged items before applying/)).toBeInTheDocument()
  })

  it('enables apply for deletion submissions once deletion decision is resolved', () => {
    render(
      <CommunityReviewClient
        initialReview={makeReviewBundle({
          submission: {
            ...makeReviewBundle().submission,
            deletionRequested: true,
            deletionReviewStatus: 'approved',
          },
        })}
        submissionId="101"
      />,
    )

    expect(screen.getByRole('button', { name: 'Apply Submission' })).toBeEnabled()
  })

  it('shows inline validation and blocks save when rejected note is missing', () => {
    render(<CommunityReviewClient initialReview={makeReviewBundle()} submissionId="101" />)

    const statusSelect = screen.getByRole('combobox') as HTMLSelectElement
    fireEvent.change(statusSelect, { target: { value: 'rejected' } })

    expect(
      screen.getByText('Rejection note is required when status is rejected.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save Item' })).toBeDisabled()
  })
})
