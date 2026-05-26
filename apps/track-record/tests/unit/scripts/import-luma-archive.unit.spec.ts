import { describe, expect, it } from 'vitest'

import type { Event } from '@/payload-types'
import {
  dataForRecord,
  findExistingEvent,
  selectBestLumaImage,
  simplifyReadingGroupName,
} from '../../../scripts/import-luma-archive'

function event(overrides: Partial<Event>): Event {
  return {
    id: 1,
    slug: 'existing-event',
    name: 'Existing Event',
    type: 'reading_group',
    organiser: 9,
    eventDate: '2025-11-12T16:00:00.000Z',
    attendanceCount: 2,
    location: 'Existing location',
    isPublished: true,
    metadata: { existing: true },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  } as Event
}

describe('simplifyReadingGroupName', () => {
  it('normalizes Luma reading group titles to the preferred display pattern', () => {
    expect(
      simplifyReadingGroupName(
        'Reading Group & Discussion: Weak-to-Strong Generalization under Distribution Shifts',
      ),
    ).toBe('Reading Group: Weak-to-Strong Generalization under Distribution Shifts')
  })
})

describe('findExistingEvent', () => {
  it('matches a same-day generic reading group as an existing duplicate', () => {
    const existing = event({
      id: 14,
      name: 'Paper Reading Group',
      slug: 'paper-reading-group-2025-10-15',
      eventDate: '2025-10-15T16:00:00.000Z',
    })

    expect(
      findExistingEvent([existing], {
        title: 'Reading Group & Discussion: Toward an African Agenda for AI Safety',
        start_at_utc: '2025-10-15T16:00:00.000Z',
        slug: 'example',
      }),
    ).toBe(existing)
  })

  it('does not guess when multiple same-day reading groups already exist', () => {
    const first = event({ id: 14, name: 'Paper Reading Group' })
    const second = event({ id: 90, name: 'Reading Group: Different Paper' })

    expect(
      findExistingEvent([first, second], {
        title: 'Reading Group & Discussion: Toward an African Agenda for AI Safety',
        start_at_utc: '2025-11-12T16:00:00.000Z',
        slug: 'example',
      }),
    ).toBeNull()
  })
})

describe('dataForRecord', () => {
  it('preserves an existing simplified reading group name and published state', () => {
    const existing = event({
      id: 28,
      name: 'Reading Group: Weak-to-Strong Generalization under Distribution Shifts',
      slug: 'reading-group-weak-to-strong-2025-11-12',
      isPublished: true,
      metadata: { existing: true },
    })

    const data = dataForRecord(
      {
        event_id: 'evt-123',
        title:
          'Reading Group & Discussion: Weak-to-Strong Generalization under Distribution Shifts',
        start_at_utc: '2025-11-12T16:00:00.000Z',
        guest_counts: { private_manage: 2 },
        location: 'Innovation City Cape Town',
        slug: 'weak-to-strong',
      },
      9,
      existing,
    )

    expect(data).toMatchObject({
      attendanceCount: 2,
      isPublished: true,
      name: 'Reading Group: Weak-to-Strong Generalization under Distribution Shifts',
      organiser: 9,
      slug: 'reading-group-weak-to-strong-2025-11-12',
      type: 'reading_group',
    })
    expect(data.metadata).toMatchObject({
      existing: true,
      externalSource: 'luma',
      externalId: 'evt-123',
    })
  })

  it('replaces generic reading group names with a simplified paper title', () => {
    const data = dataForRecord(
      {
        event_id: 'evt-456',
        title: 'Reading Group & Discussion: Why Language Models Hallucinate',
        start_at_utc: '2025-10-01T16:00:00.000Z',
        guest_counts: { private_manage: 10 },
        slug: 'hallucinate',
      },
      9,
      event({
        id: 19,
        name: 'Paper Reading Group',
        slug: 'paper-reading-group-2025-10-01',
        eventDate: '2025-10-01T16:00:00.000Z',
      }),
    )

    expect(data.name).toBe('Reading Group: Why Language Models Hallucinate')
    expect(data.slug).toBe('paper-reading-group-2025-10-01')
  })
})

describe('selectBestLumaImage', () => {
  it('prefers local event-cover images over generated social and calendar images', () => {
    const image = selectBestLumaImage({
      title: 'AISSA x Apart Research Sprint',
      start_at_utc: '2025-07-25T17:30:00.000Z',
      images: [
        {
          kind: 'calendar-avatar',
          local_path: 'output/luma-calendar-archive/public/images/calendar.png',
          source: 'public_page',
        },
        {
          kind: 'event-social',
          local_path: 'output/luma-calendar-archive/public/images/social.png',
          source: 'public_page',
        },
        {
          kind: 'event-cover',
          local_path: 'output/luma-calendar-archive/private/images/cover.png',
          source: 'private_manage',
        },
      ],
    })

    expect(image).toMatchObject({
      kind: 'event-cover',
      local_path: 'output/luma-calendar-archive/private/images/cover.png',
    })
  })

  it('skips AVIF images because Payload Sharp cannot decode the archived files', () => {
    const image = selectBestLumaImage({
      title: 'Reading Group: AI Governance',
      start_at_utc: '2025-03-26T16:00:00.000Z',
      images: [
        {
          content_type: 'image/avif',
          kind: 'event-cover',
          local_path: 'output/luma-calendar-archive/private/images/cover.img',
          source: 'private_manage',
        },
        {
          content_type: 'image/png',
          kind: 'event-social',
          local_path: 'output/luma-calendar-archive/public/images/social.png',
          source: 'public_page',
        },
      ],
    })

    expect(image).toMatchObject({
      kind: 'event-social',
      local_path: 'output/luma-calendar-archive/public/images/social.png',
    })
  })
})
