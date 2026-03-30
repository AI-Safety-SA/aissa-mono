import { describe, expect, it } from 'vitest'

import {
  getEventDefaultImage,
  getHighlightedImage,
  getProgramDefaultImage,
  type DefaultImagesData,
} from '@/lib/default-images'

const workshopImage = {
  id: 1,
  alt: 'Workshop default',
  updatedAt: '2026-03-30T00:00:00.000Z',
  createdAt: '2026-03-30T00:00:00.000Z',
  url: 'https://cdn.example.com/workshop.jpg',
}

const courseImage = {
  id: 2,
  alt: 'Course default',
  updatedAt: '2026-03-30T00:00:00.000Z',
  createdAt: '2026-03-30T00:00:00.000Z',
  url: 'https://cdn.example.com/course.jpg',
}

const highlightedImage = {
  id: 3,
  alt: 'Highlighted image',
  updatedAt: '2026-03-30T00:00:00.000Z',
  createdAt: '2026-03-30T00:00:00.000Z',
  url: 'https://cdn.example.com/highlighted.jpg',
}

const defaults: DefaultImagesData = {
  eventTypeDefaults: {
    workshopImage,
  },
  programTypeDefaults: {
    courseImage,
  },
}

describe('default image helpers', () => {
  it('returns the configured event type fallback image', () => {
    expect(getEventDefaultImage(defaults, 'workshop')).toEqual(workshopImage)
    expect(getEventDefaultImage(defaults, 'talk')).toBeNull()
  })

  it('returns the configured program type fallback image', () => {
    expect(getProgramDefaultImage(defaults, 'course')).toEqual(courseImage)
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
})
