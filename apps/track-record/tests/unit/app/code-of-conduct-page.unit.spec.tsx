import { describe, expect, it, vi } from 'vitest'
import CodeOfConductPage, { metadata } from '@/app/(frontend)/code-of-conduct/page'
import { redirect } from 'next/navigation'

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

describe('code-of-conduct page', () => {
  it('redirects to the public website canonical legal page', () => {
    CodeOfConductPage()

    expect(redirect).toHaveBeenCalledWith('https://aisafetysa.com/code-of-conduct')
  })

  it('exports the expected metadata', () => {
    expect(metadata).toMatchObject({
      title: 'Code of Conduct | AI Safety South Africa',
      description: 'AI Safety South Africa community code of conduct.',
    })
  })
})
