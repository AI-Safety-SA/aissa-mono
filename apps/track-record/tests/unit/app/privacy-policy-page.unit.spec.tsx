import { describe, expect, it, vi } from 'vitest'
import PrivacyPolicyPage, { metadata } from '@/app/(public)/privacy-policy/page'
import { redirect } from 'next/navigation'

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

describe('privacy policy page', () => {
  it('redirects to the public website canonical legal page', () => {
    PrivacyPolicyPage()

    expect(redirect).toHaveBeenCalledWith(
      'https://aissa-mono-public-website.vercel.app/privacy-policy',
    )
  })

  it('exports the expected metadata', () => {
    expect(metadata).toMatchObject({
      title: 'Privacy Policy | AI Safety South Africa',
      description: 'Privacy policy for AI Safety South Africa.',
    })
  })
})
