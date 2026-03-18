import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { DataConsentControls } from '@/app/(public)/community-edit/_components/data-consent-controls'
import {
  type CommunitySessionSummary,
  getCommunityEditSession,
  requestCommunityDeletion,
  stageConsent,
} from '@/app/(public)/community-edit/_lib/api'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

vi.mock('@/app/(public)/community-edit/_lib/api', () => ({
  getCommunityEditSession: vi.fn(),
  requestCommunityDeletion: vi.fn(),
  stageConsent: vi.fn(),
}))

function buildSession(
  overrides: Partial<CommunitySessionSummary> = {},
): { submission: CommunitySessionSummary; success: true } {
  return {
    submission: {
      consentPreferencesSavedAt: null,
      deletionRequested: false,
      deletionReviewStatus: 'not_requested',
      displayToFundersConsentRequested: false,
      email: 'person@example.com',
      id: 101,
      personId: 55,
      shareWithPartnersConsentRequested: false,
      status: 'draft',
      submittedAt: null,
      verifiedEmail: true,
      ...overrides,
    },
    success: true,
  }
}

describe('DataConsentControls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requestCommunityDeletion).mockResolvedValue({
      submissionId: 101,
      submitted: false,
      success: true,
    })
    vi.mocked(stageConsent).mockResolvedValue({
      success: true,
    })
  })

  it('keeps the saved consent summary collapsed after remounting', async () => {
    vi.mocked(getCommunityEditSession).mockResolvedValueOnce(buildSession())

    const view = render(<DataConsentControls />)

    fireEvent.click(await screen.findByRole('button', { name: 'Save Consent Preferences' }))

    await waitFor(() =>
      expect(stageConsent).toHaveBeenCalledWith({
        displayToFunders: false,
        shareWithPartners: false,
      }),
    )

    expect(
      await screen.findByText('Consent preferences saved — click to edit'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Save Consent Preferences' }),
    ).not.toBeInTheDocument()

    view.unmount()

    vi.mocked(getCommunityEditSession).mockResolvedValueOnce(
      buildSession({
        consentPreferencesSavedAt: '2026-03-18T10:00:00.000Z',
      }),
    )

    render(<DataConsentControls />)

    expect(
      await screen.findByText('Consent preferences saved — click to edit'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Save Consent Preferences' }),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Consent preferences saved — click to edit').closest('button')!)

    expect(await screen.findByRole('button', { name: 'Save Consent Preferences' })).toBeVisible()
  })
})
