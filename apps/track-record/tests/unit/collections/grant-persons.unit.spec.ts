import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GrantPersons } from '@/collections/GrantPersons'

describe('GrantPersons', () => {
  const beforeValidate = GrantPersons.hooks?.beforeValidate?.[0]
  const find = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses the related grant as the admin title', () => {
    expect(GrantPersons.admin?.useAsTitle).toBe('grant')
  })

  it('rejects duplicate grant-person pairs on create', async () => {
    find.mockResolvedValue({ totalDocs: 1 })

    await expect(
      beforeValidate?.({
        data: { grant: 11, person: 22 },
        operation: 'create',
        req: {
          payload: {
            find,
          },
        },
      } as any),
    ).rejects.toThrow('This person is already linked to this grant')

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'grant-persons',
        where: {
          and: [{ grant: { equals: 11 } }, { person: { equals: 22 } }],
        },
      }),
    )
  })

  it('rejects duplicate grant-person pairs on update while excluding the current record id', async () => {
    find.mockResolvedValue({ totalDocs: 1 })

    await expect(
      beforeValidate?.({
        data: { grant: 11, person: 22 },
        operation: 'update',
        originalDoc: { id: 33, grant: 10, person: 20 },
        req: {
          payload: {
            find,
          },
        },
      } as any),
    ).rejects.toThrow('This person is already linked to this grant')

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'grant-persons',
        where: {
          and: [
            { grant: { equals: 11 } },
            { person: { equals: 22 } },
            { id: { not_equals: 33 } },
          ],
        },
      }),
    )
  })
})
