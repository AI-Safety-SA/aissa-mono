import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PersonMajorImpacts } from '@/components/person/person-major-impacts'

describe('PersonMajorImpacts', () => {
  it('renders the supplied impact cards', () => {
    render(
      <PersonMajorImpacts
        items={[
          {
            actionCategoryLabel: 'Research',
            date: '2025-01-01T00:00:00.000Z',
            evidenceUrl: 'https://example.com/evidence',
            id: 1,
            isPinned: true,
            isVerified: true,
            summary: 'Published a safety evaluation report.',
            typeLabel: 'Publication',
          },
        ]}
      />,
    )

    expect(screen.getByText('Published a safety evaluation report.')).toBeInTheDocument()
    expect(screen.getByText('Pinned Impact 1')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View evidence' })).toHaveAttribute(
      'href',
      'https://example.com/evidence',
    )
  })
})
