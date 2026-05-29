import { describe, expect, it } from 'vitest'

import {
  getEventDefaultImage,
  getHighlightedImage,
  getProgramDefaultImage,
} from '@/lib/default-images'
import type { DefaultImage } from '@/payload-types'

const workshopImage = {
  id: 1,
  alt: 'Workshop default',
  updatedAt: '2026-03-30T00:00:00.000Z',
  createdAt: '2026-03-30T00:00:00.000Z',
  url: 'https://cdn.example.com/workshop.jpg',
}

const seminarImage = {
  id: 4,
  alt: 'Seminar default',
  updatedAt: '2026-03-30T00:00:00.000Z',
  createdAt: '2026-03-30T00:00:00.000Z',
  url: 'https://cdn.example.com/seminar.jpg',
}

const courseImage = {
  id: 2,
  alt: 'Course default',
  updatedAt: '2026-03-30T00:00:00.000Z',
  createdAt: '2026-03-30T00:00:00.000Z',
  url: 'https://cdn.example.com/course.jpg',
}

const retreatImage = {
  id: 5,
  alt: 'Retreat default',
  updatedAt: '2026-03-30T00:00:00.000Z',
  createdAt: '2026-03-30T00:00:00.000Z',
  url: 'https://cdn.example.com/retreat.jpg',
}

const highlightedImage = {
  id: 3,
  alt: 'Highlighted image',
  updatedAt: '2026-03-30T00:00:00.000Z',
  createdAt: '2026-03-30T00:00:00.000Z',
  url: 'https://cdn.example.com/highlighted.jpg',
}

const defaults: DefaultImage = {
  id: 1,
  eventTypeDefaults: {
    workshopImage,
    seminarImage,
  },
  programTypeDefaults: {
    courseImage,
    retreatImage,
  },
}

describe('default image helpers', () => {
  it('returns the configured event type fallback image', () => {
    expect(getEventDefaultImage(defaults, 'workshop')).toEqual(workshopImage)
    expect(getEventDefaultImage(defaults, 'seminar')).toEqual(seminarImage)
    expect(getEventDefaultImage(defaults, 'talk')).toBeNull()
  })

  it('returns the configured program type fallback image', () => {
    expect(getProgramDefaultImage(defaults, 'course')).toEqual(courseImage)
    expect(getProgramDefaultImage(defaults, 'retreat')).toEqual(retreatImage)
    expect(getProgramDefaultImage(defaults, 'hackathon')).toBeNull()
  })

  it('returns the highlighted image when one is set', () => {
    expect(
      getHighlightedImage([
        { image: workshopImage, isHighlighted: false },
        { image: highlightedImage, isHighlighted: true },
      ]),
    ).toEqual(highlightedImage)
  })

  it('returns null when no images are provided', () => {
    expect(getHighlightedImage(null)).toBeNull()
    expect(getHighlightedImage(undefined)).toBeNull()
  })

  it('returns null when the images array is empty', () => {
    expect(getHighlightedImage([])).toBeNull()
  })

  it('returns null when no image is highlighted', () => {
    expect(getHighlightedImage([{ image: workshopImage, isHighlighted: false }])).toBeNull()
  })
})
