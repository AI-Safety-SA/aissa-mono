import React from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RootLayout from '@/app/(frontend)/layout'
import { getFrontendGateConfig } from '@/utilities/frontend-gate'
import { getCurrentFrontendViewer } from '@/utilities/frontend-gate-server'

vi.mock('@/utilities/frontend-gate', () => ({
  getFrontendGateConfig: vi.fn(),
}))

vi.mock('@/utilities/frontend-gate-server', () => ({
  getCurrentFrontendViewer: vi.fn(),
}))

vi.mock('@/components/navigation', () => ({
  Navigation: ({ canViewFundingDetails }: { canViewFundingDetails: boolean }) => (
    <div data-testid="navigation">nav:{String(canViewFundingDetails)}</div>
  ),
}))

vi.mock('@/components/footer', () => ({
  Footer: ({
    canViewFundingDetails,
    showLockAction,
  }: {
    canViewFundingDetails: boolean
    showLockAction: boolean
  }) => <div data-testid="footer">footer:{String(canViewFundingDetails)}:{String(showLockAction)}</div>,
}))

vi.mock('@/components/frontend/password-gate-form', () => ({
  PasswordGateForm: () => <div>Password gate</div>,
}))

vi.mock('@/components/theme-script', () => ({
  ThemeScript: () => <div data-testid="theme-script" />,
}))

async function renderLayout(children: React.ReactNode) {
  const layout = await RootLayout({ children })
  if (!React.isValidElement(layout) || layout.type !== 'html') {
    throw new Error('Expected RootLayout to return an html element.')
  }

  const html = layout as React.ReactElement<{ children: React.ReactNode }>
  const body = React.Children.toArray(html.props.children).find((child) => {
    return React.isValidElement<{ children: React.ReactNode }>(child) && child.type === 'body'
  }) as React.ReactElement<{ children: React.ReactNode }> | undefined

  if (!body) {
    throw new Error('Expected RootLayout to include a body element.')
  }

  return render(<>{body.props.children}</>)
}

describe('frontend layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getFrontendGateConfig).mockReturnValue({
      status: 'enabled',
      passwords: { funder: 'secret' },
    })
    vi.mocked(getCurrentFrontendViewer).mockResolvedValue({
      audience: 'funder',
      canViewCommunityHighlights: true,
      canViewFundingDetails: true,
      isGateEnabled: true,
      isUnlocked: true,
    })
  })

  it('renders the password gate form for locked viewers', async () => {
    vi.mocked(getCurrentFrontendViewer).mockResolvedValue({
      audience: null,
      canViewCommunityHighlights: false,
      canViewFundingDetails: false,
      isGateEnabled: true,
      isUnlocked: false,
    })

    await renderLayout(<div>Dashboard</div>)

    expect(screen.getByText('Password gate')).toBeInTheDocument()
    expect(screen.queryByTestId('navigation')).not.toBeInTheDocument()
    expect(screen.queryByTestId('footer')).not.toBeInTheDocument()
  })

  it('renders the unlocked shell using the shared viewer capabilities', async () => {
    await renderLayout(<div>Dashboard</div>)

    expect(screen.getByTestId('navigation')).toHaveTextContent('nav:true')
    expect(screen.getByTestId('footer')).toHaveTextContent('footer:true:true')
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('hides the lock action when the gate is disabled', async () => {
    vi.mocked(getFrontendGateConfig).mockReturnValue({ status: 'disabled' })
    vi.mocked(getCurrentFrontendViewer).mockResolvedValue({
      audience: 'public',
      canViewCommunityHighlights: false,
      canViewFundingDetails: false,
      isGateEnabled: false,
      isUnlocked: true,
    })

    await renderLayout(<div>Dashboard</div>)

    expect(screen.getByTestId('footer')).toHaveTextContent('footer:false:false')
  })
})
