import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { SectionSkeleton } from '@/components/skeletons/section-skeleton'

describe('SectionSkeleton component', () => {
  it('renders default 3 items', () => {
    render(<SectionSkeleton />)

    const cards = document.querySelectorAll('.border.rounded-lg')
    expect(cards.length).toBe(3)
  })

  it('renders custom item count', () => {
    render(<SectionSkeleton itemCount={5} />)

    const cards = document.querySelectorAll('.border.rounded-lg')
    expect(cards.length).toBe(5)
  })

  it('renders card structure with title, subtitle, and content', () => {
    render(<SectionSkeleton itemCount={1} />)

    // Should have skeleton elements for title, subtitle, and content lines
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThanOrEqual(4) // title + subtitle + 2 content lines
  })
})
