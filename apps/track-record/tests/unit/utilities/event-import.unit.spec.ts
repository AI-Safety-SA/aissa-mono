import { describe, expect, it } from 'vitest'

import {
  extractHostNames,
  inferTypeOther,
  looksLikeOrganisationName,
  resolvePersonByName,
  slugifyEventName,
} from '@/utilities/event-import'

describe('event import helpers', () => {
  const persons = [
    { id: 1, fullName: 'Charl Botha', preferredName: 'Charl' },
    { id: 2, fullName: 'Tegan Green', preferredName: null },
    { id: 3, fullName: 'Imaan Khan', preferredName: 'Imaan' },
    { id: 4, fullName: 'Charles Botha', preferredName: 'Charles' },
  ]

  it('matches an exact full name', () => {
    const result = resolvePersonByName('Tegan Green', persons)

    expect(result.match?.id).toBe(2)
    expect(result.strategy).toBe('exact-full-name')
  })

  it('matches a preferred name plus surname alias', () => {
    const result = resolvePersonByName('Charl Botha', [
      { id: 10, fullName: 'Charles Botha', preferredName: 'Charl' },
    ])

    expect(result.match?.id).toBe(10)
    expect(result.strategy).toBe('exact-preferred-plus-surname')
  })

  it('matches a unique single-token preferred name', () => {
    const result = resolvePersonByName('Imaan', persons)

    expect(result.match?.id).toBe(3)
    expect(result.strategy).toBe('exact-preferred-name')
  })

  it('refuses ambiguous single-token matches', () => {
    const result = resolvePersonByName('Imaan', [
      { id: 3, fullName: 'Imaan Khan', preferredName: 'Imaan' },
      { id: 5, fullName: 'Imaan Patel', preferredName: 'Imaan' },
    ])

    expect(result.match).toBeNull()
    expect(result.reason).toContain('too close')
  })

  it('infers a human-readable typeOther label from event name', () => {
    expect(
      inferTypeOther({
        eventDate: '2026-03-20T19:00:00+02:00',
        name: 'AISSA x Apart: AI Control Hackathon',
        organiserName: 'Tegan Green',
        type: 'other',
      }),
    ).toBe('Hackathon')
  })

  it('extracts host names from metadata', () => {
    expect(
      extractHostNames({
        eventDate: '2026-03-20T19:00:00+02:00',
        metadata: { hosts: ['Tegan Green', 'Charl Botha', 10, null] },
        name: 'Example Event',
        organiserName: 'Tegan Green',
        type: 'seminar',
      }),
    ).toEqual(['Tegan Green', 'Charl Botha'])
  })

  it('detects obvious organisation names', () => {
    expect(looksLikeOrganisationName('Apart Research')).toBe(true)
    expect(looksLikeOrganisationName('Charl Botha')).toBe(false)
  })

  it('builds a stable date-suffixed event slug', () => {
    expect(slugifyEventName('ShockLab Seminar: Delegating Deliberation to Agents', '2026-03-11T16:00:00+02:00')).toBe(
      'shocklab-seminar-delegating-deliberation-to-agents-2026-03-11',
    )
  })
})
