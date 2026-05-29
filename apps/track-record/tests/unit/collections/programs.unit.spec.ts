import { describe, expect, it } from 'vitest'

import { Programs } from '@/collections/Programs'

function getNamedField(name: string) {
  return Programs.fields.find(
    (field): field is (typeof Programs.fields)[number] & { name: string } =>
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

describe('Programs collection config', () => {
  it('validates participant count as an optional non-negative whole number', () => {
    const field = getValidatableNamedField('participantCount')

    expect(field).toBeDefined()
    expect(field?.validate(null)).toBe(true)
    expect(field?.validate('')).toBe(true)
    expect(field?.validate(0)).toBe(true)
    expect(field?.validate(12)).toBe(true)
    expect(field?.validate(-1)).toBe('Participant count must be a non-negative whole number')
    expect(field?.validate(1.5)).toBe('Participant count must be a non-negative whole number')
  })

  it('validates highlight priority as an optional non-negative whole number', () => {
    const field = getValidatableNamedField('highlightPriority')

    expect(field).toBeDefined()
    expect(field?.validate(null)).toBe(true)
    expect(field?.validate('')).toBe(true)
    expect(field?.validate(0)).toBe(true)
    expect(field?.validate(12)).toBe(true)
    expect(field?.validate(-1)).toBe('Highlight priority must be a non-negative whole number')
    expect(field?.validate(1.5)).toBe('Highlight priority must be a non-negative whole number')
  })

  it('limits website URLs to http and https URLs', () => {
    const field = getValidatableNamedField('websiteUrl')

    expect(field).toBeDefined()
    expect(field?.validate(null)).toBe(true)
    expect(field?.validate('')).toBe(true)
    expect(field?.validate('https://example.org/program')).toBe(true)
    expect(field?.validate('http://example.org/program')).toBe(true)
    expect(field?.validate('ftp://example.org/program')).toBe('Website URL must use http or https')
    expect(field?.validate('javascript:alert(1)')).toBe('Website URL must use http or https')
    expect(field?.validate('not a url')).toBe('Website URL must be a valid URL')
  })
})
