import { describe, expect, it } from 'vitest'

import { Persons } from '@/collections/Persons'

function getNamedField(name: string) {
  return Persons.fields.find(
    (field): field is typeof Persons.fields[number] & { name: string } =>
      typeof field === 'object' && field !== null && 'name' in field && field.name === name,
  )
}

function getValidatableNamedField(name: string) {
  const field = getNamedField(name)

  if (!field || typeof field !== 'object' || !('validate' in field)) {
    return null
  }

  return field as typeof field & { validate: (value: unknown) => true | string }
}

describe('Persons collection config', () => {
  it('forces highlight on when a featured tier is set', async () => {
    const hook = Persons.hooks?.beforeChange?.[0]

    expect(hook).toBeDefined()

    const result = await hook!({
      data: {
        featuredTier: 'team',
        highlight: false,
      },
    } as never)

    expect(result).toMatchObject({
      featuredTier: 'team',
      highlight: true,
    })
  })

  it('clears highlight when the featured tier is explicitly removed', async () => {
    const hook = Persons.hooks?.beforeChange?.[0]

    const result = await hook!({
      data: {
        featuredTier: null,
        highlight: true,
      },
      originalDoc: {
        featuredTier: 'team',
        highlight: true,
      },
    } as never)

    expect(result).toMatchObject({
      featuredTier: null,
      highlight: false,
    })
  })

  it('leaves highlight unchanged when the featured tier field is omitted', async () => {
    const hook = Persons.hooks?.beforeChange?.[0]

    const result = await hook!({
      data: {
        highlight: false,
      },
    } as never)

    expect(result).toMatchObject({
      highlight: false,
    })
  })

  it('preserves legacy highlight records without a featured tier', async () => {
    const hook = Persons.hooks?.beforeChange?.[0]

    const result = await hook!({
      data: {
        featuredTier: null,
        highlight: true,
      },
      originalDoc: {
        featuredTier: null,
        highlight: true,
      },
    } as never)

    expect(result).toMatchObject({
      featuredTier: null,
      highlight: true,
    })
  })

  it('limits major impact pins to five selections', () => {
    const field = getValidatableNamedField('majorImpactPins')

    expect(field).toBeDefined()
    expect(field?.validate([1, 2, 3, 4, 5])).toBe(true)
    expect(field?.validate([1, 2, 3, 4, 5, 6])).toBe('Select up to 5 major impact pins.')
  })

  it('exposes featured tier and priority in the admin list columns', () => {
    expect(Persons.admin?.defaultColumns).toEqual(
      expect.arrayContaining(['featuredTier', 'featuredPriority']),
    )
  })
})
