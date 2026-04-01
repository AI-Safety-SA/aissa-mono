import { describe, expect, it, vi } from 'vitest'
import PeoplePage from '@/app/(frontend)/people/page'

const notFoundMock = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND')
})

vi.mock('next/navigation', () => ({
  notFound: () => notFoundMock(),
}))

describe('/people page', () => {
  it('remains blocked', async () => {
    await expect(PeoplePage()).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFoundMock).toHaveBeenCalledTimes(1)
  })
})
