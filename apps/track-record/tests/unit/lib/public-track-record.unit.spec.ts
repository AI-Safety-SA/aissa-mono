import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  PUBLIC_TEAM_FULL_NAMES,
  getPublicTeamPeople,
  hasPublicProgramImage,
  serializeEvent,
  serializeEventsForPublicList,
  serializeProgram,
  serializeResearch,
  serializeTeamPerson,
  serializeTestimonial,
} from '@/lib/public-track-record'
import type {
  DefaultImage,
  Event,
  Media,
  Person,
  Program,
  Research,
  Testimonial,
} from '@/payload-types'

function media(overrides: Partial<Media>): Media {
  return {
    alt: 'Default alt',
    createdAt: '2026-01-01T00:00:00.000Z',
    id: 1,
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function person(overrides: Partial<Person>): Person {
  return {
    createdAt: '2026-01-01T00:00:00.000Z',
    fullName: 'Public Person',
    id: 1,
    isPublished: true,
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  } as Person
}

describe('public track-record serializers', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not fall back to program type default images', () => {
    const defaultImage = media({
      alt: 'Course default',
      filename: 'course-default.jpg',
      url: 'https://pub-example.r2.dev/course-default.jpg',
    })
    const program = {
      createdAt: '2026-01-01T00:00:00.000Z',
      id: 10,
      isPublished: true,
      name: 'Intro Course',
      slug: 'intro-course',
      type: 'course',
      updatedAt: '2026-01-01T00:00:00.000Z',
    } as Program
    const defaults = {
      createdAt: '2026-01-01T00:00:00.000Z',
      eventTypeDefaults: {},
      globalType: 'default-images',
      id: 1,
      programTypeDefaults: {
        courseImage: defaultImage,
      },
      updatedAt: '2026-01-01T00:00:00.000Z',
    } as DefaultImage

    expect(serializeProgram(program).image).toBeNull()
    expect(hasPublicProgramImage(program)).toBe(false)
    expect(defaults.programTypeDefaults?.courseImage).toBe(defaultImage)
  })

  it('recognises programs with explicit public images', () => {
    const explicitImage = media({
      alt: 'Program participants',
      filename: 'participants.jpg',
      id: 2,
      url: 'https://pub-example.r2.dev/participants.jpg',
    })
    const program = {
      createdAt: '2026-01-01T00:00:00.000Z',
      id: 10,
      images: [{ image: explicitImage, isHighlighted: true }],
      isPublished: true,
      name: 'Intro Course',
      slug: 'intro-course',
      type: 'course',
      updatedAt: '2026-01-01T00:00:00.000Z',
    } as Program

    expect(hasPublicProgramImage(program)).toBe(true)
    expect(serializeProgram(program).image).toEqual({
      alt: 'Program participants',
      url: 'https://pub-example.r2.dev/participants.jpg',
    })
  })

  it('falls back to event type default images and reads public Luma URLs from metadata', () => {
    const defaultImage = media({
      alt: 'Workshop default',
      filename: 'workshop-default.jpg',
      url: 'https://pub-example.r2.dev/workshop-default.jpg',
    })
    const event = {
      createdAt: '2026-01-01T00:00:00.000Z',
      eventDate: '2026-01-02T00:00:00.000Z',
      id: 20,
      isPublished: true,
      metadata: {
        description: 'Metadata event description.',
        luma: {
          publicUrl: 'https://luma.com/public-workshop',
        },
      },
      name: 'Public Workshop',
      organiser: 1,
      slug: 'public-workshop',
      type: 'workshop',
      updatedAt: '2026-01-01T00:00:00.000Z',
    } as Event
    const defaults = {
      createdAt: '2026-01-01T00:00:00.000Z',
      eventTypeDefaults: {
        workshopImage: defaultImage,
      },
      globalType: 'default-images',
      id: 1,
      programTypeDefaults: {},
      updatedAt: '2026-01-01T00:00:00.000Z',
    } as DefaultImage

    expect(serializeEvent(event, defaults)).toMatchObject({
      description: 'Metadata event description.',
      image: {
        alt: 'Workshop default',
        url: 'https://pub-example.r2.dev/workshop-default.jpg',
      },
      lumaPublicUrl: 'https://luma.com/public-workshop',
    })
  })

  it('keeps explicit highlighted images ahead of defaults', () => {
    const explicitImage = media({
      alt: 'Explicit workshop image',
      filename: 'explicit.jpg',
      id: 2,
      url: 'https://pub-example.r2.dev/explicit.jpg',
    })
    const defaultImage = media({
      alt: 'Workshop default',
      filename: 'workshop-default.jpg',
      url: 'https://pub-example.r2.dev/workshop-default.jpg',
    })
    const event = {
      createdAt: '2026-01-01T00:00:00.000Z',
      eventDate: '2026-01-02T00:00:00.000Z',
      id: 20,
      images: [{ image: explicitImage, isHighlighted: true }],
      isPublished: true,
      name: 'Public Workshop',
      organiser: 1,
      slug: 'public-workshop',
      type: 'workshop',
      updatedAt: '2026-01-01T00:00:00.000Z',
    } as Event
    const defaults = {
      createdAt: '2026-01-01T00:00:00.000Z',
      eventTypeDefaults: {
        workshopImage: defaultImage,
      },
      globalType: 'default-images',
      id: 1,
      programTypeDefaults: {},
      updatedAt: '2026-01-01T00:00:00.000Z',
    } as DefaultImage

    expect(serializeEvent(event, defaults).image).toEqual({
      alt: 'Explicit workshop image',
      url: 'https://pub-example.r2.dev/explicit.jpg',
    })
  })

  it('excludes selected hero images from event and program galleries', () => {
    const heroImage = media({
      alt: 'Hero image',
      filename: 'hero.jpg',
      id: 2,
      url: 'https://pub-example.r2.dev/hero.jpg',
    })
    const galleryImage = media({
      alt: 'Gallery image',
      filename: 'gallery.jpg',
      id: 3,
      url: 'https://pub-example.r2.dev/gallery.jpg',
    })
    const images = [
      { image: heroImage, isHighlighted: true },
      { caption: 'Shown in gallery', image: galleryImage },
    ]
    const event = {
      createdAt: '2026-01-01T00:00:00.000Z',
      eventDate: '2026-01-02T00:00:00.000Z',
      id: 20,
      images,
      isPublished: true,
      name: 'Public Workshop',
      organiser: 1,
      slug: 'public-workshop',
      type: 'workshop',
      updatedAt: '2026-01-01T00:00:00.000Z',
    } as Event
    const program = {
      createdAt: '2026-01-01T00:00:00.000Z',
      id: 10,
      images,
      isPublished: true,
      name: 'Intro Course',
      slug: 'intro-course',
      type: 'course',
      updatedAt: '2026-01-01T00:00:00.000Z',
    } as Program

    expect(serializeEvent(event).gallery).toEqual([
      {
        alt: 'Gallery image',
        caption: 'Shown in gallery',
        url: 'https://pub-example.r2.dev/gallery.jpg',
      },
    ])
    expect(serializeProgram(program).gallery).toEqual([
      {
        alt: 'Gallery image',
        caption: 'Shown in gallery',
        url: 'https://pub-example.r2.dev/gallery.jpg',
      },
    ])
  })

  it('omits unpublished and anonymized event people from public summaries', () => {
    const publicPerson = {
      createdAt: '2026-01-01T00:00:00.000Z',
      fullName: 'Public Host',
      id: 40,
      isPublished: true,
      updatedAt: '2026-01-01T00:00:00.000Z',
    } as Person
    const unpublishedPerson = {
      createdAt: '2026-01-01T00:00:00.000Z',
      fullName: 'Unpublished Host',
      id: 41,
      isPublished: false,
      updatedAt: '2026-01-01T00:00:00.000Z',
    } as Person
    const anonymizedPerson = {
      createdAt: '2026-01-01T00:00:00.000Z',
      fullName: 'Anonymized Organiser',
      id: 42,
      isAnonymized: true,
      isPublished: true,
      updatedAt: '2026-01-01T00:00:00.000Z',
    } as Person
    const event = {
      createdAt: '2026-01-01T00:00:00.000Z',
      eventDate: '2026-01-02T00:00:00.000Z',
      hosts: [publicPerson, unpublishedPerson],
      id: 20,
      isPublished: true,
      name: 'Public Workshop',
      organiser: anonymizedPerson,
      slug: 'public-workshop',
      type: 'workshop',
      updatedAt: '2026-01-01T00:00:00.000Z',
    } as Event & { hosts: Person[] }

    expect(serializeEvent(event)).toMatchObject({
      hosts: [{ fullName: 'Public Host', id: 40 }],
      organiser: null,
    })
  })

  it('orders public event lists with explicit highlights first and latest-event backfill', () => {
    const events = [
      {
        createdAt: '2026-01-01T00:00:00.000Z',
        eventDate: '2026-04-04T00:00:00.000Z',
        id: 1,
        isPublished: true,
        metadata: {},
        name: 'Latest regular event',
        slug: 'latest-regular-event',
        type: 'workshop',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        createdAt: '2026-01-01T00:00:00.000Z',
        eventDate: '2026-04-03T00:00:00.000Z',
        id: 2,
        isPublished: true,
        metadata: { highlight: true },
        name: 'Highlighted event',
        slug: 'highlighted-event',
        type: 'seminar',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        createdAt: '2026-01-01T00:00:00.000Z',
        eventDate: '2026-04-02T00:00:00.000Z',
        id: 3,
        isPublished: true,
        metadata: {},
        name: 'Second regular event',
        slug: 'second-regular-event',
        type: 'meetup',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        createdAt: '2026-01-01T00:00:00.000Z',
        eventDate: '2026-04-01T00:00:00.000Z',
        id: 4,
        isPublished: true,
        metadata: {},
        name: 'Remaining regular event',
        slug: 'remaining-regular-event',
        type: 'talk',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ] as Event[]

    expect(serializeEventsForPublicList(events).map((event) => event.name)).toEqual([
      'Highlighted event',
      'Latest regular event',
      'Second regular event',
      'Remaining regular event',
    ])
  })

  it('serializes linked and free-text research author names', () => {
    const research = {
      acceptedVenue: 'AISSA Research Forum',
      authors: [
        {
          person: person({
            fullName: 'Linked Researcher',
            id: 41,
          }),
        },
        { name: 'Free Text Researcher' },
        {
          name: '',
          person: person({
            fullName: 'Blank Name Linked Researcher',
            id: 42,
          }),
        },
      ],
      createdAt: '2026-01-01T00:00:00.000Z',
      id: 60,
      isPublished: true,
      publicationDate: '2026-01-02T00:00:00.000Z',
      status: 'published',
      title: 'Public Research Output',
      updatedAt: '2026-01-01T00:00:00.000Z',
      venueType: 'workshop',
    } as Research

    expect(serializeResearch(research).authors).toEqual([
      { authorName: 'Linked Researcher' },
      { authorName: 'Free Text Researcher' },
      { authorName: 'Blank Name Linked Researcher' },
    ])
  })

  it('serializes published testimonials without person detail links', () => {
    const testimonial = {
      attributionTitle: 'AISF Fellow',
      contextKind: 'program',
      createdAt: '2026-01-01T00:00:00.000Z',
      id: 30,
      isPublished: true,
      person: {
        createdAt: '2026-01-01T00:00:00.000Z',
        email: 'private@example.com',
        fullName: 'Public Name',
        id: 40,
        personTag: 'Research engineer',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      quote: 'AISSA helped me do useful work.',
      updatedAt: '2026-01-01T00:00:00.000Z',
    } as Testimonial

    expect(serializeTestimonial(testimonial)).toEqual({
      attributionName: 'Public Name',
      attributionTitle: 'AISF Fellow',
      contextKind: 'program',
      id: 30,
      quote: 'AISSA helped me do useful work.',
    })
  })

  it('serializes team people through a narrow public shape', () => {
    const headshot = media({
      alt: 'Public headshot',
      filename: 'headshot.jpg',
      id: 3,
      url: 'https://pub-example.r2.dev/headshot.jpg',
    })
    const person = {
      bio: 'Helps run AISSA programs.',
      createdAt: '2026-01-01T00:00:00.000Z',
      displayToFundersConsent: true,
      email: 'private@example.com',
      featuredTier: 'team',
      fullName: 'Public Team Member',
      headshot,
      id: 50,
      isPublished: true,
      organisation: 'AISSA',
      personTag: 'Programme Lead',
      shareWithPartnersConsent: true,
      updatedAt: '2026-01-01T00:00:00.000Z',
      websiteUrl: 'https://example.org/team-member',
    } as Person

    expect(serializeTeamPerson(person)).toEqual({
      bio: 'Helps run AISSA programs.',
      fullName: 'Public Team Member',
      headshot: {
        alt: 'Public headshot',
        url: 'https://pub-example.r2.dev/headshot.jpg',
      },
      id: 50,
      organisation: 'AISSA',
      personTag: 'Programme Lead',
      websiteUrl: 'https://example.org/team-member',
    })
  })

  it('queries public team people once by the manual ordered full-name list', async () => {
    const orderedNames: string[] = [...PUBLIC_TEAM_FULL_NAMES]
    const find = vi.fn(async () => ({
      docs: orderedNames
        .slice()
        .reverse()
        .map((fullName) =>
          person({
            fullName,
            id: orderedNames.indexOf(fullName) + 1,
          }),
        ),
    }))

    const team = await getPublicTeamPeople({ find } as never)

    expect(find).toHaveBeenCalledTimes(1)
    expect(find).toHaveBeenCalledWith({
      collection: 'persons',
      where: {
        and: [
          { fullName: { in: [...PUBLIC_TEAM_FULL_NAMES] } },
          { isPublished: { equals: true } },
          { isAnonymized: { not_equals: true } },
        ],
      },
      limit: PUBLIC_TEAM_FULL_NAMES.length,
      depth: 1,
    })
    expect(team.map((teamPerson) => teamPerson.fullName)).toEqual([...PUBLIC_TEAM_FULL_NAMES])
  })

  it('warns when a manual team name does not resolve to a public person', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const orderedNames: string[] = [...PUBLIC_TEAM_FULL_NAMES]
    const find = vi.fn(async () => ({
      docs: orderedNames
        .filter((fullName) => fullName !== 'Leo Hyams')
        .map((fullName) =>
          person({
            fullName,
            id: orderedNames.indexOf(fullName) + 1,
          }),
        ),
    }))

    const team = await getPublicTeamPeople({ find } as never)

    expect(team.map((teamPerson) => teamPerson.fullName)).toEqual(
      PUBLIC_TEAM_FULL_NAMES.filter((name) => name !== 'Leo Hyams'),
    )
    expect(warn).toHaveBeenCalledWith('Public website team person not found in Payload: Leo Hyams')
  })
})
