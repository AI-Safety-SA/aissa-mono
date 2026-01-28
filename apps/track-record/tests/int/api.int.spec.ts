import { describe, it, beforeAll, expect } from 'vitest'
import { getTestPayload } from '../utils/test-payload'
import type { Payload } from 'payload'

let payload: Payload

describe('API', () => {
  beforeAll(async () => {
    payload = await getTestPayload()
  })

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })
})
