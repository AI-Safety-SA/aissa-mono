import type { Person, Research } from '@/payload-types'

export const researchVenueTypeLabels: Record<string, string> = {
  journal: 'Journal',
  conference: 'Conference',
  workshop: 'Workshop',
  preprint: 'Preprint',
}

export const researchStatusLabels: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  accepted: 'Accepted',
  published: 'Published',
}

export const researchStatusVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
  draft: 'secondary',
  submitted: 'outline',
  accepted: 'default',
  published: 'default',
}

function getTrimmedValue(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function getAuthorNames(authors: Research['authors']): string {
  if (!authors || authors.length === 0) return ''

  return authors
    .map((author) => {
      if (typeof author.person === 'object' && author.person) {
        return (author.person as Person).fullName
      }

      return author.name || ''
    })
    .filter(Boolean)
    .join(', ')
}

export function getResearchVenueLabel(venueType: string | null | undefined): string | null {
  const value = getTrimmedValue(venueType)
  if (!value) return null
  return researchVenueTypeLabels[value] || value
}

export function getResearchStatusLabel(status: string | null | undefined): string | null {
  const value = getTrimmedValue(status)
  if (!value) return null
  return researchStatusLabels[value] || value
}

export function getResearchStatusVariant(
  status: string | null | undefined,
): 'default' | 'secondary' | 'outline' {
  const value = getTrimmedValue(status)
  if (!value) return 'secondary'
  return researchStatusVariants[value] || 'secondary'
}

export function getPublicationYear(publicationDate: string | null | undefined): string | null {
  const value = getTrimmedValue(publicationDate)
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return String(date.getUTCFullYear())
}

export function getResearchExternalUrl(
  research: Pick<Research, 'arxivLink' | 'doi'>,
): string | null {
  const arxivLink = getTrimmedValue(research.arxivLink)
  if (arxivLink) return arxivLink

  const doi = getTrimmedValue(research.doi)
  if (!doi) return null

  if (/^https?:\/\//i.test(doi)) {
    return doi
  }

  const normalizedDoi = doi.replace(/^doi:\s*/i, '').replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')

  return normalizedDoi ? `https://doi.org/${normalizedDoi}` : null
}
