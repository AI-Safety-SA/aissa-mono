import { describe, expect, it } from 'vitest'

import { serializeEvent, serializeProgram } from '@/lib/public-track-record'
import type { DefaultImage, Event, Media, Program } from '@/payload-types'

function media(overrides: Partial<Media>): Media {
  return {
    alt: 'Default alt',
    createdAt: '2026-01-01T00:00:00.000Z',
    id: 1,
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('public track-record serializers', () => {
  it('falls back to program type default images', () => {
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

    expect(serializeProgram(program, defaults).image).toEqual({
      alt: 'Course default',
      url: 'https://pub-example.r2.dev/course-default.jpg',
    })
  })

  it('falls back to event type default images and reads descriptions from metadata', () => {
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
})
