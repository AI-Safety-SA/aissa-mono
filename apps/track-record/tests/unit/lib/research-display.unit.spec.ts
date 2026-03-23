import { describe, expect, it } from 'vitest'
import {
  getAuthorNames,
  getPublicationYear,
  getResearchExternalUrl,
  getResearchStatusLabel,
  getResearchStatusVariant,
  getResearchVenueLabel,
} from '@/lib/research-display'

describe('research display helpers', () => {
  it('joins linked and free-text author names', () => {
    expect(
      getAuthorNames([
        { person: { fullName: 'Ada Lovelace' } as any, id: '1' },
        { name: 'Grace Hopper', id: '2' },
      ] as any),
    ).toBe('Ada Lovelace, Grace Hopper')
  })

  it('prefers arXiv links over DOI links', () => {
    expect(
      getResearchExternalUrl({
        arxivLink: 'https://arxiv.org/abs/1234.5678',
        doi: '10.1000/example',
      } as any),
    ).toBe('https://arxiv.org/abs/1234.5678')
  })

  it('normalizes DOI identifiers into DOI URLs', () => {
    expect(
      getResearchExternalUrl({
        arxivLink: null,
        doi: '10.1000/example',
      } as any),
    ).toBe('https://doi.org/10.1000/example')
  })

  it('returns publication year only', () => {
    expect(getPublicationYear('2025-06-15T00:00:00.000Z')).toBe('2025')
  })

  it('maps venue and status values to display labels and variants', () => {
    expect(getResearchVenueLabel('conference')).toBe('Conference')
    expect(getResearchStatusLabel('submitted')).toBe('Submitted')
    expect(getResearchStatusVariant('submitted')).toBe('outline')
  })
})
